import { globby } from "globby";
import fs from "node:fs/promises";

const files = await globby([
  "app/**/*.{ts,tsx,js,jsx}",
  "components/**/*.{ts,tsx,js,jsx}",
  "lib/**/*.{ts,tsx,js,jsx}",
  "!node_modules/**"
]);

for (const f of files) {
  let content = await fs.readFile(f, "utf8");
  
  // Check if file has duplicate content (same import/export appearing twice)
  const lines = content.split('\n');
  const seenImports = new Set();
  const seenExports = new Set();
  const seenFunctions = new Set();
  const seenTypes = new Set();
  
  let cleanedLines = [];
  let inDuplicate = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect start of duplicate section (usually after first function/export)
    if (line.startsWith('import ') || line.startsWith('export ')) {
      if (seenImports.has(line) || seenExports.has(line)) {
        inDuplicate = true;
        continue;
      }
      if (line.startsWith('import ')) seenImports.add(line);
      if (line.startsWith('export ')) seenExports.add(line);
    }
    
    // Detect duplicate function definitions
    const functionMatch = line.match(/^(export\s+)?(async\s+)?function\s+(\w+)/);
    if (functionMatch) {
      const funcName = functionMatch[3];
      if (seenFunctions.has(funcName)) {
        inDuplicate = true;
        continue;
      }
      seenFunctions.add(funcName);
    }
    
    // Detect duplicate type definitions
    const typeMatch = line.match(/^(export\s+)?(type|interface)\s+(\w+)/);
    if (typeMatch) {
      const typeName = typeMatch[3];
      if (seenTypes.has(typeName)) {
        inDuplicate = true;
        continue;
      }
      seenTypes.add(typeName);
    }
    
    // Detect duplicate const/let/var declarations
    const constMatch = line.match(/^(export\s+)?(const|let|var)\s+(\w+)/);
    if (constMatch) {
      const varName = constMatch[3];
      if (seenTypes.has(varName)) {
        inDuplicate = true;
        continue;
      }
      seenTypes.add(varName);
    }
    
    // Reset duplicate flag when we hit a new section
    if (line === '' && inDuplicate) {
      inDuplicate = false;
      continue;
    }
    
    if (!inDuplicate) {
      cleanedLines.push(lines[i]);
    }
  }
  
  const cleanedContent = cleanedLines.join('\n');
  
  if (cleanedContent !== content) {
    await fs.writeFile(f, cleanedContent, "utf8");
    console.log("Cleaned", f);
  }
}
