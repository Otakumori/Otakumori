import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { execSync } from 'child_process';

const reportsDir = 'reports';
if (!existsSync(reportsDir)) {
  mkdirSync(reportsDir, { recursive: true });
}

function getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getFileContent(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (e) {
    return '';
  }
}

function getImportCount(filePath, allFiles) {
  const content = getFileContent(filePath);
  let count = 0;
  
  for (const otherFile of allFiles) {
    if (otherFile !== filePath) {
      const otherContent = getFileContent(otherFile);
      const relativePath = filePath.replace(/\\/g, '/');
      const fileName = basename(filePath, extname(filePath));
      
      // Check for various import patterns
      if (otherContent.includes(`from '${relativePath}'`) ||
          otherContent.includes(`from "${relativePath}"`) ||
          otherContent.includes(`from './${fileName}'`) ||
          otherContent.includes(`from "./${fileName}"`) ||
          otherContent.includes(`import ${fileName}`) ||
          otherContent.includes(`<${fileName}`)) {
        count++;
      }
    }
  }
  
  return count;
}

function getCommitDate(filePath) {
  try {
    const result = execSync(`git log -1 --format=%ct "${filePath}"`, { encoding: 'utf8' });
    return parseInt(result.trim()) || 0;
  } catch (e) {
    return 0;
  }
}

function getLineCount(filePath) {
  const content = getFileContent(filePath);
  return content.split('\n').length;
}

function generateSlug(filePath) {
  const name = basename(filePath, extname(filePath));
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function findDuplicates() {
  const allFiles = getAllFiles('.');
  const groups = new Map();
  
  // Group files by slug
  for (const file of allFiles) {
    const slug = generateSlug(file);
    if (!groups.has(slug)) {
      groups.set(slug, []);
    }
    groups.get(slug).push(file);
  }
  
  const duplicates = {};
  
  for (const [slug, files] of groups) {
    if (files.length > 1) {
      // Score each file: imports > commit date > line count
      const scored = files.map(file => ({
        file,
        imports: getImportCount(file, allFiles),
        commitDate: getCommitDate(file),
        lineCount: getLineCount(file)
      }));
      
      // Sort by score (higher is better)
      scored.sort((a, b) => {
        if (a.imports !== b.imports) return b.imports - a.imports;
        if (a.commitDate !== b.commitDate) return b.commitDate - a.commitDate;
        return b.lineCount - a.lineCount;
      });
      
      duplicates[slug] = {
        winner: scored[0].file,
        losers: scored.slice(1).map(s => s.file),
        scores: scored
      };
    }
  }
  
  writeFileSync(join(reportsDir, 'duplicates.json'), JSON.stringify(duplicates, null, 2));
  console.log(`Found ${Object.keys(duplicates).length} duplicate groups`);
  console.log(`Report written to ${join(reportsDir, 'duplicates.json')}`);
  
  return duplicates;
}

findDuplicates();
