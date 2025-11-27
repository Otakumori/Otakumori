#!/usr/bin/env node
/**
 * Comprehensive verification script for deprecated file replacements
 * Checks: existence, exports, interfaces, completeness, usage
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', '.cache', 'coverage', 'reports'];

function findImports(dir, targetFile, results = []) {
  if (!existsSync(dir)) {
    return results;
  }

  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    
    try {
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findImports(filePath, targetFile, results);
      } else if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))) {
        try {
          const content = readFileSync(filePath, 'utf8');
          const normalizedTarget = targetFile.replace(/\\/g, '/');
          
          // Check various import patterns
          const importPatterns = [
            new RegExp(`from\\s+['"]${escapeRegex(normalizedTarget)}['"]`, 'i'),
            new RegExp(`from\\s+['"]\\.\\.?/[^'"]*${escapeRegex(file.split('/').pop())}['"]`, 'i'),
            new RegExp(`require\\(['"]${escapeRegex(normalizedTarget)}['"]\\)`, 'i'),
          ];
          
          if (importPatterns.some(pattern => pattern.test(content))) {
            results.push(filePath);
          }
        } catch (e) {
          // Skip
        }
      }
    } catch (e) {
      // Skip
    }
  });
  
  return results;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractExports(content) {
  const exports = {
    default: false,
    named: [],
    types: [],
  };
  
  // Default export
  if (/export\s+default/.test(content)) {
    exports.default = true;
  }
  
  // Named exports
  const namedMatches = content.matchAll(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g);
  for (const match of namedMatches) {
    exports.named.push(match[1]);
  }
  
  // Type exports
  const typeMatches = content.matchAll(/export\s+type\s+(\w+)/g);
  for (const match of typeMatches) {
    exports.types.push(match[1]);
  }
  
  return exports;
}

function extractProps(content) {
  const props = [];
  
  // Interface props
  const interfaceMatch = content.match(/interface\s+\w+Props\s*\{([^}]+)\}/s);
  if (interfaceMatch) {
    const propsContent = interfaceMatch[1];
    const propMatches = propsContent.matchAll(/(\w+)(\??):\s*([^;]+)/g);
    for (const match of propMatches) {
      props.push({
        name: match[1],
        optional: match[2] === '?',
        type: match[3].trim(),
      });
    }
  }
  
  // Function component props
  const funcMatch = content.match(/function\s+\w+\s*\(\s*\{\s*([^}]+)\s*\}\s*:\s*(\w+Props)/);
  if (funcMatch) {
    // Props interface name found
  }
  
  return props;
}

function checkCompleteness(content, filePath) {
  const issues = [];
  
  // Check for TODO/FIXME indicating incomplete
  if (/TODO|FIXME|XXX|HACK/i.test(content)) {
    const todoMatches = content.matchAll(/(TODO|FIXME|XXX|HACK):\s*([^\n]+)/gi);
    for (const match of todoMatches) {
      issues.push({
        type: 'incomplete',
        severity: match[1].toUpperCase() === 'FIXME' ? 'high' : 'medium',
        message: match[2].trim(),
      });
    }
  }
  
  // Check for placeholder/stub indicators
  if (/placeholder|stub|not implemented|coming soon/i.test(content)) {
    issues.push({
      type: 'stub',
      severity: 'high',
      message: 'File appears to be a placeholder or stub',
    });
  }
  
  // Check file size (very small might be incomplete)
  const lines = content.split('\n').length;
  if (lines < 10 && !content.includes('export')) {
    issues.push({
      type: 'suspicious',
      severity: 'medium',
      message: `File is very small (${lines} lines) - might be incomplete`,
    });
  }
  
  return issues;
}

function verifyReplacement(deprecatedFile, replacementFile) {
  const result = {
    deprecatedFile,
    replacementFile,
    deprecatedExists: existsSync(deprecatedFile),
    replacementExists: existsSync(replacementFile),
    deprecatedExports: null,
    replacementExports: null,
    deprecatedProps: null,
    replacementProps: null,
    deprecatedImports: [],
    replacementImports: [],
    completeness: [],
    compatible: false,
    safe: false,
    warnings: [],
    errors: [],
  };
  
  // Check if files exist
  if (!result.deprecatedExists) {
    result.warnings.push('Deprecated file does not exist (may already be deleted)');
    result.safe = true; // Safe to "delete" if it doesn't exist
    return result;
  }
  
  if (!result.replacementExists) {
    result.errors.push('Replacement file does not exist');
    result.safe = false;
    return result;
  }
  
  // Read and analyze files
  try {
    const deprecatedContent = readFileSync(deprecatedFile, 'utf8');
    const replacementContent = readFileSync(replacementFile, 'utf8');
    
    // Extract exports
    result.deprecatedExports = extractExports(deprecatedContent);
    result.replacementExports = extractExports(replacementContent);
    
    // Extract props/interfaces
    result.deprecatedProps = extractProps(deprecatedContent);
    result.replacementProps = extractProps(replacementContent);
    
    // Check completeness
    result.completeness = checkCompleteness(replacementContent, replacementFile);
    
    // Check for imports
    result.deprecatedImports = findImports('./app', deprecatedFile);
    result.deprecatedImports.push(...findImports('./components', deprecatedFile));
    result.replacementImports = findImports('./app', replacementFile);
    result.replacementImports.push(...findImports('./components', replacementFile));
    
    // Compatibility checks
    if (result.deprecatedExports.default && !result.replacementExports.default) {
      result.errors.push('Deprecated has default export but replacement does not');
    }
    
    if (result.deprecatedExports.named.length > 0) {
      const missingNamed = result.deprecatedExports.named.filter(
        name => !result.replacementExports.named.includes(name)
      );
      if (missingNamed.length > 0) {
        result.warnings.push(`Missing named exports: ${missingNamed.join(', ')}`);
      }
    }
    
    // Props compatibility
    if (result.deprecatedProps.length > 0 && result.replacementProps.length === 0) {
      result.warnings.push('Deprecated has props interface but replacement does not');
    }
    
    // Check if replacement is actually used
    if (result.replacementImports.length === 0 && result.deprecatedImports.length > 0) {
      result.errors.push('Replacement is not imported anywhere, but deprecated is');
    }
    
    // Completeness issues
    if (result.completeness.some(issue => issue.severity === 'high')) {
      result.errors.push('Replacement has high-severity completeness issues');
    }
    
    // Determine if safe
    result.compatible = result.errors.length === 0;
    result.safe = result.compatible &&
                   result.deprecatedImports.length === 0 &&
                   result.completeness.filter(i => i.severity === 'high').length === 0;
    
  } catch (error) {
    result.errors.push(`Error analyzing files: ${error.message}`);
    result.safe = false;
  }
  
  return result;
}

// Main execution
const REPORT_DIR = join(process.cwd(), 'reports');
const AUDIT_REPORT = join(REPORT_DIR, 'deprecated-files-audit.json');

if (!existsSync(AUDIT_REPORT)) {
  console.error('❌ Audit report not found. Run scripts/audit-deprecated-files.mjs first.');
  process.exit(1);
}

const auditReport = JSON.parse(readFileSync(AUDIT_REPORT, 'utf8'));

console.log('🔍 Verifying replacements for deprecated files...\n');

const verifications = auditReport.safeToDelete.map(({ file, replacement }) =>
  verifyReplacement(file, replacement));

// Categorize results
const safe = verifications.filter(v => v.safe);
const unsafe = verifications.filter(v => !v.safe);
const warnings = verifications.filter(v => v.warnings.length > 0);
const errors = verifications.filter(v => v.errors.length > 0);
const notFound = verifications.filter(v => !v.deprecatedExists);

// Generate report
const report = {
  summary: {
    total: verifications.length,
    safe: safe.length,
    unsafe: unsafe.length,
    withWarnings: warnings.length,
    withErrors: errors.length,
    notFound: notFound.length,
  },
  safe,
  unsafe: unsafe.map(v => ({
    file: v.deprecatedFile,
    replacement: v.replacementFile,
    errors: v.errors,
    warnings: v.warnings,
    deprecatedImports: v.deprecatedImports.length,
    completeness: v.completeness,
  })),
  notFound: notFound.map(v => v.deprecatedFile),
};

const reportPath = join(REPORT_DIR, 'replacement-verification.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Print summary
console.log('📊 Replacement Verification Report');
console.log('==================================');
console.log(`Total files checked: ${report.summary.total}`);
console.log(`✅ Safe to delete: ${report.summary.safe}`);
console.log(`❌ Unsafe to delete: ${report.summary.unsafe}`);
console.log(`⚠️  With warnings: ${report.summary.withWarnings}`);
console.log(`🔴 With errors: ${report.summary.withErrors}`);
console.log(`📭 Not found (already deleted?): ${report.summary.notFound}`);

if (unsafe.length > 0) {
  console.log('\n❌ Files that are NOT safe to delete:');
  unsafe.slice(0, 10).forEach(v => {
    console.log(`\n  ${v.deprecatedFile}`);
    console.log(`    → Replacement: ${v.replacementFile}`);
    if (v.errors.length > 0) {
      console.log(`    Errors:`);
      v.errors.forEach(e => console.log(`      - ${e}`));
    }
    if (v.warnings.length > 0) {
      console.log(`    Warnings:`);
      v.warnings.forEach(w => console.log(`      - ${w}`));
    }
    if (v.deprecatedImports.length > 0) {
      console.log(`    Still imported in ${v.deprecatedImports.length} file(s)`);
    }
  });
  if (unsafe.length > 10) {
    console.log(`\n  ... and ${unsafe.length - 10} more (see full report)`);
  }
}

if (safe.length > 0) {
  console.log(`\n✅ Safe to delete (${safe.length} files):`);
  safe.slice(0, 10).forEach(v => {
    console.log(`  ${v.deprecatedFile} → ${v.replacementFile}`);
  });
  if (safe.length > 10) {
    console.log(`  ... and ${safe.length - 10} more (see full report)`);
  }
}

console.log(`\n📄 Full report: ${reportPath}`);

