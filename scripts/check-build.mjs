#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔍 Checking build status...\n');

try {
  // Check if package.json exists
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  console.log('✅ Package.json found');

  // Check dependencies
  console.log('📦 Checking dependencies...');
  execSync('npm list --depth=0', { stdio: 'pipe' });
  console.log('✅ Dependencies are installed');

  // Check for vulnerabilities
  console.log('🔒 Checking security vulnerabilities...');
  try {
    const auditResult = execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
    console.log('✅ No security vulnerabilities found');
  } catch (error) {
    console.log('⚠️  Security vulnerabilities detected. Run "npm audit fix" to resolve.');
  }

  // Check TypeScript
  console.log('🔧 Checking TypeScript...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.log('❌ TypeScript errors found');
    console.log(error.stdout?.toString() || error.message);
  }

  // Check ESLint
  console.log('📝 Checking ESLint...');
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    console.log('✅ ESLint checks passed');
  } catch (error) {
    console.log('⚠️  ESLint warnings/errors found');
    console.log(error.stdout?.toString() || error.message);
  }

  console.log('\n🎉 Build check completed!');
} catch (error) {
  console.error('❌ Build check failed:', error.message);
  process.exit(1);
}
