#!/usr/bin/env node
/**
 * Add error boundaries to pages missing them
 * Run: node scripts/add-error-boundaries.mjs --dry-run
 * Run: node scripts/add-error-boundaries.mjs --execute
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'reports', 'coverage'];

function findPageFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
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

function hasErrorBoundary(content) {
  return /UniversalErrorBoundary|ErrorBoundary|ClientErrorBoundary/.test(content);
}

function getSectionName(filePath) {
  const sectionName = filePath
    .replace(/^.*[\\/]app[\\/]/, '')
    .replace(/[\\/]page\.tsx$/, '')
    .replace(/[\\/]/g, ' ')
    .replace(/\[.*?\]/g, '')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Page';
  
  return sectionName;
}

function findMatchingParen(str, start) {
  let depth = 1;
  let i = start + 1;
  while (i < str.length && depth > 0) {
    if (str[i] === '(') depth++;
    if (str[i] === ')') depth--;
    i++;
  }
  return i - 1;
}

function addErrorBoundary(filePath) {
  let content = readFileSync(filePath, 'utf8');
  
  // Check if already has error boundary
  if (hasErrorBoundary(content)) {
    return { file: filePath, status: 'skipped', reason: 'Already has error boundary' };
  }

  const sectionName = getSectionName(filePath);

  // Add import if not present
  const importStatement = "import { UniversalErrorBoundary } from '@/app/components/util/UniversalErrorBoundary';";
  if (!content.includes(importStatement)) {
    // Find the last import statement
    const importRegex = /^import\s+.+\s+from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = [...content.matchAll(importRegex)];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const insertIndex = lastImport.index + lastImport[0].length;
      content = 
        content.slice(0, insertIndex) +
        '\n' + importStatement +
        content.slice(insertIndex);
    } else {
      // No imports, add at the top
      content = importStatement + '\n\n' + content;
    }
  }

  // Find default export function
  const defaultExportMatch = content.match(/export\s+default\s+(?:async\s+)?function\s+(\w+)/);
  if (!defaultExportMatch) {
    return { file: filePath, status: 'skipped', reason: 'No default export function found' };
  }

  const functionName = defaultExportMatch[1];
  const functionStart = defaultExportMatch.index;
  
  // Find the return statement
  const functionBodyStart = content.indexOf('{', functionStart);
  if (functionBodyStart === -1) {
    return { file: filePath, status: 'skipped', reason: 'Could not find function body' };
  }

  // Find return statement
  const returnRegex = new RegExp(`return\\s*\\(`, 'g');
  let returnMatch;
  let returnIndex = -1;
  
  // Find return statement after function start
  while ((returnMatch = returnRegex.exec(content)) !== null) {
    if (returnMatch.index > functionStart) {
      returnIndex = returnMatch.index;
      break;
    }
  }

  if (returnIndex === -1) {
    // Try to find return without parens
    const returnNoParenRegex = new RegExp(`return\\s+<`, 'g');
    while ((returnMatch = returnNoParenRegex.exec(content)) !== null) {
      if (returnMatch.index > functionStart) {
        returnIndex = returnMatch.index;
        break;
      }
    }
    
    if (returnIndex === -1) {
      return { file: filePath, status: 'skipped', reason: 'Could not find return statement' };
    }
    
    // Handle return without parens - wrap the JSX
    const jsxStart = returnIndex + 6; // after "return "
    // Find matching closing tag for the root JSX element
    const jsxEnd = findJSXEnd(content, jsxStart);
    if (jsxEnd === -1) {
      return { file: filePath, status: 'skipped', reason: 'Could not find JSX end' };
    }
    
    const beforeReturn = content.slice(0, returnIndex + 6);
    const jsxContent = content.slice(jsxStart, jsxEnd);
    const afterReturn = content.slice(jsxEnd);
    
    content = 
      beforeReturn +
      `(\n        <UniversalErrorBoundary sectionName="${sectionName}">\n          ` +
      jsxContent +
      `\n        </UniversalErrorBoundary>\n      )` +
      afterReturn;
  } else {
    // Handle return with parens
    const parenStart = returnIndex + 6; // after "return "
    const parenEnd = findMatchingParen(content, parenStart);
    
    if (parenEnd === -1) {
      return { file: filePath, status: 'skipped', reason: 'Could not find matching paren' };
    }
    
    const beforeReturn = content.slice(0, parenStart + 1);
    const returnContent = content.slice(parenStart + 1, parenEnd);
    const afterReturn = content.slice(parenEnd);
    
    content = 
      beforeReturn +
      `\n        <UniversalErrorBoundary sectionName="${sectionName}">\n          ` +
      returnContent.trim() +
      `\n        </UniversalErrorBoundary>\n      ` +
      afterReturn;
  }

  return { file: filePath, status: 'modified', content };
}

function findJSXEnd(content, start) {
  let depth = 0;
  let i = start;
  let inTag = false;
  let inString = false;
  let stringChar = '';
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (!inString) {
      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
      } else if (char === '<' && nextChar !== '/') {
        depth++;
        inTag = true;
      } else if (char === '>' && inTag) {
        inTag = false;
        if (depth === 0) {
          return i + 1;
        }
      } else if (char === '<' && nextChar === '/') {
        depth--;
        if (depth === 0) {
          // Find the closing >
          const closeIndex = content.indexOf('>', i);
          return closeIndex + 1;
        }
      }
    } else {
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false;
      }
    }
    
    i++;
  }
  
  return -1;
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');
const isExecute = process.argv.includes('--execute');

if (!isDryRun && !isExecute) {
  console.log('Usage: node scripts/add-error-boundaries.mjs --dry-run|--execute');
  process.exit(1);
}

const pageFiles = findPageFiles('./app');
const results = [];

for (const file of pageFiles) {
  const result = addErrorBoundary(file);
  results.push(result);
  
  if (isExecute && result.status === 'modified') {
    writeFileSync(file, result.content, 'utf8');
    console.log(`✅ Modified: ${file}`);
  } else if (isDryRun) {
    console.log(`${result.status === 'modified' ? '📝' : '⏭️ '} ${file}: ${result.reason || 'Would modify'}`);
  }
}

console.log(`\n📊 Summary: ${results.filter(r => r.status === 'modified').length} files to modify`);

