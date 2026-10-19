// ─── MODEL CONFIG ────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

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

function jsonResponse(statusCode, payload) {
  return { statusCode, headers: { 'Content-Type': 'application/json', ...CORS }, body: JSON.stringify(payload) };
}

exports.handler = async function(event) {
  // CORS preflight — the browser sends this before every cross-origin POST.
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: { message: 'Method Not Allowed' } });
  }

  // Fail fast with an honest message instead of sending an empty bearer token
  // upstream (OpenRouter would only reply "Missing Authentication header").
  const OPENROUTER_API_KEY = getOpenRouterKey();
  if (!OPENROUTER_API_KEY) {
    return jsonResponse(503, { error: { message: MAINTENANCE_MESSAGE } });
  }

  try {
    const body = JSON.parse(event.body);

    // Build OpenRouter request — same messages/system shape as Anthropic
    // (the client-sent `model` is ignored: the frontend hardcodes an
    // Anthropic slug OpenRouter rejects).
    const orBody = {
      max_tokens: body.max_tokens || 2000,
      messages: body.messages,
    };
    if (body.system) {
      // OpenRouter accepts system as a top-level field (same as Anthropic)
      orBody.system = body.system;
    }

    // Try each model candidate in turn — OpenRouter retires free slugs
    // without notice, so degrade to the next working model instead of
    // surfacing an error.
    let response = null;
    let lastStatus = 502;
    let lastMessage = null;

    for (const model of MODEL_FALLBACKS) {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://wandrtravel-app.netlify.app',
          'X-Title': 'Wandr Travel Planner',
        },
        body: JSON.stringify({ ...orBody, model }),
      });

      if (res.ok) {
        response = res;
        break;
      }

      const data = await res.json().catch(() => null);
      // A 401/403 from OpenRouter means the key is invalid or revoked —
      // surface the friendly maintenance message rather than the raw
      // "Missing Authentication header" text.
      if (res.status === 401 || res.status === 403) {
        return jsonResponse(res.status, { error: { message: MAINTENANCE_MESSAGE } });
      }
      lastStatus = res.status;
      lastMessage = data?.error?.message || `OpenRouter error (${res.status})`;
      if (!isModelUnavailable(res.status, lastMessage)) break;
    }

    if (!response) {
      return jsonResponse(lastStatus, { error: { message: lastMessage || `OpenRouter error (${lastStatus})` } });
    }

    const data = await response.json().catch(() => null);

    // Normalize OpenRouter response → Anthropic shape so aiService.ts needs no changes
    // OpenRouter: data.choices[0].message.content
    // Anthropic:  data.content[0].text
    const text = data.choices?.[0]?.message?.content ?? '';
    const normalized = {
      content: [{ type: 'text', text }],
    };

    return jsonResponse(200, normalized);
  } catch (err) {
    return jsonResponse(500, { error: { message: err.message || 'Unexpected server error' } });
  }
};
