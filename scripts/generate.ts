import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const GEN_CFG = path.join(ROOT, 'app/lib/assets/generators.config.json');
const ASSET_CFG = path.join(ROOT, 'app/lib/assets/assets.config.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const STYLE_MAP = path.join(ROOT, 'app/lib/style-map.ts');

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function sha256(b: Buffer) {
  return crypto.createHash('sha256').update(b).digest('hex');
}

// ---- DITHER HELPERS ----
type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  const [r, g, b] = m ? m.map((h) => parseInt(h, 16)) : [255, 255, 255];
  return { r, g, b };
}

function nearestPaletteColor(c: RGB, palette: RGB[]): RGB {
  let best = 0,
    bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dr = c.r - p.r,
      dg = c.g - p.g,
      db = c.b - p.b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return palette[best];
}

function clamp8(x: number) {
  return x < 0 ? 0 : x > 255 ? 255 : x | 0;
}

// Floyd–Steinberg kernel weights
const FS = [
  { dx: 1, dy: 0, w: 7 / 16 },
  { dx: -1, dy: 1, w: 3 / 16 },
  { dx: 0, dy: 1, w: 5 / 16 },
  { dx: 1, dy: 1, w: 1 / 16 },
];

// Atkinson kernel weights (sum = 1/8 * 6 = 0.75)
const ATK = [
  { dx: 1, dy: 0, w: 1 / 8 },
  { dx: 2, dy: 0, w: 1 / 8 },
  { dx: -1, dy: 1, w: 1 / 8 },
  { dx: 0, dy: 1, w: 1 / 8 },
  { dx: 1, dy: 1, w: 1 / 8 },
  { dx: 0, dy: 2, w: 1 / 8 },
];

function ditherToPaletteRGBA(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  paletteHex: string[],
  mode: 'floyd-steinberg' | 'atkinson' = 'floyd-steinberg',
  strength = 1.0,
  alphaThreshold = 16,
) {
  if (!paletteHex?.length) return rgba;
  const kern = mode === 'atkinson' ? ATK : FS;
  const pal = paletteHex.map(hexToRgb);

  // work on a float buffer copy for error diffusion
  const buf = new Float32Array(rgba.length);
  for (let i = 0; i < rgba.length; i++) buf[i] = rgba[i];

  const idx = (x: number, y: number) => (y * width + x) * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      const a = buf[i + 3];
      if (a < alphaThreshold) continue; // skip nearly transparent pixels

      const old: RGB = { r: buf[i], g: buf[i + 1], b: buf[i + 2] };
      const neu = nearestPaletteColor(old, pal);

      // write quantized color
      buf[i] = neu.r;
      buf[i + 1] = neu.g;
      buf[i + 2] = neu.b;

      // diffuse error
      const er = (old.r - neu.r) * strength;
      const eg = (old.g - neu.g) * strength;
      const eb = (old.b - neu.b) * strength;

      for (const k of kern) {
        const nx = x + k.dx,
          ny = y + k.dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = idx(nx, ny);
        if (buf[ni + 3] < alphaThreshold) continue;
        buf[ni] = clamp8(buf[ni] + er * k.w);
        buf[ni + 1] = clamp8(buf[ni + 1] + eg * k.w);
        buf[ni + 2] = clamp8(buf[ni + 2] + eb * k.w);
      }
    }
  }

  // copy back to Uint8ClampedArray
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = clamp8(buf[i]);
    rgba[i + 1] = clamp8(buf[i + 1]);
    rgba[i + 2] = clamp8(buf[i + 2]);
    // keep alpha
  }
  return rgba;
}

