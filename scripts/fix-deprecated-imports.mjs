#!/usr/bin/env node
/**
 * Script to fix imports that reference deprecated files
 * Run: node scripts/fix-deprecated-imports.mjs
 * 
 * This script:
 * 1. Reads audit and import reports
 * 2. Updates imports to point to replacement files
 * 3. Preserves relative path structure
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, relative, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const REPORT_DIR = join(process.cwd(), 'reports');
const AUDIT_REPORT = join(REPORT_DIR, 'deprecated-files-audit.json');
const IMPORTS_REPORT = join(REPORT_DIR, 'deprecated-imports-check.json');

if (!existsSync(AUDIT_REPORT)) {
  console.error('❌ Audit report not found. Run scripts/audit-deprecated-files.mjs first.');
  process.exit(1);
}

if (!existsSync(IMPORTS_REPORT)) {
  console.error('❌ Import check report not found. Run scripts/check-deprecated-imports.mjs first.');
  process.exit(1);
}

const auditReport = JSON.parse(readFileSync(AUDIT_REPORT, 'utf8'));
const importsReport = JSON.parse(readFileSync(IMPORTS_REPORT, 'utf8'));

// Create mapping of deprecated -> replacement
const replacementMap = new Map();
auditReport.safeToDelete.forEach(({ file, replacement }) => {
  replacementMap.set(file, replacement);
});

// Also add needsReview items that have valid replacements
auditReport.needsReview.forEach(({ file, claimedReplacement }) => {
  // Try to verify if replacement exists
  const possiblePaths = [
    claimedReplacement,
    resolve(process.cwd(), claimedReplacement),
    join(dirname(file), claimedReplacement),
  ];
  
  for (const possiblePath of possiblePaths) {
    if (existsSync(possiblePath)) {
      replacementMap.set(file, possiblePath);
      break;
    }
  }
});

function calculateNewImportPath(importingFile, oldImport, deprecatedFile, replacement) {
  // Calculate relative path from importing file to replacement
  const importingDir = dirname(importingFile);
  const replacementPath = resolve(process.cwd(), replacement);
  const relativePath = relative(importingDir, replacementPath);
  
  // Normalize path
  let normalized = relativePath.replace(/\\/g, '/');
  
  // Remove extension if it's a TypeScript/JavaScript file
  normalized = normalized.replace(/\.(ts|tsx|js|jsx|mjs)$/, '');
  
  // Ensure it starts with ./
  if (!normalized.startsWith('.')) {
    normalized = `./${normalized}`;
  }
  
  return normalized;
}

// Group imports by file
const importsByFile = {};
importsReport.imports.forEach(({ importingFile, deprecatedFile, importPath }) => {
  if (!importsByFile[importingFile]) {
    importsByFile[importingFile] = [];
  }
  importsByFile[importingFile].push({ deprecatedFile, importPath });
});

console.log(`\n🔧 Fixing imports in ${Object.keys(importsByFile).length} files...\n`);

let filesFixed = 0;
let importsFixed = 0;
const fixLog = [];

// Fix each file
Object.entries(importsByFile).forEach(([file, imports]) => {
  try {
    let content = readFileSync(file, 'utf8');
    let modified = false;
    const fileFixes = [];
    
    imports.forEach(({ deprecatedFile, importPath }) => {
      const replacement = replacementMap.get(deprecatedFile);
      if (replacement) {
        const newImport = calculateNewImportPath(file, importPath, deprecatedFile, replacement);
        
        // Escape special regex characters in importPath
        const escapedImport = importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Try different import patterns
        const patterns = [
          // ES6 import: from 'path'
          new RegExp(`from\\s+['"]${escapedImport}['"]`, 'g'),
          // require('path')
          new RegExp(`require\\(['"]${escapedImport}['"]\\)`, 'g'),
          // import('path')
          new RegExp(`import\\(['"]${escapedImport}['"]\\)`, 'g'),
        ];
        
        patterns.forEach(pattern => {
          if (content.match(pattern)) {
            const replacementPattern = pattern.source.includes('from')
              ? `from '${newImport}'`
              : pattern.source.includes('require')
              ? `require('${newImport}')`
              : `import('${newImport}')`;
            
            content = content.replace(pattern, replacementPattern);
            modified = true;
            importsFixed++;
            fileFixes.push({
              old: importPath,
              new: newImport,
            });
          }
        });
      } else {
        console.log(`⚠️  No replacement found for ${deprecatedFile} (imported in ${file})`);
      }
    });
    
    if (modified) {
      writeFileSync(file, content);
      filesFixed++;
      fixLog.push({
        file,
        fixes: fileFixes,
      });
      console.log(`✅ ${file}`);
      fileFixes.forEach(fix => {
        console.log(`   ${fix.old} → ${fix.new}`);
      });
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files fixed: ${filesFixed}`);
console.log(`   Imports fixed: ${importsFixed}`);

// Save fix log
const logPath = join(REPORT_DIR, 'deprecated-imports-fix-log.json');
writeFileSync(logPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  filesFixed,
  importsFixed,
  fixes: fixLog,
}, null, 2));
console.log(`\n📄 Fix log saved to: ${logPath}`);

