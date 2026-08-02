/**
 * AI Service — abstracts all Claude API calls behind a single service layer.
 * Swap the endpoint or model here without touching any UI component.
 * TODO: Add streaming support via EventSource / ReadableStream.
 * TODO: Add per-session rate limiting.
 */
import type { ChatMessage } from '@/types';

const API_ENDPOINT = '/api/claude';
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

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'AI service error');
  return data.content?.[0]?.text ?? '';
}

/** Single-turn travel Q&A (Visa Finder, quick questions). */
export async function askTravelQuestion(question: string): Promise<string> {
  return sendChatMessage(
    [{ role: 'user', content: question }],
    SYSTEM_PROMPT_TRAVEL,
  );
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
