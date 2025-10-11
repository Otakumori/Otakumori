import 'dotenv/config';

const SERVE_URL = process.env.INNGEST_SERVE_URL;
if (!SERVE_URL) {
  console.error('INNGEST_SERVE_URL not set');
  process.exit(1);
}
const need = ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'].filter((k) => !process.env[k]);
if (need.length) {
  console.error('Missing env:', need.join(', '));
  process.exit(1);
}

const getRes = await fetch(SERVE_URL);
if (!getRes.ok) {
  console.error('GET failed', getRes.status);
  process.exit(1);
}
const postRes = await fetch(SERVE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'healthcheck/inngest', data: { ci: true } }),
});
if (!postRes.ok) {
  console.error('POST failed', postRes.status);
  process.exit(1);
}
console.log('✅ Inngest OK');
