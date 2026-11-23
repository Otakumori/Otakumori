const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const approvedDirectory = path.resolve(
  'docs/design/references/approved/batch-3/games/puzzle-reveal/reveal-art',
);
const runtimeDirectory = path.resolve('public/assets/games/puzzle-reveal/reveal-art');

const approvedMasters = [
  {
    source:
      'docs/design/references/approved/batch-2/games/covers/game-puzzle-reveal-cover-source.png',
    runtime: 'puzzle-reveal-cover-v1.webp',
    crop: { left: 0, top: 300, width: 1024, height: 768 },
  },
  {
    source: 'docs/design/references/approved/batch-2/games/hub/game-puzzle-reveal-hub-source.png',
    runtime: 'puzzle-reveal-hub-v1.webp',
    crop: { left: 0, top: 110, width: 1254, height: 941 },
  },
  { source: path.join(approvedDirectory, 'puzzle-reveal-shrine-circuit-oracle-v1.png') },
  {
    source: path.join(approvedDirectory, 'puzzle-reveal-kintsugi-machine-bodhisattva-v1.png'),
  },
  { source: path.join(approvedDirectory, 'puzzle-reveal-foxfire-data-reliquary-v2.png') },
  { source: path.join(approvedDirectory, 'puzzle-reveal-sakura-singularity-v1.png') },
  { source: path.join(approvedDirectory, 'puzzle-reveal-memory-well-archivist-v1.png') },
  { source: path.join(approvedDirectory, 'puzzle-reveal-celestial-komainu-gate-v1.png') },
];

async function build() {
  await mkdir(runtimeDirectory, { recursive: true });

  for (const asset of approvedMasters) {
    const sourcePath = path.resolve(asset.source);
    const filename = path.basename(sourcePath);
    const runtimePath = path.join(
      runtimeDirectory,
      asset.runtime ?? filename.replace(/\.png$/i, '.webp'),
    );
    let pipeline = sharp(sourcePath, { failOn: 'error' });

    if (asset.crop) {
      pipeline = pipeline.extract(asset.crop);
    }

    // The oracle master is 1447×1087. This four-pixel edge trim produces an exact 4:3 frame
    // without moving its face, hands, altar, or illuminated archive panels.
    if (filename === 'puzzle-reveal-shrine-circuit-oracle-v1.png') {
      pipeline = pipeline.extract({ left: 1, top: 2, width: 1444, height: 1083 });
    }

    await pipeline
      .resize(800, 600, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
      .webp({ quality: 88, effort: 6, smartSubsample: true })
      .toFile(runtimePath);
  }
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
