// Itinerary form proxy — keeps the upstream webhook URL server-side so it
// never ships in the client bundle and can be rotated without a redeploy.
// Configure the stable production webhook (e.g. the permanent n8n Cloud
// /webhook/itinerary-request URL) via the ITINERARY_WEBHOOK_URL env var in
// Netlify → Site settings → Environment variables.
const WEBHOOK_URL_ENV = 'ITINERARY_WEBHOOK_URL';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookUrl = process.env[WEBHOOK_URL_ENV];
  if (!webhookUrl) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: { message: 'Itinerary webhook is not configured (ITINERARY_WEBHOOK_URL missing).' },
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: { message: `Webhook error (${response.status})` } }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: { message: err.message } }),
    };
  }
};