async function waitForImages(endpoint: string, prompt_id: string, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${endpoint}/history/${prompt_id}`);
    if (res.ok) {
      const data = await res.json();
      const entry = data?.[prompt_id];
      if (entry?.outputs) {
        const urls: string[] = [];
        for (const nodeId of Object.keys(entry.outputs)) {
          const out = entry.outputs[nodeId];
          const imgs = out?.images || [];
          for (const im of imgs) {
            // ComfyUI serves images via /view
            const u = `${endpoint}/view?filename=${encodeURIComponent(im.filename)}&subfolder=${encodeURIComponent(im.subfolder || '')}&type=${encodeURIComponent(im.type || 'output')}`;
            urls.push(u);
          }
        }
        if (urls.length) return urls;
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Timed out waiting for ComfyUI images');
}

async function main() {
  const [, , targetOrPreset, ...argv] = process.argv;

  // Usage examples:
  // npm run gen:asset -- ui --avatar yumi --game snake --workflow ./comfy/workflow.json
  // npm run gen:asset -- minigame.noir.tech --workflow ./comfy/workflow.json   (direct preset)

  if (!targetOrPreset) {
    console.error(
      'Usage: npm run gen:asset -- <class|presetId> [--avatar <name> --game <game> --workflow <path> --seed 123 --count 4]',
    );
    console.error('\nExamples:');
    console.error('  npm run gen:asset -- ui --avatar yumi --game snake');
    console.error('  npm run gen:asset -- minigame.noir.tech --workflow ./comfy/workflow.json');
    console.error("\nNote: Always use 'npm run gen:asset --' (with --) to pass flags correctly");
    process.exit(1);
  }

  const arg = (k: string, d?: any) => {
    const i = argv.indexOf(`--${k}`);
    if (i >= 0 && argv[i + 1]) return argv[i + 1];
    return d;
  };

  const hasFlag = (k: string) => process.argv.includes(`--${k}`);

  const ditherFlag = String(arg('dither', '')).toLowerCase(); // "fs" | "atkinson"
  const ditherModeCli =
    ditherFlag === 'fs' ? 'floyd-steinberg' : ditherFlag === 'atkinson' ? 'atkinson' : undefined;

  const ditherStrengthCli = arg('dither-strength'); // e.g. "0.8"
  const alphaThresholdCli = arg('alpha-threshold'); // e.g. "24"
  const disableDitherCli = hasFlag('no-dither');

  // Require a workflow file for visual classes
  const workflowPath = String(arg('workflow', ''));

  const genRaw = await fsp.readFile(GEN_CFG, 'utf8');
  const gen = JSON.parse(genRaw);

  type ClassKey = 'ui' | 'textures' | 'icons' | 'avatars' | 'sfx';
  const classKey = (['ui', 'textures', 'icons', 'avatars', 'sfx'] as ClassKey[]).includes(
    targetOrPreset as any,
  )
    ? (targetOrPreset as ClassKey)
    : null;

  let presetId = '';
  let vibe = 'neutral';

  if (classKey) {
    const avatar = String(arg('avatar', '')).toLowerCase();
    if (!avatar) throw new Error('When generating a class, provide --avatar <name>');

    // Import avatar vibes dynamically using pathToFileURL
    if (!fs.existsSync(STYLE_MAP)) {
      throw new Error('style-map.ts not found. Create it first with avatar vibe mappings.');
    }

    try {
      const { getVibeForAvatar, avatarVibes } = await import(pathToFileURL(STYLE_MAP).href);

      if (!getVibeForAvatar) {
        throw new Error('style-map.ts missing getVibeForAvatar function');
      }

      vibe = getVibeForAvatar(avatar);
      if (!vibe) throw new Error(`Unknown vibe for avatar: ${avatar}`);

      // ` Avatar "${avatar}" resolved to vibe: ${vibe}`
    } catch (error) {
      console.error('Failed to import style-map:', error);
      throw new Error(`Could not resolve vibe for avatar: ${avatar}`);
    }

    const family = gen.families?.[vibe];
    if (!family || !family[classKey]) {
      throw new Error(`No preset mapped for vibe "${vibe}" class "${classKey}"`);
    }
    presetId = family[classKey];

    // ` Generating ${classKey} for avatar "${avatar}" (${vibe} vibe → preset: ${presetId}`
  } else {
    // User passed a direct preset id like "minigame.noir.tech"
    presetId = targetOrPreset;
    // ` Using direct preset: ${presetId}`
  }

  const preset = gen.presets[presetId];
  if (!preset) throw new Error(`Unknown presetId: ${presetId}`);

  // Resolve effective dither settings
  const ditherCfg = disableDitherCli
    ? null
    : {
        mode:
          (ditherModeCli as 'floyd-steinberg' | 'atkinson') ??
          preset.dither?.mode ??
          'floyd-steinberg',
        strength:
          ditherStrengthCli !== undefined
            ? parseFloat(String(ditherStrengthCli))
            : (preset.dither?.strength ?? 1.0),
        alphaThreshold:
          alphaThresholdCli !== undefined
            ? parseInt(String(alphaThresholdCli))
            : (preset.dither?.alphaThreshold ?? 24),
      };

  if (ditherCfg) {
    // ` Dithering: ${ditherCfg.mode} (strength: ${ditherCfg.strength}, alpha: ${ditherCfg.alphaThreshold}`
  }

  const endpoint = gen.endpoint || 'http://127.0.0.1:8188';
  const count = parseInt(arg('count', preset.count || 1));
  const seed = parseInt(arg('seed', gen.defaults.seed));
  const width = parseInt(arg('width', gen.defaults.width));
  const height = parseInt(arg('height', gen.defaults.height));
  const steps = parseInt(arg('steps', gen.defaults.steps));
  const cfg = parseFloat(arg('cfg', gen.defaults.cfg));
  const sampler = String(arg('sampler', gen.defaults.sampler));

  const names: string[] =
    preset.names && preset.names.length === count
      ? preset.names
      : Array.from({ length: count }).map((_, i) => `${presetId.split('.').slice(-1)[0]}-${i + 1}`);

  // Load and patch workflow
  if (!workflowPath) throw new Error('--workflow <path> is required for image generation');
  await fsp.access(workflowPath).catch(() => {
    throw new Error(`Workflow not found at ${workflowPath}`);
  });
  const workflowRaw = await fsp.readFile(workflowPath, 'utf8');
  const workflow = JSON.parse(workflowRaw);

  const patchTexts = (wf: any, pos: string, neg: string) => {
    const nodes = Object.keys(wf);
    let posPatched = false;
    let negPatched = false;
    for (const id of nodes) {
      const node = wf[id];
      if (!node || typeof node !== 'object') continue;
      if (node.class_type === 'CLIPTextEncode') {
        const title = node._meta?.title || '';
        if (!posPatched && /positive/i.test(title)) {
          node.inputs = node.inputs || {};
          node.inputs.text = pos;
          posPatched = true;
          continue;
        }
        if (!negPatched && /negative/i.test(title)) {
          node.inputs = node.inputs || {};
          node.inputs.text = neg;
          negPatched = true;
          continue;
        }
      }
    }
    // If not found by title, fall back to first two CLIPTextEncode nodes
    if (!posPatched || !negPatched) {
      const clips = nodes.filter((id) => workflow[id]?.class_type === 'CLIPTextEncode');
      if (!posPatched && clips[0]) {
        workflow[clips[0]].inputs = workflow[clips[0]].inputs || {};
        workflow[clips[0]].inputs.text = pos;
      }
      if (!negPatched && clips[1]) {
        workflow[clips[1]].inputs = workflow[clips[1]].inputs || {};
        workflow[clips[1]].inputs.text = neg;
      }
    }
  };

  const results: { file: string; id: string; bytes: number; sha256: string; publicPath: string }[] =
    [];

  for (let i = 0; i < count; i++) {
    const name = names[i];
    // `  → Generating ${name} (${i + 1}/${count}`);

    // Prepare per-image workflow copy and patch prompts
    const wf = JSON.parse(JSON.stringify(workflow));
    const positive = `${preset.positive}\nLabel: ${name}`;
    const negative = preset.negative || '';
    patchTexts(wf, positive, negative);

    // Send full graph to ComfyUI
    const res = await fetch(`${endpoint}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: wf }),
    });
    if (!res.ok) throw new Error(`ComfyUI HTTP ${res.status}`);

    // Expect prompt_id, then wait for outputs
    const data = await res.json();
    const prompt_id = data.prompt_id || data.promptId || data?.['prompt_id'];
    if (!prompt_id) throw new Error('No prompt_id in ComfyUI response');

    // `    Waiting for ComfyUI to generate...`
    const urls = await waitForImages(endpoint, prompt_id);
    if (!urls.length) throw new Error('No images generated');

    // Fetch the first image
    const img = await fetch(urls[0]);
    if (!img.ok) throw new Error(`Failed to fetch image: ${img.status}`);
    const ab = await img.arrayBuffer();
    let buf: Buffer = Buffer.from(ab as ArrayBuffer);

    // Apply dithering if configured
    if (ditherCfg && preset.palette?.length) {
      // `    Applying ${ditherCfg.mode} dithering...`

      // Pull raw pixels, dither to palette, then re-encode PNG
      const sharp = (await import('sharp')).default;
      const tmp = await sharp(buf).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
      const arr = new Uint8ClampedArray(tmp.data.buffer);

      ditherToPaletteRGBA(
        arr,
        tmp.info.width,
        tmp.info.height,
        preset.palette,
        ditherCfg.mode,
        ditherCfg.strength,
        ditherCfg.alphaThreshold,
      );

      // Create a new buffer from the modified array data
      const newBuffer = Buffer.alloc(arr.length);
      for (let j = 0; j < arr.length; j++) newBuffer[j] = arr[j];

      buf = await sharp(newBuffer, {
        raw: { width: tmp.info.width, height: tmp.info.height, channels: 4 },
      })
        .png()
        .toBuffer();
    }

    const hash = sha256(buf);
    const file = path.join(
      PUBLIC_DIR,
      'assets',
      'gen',
      presetId.replace(/\./g, '/'),
      `${name}.${hash.slice(0, 8)}.png`,
    );
    ensureDir(path.dirname(file));
    await fsp.writeFile(file, buf);
    const publicPath = '/' + path.relative(PUBLIC_DIR, file).replace(/\\/g, '/');
    results.push({ file, id: `${presetId}.${name}`, bytes: buf.length, sha256: hash, publicPath });
  }

  // Append generated assets to assets.config.json so sync includes them going forward
  const assetsRaw = await fsp.readFile(ASSET_CFG, 'utf8');
  const assets = JSON.parse(assetsRaw);
  assets.baseDir = assets.baseDir || 'public/assets';
  assets.items = assets.items || [];

  for (const r of results) {
    assets.items.push({
      id: r.id,
      url: '',
      type: 'image',
      license: 'GENERATED',
      dest: path.relative(path.join(PUBLIC_DIR, 'assets'), path.dirname(r.file)),
    });
  }

  await fsp.writeFile(ASSET_CFG, JSON.stringify(assets, null, 2), 'utf8');

  // '\n Generated:'
  // for (const r of results) ' •', r.publicPath
  // `\n Next: run 'npm run assets:sync' to ensure the manifest includes these.`
}

main().catch((e) => {
  console.error(' Generation failed:', e);
  process.exit(1);
});
