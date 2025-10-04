const fs = require('fs');
const path = require('path');

// Simple script to fix corrupted quotes in all TypeScript/JavaScript files
const extensions = ['.ts', '.tsx', '.js', '.jsx'];
const excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function fixQuotesInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = content.replace(/\{\"'\}/g, "'");

    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('Starting quote fix process...');
const files = getAllFiles('.');
let fixedCount = 0;

files.forEach((file) => {
  if (fixQuotesInFile(file)) {
    fixedCount++;
  }
});

console.log(`Fixed quotes in ${fixedCount} files.`);
