// scripts/fix-braces-safe.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { execSync } from 'child_process';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const SKIP_VALIDATION = process.argv.includes('--skip-validation');

const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'coverage', '.turbo', '__tests__'];

let filesProcessed = 0;
let filesFixed = 0;
let filesSkipped = 0;
let totalFixes = 0;
let totalRollbacks = 0;

/**
 * Recursively get all TypeScript files
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
 * Check if a line starts a declaration
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
    trimmed.startsWith('export function ') ||
    trimmed.startsWith('export async function ') ||
    trimmed.startsWith('function ') ||
    trimmed.startsWith('async function ') ||
    trimmed.startsWith('export default ')
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
 * Proper brace matching to find where an interface/type should end
 */
function findInterfaceEnd(lines, startIndex) {
  let braceCount = 0;
  let inInterface = false;
  let inString = false;
  let stringChar = '';
  let lastPropertyLine = -1;
  let parenCount = 0;
  let bracketCount = 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === '') {
      continue;
    }

    // Check if we've hit the next declaration
    if (i > startIndex && isDeclarationStart(line)) {
      if (inInterface && braceCount === 0) {
        return lastPropertyLine;
      }
      break;
    }

    // Track string state and braces
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : '';
      const nextChar = j < line.length - 1 ? line[j + 1] : '';

      if (!inString) {
        // Handle string literals
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          inString = true;
          stringChar = char;
        }
        // Handle comments
        else if (char === '/' && nextChar === '/') {
          break; // Rest of line is comment
        }
        else if (char === '/' && nextChar === '*') {
          // Multi-line comment - skip until */
          j++;
          while (j < line.length - 1) {
            if (line[j] === '*' && line[j + 1] === '/') {
              j++;
              break;
            }
            j++;
          }
        }
        // Count braces
        else if (char === '{') {
          braceCount++;
          if (i === startIndex) {
            inInterface = true;
          }
        }
        else if (char === '}') {
          braceCount--;
          if (inInterface && braceCount === 0) {
            return i;
          }
        }
        // Track parens and brackets for nested structures
        else if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
      } else {
        // Inside string - check for escape sequences
        if (char === '\\' && prevChar !== '\\') {
          continue; // Skip escaped char
        }
        if (char === stringChar && prevChar !== '\\') {
          inString = false;
        }
      }
    }

    // Track the last line that looks like a property
    if (inInterface && braceCount === 1 && parenCount === 0 && bracketCount === 0) {
      if (trimmed.includes(':') || trimmed.includes(';') || trimmed.endsWith(',')) {
        lastPropertyLine = i;
      }
    }
  }

  // If we never closed the interface and hit another declaration
  if (inInterface && braceCount > 0) {
    return lastPropertyLine;
  }

  return -1;
}

/**
 * Check if interface is already properly closed
 */
function isAlreadyClosed(lines, startIndex, endLine) {
  // Check the endLine itself
  if (endLine >= 0 && endLine < lines.length) {
    const trimmed = lines[endLine].trim();
    if (trimmed === '}' || trimmed === '};' || trimmed.endsWith('}')) {
      return true;
    }
  }

  // Check previous non-empty lines (up to 3 lines back)
  for (let i = endLine; i >= Math.max(0, endLine - 3); i--) {
    if (i < 0 || i >= lines.length) continue;
    const trimmed = lines[i].trim();
    if (trimmed === '') continue;
    if (trimmed === '}' || trimmed === '};' || trimmed.endsWith('}')) {
      return true;
    }
    // If we hit a non-empty line that's not a closing brace, stop
    if (trimmed !== '') {
      break;
    }
  }

  return false;
}

/**
 * Validate file with TypeScript compiler
 */
