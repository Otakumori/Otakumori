/* eslint-disable no-console */
import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { encode } from "wav-encoder";

// Simple sine wave generator for fallback
function generateSineWave(frequency: number, duration: number, sampleRate = 44100): Float32Array {
  const samples = Math.floor(duration * sampleRate);
  const data = new Float32Array(samples);
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3; // 0.3 amplitude
  }
  
  return data;
}

function vibePresets(vibe: string): string[] {
  switch (vibe) {
    case "spicy-male": return [
      "3,,0.18,0.3,0.36,0.5,,,,,,0.3,,,,,0.2,0.2,0.2",
      "0,,0.1,,0.5,0.2,,0.3,,,,0.3,,,,,0.2,0.3,0.3",
    ];
    case "spicy-female": return [
      "0,,0.1,,0.2,0.3,,0.5,,,,0.4,,,,,0.5,0.2,0.2",
      "2,,0.15,,0.3,0.25,,0.4,,,,0.2,,,,,0.6,0.2,0.1",
    ];
    default: return [
      "0,,0.2,,0.4,0.3,,0.2,,,,0.1,,,,,0.2,0.2,0.2",
      "1,,0.15,,0.25,0.25,,0.2,,,,0.15,,,,,0.3,0.2,0.1",
    ];
  }
}

async function saveWav(file: string, samples: Float32Array, sampleRate = 44100) {
  const wav = await encode({ sampleRate, channelData: [samples] });
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, Buffer.from(wav));
}

async function appendItems(newItems: any[]) {
  let cfg: any;
  try {
    const raw = await fsp.readFile(CONFIG_PATH, "utf8");
    cfg = JSON.parse(raw);
  } catch {
    cfg = { version: 2, baseDir: "public/assets", items: [] as any[] };
  }
  
  // Ensure items array exists
  if (!cfg.items) cfg.items = [];

  for (const n of newItems) {
    if (!cfg.items.find((x: any) => x.id === n.id)) {
      cfg.items.push(n);
    }
  }
  
  await fsp.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fsp.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf8");
  console.log("→ assets.config.json appended", newItems.length, "item(s)");
}

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTDIR = path.join(PUBLIC_DIR, "assets/sfx");
const CONFIG_PATH = path.join(ROOT, "app/lib/assets/assets.config.json");

function argvValue(key: string, fallback?: string) {
  const i = process.argv.indexOf(`--${key}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

async function main() {
  // Parse arguments: npm run gen:sfx -- --avatar yumi --vibe spicy-female --count 3
  // The -- separates npm args from script args, so we need to look after the --
  const args = process.argv.slice(2); // Skip node and script name
  
  let avatar = "neutral";
  let vibe = "neutral";
  let count = 4;
  
  // Try to parse as named arguments first (--avatar yumi --vibe spicy-female --count 3)
  let hasNamedArgs = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--avatar" && args[i + 1]) {
      avatar = String(args[i + 1]).toLowerCase();
      i++; // Skip the value
      hasNamedArgs = true;
    } else if (args[i] === "--vibe" && args[i + 1]) {
      vibe = String(args[i + 1]).toLowerCase();
      i++; // Skip the value
      hasNamedArgs = true;
    } else if (args[i] === "--count" && args[i + 1]) {
      count = parseInt(String(args[i + 1]), 10);
      i++; // Skip the value
      hasNamedArgs = true;
    }
  }
  
  // If no named args, try positional (avatar vibe count)
  if (!hasNamedArgs && args.length >= 3) {
    avatar = String(args[0]).toLowerCase();
    vibe = String(args[1]).toLowerCase();
    count = parseInt(String(args[2]), 10);
    console.log("📝 Using positional arguments");
  }
  
  console.log(`🎵 Generating ${count} SFX for avatar: ${avatar} (${vibe} vibe)`);
  
  const presets = vibePresets(vibe);
  const itemsToAppend: any[] = [];
  
  for (let i = 0; i < count; i++) {
    const presetString = presets[i % presets.length];
    let samples: Float32Array;
    
    // Use sine wave generation as fallback
    console.log(`  ✓ Generated SFX ${i + 1} with sine wave fallback`);
    samples = generateSineWave(400 + i * 100, 0.1 + i * 0.05);
    
    const id = `${vibe}-${avatar}-sfx${i + 1}`;
    const relFile = `assets/sfx/${id}.wav`;
    const absFile = path.join(ROOT, "public", relFile);
    
    await saveWav(absFile, samples);
    console.log(`  ✓ Saved ${relFile}`);
    
    itemsToAppend.push({
      id,
      type: "audio",
      file: relFile, // <-- local file; assets:sync will pick it up
      license: "GENERATED",
      dest: "sfx/"
    });
  }
  
  await appendItems(itemsToAppend);
  console.log(`\n✅ Generated ${count} SFX files in ${OUTDIR}`);
}

main().catch(err => {
  console.error("✖ SFX gen failed", err);
  process.exit(1);
});
