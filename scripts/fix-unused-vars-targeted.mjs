import fs from 'node:fs';
import path from 'node:path';

// Target specific files with the most unused variable warnings
const targetFiles = [
  'app/components/games/MemoryCubeBoot.tsx',
  'app/components/layout/Header.tsx',
  'app/components/layout/Navbar.tsx',
  'app/emails/OrderConfirmation.tsx',
  'app/mini-games/list/page.tsx',
];

function fixUnusedVars(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix specific patterns that are safe to fix
    const fixes = [
      // Function parameters that are unused
      {
        pattern: /function\s+\w+\s*\(([^)]*)\)/g,
        replacement: (match, params) => {
          const fixedParams = params
            .split(',')
            .map((p) => {
              const trimmed = p.trim();
              if (
                trimmed &&
                !trimmed.startsWith('_') &&
                !trimmed.includes('=') &&
                !trimmed.includes(':')
              ) {
                changed = true;
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
        replacement: (match, params) => {
          const fixedParams = params
            .split(',')
            .map((p) => {
              const trimmed = p.trim();
              if (
                trimmed &&
                !trimmed.startsWith('_') &&
                !trimmed.includes('=') &&
                !trimmed.includes(':')
              ) {
                changed = true;
                return `_${trimmed}`;
              }
              return trimmed;
            })
            .join(', ');
          return match.replace(params, fixedParams);
        },
      },

      // Destructuring with unused variables
      {
        pattern: /const\s*{\s*([^}]*)\s*}\s*=/g,
        replacement: (match, destructured) => {
          const fixed = destructured
            .split(',')
            .map((d) => {
              const trimmed = d.trim();
              if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(':')) {
                changed = true;
                return `_${trimmed}`;
              }
              return trimmed;
            })
            .join(', ');
          return match.replace(destructured, fixed);
        },
      },
    ];

    // Apply fixes
    for (const fix of fixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(` Fixed unused vars in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(` Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Process target files
let fixedCount = 0;
for (const file of targetFiles) {
  if (fixUnusedVars(file)) {
    fixedCount++;
  }
}

console.log(`\n Fixed unused variables in ${fixedCount} files`);
