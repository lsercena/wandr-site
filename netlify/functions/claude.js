// ─── MODEL CONFIG ────────────────────────────────────────────────────────────
// TEMPORARY (2026-08-11): Gemma 4 31B hitting 429 rate limits; DeepSeek R1 free
// and Llama 3.3 70B free have been removed from OpenRouter's free tier entirely.
// nvidia/nemotron-3-nano-30b-a3b:free tested OK — 16s, good structured output.
// To restore: change back to google/gemma-4-31b-it:free
// PAID (swap when OpenRouter balance is funded):
//   const MODEL_OVERRIDE = 'anthropic/claude-sonnet-4-5';
const MODEL_OVERRIDE = 'nvidia/nemotron-3-nano-30b-a3b:free';
// ─────────────────────────────────────────────────────────────────────────────

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    // Build OpenRouter request — same messages/system shape as Anthropic
    const orBody = {
      model: MODEL_OVERRIDE,
      max_tokens: body.max_tokens || 2000,
      messages: body.messages,
    };
    if (body.system) {
      // OpenRouter accepts system as a top-level field (same as Anthropic)
      orBody.system = body.system;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://wandrtravel-app.netlify.app',
        'X-Title': 'Wandr Travel Planner',
      },
      body: JSON.stringify(orBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: { message: data.error?.message || 'OpenRouter error' } }),
      };
    }

    // Normalize OpenRouter response → Anthropic shape so aiService.ts needs no changes
    // OpenRouter: data.choices[0].message.content
    // Anthropic:  data.content[0].text
    const text = data.choices?.[0]?.message?.content ?? '';
    const normalized = {
      content: [{ type: 'text', text }],
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(normalized),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: err.message } }),
    };
  }
};
