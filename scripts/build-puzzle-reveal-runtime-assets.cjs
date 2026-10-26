const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const sourceDirectory = path.resolve(
  'docs/design/references/approved/batch-3/games/puzzle-reveal/reveal-art',
);
const runtimeDirectory = path.resolve('public/assets/games/puzzle-reveal/reveal-art');

const approvedMasters = [
  'puzzle-reveal-shrine-circuit-oracle-v1.png',
  'puzzle-reveal-kintsugi-machine-bodhisattva-v1.png',
  'puzzle-reveal-sakura-singularity-v1.png',
  'puzzle-reveal-memory-well-archivist-v1.png',
  'puzzle-reveal-celestial-komainu-gate-v1.png',
];

async function build() {
  await mkdir(runtimeDirectory, { recursive: true });

  for (const filename of approvedMasters) {
    const sourcePath = path.join(sourceDirectory, filename);
    const runtimePath = path.join(runtimeDirectory, filename.replace(/\.png$/i, '.webp'));
    let pipeline = sharp(sourcePath, { failOn: 'error' });

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
