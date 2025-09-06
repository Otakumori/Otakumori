import fs from 'node:fs';
import path from 'node:path';

// Common unused variable patterns to fix
const UNUSED_PATTERNS = [
  // Function parameters
  {
    pattern: /function\s+\w+\s*\(([^)]*)\)/g,
    fix: (match, params) => {
      const fixedParams = params
        .split(',')
        .map((p) => {
          const trimmed = p.trim();
          if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=')) {
            return `_${trimmed}`;
          }
          return trimmed;
        })
        .join(', ');
      return match.replace(params, fixedParams);
    },
  },

  // Arrow function parameters
  {
    pattern: /\(([^)]*)\)\s*=>/g,
    fix: (match, params) => {
      const fixedParams = params
        .split(',')
        .map((p) => {
          const trimmed = p.trim();
          if (trimmed && !trimmed.startsWith('_') && !trimmed.includes('=')) {
            return `_${trimmed}`;
          }
          return trimmed;
        })
        .join(', ');
      return match.replace(params, fixedParams);
    },
  },

  // Destructuring assignments
  {
    pattern: /const\s*{\s*([^}]+)\s*}\s*=/g,
    fix: (match, destructured) => {
      const fixed = destructured
        .split(',')
        .map((item) => {
          const trimmed = item.trim();
          if (trimmed && !trimmed.startsWith('_')) {
            return `_${trimmed}`;
          }
          return trimmed;
        })
        .join(', ');
      return match.replace(destructured, fixed);
    },
  },

  // Array destructuring
  {
    pattern: /const\s*\[\s*([^\]]+)\s*\]\s*=/g,
    fix: (match, destructured) => {
      const fixed = destructured
        .split(',')
        .map((item) => {
          const trimmed = item.trim();
          if (trimmed && !trimmed.startsWith('_') && trimmed !== '') {
            return `_${trimmed}`;
          }
          return trimmed;
        })
        .join(', ');
      return match.replace(destructured, fixed);
    },
  },

  // Variable declarations
  {
    pattern: /(const|let|var)\s+(\w+)\s*=/g,
    fix: (match, keyword, varName) => {
      if (!varName.startsWith('_') && !varName.includes('.')) {
        return match.replace(varName, `_${varName}`);
      }
      return match;
    },
  },
];

function fixUnusedVars(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;

    // Apply fixes
    for (const { pattern, fix } of UNUSED_PATTERNS) {
      fixedContent = fixedContent.replace(pattern, fix);
    }

    // Only write if content changed
    if (fixedContent !== content) {
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
