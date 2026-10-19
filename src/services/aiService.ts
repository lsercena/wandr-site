/**
 * AI Service — abstracts all Claude/OpenRouter calls behind a single service
 * layer. Streaming (SSE via /api/claude/stream) is preferred for chat and
 * itinerary generation; every streaming call transparently falls back to the
 * legacy JSON endpoint when the stream endpoint is unavailable.
 * TODO: Add per-session rate limiting.
 */
import type { ChatMessage } from '@/types';

const API_ENDPOINT = '/api/claude';
const STREAM_ENDPOINT = '/api/claude/stream';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT_TRAVEL = `You are Wandr AI, an expert travel intelligence assistant specializing in:
- Visa requirements and eligibility by nationality
- Digital nomad visa programs worldwide
- Cost of living and budget planning
- Tax residency rules (183-day rule, territorial tax, etc.)
- Remote work infrastructure (internet speed, coworking spaces)
- Healthcare, safety, and travel advisories
- Housing markets and neighborhoods for expats

Guidelines:
- Be specific and practical. Cite country names and real figures where possible.
- When visa rules or costs are involved, always recommend verifying with official government sources.
- If you're uncertain, say so clearly.
- Keep answers focused and well-structured.
- Use bullet points for lists; keep paragraphs short.`;

const SYSTEM_PROMPT_ITINERARY = `You are Wandr AI, a world-class travel planner. Create detailed, realistic day-by-day itineraries.
Format your response as a clean, well-structured itinerary with:
- A brief destination overview (2-3 sentences)
- Day-by-day breakdown with morning/afternoon/evening activities
- Specific restaurant and attraction names where possible
- Practical tips for each day
- Budget estimate for the trip
Keep it engaging, personal, and actionable.`;

export async function sendChatMessage(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt?: string,
  maxTokens = 2000,
): Promise<string> {
  const body: Record<string, unknown> = {
    model: DEFAULT_MODEL,
    max_tokens: maxTokens,
    messages,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Some failure modes (e.g. a proxy error page) return non-JSON bodies —
  // never let res.json() throw a SyntaxError at the UI.
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.error?.message || `The AI assistant couldn't be reached (error ${res.status}). Please try again in a moment.`,
    );
  }
  return data?.content?.[0]?.text ?? '';
}

/** Single-turn travel Q&A (Visa Finder, quick questions). */
export async function askTravelQuestion(question: string): Promise<string> {
  return sendChatMessage(
    [{ role: 'user', content: question }],
    SYSTEM_PROMPT_TRAVEL,
  );
}

// ─── Streaming (Server-Sent Events) ─────────────────────────────────────────

export interface StreamOptions {
  /** Called with each incremental text chunk as it arrives. */
  onDelta?: (delta: string) => void;
  /** Abort the in-flight stream (user pressed Stop). */
  signal?: AbortSignal;
}

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError')
  );
}

/**
 * Reads a `text/event-stream` response, invoking onDelta per `delta` event.
 * Throws on `error` events, resolves on `done`.
 */
async function readSseStream(res: Response, opts: StreamOptions): Promise<string> {
  if (!res.body) throw new Error('AI service returned an empty stream.');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let event: { delta?: string; done?: boolean; error?: { message?: string } };
      try {
        event = JSON.parse(payload);
      } catch {
        continue; // partial/garbled chunk
      }

      if (event.error) throw new Error(event.error.message || 'AI service error');
      if (event.delta) {
        text += event.delta;
        opts.onDelta?.(event.delta);
      }
    }
  }

  return text;
}

/**
 * Streams a completion. Falls back to the non-streaming endpoint when the
 * stream route is unavailable (e.g. old deployment) — in that case onDelta
 * receives the full reply as a single chunk.
 */
export async function streamChatMessage(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string | undefined,
  opts: StreamOptions = {},
  maxTokens = 2000,
): Promise<string> {
  const body: Record<string, unknown> = { model: DEFAULT_MODEL, max_tokens: maxTokens, messages };
  if (systemPrompt) body.system = systemPrompt;

  let res: Response;
  try {
    res = await fetch(STREAM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: opts.signal ?? null,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    // Network-level failure — try the legacy endpoint before giving up.
    const text = await sendChatMessage(messages, systemPrompt, maxTokens);
    opts.onDelta?.(text);
    return text;
  }

  if (res.status === 404 || res.status === 405) {
    const text = await sendChatMessage(messages, systemPrompt, maxTokens);
    opts.onDelta?.(text);
    return text;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('text/event-stream')) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.error?.message ||
        `The AI assistant couldn't be reached (error ${res.status}). Please try again in a moment.`,
    );
  }

  return readSseStream(res, opts);
}

/** Streaming multi-turn chat — full conversation history, word-by-word output. */
export async function continueConversationStreaming(
  history: ChatMessage[],
  userMessage: string,
  opts: StreamOptions = {},
): Promise<string> {
  const messages = [
    ...formatChatHistory(history),
    { role: 'user' as const, content: userMessage },
  ];
  return streamChatMessage(messages, SYSTEM_PROMPT_TRAVEL, opts);
}

/** Streaming itinerary generation — renders progressively as it's written. */
export async function generateItineraryStreaming(
  prompt: string,
  opts: StreamOptions = {},
): Promise<string> {
  return streamChatMessage([{ role: 'user', content: prompt }], SYSTEM_PROMPT_ITINERARY, opts, 4000);
}

/** Multi-turn chat — passes the full conversation history to preserve context. */
export async function continueConversation(history: ChatMessage[], userMessage: string): Promise<string> {
  const messages = [
    ...formatChatHistory(history),
    { role: 'user' as const, content: userMessage },
  ];
  return sendChatMessage(messages, SYSTEM_PROMPT_TRAVEL);
}

/** Generate a travel itinerary from a structured prompt. */
export async function generateItinerary(prompt: string): Promise<string> {
  return sendChatMessage(
    [{ role: 'user', content: prompt }],
    SYSTEM_PROMPT_ITINERARY,
    4000,
  );
}

export function formatChatHistory(
  messages: ChatMessage[],
): { role: 'user' | 'assistant'; content: string }[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
