import fs from "node:fs";
import path from "node:path";

// Comprehensive patterns to fix unused variables
const UNUSED_PATTERNS = [
  // Function parameters
  { pattern: /function\s+\w+\s*\(([^)]*)\)/g, fix: (match, params) => {
    const fixedParams = params.split(',').map(p => {
      const trimmed = p.trim();
      if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=') && !trimmed.includes(':')) {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return match.replace(params, fixedParams);
  }},
  
  // Arrow function parameters
  { pattern: /\(([^)]*)\)\s*=>/g, fix: (match, params) => {
    const fixedParams = params.split(',').map(p => {
      const trimmed = p.trim();
      if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=') && !trimmed.includes(':')) {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return match.replace(params, fixedParams);
  }},
  
  // Destructuring assignments
  { pattern: /const\s*{\s*([^}]+)\s*}\s*=/g, fix: (match, destructured) => {
    const fixed = destructured.split(',').map(item => {
      const trimmed = item.trim();
      if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(':')) {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return match.replace(destructured, fixed);
  }},
  
  // Array destructuring
  { pattern: /const\s*\[\s*([^\]]+)\s*\]\s*=/g, fix: (match, destructured) => {
    const fixed = destructured.split(',').map(item => {
      const trimmed = item.trim();
      if (trimmed && !trimmed.startsWith('_') && trimmed !== '') {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return match.replace(destructured, fixed);
  }},
  
  // Variable declarations (const/let/var)
  { pattern: /(const|let|var)\s+(\w+)\s*=/g, fix: (match, keyword, varName) => {
    if (!varName.startsWith('_') && !varName.includes('.')) {
      return match.replace(varName, `_${varName}`);
    }
    return match;
  }},
  
  // Import statements with unused imports
  { pattern: /import\s*{\s*([^}]+)\s*}\s*from/g, fix: (match, imports) => {
    const fixed = imports.split(',').map(item => {
      const trimmed = item.trim();
      if (trimmed && !trimmed.startsWith('_')) {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return match.replace(imports, fixed);
  }},
  
  // Function parameters with types
  { pattern: /(\w+)\s*:\s*(\w+)\s*\)/g, fix: (match, param, type) => {
    if (!param.startsWith('_')) {
      return `_${param}: ${type})`;
    }
    return match;
  }},
  
  // Destructuring in function parameters
  { pattern: /{\s*([^}]+)\s*}\s*:\s*(\w+)/g, fix: (match, destructured, type) => {
    const fixed = destructured.split(',').map(item => {
      const trimmed = item.trim();
      if (trimmed && !trimmed.startsWith('_')) {
        return `_${trimmed}`;
      }
      return trimmed;
    }).join(', ');
    return `{ ${fixed} }: ${type}`;
  }}
];

function fixUnusedVars(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    let changed = false;
    
    // Apply fixes
    for (const { pattern, fix } of UNUSED_PATTERNS) {
      const newContent = fixedContent.replace(pattern, fix);
      if (newContent !== fixedContent) {
        changed = true;
        fixedContent = newContent;
      }
    }
    
    // Only write if content changed
    if (changed) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed unused vars in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      fixedCount += walkDirectory(fullPath);
    } else if (file.isFile() && /\.(ts|tsx|js|jsx)$/.test(file.name)) {
      if (fixUnusedVars(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Main execution
const directories = ['app', 'components', 'lib', 'src'];
let totalFixed = 0;

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`Processing directory: ${dir}`);
    totalFixed += walkDirectory(dir);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);
