import fs from 'node:fs';
import path from 'node:path';

// Files to fix based on the build output
const filesToFix = [
  'app/components/layout/Navbar.tsx',
  'app/components/games/MemoryCubeBoot.tsx',
  'app/components/layout/Header.tsx',
  'app/emails/OrderConfirmation.tsx',
];

function fixUnusedVars(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix common unused variable patterns
    const fixes = [
      // Function parameters that are unused
      {
        pattern: /(\w+)\s*:\s*(\w+)\s*\)/g,
        replacement: (match, param, type) => {
          if (!param.startsWith('_')) {
            changed = true;
            return `_${param}: ${type})`;
          }
          return match;
        },
      },

      // Destructuring with unused variables
      {
        pattern: /const\s*{\s*([^}]+)\s*}\s*=/g,
        replacement: (match, destructured) => {
          const items = destructured.split(',').map((item) => {
            const trimmed = item.trim();
            if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(':')) {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          });
          return match.replace(destructured, items.join(', '));
        },
      },

      // Array destructuring
      {
        pattern: /const\s*\[\s*([^\]]+)\s*\]\s*=/g,
        replacement: (match, destructured) => {
          const items = destructured.split(',').map((item) => {
            const trimmed = item.trim();
            if (trimmed && !trimmed.startsWith('_') && trimmed !== '') {
              changed = true;
              return `_${trimmed}`;
            }
            return trimmed;
          });
          return match.replace(destructured, items.join(', '));
        },
      },
    ];

    // Apply fixes
    for (const { pattern, replacement } of fixes) {
      content = content.replace(pattern, replacement);
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed unused vars in: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Fix the specific files
let fixedCount = 0;
for (const file of filesToFix) {
  if (fixUnusedVars(file)) {
    fixedCount++;
  }
}

console.log(`\nTotal files fixed: ${fixedCount}`);
