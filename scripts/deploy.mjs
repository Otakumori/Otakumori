#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🚀 Starting deployment process...\n');

try {
  // Step 1: Check if we're in a git repository
  console.log('📋 Step 1: Checking git status...');
  try {
    execSync('git status --porcelain', { stdio: 'pipe' });
    console.log('✅ Git repository found');
  } catch (error) {
    console.log('❌ Not in a git repository. Initializing...');
    execSync('git init', { stdio: 'inherit' });
  }

  // Step 2: Check for uncommitted changes
  console.log('\n📋 Step 2: Checking for uncommitted changes...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('📝 Found uncommitted changes:');
    console.log(gitStatus);

    // Add all changes
    console.log('\n➕ Adding all changes...');
    execSync('git add .', { stdio: 'inherit' });

    // Commit with timestamp
    const timestamp = new Date().toISOString();
    const commitMessage = `Deploy: ${timestamp}`;
    console.log(`\n💾 Committing changes: ${commitMessage}`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  } else {
    console.log('✅ No uncommitted changes');
  }

  // Step 3: Run final build check
  console.log('\n📋 Step 3: Running final build check...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (error) {
    console.log('❌ Build failed. Please fix errors before deploying.');
    process.exit(1);
  }

  // Step 4: Check for deployment platform
  console.log('\n📋 Step 4: Checking deployment platform...');

  // Check for Vercel
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI found');

    console.log('\n🚀 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Deployment to Vercel completed!');
  } catch (error) {
    console.log('⚠️  Vercel CLI not found. Checking for other platforms...');

    // Check for Netlify
    try {
      execSync('netlify --version', { stdio: 'pipe' });
      console.log('✅ Netlify CLI found');

      console.log('\n🚀 Deploying to Netlify...');
      execSync('netlify deploy --prod', { stdio: 'inherit' });
      console.log('✅ Deployment to Netlify completed!');
    } catch (error) {
      console.log('⚠️  No deployment platform CLI found.');
      console.log('📋 Manual deployment steps:');
      console.log('1. Push to your git repository');
      console.log('2. Connect your repository to your deployment platform');
      console.log('3. Configure environment variables');
      console.log('4. Deploy!');
    }
  }

  // Step 5: Push to remote repository
  console.log('\n📋 Step 5: Pushing to remote repository...');
  try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Pushed to remote repository');
  } catch (error) {
    console.log('⚠️  Could not push to remote. You may need to:');
    console.log('1. Add a remote repository: git remote add origin <url>');
    console.log('2. Set upstream: git push -u origin main');
  }

  console.log('\n🎉 Deployment process completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Verify your deployment is working');
  console.log('2. Check environment variables are set correctly');
  console.log('3. Monitor for any runtime errors');
  console.log('4. Test all major functionality');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
