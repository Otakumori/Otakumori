from pathlib import Path
from collections import defaultdict
root = Path('.')
imports = defaultdict(list)
for path in root.rglob('*.*'):
    if '.git' in path.parts:
        continue
    if path.suffix not in {'.ts', '.tsx', '.js', '.mjs', '.cjs'}:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue
    if "from '@/env/server" in text or 'from "@/env/server' in text:
        imports['env'].append(str(path))
    if "from '@/env.mjs" in text or 'from "@/env.mjs' in text:
        imports['env.mjs'].append(str(path))
    if 'process.env' in text:
        imports['process.env'].append(str(path))
for key, files in imports.items():
    print(f'--- {key} ({len(files)})')
    for f in sorted(set(files)):
        print(f)

