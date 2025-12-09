// scripts/fix-missing-braces.mjs
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
let totalFixes = 0;

/**
 * Recursively get all TypeScript/JavaScript files
 */
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
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
 * Check if a line starts a declaration (interface, type, class, const, function, etc.)
 */
function isDeclarationStart(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('export interface ') ||
    trimmed.startsWith('interface ') ||
    trimmed.startsWith('export type ') ||
    trimmed.startsWith('type ') ||
    trimmed.startsWith('export class ') ||
    trimmed.startsWith('class ') ||
    trimmed.startsWith('export const ') ||
    trimmed.startsWith('const ') ||
    trimmed.startsWith('export let ') ||
    trimmed.startsWith('let ') ||
    trimmed.startsWith('export var ') ||
    trimmed.startsWith('var ') ||
    trimmed.startsWith('export function ') ||
    trimmed.startsWith('export async function ') ||
    trimmed.startsWith('function ') ||
    trimmed.startsWith('async function ') ||
    trimmed.startsWith('export default function ') ||
    trimmed.startsWith('export default ') ||
    trimmed.startsWith("'use client'") ||
    trimmed.startsWith('"use client"') ||
    trimmed.startsWith("'use server'") ||
    trimmed.startsWith('"use server"')
  );
}

/**
 * Check if a line is an interface or type declaration
 */
function isInterfaceOrType(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('export interface ') ||
    trimmed.startsWith('interface ') ||
    trimmed.startsWith('export type ') ||
    trimmed.startsWith('type ')
  );
}

/**
 * Count opening and closing braces to find where an interface/type should end
 * Returns the line index where the interface/type should close, or -1 if not found
 */
function findInterfaceEnd(lines, startIndex) {
  let braceCount = 0;
  let inInterface = false;
  let inString = false;
  let stringChar = '';
  let lastPropertyLine = -1;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines but track them
    if (trimmed === '') {
      continue;
    }

    // Check if we've hit the next declaration (interface should be closed by now)
    if (i > startIndex && isDeclarationStart(line)) {
      // If we're still in an interface, it needs to be closed
      if (inInterface && braceCount === 0) {
        return lastPropertyLine; // Return the last property line
      }
      break;
    }

    // Track string state to avoid counting braces in strings
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : '';

      if (!inString) {
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          inString = true;
          stringChar = char;
        } else if (char === '{') {
          braceCount++;
          if (i === startIndex) {
            inInterface = true;
          }
        } else if (char === '}') {
          braceCount--;
          if (inInterface && braceCount === 0) {
            // Interface is properly closed
            return i;
          }
        }
      } else {
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
        }
      }
    }

    // Track the last line that looks like a property (has : or ; or ,)
    if (inInterface && braceCount === 1) {
      if (trimmed.includes(':') || trimmed.includes(';') || trimmed.endsWith(',')) {
        lastPropertyLine = i;
      }
    }
  }

  // If we never closed the interface and hit another declaration, return last property line
  if (inInterface && braceCount > 0) {
    return lastPropertyLine;
  }

  return -1;
}

/**
 * Check if a line already has a closing brace
 */
function hasClosingBrace(lines, index) {
  if (index < 0 || index >= lines.length) return false;
  const trimmed = lines[index].trim();
  return trimmed === '}' || trimmed === '};' || trimmed.endsWith('}') || trimmed.endsWith('};');
}

/**
 * Check if the previous non-empty line has a closing brace
 */
function previousLineHasClosingBrace(lines, index) {
  for (let i = index - 1; i >= Math.max(0, index - 5); i--) {
    const trimmed = lines[i].trim();
    if (trimmed === '') continue;
    if (trimmed === '}' || trimmed.endsWith('}')) {
      return true;
    }
    // If we hit a non-empty line that's not a closing brace, stop
    if (trimmed !== '') {
      return false;
    }
  }
  return false;
}

/**
 * Fix missing closing braces in a file
 */
function fixMissingBraces(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fixes = [];
    
    // Find all interface/type declarations
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (isInterfaceOrType(line)) {
        // Find where this interface/type should end
        const endLine = findInterfaceEnd(lines, i);
        
        if (endLine > i && endLine < lines.length) {
          // Check if it's already closed - check the endLine itself and previous lines
          const alreadyClosed = hasClosingBrace(lines, endLine) || previousLineHasClosingBrace(lines, endLine + 1);
          
          if (!alreadyClosed) {
            // Check if the next non-empty line is a new declaration
            let nextNonEmpty = -1;
            for (let j = endLine + 1; j < lines.length && j < endLine + 10; j++) {
              if (lines[j].trim() !== '') {
                nextNonEmpty = j;
                break;
              }
            }
            
            if (nextNonEmpty > endLine && isDeclarationStart(lines[nextNonEmpty])) {
              // We need to add a closing brace
              const insertIndex = endLine + 1;
              const indent = lines[endLine].match(/^(\s*)/)?.[1] || '';
              
              fixes.push({
                line: insertIndex + 1, // 1-indexed for reporting
                interfaceName: line.trim().split(/\s+/).slice(-1)[0].replace('{', ''),
                indent: indent,
              });
            }
          }
        }
      }
    }
    
    // Apply fixes in reverse order to maintain line numbers
    if (fixes.length > 0) {
      filesFixed++;
      totalFixes += fixes.length;
      
      if (VERBOSE) {
        console.log(`\n  Fixed ${filePath}:`);
        fixes.forEach(({ line, interfaceName }) => {
          console.log(`    Line ${line}: Added closing brace for ${interfaceName}`);
        });
      }
      
      if (!DRY_RUN) {
        // Apply fixes in reverse order
        for (let i = fixes.length - 1; i >= 0; i--) {
          const fix = fixes[i];
          const insertIndex = fix.line - 1; // Convert to 0-indexed
          lines.splice(insertIndex, 0, fix.indent + '}');
        }
        
        const newContent = lines.join('\n');
        writeFileSync(filePath, newContent, 'utf8');
      }
      
      return { fixed: true, fixes: fixes.length };
    }
    
    return { fixed: false, fixes: 0 };
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
    const result = fixMissingBraces(file);
    results.push({ file, ...result });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Total braces added: ${totalFixes}`);
  
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
        console.log(`  ✓ ${relativePath} (${r.fixes} brace${r.fixes > 1 ? 's' : ''} added)`);
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