function validateFile(filePath) {
  if (SKIP_VALIDATION) return { valid: true, errors: [] };

  try {
    const relativePath = relative(process.cwd(), filePath);
    // Use tsc to check just this file
    const result = execSync(
      `npx tsc --noEmit --skipLibCheck "${filePath}" 2>&1`,
      { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
    );
    
    // If no output, file is valid
    if (!result || result.trim() === '') {
      return { valid: true, errors: [] };
    }

    // Check if errors are only in this file
    const errors = result.split('\n').filter(line => 
      line.includes(relativePath) || line.includes(filePath)
    );

    return { valid: errors.length === 0, errors };
  } catch (error) {
    // If tsc fails, check stderr
    const stderr = error.stderr?.toString() || '';
    const stdout = error.stdout?.toString() || '';
    const output = stderr || stdout;
    
    if (!output || output.trim() === '') {
      return { valid: true, errors: [] };
    }

    const relativePath = relative(process.cwd(), filePath);
    const errors = output.split('\n').filter(line => 
      line.includes(relativePath) || line.includes(filePath)
    );

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Fix missing closing braces in a file with validation
 */
function fixMissingBraces(filePath) {
  try {
    const originalContent = readFileSync(filePath, 'utf8');
    const lines = originalContent.split('\n');
    const fixes = [];
    
    // Find all interface/type declarations
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (isInterfaceOrType(line)) {
        const endLine = findInterfaceEnd(lines, i);
        
        if (endLine > i && endLine < lines.length) {
          // Check if it's already closed
          if (!isAlreadyClosed(lines, i, endLine)) {
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
                line: insertIndex + 1,
                interfaceName: line.trim().split(/\s+/).slice(-1)[0].replace('{', ''),
                indent: indent,
                insertIndex: insertIndex,
              });
            }
          }
        }
      }
    }
    
    if (fixes.length === 0) {
      return { fixed: false, fixes: 0, skipped: false };
    }

    // Apply fixes in reverse order to maintain line numbers
    const modifiedLines = [...lines];
    for (let i = fixes.length - 1; i >= 0; i--) {
      const fix = fixes[i];
      modifiedLines.splice(fix.insertIndex, 0, fix.indent + '}');
    }

    const modifiedContent = modifiedLines.join('\n');

    // Validate the fix
    if (!DRY_RUN && !SKIP_VALIDATION) {
      // Write temporarily to validate
      writeFileSync(filePath, modifiedContent, 'utf8');
      const validation = validateFile(filePath);
      
      if (!validation.valid) {
        // Rollback - restore original content
        writeFileSync(filePath, originalContent, 'utf8');
        totalRollbacks++;
        
        if (VERBOSE) {
          console.log(`  ⚠️  Skipped ${filePath} - validation failed:`);
          validation.errors.slice(0, 3).forEach(err => {
            console.log(`     ${err.trim()}`);
          });
        }
        
        return { fixed: false, fixes: 0, skipped: true, validationErrors: validation.errors };
      }
    } else if (DRY_RUN) {
      // In dry-run, just report what would be fixed
      writeFileSync(filePath, originalContent, 'utf8'); // Restore original
    }

    // Fix is valid - keep it
    if (!DRY_RUN) {
      writeFileSync(filePath, modifiedContent, 'utf8');
    }

    filesFixed++;
    totalFixes += fixes.length;

    if (VERBOSE) {
      console.log(`\n  ✅ Fixed ${filePath}:`);
      fixes.forEach(({ line, interfaceName }) => {
        console.log(`     Line ${line}: Added closing brace for ${interfaceName}`);
      });
    }

    return { fixed: true, fixes: fixes.length, skipped: false };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { fixed: false, error: error.message, skipped: false };
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding TypeScript files...');
  
  const appDir = join(process.cwd(), 'app');
  const files = getAllFiles(appDir);
  
  console.log(`📁 Found ${files.length} files to check\n`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  if (SKIP_VALIDATION) {
    console.log('⚠️  VALIDATION DISABLED - Use with caution!\n');
  } else {
    console.log('✅ Validation enabled - fixes will be validated with TypeScript\n');
  }

  const results = [];
  
  for (const file of files) {
    filesProcessed++;
    const result = fixMissingBraces(file);
    if (result.skipped) {
      filesSkipped++;
    }
    results.push({ file, ...result });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Files skipped (validation failed): ${filesSkipped}`);
  console.log(`Total braces added: ${totalFixes}`);
  console.log(`Total rollbacks: ${totalRollbacks}`);
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no files were modified');
    console.log('   Run without --dry-run to apply fixes');
  } else {
    console.log('\n✅ Fixes applied and validated!');
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

  // Show files that were skipped
  if (filesSkipped > 0) {
    console.log('\n⚠️  Files skipped (validation failed):');
    results
      .filter(r => r.skipped)
      .forEach(r => {
        const relativePath = r.file.replace(process.cwd() + '\\', '').replace(process.cwd() + '/', '');
        console.log(`  ⊘ ${relativePath}`);
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

