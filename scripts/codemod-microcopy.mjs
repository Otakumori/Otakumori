import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const microcopyPath = 'content/microcopy.json';
const microcopy = JSON.parse(readFileSync(microcopyPath, 'utf8'));

function getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith('.') &&
      item !== 'node_modules' &&
      item !== 'content'
    ) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

function flattenMicrocopy(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[value] = `${prefix}${key}`;
    } else if (typeof value === 'object') {
      Object.assign(result, flattenMicrocopy(value, `${prefix}${key}.`));
    }
  }
  return result;
}

function codemodMicrocopy() {
  const files = getAllFiles('.');
  const stringMap = flattenMicrocopy(microcopy);
  let modifiedCount = 0;

  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf8');
      let modified = false;

      // Skip if already has microcopy import
      if (
        content.includes('from "@/lib/microcopy"') ||
        content.includes('from "@/lib/microcopy.ts"')
      ) {
        continue;
      }

      // Find and replace strings
      for (const [string, key] of Object.entries(stringMap)) {
        // Look for JSX text content and string literals
        const patterns = [
          // JSX text content: >text<
          new RegExp(`>\\s*${string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'),
          // String literals in JSX attributes
          new RegExp(`"${string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
          new RegExp(`'${string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'),
        ];

        for (const pattern of patterns) {
          if (pattern.test(content)) {
            const [k1, k2] = key.split('.');
            const replacement = `{t("${k1}", "${k2}")}`;
            content = content.replace(pattern, replacement);
            modified = true;
          }
        }
      }

      if (modified) {
        // Add import if not present
        if (!content.includes('import { t }')) {
          const importLine = `import { t } from "@/lib/microcopy";\n`;
          content = importLine + content;
        }

        writeFileSync(file, content);
        console.log(`Modified: ${file}`);
        modifiedCount++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }

  console.log(`Modified ${modifiedCount} files with microcopy`);
}

codemodMicrocopy();
