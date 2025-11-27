#!/usr/bin/env node
/**
 * Consolidate components from root components/ to app/components/
 * Run: node scripts/consolidate-components.mjs --dry-run
 * Run: node scripts/consolidate-components.mjs --execute
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, copyFileSync, rmSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'reports', 'coverage'];
const ROOT_COMPONENTS = './components';
const APP_COMPONENTS = './app/components';

function findComponentFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findComponentFiles(filePath, fileList);
      } else if (stat.isFile() && /\.(tsx|ts|jsx|js)$/.test(file)) {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function findImports(content, filePath) {
  const imports = [];
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('@/components/') || 
        importPath.startsWith('../components/') || 
        importPath.startsWith('./components/') ||
        importPath.includes('/components/')) {
      imports.push({
        original: match[0],
        path: importPath,
        fullMatch: match[0],
        index: match.index,
      });
    }
  }
  
  return imports;
}

function updateImportPath(importPath, fromFile) {
  // Handle @/components/ imports
  if (importPath.startsWith('@/components/')) {
    return importPath.replace('@/components/', '@/app/components/');
  }
  
  // Handle relative imports
  if (importPath.startsWith('../components/') || importPath.startsWith('./components/')) {
    const fromDir = dirname(fromFile);
    const oldPath = join(fromDir, importPath.replace(/^\.\.?\/components\//, 'components/'));
    const newPath = join(APP_COMPONENTS, importPath.replace(/^\.\.?\/components\//, ''));
    const relativePath = relative(fromDir, newPath).replace(/\\/g, '/');
    return relativePath.startsWith('.') ? relativePath : './' + relativePath;
  }
  
  // Handle nested component imports (e.g., '@/components/hero/FeaturedProducts')
  if (importPath.includes('/components/')) {
    return importPath.replace(/\/components\//, '/app/components/');
  }
  
  return importPath;
}

function consolidateComponents() {
  if (!existsSync(ROOT_COMPONENTS)) {
    return { toMove: [], duplicates: [], rootComponents: [] };
  }

  const rootComponents = findComponentFiles(ROOT_COMPONENTS);
  const appComponents = findComponentFiles(APP_COMPONENTS);
  const appComponentMap = new Map();
  
  // Map existing app/components files
  appComponents.forEach(file => {
    const relPath = relative(APP_COMPONENTS, file);
    appComponentMap.set(relPath, file);
  });
  
  const toMove = [];
  const toMerge = [];
  const duplicates = [];
  
  // Analyze root components
  rootComponents.forEach(file => {
    const relPath = relative(ROOT_COMPONENTS, file);
    const targetPath = join(APP_COMPONENTS, relPath);
    
    if (appComponentMap.has(relPath)) {
      // Duplicate exists - need to merge or choose
      duplicates.push({ root: file, app: appComponentMap.get(relPath), relPath });
    } else {
      // Safe to move
      toMove.push({ from: file, to: targetPath, relPath });
    }
  });
  
  return { toMove, duplicates, rootComponents };
}

function updateAllImports() {
  const allFiles = findComponentFiles('./app');
  const updates = [];
  
  allFiles.forEach(file => {
    const content = readFileSync(file, 'utf8');
    const imports = findImports(content, file);
    
    if (imports.length > 0) {
      let newContent = content;
      let hasChanges = false;
      
      // Process imports in reverse order to preserve indices
      imports.reverse().forEach(imp => {
        const newPath = updateImportPath(imp.path, file);
        if (newPath !== imp.path) {
          newContent = 
            newContent.slice(0, imp.index) +
            newContent.slice(imp.index).replace(imp.path, newPath) +
            newContent.slice(imp.index + imp.fullMatch.length);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        updates.push({ file, content: newContent });
      }
    }
  });
  
  return updates;
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');
const isExecute = process.argv.includes('--execute');

if (!isDryRun && !isExecute) {
  console.log('Usage: node scripts/consolidate-components.mjs --dry-run|--execute');
  process.exit(1);
}

const { toMove, duplicates } = consolidateComponents();
const importUpdates = updateAllImports();

console.log(`📦 Found ${toMove.length} components to move`);
console.log(`⚠️  Found ${duplicates.length} duplicate components`);
console.log(`📝 Found ${importUpdates.length} files with imports to update`);

if (isDryRun) {
  console.log('\n📋 Components to move:');
  toMove.forEach(({ relPath }) => console.log(`  - ${relPath}`));
  
  if (duplicates.length > 0) {
    console.log('\n⚠️  Duplicates (need manual review):');
    duplicates.forEach(({ relPath }) => console.log(`  - ${relPath}`));
  }
  
  if (importUpdates.length > 0) {
    console.log('\n📝 Import updates:');
    importUpdates.slice(0, 20).forEach(({ file }) => console.log(`  - ${file}`));
    if (importUpdates.length > 20) {
      console.log(`  ... and ${importUpdates.length - 20} more`);
    }
  }
} else if (isExecute) {
  // Move components
  toMove.forEach(({ from, to, relPath }) => {
    const targetDir = dirname(to);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }
    copyFileSync(from, to);
    console.log(`✅ Moved: ${relPath}`);
  });
  
  // Update imports
  importUpdates.forEach(({ file, content }) => {
    writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated imports: ${file}`);
  });
  
  if (duplicates.length > 0) {
    console.log('\n⚠️  Manual review needed for duplicates:');
    duplicates.forEach(({ relPath }) => console.log(`  - ${relPath}`));
  }
  
  console.log('\n✨ Consolidation complete!');
  console.log('⚠️  Remember to:');
  console.log('  1. Review duplicate components manually');
  console.log('  2. Test the application');
  console.log('  3. Delete root components/ directory after verification');
}

