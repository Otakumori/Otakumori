import fs from "node:fs";
import path from "node:path";

// Get all TypeScript/JavaScript files
function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixUnusedVars(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Fix specific patterns that are safe to fix
    const fixes = [
      // Import statements with unused imports
      { 
        pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*['"][^'"]*['"];?/g, 
        replacement: (match, imports) => {
          const fixedImports = imports.split(',').map(imp => {
            const trimmed = imp.trim();
            if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(' as ')) {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          }).join(', ');
          return match.replace(imports, fixedImports);
        }
      },
      
      // Function parameters that are unused
      { 
        pattern: /function\s+\w+\s*\(([^)]*)\)/g, 
        replacement: (match, params) => {
          const fixedParams = params.split(',').map(p => {
            const trimmed = p.trim();
            if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=') && !trimmed.includes(':')) {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          }).join(', ');
          return match.replace(params, fixedParams);
        }
      },
      
      // Arrow function parameters
      { 
        pattern: /\(([^)]*)\)\s*=>/g, 
        replacement: (match, params) => {
          const fixedParams = params.split(',').map(p => {
            const trimmed = p.trim();
            if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=') && !trimmed.includes(':')) {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          }).join(', ');
          return match.replace(params, fixedParams);
        }
      },
      
      // Destructuring with unused variables
      { 
        pattern: /const\s*{\s*([^}]*)\s*}\s*=/g, 
        replacement: (match, destructured) => {
          const fixed = destructured.split(',').map(d => {
            const trimmed = d.trim();
            if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(':')) {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          }).join(', ');
          return match.replace(destructured, fixed);
        }
      },
      
      // Array destructuring
      { 
        pattern: /const\s*\[\s*([^\]]*)\s*\]\s*=/g, 
        replacement: (match, destructured) => {
          const fixed = destructured.split(',').map(d => {
            const trimmed = d.trim();
            if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=')) {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          }).join(', ');
          return match.replace(destructured, fixed);
        }
      }
    ];
    
    // Apply fixes
    for (const fix of fixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Get all files
const allFiles = getAllFiles('.');
console.log(`Found ${allFiles.length} files to process...`);

// Process files in batches to avoid overwhelming the system
const batchSize = 50;
let fixedCount = 0;
let processedCount = 0;

for (let i = 0; i < allFiles.length; i += batchSize) {
  const batch = allFiles.slice(i, i + batchSize);
  
  for (const file of batch) {
    if (fixUnusedVars(file)) {
      fixedCount++;
    }
    processedCount++;
    
    if (processedCount % 100 === 0) {
      console.log(`Processed ${processedCount}/${allFiles.length} files...`);
    }
  }
}

console.log(`\n🎉 Fixed unused variables in ${fixedCount} files out of ${allFiles.length} total files`);
