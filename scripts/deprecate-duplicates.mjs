import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

function deprecateDuplicates() {
  const duplicatesPath = join('reports', 'duplicates.json');

  if (!existsSync(duplicatesPath)) {
    console.log('No duplicates.json found. Run find-duplicates.mjs first.');
    return;
  }

  const duplicates = JSON.parse(readFileSync(duplicatesPath, 'utf8'));
  let deprecatedCount = 0;

  for (const [slug, data] of Object.entries(duplicates)) {
    for (const loserFile of data.losers) {
      try {
        const content = readFileSync(loserFile, 'utf8');

        // Check if already deprecated
        if (content.includes('DEPRECATED')) {
          console.log(`Already deprecated: ${loserFile}`);
          continue;
        }

        // Add deprecation header
        const deprecatedHeader = `// DEPRECATED: This component is a duplicate. Use ${data.winner} instead.\n`;
        const newContent = deprecatedHeader + content;

        writeFileSync(loserFile, newContent);
        console.log(`Deprecated: ${loserFile}`);
        deprecatedCount++;
      } catch (e) {
        console.error(`Error deprecating ${loserFile}:`, e.message);
      }
    }
  }

  console.log(`Deprecated ${deprecatedCount} duplicate files`);
}

deprecateDuplicates();
