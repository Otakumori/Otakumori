#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔧 Replacing all @/env imports with @/env.mjs...\n');

// Get all files that import from @/env
const output = execSync(
  'grep -rl "from [\'\\"]@/env[\'\\"]" app lib components src utils instrumentation.ts eslint.config.js --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" 2>nul || echo',
  { encoding: 'utf-8', shell: 'powershell.exe' }
);

const files = output
  .split('\n')
  .map((f) => f.trim())
  .filter((f) => f && !f.includes('node_modules') && !f.endsWith('.backup'));

console.log(`Found ${files.length} files to update\n`);

let updated = 0;
for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    const original = content;
    
    // Replace all variations
    content = content.replace(/from ['"]@\/env['"]/g, "from '@/env.mjs'");
    content = content.replace(/from ['"]\.\.?\/env['"]/g, "from './env.mjs'");
    
    if (content !== original) {
      writeFileSync(file, content, 'utf-8');
      console.log(`✅ Updated: ${file}`);
      updated++;
    }
  } catch (err) {
    console.log(`❌ Failed: ${file}`);
  }
}

console.log(`\n🎉 Updated ${updated} files!`);
console.log('\nNext: git add . && git commit -m "fix: use env.mjs everywhere" && git push');

