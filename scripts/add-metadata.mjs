#!/usr/bin/env node
/**
 * Add generateMetadata() to pages missing it
 * Run: node scripts/add-metadata.mjs --dry-run
 * Run: node scripts/add-metadata.mjs --execute
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'reports', 'coverage'];

function findPageFiles(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findPageFiles(filePath, fileList);
      } else if (stat.isFile() && file === 'page.tsx') {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function hasMetadata(content) {
  return /export\s+(async\s+)?function\s+generateMetadata/.test(content);
}

function hasSEOImport(content) {
  return /import.*generateSEO.*from.*['"]@\/app\/lib\/seo['"]/.test(content);
}

function getTitleForPage(filePath) {
  const relativePath = filePath.replace(/^.*\/app\//, '');
  
  if (relativePath.includes('mini-games') && relativePath.includes('[slug]')) {
    return 'Mini Game';
  }
  if (relativePath.includes('shop/product') && relativePath.includes('[id]')) {
    return 'Product';
  }
  if (relativePath.includes('shop') && relativePath.includes('[category]')) {
    return 'Shop Category';
  }
  if (relativePath.includes('shop')) {
    return 'Shop';
  }
  if (relativePath.includes('profile') && relativePath.includes('[username]')) {
    return 'User Profile';
  }
  if (relativePath.includes('profile')) {
    return 'Profile';
  }
  if (relativePath.includes('trade')) {
    return 'Scarlet Bazaar';
  }
  if (relativePath.includes('parties')) {
    return 'Parties';
  }
  if (relativePath.includes('soapstones')) {
    return 'Soapstones';
  }
  if (relativePath.includes('storage')) {
    return 'Storage';
  }
  if (relativePath.includes('mini-games')) {
    return 'Mini Games';
  }
  
  return 'Page';
}

function getDescriptionForPage(filePath) {
  const relativePath = filePath.replace(/^.*\/app\//, '');
  
  if (relativePath.includes('mini-games')) {
    return 'Play mini-games and earn rewards';
  }
  if (relativePath.includes('shop')) {
    return 'Browse our anime and gaming merchandise';
  }
  if (relativePath.includes('profile')) {
    return 'View user profile';
  }
  if (relativePath.includes('trade')) {
    return 'Trade items in the Scarlet Bazaar';
  }
  if (relativePath.includes('parties')) {
    return 'Join parties and play together';
  }
  if (relativePath.includes('soapstones')) {
    return 'Leave signs for fellow travelers';
  }
  if (relativePath.includes('storage')) {
    return 'Manage your storage';
  }
  
  return 'Anime x gaming shop + play — petals, runes, rewards.';
}

function getUrlForPage(filePath) {
  const relativePath = filePath.replace(/^.*\/app\//, '');
  const url = '/' + relativePath.replace(/\/page\.tsx$/, '').replace(/\[(\w+)\]/g, ':$1');
  return url;
}

function extractParamName(filePath) {
  const paramMatch = filePath.match(/\[(\w+)\]/);
  return paramMatch ? paramMatch[1] : 'slug';
}

function generateMetadataCode(filePath) {
  const isDynamic = filePath.includes('[') && filePath.includes(']');
  const paramName = isDynamic ? extractParamName(filePath) : null;
  const title = getTitleForPage(filePath);
  const description = getDescriptionForPage(filePath);
  const url = getUrlForPage(filePath);
  
  if (isDynamic && paramName) {
    return `export async function generateMetadata({ params }: { params: Promise<{ ${paramName}: string }> }) {
  const { ${paramName} } = await params;
  
  return generateSEO({
    title: '${title}',
    description: '${description}',
    url: '${url}',
  });
}`;
  } else {
    return `export function generateMetadata() {
  return generateSEO({
    title: '${title}',
    description: '${description}',
    url: '${url}',
  });
}`;
  }
}

function addMetadataToFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  
  // Check if already has metadata
  if (hasMetadata(content)) {
    return { modified: false, reason: 'Already has metadata' };
  }
  
  // Generate metadata code
  const metadataCode = generateMetadataCode(filePath);
  
  // Add import if needed
  if (!hasSEOImport(content)) {
    const importLine = "import { generateSEO } from '@/app/lib/seo';";
    
    // Find first import line
    const firstImportMatch = content.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPos = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPos) + 
                importLine + '\n' + 
                content.slice(insertPos);
    } else {
      // No imports, add at top (after 'use client' if present)
      const useClientMatch = content.match(/^['"]use client['"];?\s*\n/);
      if (useClientMatch) {
        const insertPos = useClientMatch.index + useClientMatch[0].length;
        content = content.slice(0, insertPos) + 
                  importLine + '\n' + 
                  content.slice(insertPos);
      } else {
        content = importLine + '\n\n' + content;
      }
    }
  }
  
  // Add metadata function before default export or at end
  const defaultExportMatch = content.match(/^export\s+default\s+/m);
  if (defaultExportMatch) {
    const insertPos = content.indexOf(defaultExportMatch[0]);
    // Check if there's already a newline before export
    const beforeExport = content.substring(Math.max(0, insertPos - 2), insertPos);
    const needsNewline = !beforeExport.endsWith('\n\n') && !beforeExport.endsWith('\n');
    content = content.slice(0, insertPos) + 
              metadataCode + (needsNewline ? '\n\n' : '\n') + 
              content.slice(insertPos);
  } else {
    // No default export, add at end
    content = content.trimEnd() + '\n\n' + metadataCode + '\n';
  }
  
  return { modified: true, content };
}

// Main execution
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
const rootDir = join(__dirname, '..');
const appDir = join(rootDir, 'app');

console.log('🔍 Scanning for pages missing metadata...\n');

let pageFiles = [];
try {
  pageFiles = findPageFiles(appDir);
} catch (e) {
  console.error('Error scanning files:', e.message);
  process.exit(1);
}

const filesToFix = pageFiles.filter(f => {
  try {
    const content = readFileSync(f, 'utf8');
    return !hasMetadata(content);
  } catch {
    return false;
  }
});

console.log(`Found ${filesToFix.length} pages needing metadata (out of ${pageFiles.length} total pages)\n`);

if (DRY_RUN) {
  filesToFix.slice(0, 30).forEach(f => {
    console.log(`  📄 ${f.replace(rootDir + '/', '')}`);
  });
  if (filesToFix.length > 30) {
    console.log(`\n... and ${filesToFix.length - 30} more pages`);
  }
  console.log('\nRun with --execute to add metadata');
} else {
  let fixed = 0;
  let errors = 0;
  let skipped = 0;
  
  filesToFix.forEach(file => {
    try {
      const { modified, content, reason } = addMetadataToFile(file);
      if (modified) {
        writeFileSync(file, content, 'utf8');
        console.log(`✅ Added metadata to: ${file.replace(rootDir + '/', '')}`);
        fixed++;
      } else {
        console.log(`⚠️  Skipped ${file.replace(rootDir + '/', '')}: ${reason}`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file.replace(rootDir + '/', '')}:`, error.message);
      errors++;
    }
  });
  
  console.log(`\n📊 Summary: Fixed ${fixed}, Skipped ${skipped}, Errors: ${errors}`);
}

