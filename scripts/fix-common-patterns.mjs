import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

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

function fixCommonPatterns() {
  const files = getAllFiles('.');
  let fixedCount = 0;

  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf8');
      let modified = false;

      // Fix 1: JSX text content - replace "t("key", "subkey")/tag>" with ">{t("key", "subkey")}</tag>"
      const jsxTextPattern = /"t\("([^"]+)",\s*"([^"]+)"\)\/([a-zA-Z][a-zA-Z0-9]*)\>"/g;
      if (jsxTextPattern.test(content)) {
        content = content.replace(jsxTextPattern, '">{t("$1", "$2")}</$3>"');
        modified = true;
      }

      // Fix 2: JSX text content without quotes - replace "t("key", "subkey")/tag>" with ">{t("key", "subkey")}</tag>"
      const jsxTextNoQuotesPattern = /t\("([^"]+)",\s*"([^"]+)"\)\/([a-zA-Z][a-zA-Z0-9]*)\>/g;
      if (jsxTextNoQuotesPattern.test(content)) {
        content = content.replace(jsxTextNoQuotesPattern, '>{t("$1", "$2")}</$3>');
        modified = true;
      }

      // Fix 3: JSX attributes - replace "t("key", "subkey")" with ">{t("key", "subkey")}</tag>"
      const jsxAttrPattern = /"t\("([^"]+)",\s*"([^"]+)"\)"/g;
      if (jsxAttrPattern.test(content)) {
        content = content.replace(jsxAttrPattern, '">{t("$1", "$2")}</tag>"');
        modified = true;
      }

      // Fix 4: JSX attributes without quotes - replace "t("key", "subkey")" with ">{t("key", "subkey")}</tag>"
      const jsxAttrNoQuotesPattern = /t\("([^"]+)",\s*"([^"]+)"\)/g;
      if (jsxAttrNoQuotesPattern.test(content)) {
        content = content.replace(jsxAttrNoQuotesPattern, '>{t("$1", "$2")}</tag>');
        modified = true;
      }

      if (modified) {
        writeFileSync(file, content);
        console.log(`Fixed: ${file}`);
        fixedCount++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }

  console.log(`Fixed ${fixedCount} files`);
}

fixCommonPatterns();
