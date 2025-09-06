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

function fixRemainingErrors() {
  const files = getAllFiles('.');
  let fixedCount = 0;

  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf8');
      let modified = false;

      // Fix 1: Replace >t("key", "subkey")</tag> with t("key", "subkey")
      const incorrectPattern = />t\("([^"]+)",\s*"([^"]+)"\)<\/tag>/g;
      if (incorrectPattern.test(content)) {
        content = content.replace(incorrectPattern, 't("$1", "$2")');
        modified = true;
      }

      // Fix 2: Replace >t("key", "subkey")</tag> with t("key", "subkey") (without quotes)
      const incorrectPatternNoQuotes = />t\("([^"]+)",\s*"([^"]+)"\)<\/tag>/g;
      if (incorrectPatternNoQuotes.test(content)) {
        content = content.replace(incorrectPatternNoQuotes, 't("$1", "$2")');
        modified = true;
      }

      // Fix 3: Replace JSX text content patterns like >t("key", "subkey")</tag> with {t("key", "subkey")}
      const jsxTextPattern = />t\("([^"]+)",\s*"([^"]+)"\)<\/tag>/g;
      if (jsxTextPattern.test(content)) {
        content = content.replace(jsxTextPattern, '{t("$1", "$2")}');
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

fixRemainingErrors();
