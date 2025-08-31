#!/usr/bin/env node

/**
 * Script to fix Next.js metadata warnings by moving themeColor and viewport
 * from metadata exports to proper viewport exports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, '..', 'app');

function fixMetadataFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file has metadata export with themeColor or viewport
    if (
      content.includes('export const metadata') &&
      (content.includes('themeColor') || content.includes('viewport'))
    ) {
      console.log(`Fixing metadata in: ${filePath}`);

      // Extract themeColor and viewport from metadata
      const themeColorMatch = content.match(/themeColor:\s*['"`]([^'"`]+)['"`]/);
      const viewportMatch = content.match(/viewport:\s*['"`]([^'"`]+)['"`]/);

      let newContent = content;

      // Remove themeColor and viewport from metadata
      newContent = newContent.replace(/,\s*themeColor:\s*['"`][^'"`]+['"`]/g, '');
      newContent = newContent.replace(/,\s*viewport:\s*['"`][^'"`]+['"`]/g, '');

      // Add viewport export if needed
      if (themeColorMatch || viewportMatch) {
        const viewportExport = `export const viewport = {
  themeColor: ${themeColorMatch ? `'${themeColorMatch[1]}'` : "'#F6A8C7'"},
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}`;

        // Insert viewport export after metadata export
        const metadataEnd = newContent.indexOf('};', newContent.indexOf('export const metadata'));
        if (metadataEnd !== -1) {
          newContent =
            newContent.slice(0, metadataEnd + 2) +
            '\n\n' +
            viewportExport +
            newContent.slice(metadataEnd + 2);
        }
      }

      fs.writeFileSync(filePath, newContent);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixMetadataFile(filePath);
    }
  }
}

console.log('Fixing metadata warnings...');
walkDir(appDir);
console.log('Metadata fixes completed!');
