// ─── Wandr AI streaming proxy (Netlify Function v2) ─────────────────────────
// POST /api/claude/stream  →  Server-Sent Events
//   body:   { messages: [{role, content}], system?: string, max_tokens?: n,
//             model?: string }
//   stream: data: {"delta":"text chunk"}\n\n  … repeated …  data: {"done":true}\n\n
//
// Same request shape as the non-streaming /api/claude function (claude.cjs),
// so the frontend can fall back to it transparently. The OpenRouter API key
// stays server-side.

// Default chat model. Free model slugs on OpenRouter rotate often (this
// project has been bitten twice: gemma-4-31b hit rate limits, then
// nemotron-3-nano-30b was pulled from the free tier), so a "model
// unavailable" error automatically retries with the next candidate below
// before surfacing anything to the user. Override via OPENROUTER_MODEL.
const MODEL_OVERRIDE = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free';
const MODEL_FALLBACKS = [
  MODEL_OVERRIDE,
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'google/gemma-4-31b-it:free',
];

const MODEL_UNAVAILABLE =
  /(unavailable|not found|no such model|does not exist|not offered|not a valid model|invalid model)/i;

/** True when OpenRouter rejected the request because the model slug is gone. */
function isModelUnavailable(status, message) {
  return (status === 404 || status === 400) && MODEL_UNAVAILABLE.test(message || '');
}

// Friendly message shown whenever the OpenRouter key is missing or blank —
// far better UX than letting an empty bearer token reach OpenRouter and
// bounce back as a raw "Missing Authentication header" 401.
const MAINTENANCE_MESSAGE =
  'AI assistant is temporarily in maintenance mode. Please ensure OPENROUTER_API_KEY is configured in Netlify.';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Resolves the OpenRouter API key with fallbacks for alternate env var names.
 * Whitespace-only values count as missing (they would otherwise produce an
 * empty Authorization header upstream).
 */
function getOpenRouterKey() {
  const candidates = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_KEY,
    process.env.VITE_OPENROUTER_API_KEY,
  ];
  for (const candidate of candidates) {
    const key = typeof candidate === 'string' ? candidate.trim() : '';
    if (key) return key;
  }
  return null;
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function sse(data) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return jsonError(405, 'Method Not Allowed');
  }

  // Fail fast with an honest message instead of sending an empty bearer token
  // upstream (OpenRouter would only reply "Missing Authentication header").
  const OPENROUTER_API_KEY = getOpenRouterKey();
  if (!OPENROUTER_API_KEY) {
    return jsonError(503, MAINTENANCE_MESSAGE);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON body');
  }

  const orBody = {
    max_tokens: body.max_tokens || 2000,
    messages: body.messages,
    stream: true,
  };
  if (body.system) orBody.system = body.system;

  // Model candidates: the client-sent `model` is intentionally ignored — the
  // frontend hardcodes an Anthropic slug ("claude-sonnet-4-20250514") that
  // OpenRouter rejects. The configured default + fallbacks are used instead.
  const models = [...MODEL_FALLBACKS];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => controller.enqueue(encoder.encode(sse(data)));

      try {
        let upstream = null;
        let lastStatus = 502;
        let lastMessage = null;

        // Try each candidate in turn — OpenRouter retires free slugs without
        // notice, so degrade to the next working model instead of erroring.
        for (const model of models) {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://wandrtravel-app.netlify.app',
              'X-Title': 'Wandr Travel Planner',
            },
            body: JSON.stringify({ ...orBody, model }),
          });

          if (res.ok && res.body) {
            upstream = res;
            break;
          }

          const errText = await res.text().catch(() => '');
          // A 401/403 from OpenRouter means the key is invalid or revoked —
          // surface the same friendly maintenance message rather than the
          // raw "Missing Authentication header" text.
          if (res.status === 401 || res.status === 403) {
            send({ error: { message: MAINTENANCE_MESSAGE } });
            return;
          }
          lastStatus = res.status;
          lastMessage = `OpenRouter error (${res.status})`;
          try {
            const parsed = JSON.parse(errText);
            if (parsed?.error?.message) lastMessage = parsed.error.message;
          } catch {
            /* keep generic message */
          }

          if (!isModelUnavailable(res.status, lastMessage)) break;
        }

        if (!upstream) {
          send({ error: { message: lastMessage || `OpenRouter error (${lastStatus})` } });
          return;
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

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
            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) send({ delta });
            } catch {
              /* partial/garbled chunk — skip */
            }
          }
        }

        send({ done: true });
      } catch (err) {
        send({ error: { message: err?.message || 'Streaming failed' } });
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      ...CORS,
    },
  });
}
