 
 
import fsp from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'app/lib/assets/assets.config.json');

export interface AssetEntry {
  id: string;
  type: 'image' | 'audio' | 'video' | 'font';
  file: string;
  tags?: string[];
  vibe?: string;
  avatar?: string;
}

export async function appendAsset(entry: AssetEntry) {
  let data: any = {};
  try {
    const raw = await fsp.readFile(MANIFEST, 'utf8');
    data = JSON.parse(raw);
  } catch {
    data = { version: 2, baseDir: 'public/assets', items: [] };
  }

  // ensure items array exists
  if (!data.items) data.items = [];

  // avoid dupes
  if (!data.items.find((d: any) => d.id === entry.id)) {
    data.items.push({
      id: entry.id,
      url: '', // local file
      type: entry.type,
      license: 'GENERATED',
      dest: path.dirname(entry.file).replace('public/assets/', ''),
      tags: entry.tags,
      vibe: entry.vibe,
      avatar: entry.avatar,
    });
    await fsp.writeFile(MANIFEST, JSON.stringify(data, null, 2), 'utf8');
    console.log('→ Manifest appended:', entry.id);
  } else {
    console.log('→ Manifest already has:', entry.id);
  }
}
