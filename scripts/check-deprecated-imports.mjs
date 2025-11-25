#!/usr/bin/env node
/**
 * Script to check if deprecated files are still being imported
 * Run: node scripts/check-deprecated-imports.mjs
 * 
 * This script:
 * 1. Reads the deprecated files audit report
 * 2. Scans all files for imports of deprecated files
 * 3. Reports which files still import deprecated code
 */

import { readFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, relative, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'coverage', 'reports'];
const REPORT_DIR = join(process.cwd(), 'reports');
const AUDIT_REPORT = join(REPORT_DIR, 'deprecated-files-audit.json');

if (!existsSync(AUDIT_REPORT)) {
  console.error('❌ Audit report not found. Run scripts/audit-deprecated-files.mjs first.');
  process.exit(1);
}

const auditReport = JSON.parse(readFileSync(AUDIT_REPORT, 'utf8'));
const DEPRECATED_FILES = [
  ...auditReport.safeToDelete.map(f => f.file),
  ...auditReport.needsReview.map(f => f.file),
  ...auditReport.suspicious.map(f => f.file),
];

function findImports(dir, fileList = []) {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    
    try {
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findImports(filePath, fileList);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(file))) {
        try {
          const content = readFileSync(filePath, 'utf8');
          const imports = extractImports(content, filePath);
          if (imports.length > 0) {
            fileList.push({ file: filePath, imports });
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }
    } catch (e) {
      // Skip files/dirs that can't be accessed
    }
  });
  
  return fileList;
}

function extractImports(content, filePath) {
  const imports = [];
  
  // Match ES6 imports: import ... from 'path'
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  // Match require: require('path')
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  // Match dynamic imports: import('path')
  const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function normalizePath(path) {
  // Remove extensions, handle relative paths
  return path
    .replace(/\.(ts|tsx|js|jsx|mjs)$/, '')
    .replace(/^\.\//, '')
    .replace(/\\/g, '/');
}

function matchesDeprecated(importPath, deprecatedFile) {
  const normalizedImport = normalizePath(importPath);
  const normalizedDeprecated = normalizePath(relative(process.cwd(), deprecatedFile));
  
  // Check exact match
  if (normalizedImport === normalizedDeprecated) {
    return true;
  }
  
  // Check if import path contains deprecated file path
  if (normalizedImport.includes(normalizedDeprecated) || 
      normalizedDeprecated.includes(normalizedImport)) {
    return true;
  }
  
  // Check without extensions
  const importNoExt = normalizedImport.replace(/\.(ts|tsx|js|jsx|mjs)$/, '');
  const deprecatedNoExt = normalizedDeprecated.replace(/\.(ts|tsx|js|jsx|mjs)$/, '');
  
  if (importNoExt === deprecatedNoExt) {
    return true;
  }
  
  // Check relative paths
  try {
    const resolvedImport = resolve(process.cwd(), normalizedImport);
    const resolvedDeprecated = resolve(process.cwd(), normalizedDeprecated);
    if (resolvedImport === resolvedDeprecated) {
      return true;
    }
  } catch (e) {
    // Ignore resolution errors
  }
  
  return false;
}

// Check which deprecated files are imported
console.log('🔍 Scanning for imports of deprecated files...\n');

const allFiles = findImports('./app');
const allComponents = findImports('./components');
const allLib = findImports('./lib');
const allImports = [...allFiles, ...allComponents, ...allLib];

console.log(`Scanned ${allImports.length} files for imports\n`);

const deprecatedImports = [];

allImports.forEach(({ file, imports }) => {
  imports.forEach(importPath => {
    DEPRECATED_FILES.forEach(deprecated => {
      if (matchesDeprecated(importPath, deprecated)) {
        deprecatedImports.push({
          importingFile: file,
          deprecatedFile: deprecated,
          importPath: importPath,
        });
      }
    });
  });
});

const report = {
  summary: {
    deprecatedFilesChecked: DEPRECATED_FILES.length,
    filesWithImports: deprecatedImports.length,
    uniqueDeprecatedFiles: [...new Set(deprecatedImports.map(i => i.deprecatedFile))].length,
    uniqueImportingFiles: [...new Set(deprecatedImports.map(i => i.importingFile))].length,
    timestamp: new Date().toISOString(),
  },
  imports: deprecatedImports,
};

const reportPath = join(REPORT_DIR, 'deprecated-imports-check.json');
const fs = await import('fs');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('🔍 Deprecated Files Import Check');
console.log('================================');
console.log(`Deprecated files checked: ${report.summary.deprecatedFilesChecked}`);
console.log(`Files still importing deprecated: ${report.summary.filesWithImports}`);
console.log(`Unique deprecated files imported: ${report.summary.uniqueDeprecatedFiles}`);
console.log(`Unique files importing: ${report.summary.uniqueImportingFiles}`);
console.log(`\n📄 Full report saved to: ${reportPath}\n`);

if (deprecatedImports.length > 0) {
  console.log('⚠️  Files that need import updates:\n');
  
  // Group by deprecated file
  const byDeprecated = {};
  deprecatedImports.forEach(({ importingFile, deprecatedFile, importPath }) => {
    if (!byDeprecated[deprecatedFile]) {
      byDeprecated[deprecatedFile] = [];
    }
    byDeprecated[deprecatedFile].push({ importingFile, importPath });
  });
  
  Object.entries(byDeprecated).forEach(([deprecated, imports]) => {
    console.log(`📁 ${deprecated}`);
    imports.forEach(({ importingFile, importPath }) => {
      console.log(`  └─ ${importingFile}`);
      console.log(`     imports: ${importPath}`);
    });
    console.log('');
  });
} else {
  console.log('✅ No imports of deprecated files found!');
}

