import http from 'node:http';
import https from 'node:https';

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const GET = (path) =>
  new Promise((res) => {
    const url = new URL(path, ORIGIN);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(url, (r) => {
      let data = '';
      r.on('data', (c) => (data += c));
      r.on('end', () => res({ status: r.statusCode || 0, path, ok: r.statusCode < 500, data }));
    });
    req.on('error', () => res({ status: 0, path, ok: false, data: '' }));
  });

const checks = [
  '/', // home should render
  '/about', // should NOT force petals globally
  '/blog', // blog renders
  '/mini-games', // ssr:false components should not crash
  '/api/soapstones', // must return JSON, even on failure
  '/api/shop/products', // must not 500; safe JSON if env missing
];

const main = async () => {
  const results = await Promise.all(checks.map(GET));
  const bad = results.filter((r) => !r.ok);
  results.forEach((r) => console.log(`${r.ok ? '' : ''} ${r.status} ${r.path}`));
  if (bad.length) {
    console.error('\nHealth check failures:');
    bad.forEach((r) => console.error(` - ${r.path}: ${r.status}`));
    process.exit(1);
  }
};
main();
