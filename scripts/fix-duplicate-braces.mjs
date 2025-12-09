// scripts/fix-duplicate-braces.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'coverage', '.turbo', '__tests__'];

let filesProcessed = 0;
let filesFixed = 0;
let totalRemovals = 0;

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

function fixDuplicateBraces(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const removals = [];
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();
      
      // Check if current line is `};` and next line is just `}`
      if (currentLine === '};' && nextLine === '}') {
        // Check if the line after that is empty or a new declaration
        const lineAfter = i + 2 < lines.length ? lines[i + 2].trim() : '';
        if (lineAfter === '' || lineAfter.startsWith('export ') || lineAfter.startsWith('import ') || lineAfter.startsWith('const ') || lineAfter.startsWith('function ') || lineAfter.startsWith('type ') || lineAfter.startsWith('interface ')) {
          removals.push({ line: i + 2, content: nextLine });
        }
      }
    }
    
    if (removals.length > 0) {
      filesFixed++;
      totalRemovals += removals.length;
      
      if (VERBOSE) {
        console.log(`\n  Fixed ${filePath}:`);
        removals.forEach(({ line }) => {
          console.log(`    Line ${line}: Removed duplicate closing brace`);
        });
      }
      
      if (!DRY_RUN) {
        // Remove in reverse order to maintain line numbers
        for (let i = removals.length - 1; i >= 0; i--) {
          const removal = removals[i];
          lines.splice(removal.line - 1, 1);
        }
        
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

function main() {
  console.log('🔍 Finding files with duplicate closing braces...');
  
  const appDir = join(process.cwd(), 'app');
  const files = getAllFiles(appDir);
  
  console.log(`📁 Found ${files.length} files to check\n`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  const results = [];
  
  for (const file of files) {
    filesProcessed++;
    const result = fixDuplicateBraces(file);
    results.push({ file, ...result });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Files fixed: ${filesFixed}`);
  console.log(`Total duplicate braces removed: ${totalRemovals}`);
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a DRY RUN - no files were modified');
    console.log('   Run without --dry-run to apply fixes');
  } else {
    console.log('\n✅ Fixes applied!');
  }
  
  if (filesFixed > 0) {
    console.log('\n📝 Files fixed:');
    results
      .filter(r => r.fixed)
      .forEach(r => {
        const relativePath = r.file.replace(process.cwd() + '\\', '').replace(process.cwd() + '/', '');
        console.log(`  ✓ ${relativePath} (${r.removals} duplicate${r.removals > 1 ? 's' : ''} removed)`);
      });
  }
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(r => {
      console.log(`  ✗ ${r.file}: ${r.error}`);
    });
  }
  
  console.log('\n');
}

main();

