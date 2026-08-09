import 'dotenv/config';

const SERVE_URL = process.env.INNGEST_SERVE_URL;
if (!SERVE_URL) {
  console.error('Inngest serve URL is not configured.');
  process.exit(1);
}

const requiredKeys = ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'];
if (requiredKeys.some((key) => !process.env[key])) {
  console.error('Required Inngest configuration is unavailable.');
  process.exit(1);
}

const response = await fetch(SERVE_URL);
if (!response.ok) {
  console.error('Inngest serve endpoint health check failed', response.status);
  process.exit(1);
}

console.log('Inngest serve endpoint health check passed. No event was sent.');
