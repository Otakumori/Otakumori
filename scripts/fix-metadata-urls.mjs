#!/usr/bin/env node
/**
 * Fix Windows file paths in metadata URLs and remove duplicate metadata exports
 * Run: node scripts/fix-metadata-urls.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Convert Windows file path to route URL
function fixUrl(filePath, url) {
  // If URL contains Windows path (backslash or C:\), convert it
  if (url.includes(':\\') || url.includes('\\')) {
    // Extract the route part from the file path
    const relativePath = filePath.replace(/^.*[\/\\]app[\/\\]/, '');
    const routePath = relativePath
      .replace(/[\/\\]page\.tsx$/, '')
      .replace(/\[(\w+)\]/g, ':$1')
      .replace(/\\/g, '/');
    return '/' + routePath;
  }
  return url;
}

// Remove export const metadata lines
function removeConstMetadata(content) {
  // Remove export const metadata = ...; lines
  const lines = content.split('\n');
  const filtered = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Check if this line starts export const metadata
    if (/^\s*export\s+const\s+metadata\s*[:=]/.test(line)) {
      // Skip this line and continue until we find a semicolon
      let j = i;
      let foundSemicolon = false;
      while (j < lines.length) {
        if (lines[j].includes(';')) {
          foundSemicolon = true;
          break;
        }
        j++;
      }
      i = j + 1;
      continue;
    }
    filtered.push(line);
    i++;
  }
  return filtered.join('\n');
}

// Fix Windows paths in generateMetadata functions
function fixMetadataUrls(content, filePath) {
  // Find all generateMetadata functions and fix their URLs
  const urlPattern = /url:\s*['"]([^'"]+)['"]/g;
  
  return content.replace(urlPattern, (match, url) => {
    const fixedUrl = fixUrl(filePath, url);
    if (fixedUrl !== url) {
      return `url: '${fixedUrl}'`;
    }
    return match;
  });
}

// Remove duplicate imports
function removeDuplicateImports(content) {
  const lines = content.split('\n');
  const seen = new Set();
  const filtered = [];
  
  for (const line of lines) {
    // Check if this is an import line for generateSEO
    if (/import.*generateSEO.*from/.test(line)) {
      const normalized = line.trim();
      if (seen.has(normalized)) {
        continue; // Skip duplicate
      }
      seen.add(normalized);
    }
    filtered.push(line);
  }
  
  return filtered.join('\n');
}

async function main() {
  const pageFiles = await glob('app/**/page.tsx', {
    cwd: rootDir,
    absolute: true,
  });

  console.log(`Found ${pageFiles.length} page files\n`);

  let fixed = 0;
  let errors = 0;

  for (const filePath of pageFiles) {
    try {
      let content = readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix Windows paths in URLs
      content = fixMetadataUrls(content, filePath);

      // Remove duplicate const metadata exports
      content = removeConstMetadata(content);

      // Remove duplicate imports
      content = removeDuplicateImports(content);

      if (content !== originalContent) {
        writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath.replace(rootDir + '/', '')}`);
        fixed++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath.replace(rootDir + '/', '')}:`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Summary: Fixed ${fixed} files, Errors: ${errors}`);
}

main().catch(console.error);

