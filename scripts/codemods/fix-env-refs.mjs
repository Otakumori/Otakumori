import { globby } from "globby";
import fs from "node:fs/promises";

const files = await globby([
  "app/**/*.{ts,tsx,js,jsx}",
  "lib/**/*.{ts,tsx,js,jsx}",
  "components/**/*.{ts,tsx,js,jsx}",
  "scripts/**/*.{ts,tsx,js,jsx}",
  "!node_modules/**"
]);

for (const f of files) {
  let s = await fs.readFile(f, "utf8");
  if (!s.includes("process.env")) continue;

  if (!s.includes("from '@/env'") && !s.includes("from \"@/env\"")) {
    // add import only if file is ESM/TS module (skip .cjs)
    if (!f.endsWith(".cjs")) {
      s = s.replace(/^(?!.*import\s+\{\s*env\s*\}\s+from\s+['"]@\/env['"]).*/m, (line, i, full) => {
        // Insert after first import or at top
        if (full.startsWith("import ")) {
          return `import { env } from '@/env';\n${full}`;
        }
        return `import { env } from '@/env';\n${line}`;
      });
    }
  }
  s = s.replaceAll(/process\.env\.(\w+)/g, "env.$1");
  await fs.writeFile(f, s, "utf8");
  console.log("fixed", f);
}
