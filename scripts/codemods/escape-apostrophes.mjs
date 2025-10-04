// Escape apostrophes in JSX text nodes
import { promises as fs } from 'fs';
import path from 'path';

async function processFile(file) {
  let text = await fs.readFile(file, 'utf8');
  // Replace ' in JSX text nodes with {"'"}
  text = text.replace(/([>\s])'([a-zA-Z])/g, '$1{"\'"}$2');
  await fs.writeFile(file, text, 'utf8');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(jsx|tsx)$/.test(entry.name)) await processFile(full);
  }
}

await walk(process.cwd());
console.log('Apostrophes in JSX text nodes escaped.');
