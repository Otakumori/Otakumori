#!/usr/bin/env node
/**
 * Replace custom loading states with standard skeletons
 * Run: node scripts/standardize-loading-states.mjs --dry-run
 * Run: node scripts/standardize-loading-states.mjs --execute
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'reports', 'coverage'];
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Common loading patterns to detect
const CUSTOM_LOADING_PATTERNS = [
  /<div[^>]*loading[^>]*>.*?<\/div>/gis,
  /Loading\.\.\./g,
  /isLoading.*\?.*<div/g,
  /loading.*\?.*<div/g,
  /<div[^>]*>Loading<\/div>/gi,
  /<p[^>]*>Loading\.\.\.<\/p>/gi,
];

const SKELETON_IMPORTS = {
  'ProductCardSkeleton': "import { ProductCardSkeleton, ShopGridSkeleton } from '@/app/components/ui/Skeleton';",
  'ShopGridSkeleton': "import { ShopGridSkeleton } from '@/app/components/ui/Skeleton';",
  'Skeleton': "import { Skeleton } from '@/app/components/ui/Skeleton';",
};

function findFiles(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      } else if (stat.isFile() && FILE_EXTENSIONS.includes(extname(file))) {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function hasSkeletonImport(content) {
  return /import.*Skeleton.*from.*['"]@\/app\/components\/ui\/Skeleton['"]/.test(content);
}

function detectPageType(filePath) {
  if (filePath.includes('shop') || filePath.includes('product')) {
    return 'ShopGridSkeleton';
  }
  return 'Skeleton';
}

function replaceCustomLoading(content, filePath) {
  let modified = content;
  let needsImport = false;
  const pageType = detectPageType(filePath);
  const importType = pageType === 'ShopGridSkeleton' ? 'ShopGridSkeleton' : 'Skeleton';
  
  // Detect if there are custom loading patterns
  let hasCustomLoading = false;
  for (const pattern of CUSTOM_LOADING_PATTERNS) {
    if (pattern.test(content)) {
      hasCustomLoading = true;
      break;
    }
  }
  
  if (!hasCustomLoading) {
    return { modified, changed: false };
  }
  
  // Replace common loading patterns
  // Pattern 1: Simple "Loading..." text
  modified = modified.replace(/<div[^>]*>Loading\.\.\.<\/div>/gi, 
    pageType === 'ShopGridSkeleton' ? '<ShopGridSkeleton />' : '<Skeleton />');
  
  modified = modified.replace(/<p[^>]*>Loading\.\.\.<\/p>/gi, 
    pageType === 'ShopGridSkeleton' ? '<ShopGridSkeleton />' : '<Skeleton />');
  
  // Pattern 2: Conditional loading with isLoading
  modified = modified.replace(
    /(isLoading|loading)\s*\?\s*<div[^>]*>.*?Loading.*?<\/div>/gis,
    (match) => {
      const condition = match.match(/(isLoading|loading)/)?.[0] || 'isLoading';
      return `${condition} ? <${importType} /> : `;
    }
  );
  
  // Pattern 3: Loading divs with loading class
  modified = modified.replace(
    /<div[^>]*className[^>]*loading[^>]*>.*?<\/div>/gis,
    pageType === 'ShopGridSkeleton' ? '<ShopGridSkeleton />' : '<Skeleton />'
  );
  
  // Check if import needed
  if (modified !== content && !hasSkeletonImport(modified)) {
    needsImport = true;
  }
  
  // Add import
  if (needsImport) {
    const importLine = SKELETON_IMPORTS[importType];
    
    // Find first import line
    const firstImportMatch = modified.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPos = modified.indexOf(firstImportMatch[0]);
      modified = modified.slice(0, insertPos) + 
                 importLine + '\n' + 
                 modified.slice(insertPos);
    } else {
      // No imports, add at top (after 'use client' if present)
      const useClientMatch = modified.match(/^['"]use client['"];?\s*\n/);
      if (useClientMatch) {
        const insertPos = useClientMatch.index + useClientMatch[0].length;
        modified = modified.slice(0, insertPos) + 
                  importLine + '\n' + 
                  modified.slice(insertPos);
      } else {
        modified = importLine + '\n\n' + modified;
      }
    }
  }
  
  return { modified, changed: modified !== content };
}

// Main execution
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
const rootDir = join(__dirname, '..');
const appDir = join(rootDir, 'app');

console.log('🔍 Scanning for custom loading states...\n');

let files = [];
try {
  files = findFiles(appDir);
} catch (e) {
  console.error('Error scanning files:', e.message);
  process.exit(1);
}

const filesWithCustomLoading = files.filter(f => {
  try {
    const content = readFileSync(f, 'utf8');
    return CUSTOM_LOADING_PATTERNS.some(pattern => {
      // Reset regex lastIndex
      pattern.lastIndex = 0;
      return pattern.test(content);
    });
  } catch {
    return false;
  }
});

console.log(`Found ${filesWithCustomLoading.length} files with custom loading states\n`);

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE\n');
  filesWithCustomLoading.slice(0, 20).forEach(f => {
    try {
      const content = readFileSync(f, 'utf8');
      let matchCount = 0;
      CUSTOM_LOADING_PATTERNS.forEach(pattern => {
        pattern.lastIndex = 0;
        const matches = content.match(pattern);
        if (matches) matchCount += matches.length;
      });
      console.log(`${f.replace(rootDir + '/', '')}: ${matchCount} custom loading patterns`);
    } catch (e) {
      console.log(`${f}: Error reading file`);
    }
  });
  if (filesWithCustomLoading.length > 20) {
    console.log(`\n... and ${filesWithCustomLoading.length - 20} more files`);
  }
  console.log('\nRun with --execute to apply replacements');
} else {
  let fixed = 0;
  let errors = 0;
  let skipped = 0;
  
  filesWithCustomLoading.forEach(file => {
    try {
      const content = readFileSync(file, 'utf8');
      const { modified, changed } = replaceCustomLoading(content, file);
      
      if (changed) {
        writeFileSync(file, modified, 'utf8');
        console.log(`✅ Fixed: ${file.replace(rootDir + '/', '')}`);
        fixed++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file.replace(rootDir + '/', '')}:`, error.message);
      errors++;
    }
  });
  
  console.log(`\n📊 Summary: Fixed ${fixed}, Skipped ${skipped}, Errors: ${errors}`);
  console.log('\n⚠️  Note: This script handles common patterns. Manual review may be needed for complex cases.');
}

