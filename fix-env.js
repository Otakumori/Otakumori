import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Fixing Environment Variables ===');

// Read the current .env.local file
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('Current sign-in URL:', envContent.match(/NEXT_PUBLIC_CLERK_SIGN_IN_URL=.*/)?.[0]);
console.log('Current sign-up URL:', envContent.match(/NEXT_PUBLIC_CLERK_SIGN_UP_URL=.*/)?.[0]);

// Replace production URLs with localhost URLs
envContent = envContent.replace(
  /NEXT_PUBLIC_CLERK_SIGN_IN_URL=https:\/\/otaku-mori\.com\/sign-in/g,
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in'
);

envContent = envContent.replace(
  /NEXT_PUBLIC_CLERK_SIGN_UP_URL=https:\/\/otaku-mori\.com\/sign-up/g,
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up'
);

// Write the updated content back
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated sign-in URL to: /sign-in');
console.log('✅ Updated sign-up URL to: /sign-up');
console.log('=== Environment file updated! ===');
console.log('Please restart your dev server: npm run dev');
