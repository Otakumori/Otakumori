import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'content') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixFinalUseClient() {
  const files = getAllFiles('.');
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      let content = readFileSync(file, 'utf8');
      let modified = false;
      
      // Check if file has 'use client' directive and move it to the very top
      if (content.includes("'use client'")) {
        const lines = content.split('\n');
        const useClientIndex = lines.findIndex(line => line.trim() === "'use client'");
        
        if (useClientIndex > 0) {
          // Remove the 'use client' line from its current position
          const useClientLine = lines[useClientIndex];
          lines.splice(useClientIndex, 1);
          
          // Add it at the very beginning
          lines.unshift(useClientLine);
          
          content = lines.join('\n');
          modified = true;
        }
      }
      
      if (modified) {
        writeFileSync(file, content);
        console.log(`Fixed use client directive: ${file}`);
        fixedCount++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  
  console.log(`Fixed ${fixedCount} files`);
}

fixFinalUseClient();
