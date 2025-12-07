// scripts/fix-stray-syntax.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Files to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'coverage', '.turbo', '__tests__'];

// Statistics
let filesProcessed = 0;
let filesFixed = 0;
let totalRemovals = 0;

/**
 * Recursively get all TypeScript/JavaScript files
 */
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDE_DIRS.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.includes(extname(file))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Check if a line is a stray closing paren/brace
 */
function isStraySyntax(line) {
  const trimmed = line.trim();
  return trimmed === ');' || trimmed === '}';
}

/**
 * Check if line is an import/export statement
 */
function isImportOrExport(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('import ') || trimmed.startsWith('export ');
}

/**
 * Check if line starts a declaration (function, const, etc.)
 */
function isDeclarationStart(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('export ') ||
    trimmed.startsWith('function ') ||
    trimmed.startsWith('const ') ||
    trimmed.startsWith('let ') ||
    trimmed.startsWith('var ') ||
    trimmed.startsWith('interface ') ||
    trimmed.startsWith('type ') ||
    trimmed.startsWith('class ') ||
    trimmed.startsWith("'use client'") ||
    trimmed.startsWith('"use client"') ||
    trimmed.startsWith("'use server'") ||
    trimmed.startsWith('"use server"')
  );
}

/**
 * Check if line is an interface/type definition
 */
function isInterfaceOrType(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('interface ') || trimmed.startsWith('type ');
}

/**
 * Check if previous non-empty line ends with opening brace/paren
 */
function previousLineOpensStructure(lines, index) {
  for (let i = index - 1; i >= Math.max(0, index - 5); i--) {
    const line = lines[i].trim();
    if (line === '') continue;
    // If previous line ends with { or ( and doesn't close it, this might be closing it
    if (line.endsWith('{') || line.endsWith('(')) {
      return true;
    }
    // If previous line is an import/export, it's safe
    if (isImportOrExport(line)) {
      return false;
    }
  }
  return false;
}

/**
 * Fix stray syntax in a file - more conservative approach
 */
function fixStraySyntax(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const removals = [];
    
    // Look for the specific pattern: import/export, then stray ); or }, then declaration
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      
      if (isStraySyntax(line)) {
        // Check if previous line is import/export and next non-empty line is a declaration
        let hasImportExportBefore = false;
        let hasDeclarationAfter = false;
        
        // Look backwards for import/export or interface/type (skip blank lines)
        for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
          const prevLine = lines[j].trim();
          if (prevLine === '') continue; // Skip blank lines but keep looking
          if (isImportOrExport(prevLine) || isInterfaceOrType(prevLine)) {
            hasImportExportBefore = true;
            break;
          }
          // If previous line ends with }, it might be closing an interface/type
          if (prevLine === '}') {
            // Look further back for interface/type
            for (let k = j - 1; k >= Math.max(0, j - 10); k--) {
              const earlierLine = lines[k].trim();
              if (earlierLine === '') continue;
              if (isInterfaceOrType(earlierLine)) {
                hasImportExportBefore = true;
                break;
              }
              if (isDeclarationStart(earlierLine) || earlierLine.endsWith('{')) {
                break;
              }
            }
            if (hasImportExportBefore) break;
          }
          // If we hit a declaration or opening brace, stop
          if (isDeclarationStart(prevLine) || prevLine.endsWith('{') || prevLine.endsWith('(')) {
            break;
          }
        }
        
        // Look forwards for declaration
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const nextLine = lines[j].trim();
          if (nextLine === '') continue;
          if (isDeclarationStart(nextLine)) {
            hasDeclarationAfter = true;
            break;
          }
          // If we hit another stray syntax or non-empty non-declaration, stop
          if (isStraySyntax(nextLine) || (!isImportOrExport(nextLine) && nextLine !== '')) {
            break;
          }
        }
        
        // Only remove if: has import/export before AND declaration after AND doesn't close a structure
        if (hasImportExportBefore && hasDeclarationAfter && !previousLineOpensStructure(lines, i)) {
          removals.push({ line: i + 1, content: line.trim() });
          lines.splice(i, 1);
        }
      }
    }
    
    if (removals.length > 0) {
      filesFixed++;
      totalRemovals += removals.length;
      
      if (VERBOSE) {
        console.log(`\n  Fixed ${filePath}:`);
        removals.forEach(({ line, content }) => {
          console.log(`    Line ${line}: Removed "${content}"`);
        });
      }
      
      if (!DRY_RUN) {
        const newContent = lines.join('\n');
        writeFileSync(filePath, newContent, 'utf8');
      }
      
      return { fixed: true, removals: removals.length };
    }
    
    return { fixed: false, removals: 0 };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { fixed: false, error: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding TypeScript/JavaScript files...');
  
  const appDir = join(process.cwd(), 'app');
  const files = getAllFiles(appDir);
  
  console.log(`📁 Found ${files.length} files to check\n`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  const results = [];
  
  for (const file of files) {
    filesProcessed++;
    const result = fixStraySyntax(file);
    results.push({ file, ...result });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Total removals: ${totalRemovals}`);
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no files were modified');
    console.log('   Run without --dry-run to apply fixes');
  } else {
    console.log('\n✅ Fixes applied!');
  }
  
  // Show files that were fixed
  if (filesFixed > 0) {
    console.log('\n📝 Files fixed:');
    results
      .filter(r => r.fixed)
      .forEach(r => {
        const relativePath = r.file.replace(process.cwd() + '\\', '').replace(process.cwd() + '/', '');
        console.log(`  ✓ ${relativePath} (${r.removals} removal${r.removals > 1 ? 's' : ''})`);
      });
  }
  
  // Show any errors
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(r => {
      console.log(`  ✗ ${r.file}: ${r.error}`);
    });
  }
  
  console.log('\n');
}

// Run the script
main();
