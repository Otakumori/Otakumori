import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function main() {
  const [, , avatar, ...argv] = process.argv;

  if (!avatar) {
    console.error(
      'Usage: npm run gen:pack <avatar> [-- --workflow ./comfy/workflow.json --seed 123]',
    );
    console.error('\nExamples:');
    console.error('  npm run gen:pack yumi');
    console.error('  npm run gen:pack akira -- --workflow ./comfy/workflow.json --seed 42');
    process.exit(1);
  }

  const arg = (k: string, d?: any) => {
    const i = argv.indexOf(`--${k}`);
    if (i >= 0 && argv[i + 1]) return argv[i + 1];
    return d;
  };

  const hasFlag = (k: string) => argv.includes(`--${k}`);

  // Handle both positional and named arguments
  let workflow = arg('workflow', '');
  // `⌕ Debug: argv = ${JSON.stringify(argv}`);
  // `⌕ Debug: named workflow = ${workflow}`

  if (!workflow && argv.length > 0) {
    // If no named workflow, check if first positional arg is a workflow file
    const firstArg = argv[0];
    if (firstArg && !firstArg.startsWith('--') && firstArg.endsWith('.json')) {
      workflow = firstArg;
      // ` Using positional workflow: ${workflow}`
    }
  }

  const seed = arg('seed', '-1');
  const packVibeOverride = arg('vibe'); // optional pack-level override
  const dith = arg('dither'); // "fs" | "atkinson"
  const dstr = arg('dither-strength'); // e.g. "0.8"
  const athr = arg('alpha-threshold'); // e.g. "24"
  const nod = hasFlag('no-dither');

  // Validate required workflows exist
  if (!workflow) {
    console.error(' Missing required workflow for visual generation');
    console.error(
      'Usage: npm run gen:pack <avatar> -- --workflow ./comfy/ui-workflow.json [--avatars-workflow ./comfy/char-workflow.json]',
    );
    process.exit(1);
  }

  // Check if workflow file exists
  try {
    // await access(workflow);
    // ` Workflow file found: ${workflow}`
  } catch (error) {
    console.error(` Workflow file not found: ${workflow}`);
    console.error('Please check the path and ensure the file exists');
    process.exit(1);
  }

  const ditherArgs: string[] = [];
  if (!nod) {
    if (dith) ditherArgs.push('--dither', dith);
    if (dstr) ditherArgs.push('--dither-strength', dstr);
    if (athr) ditherArgs.push('--alpha-threshold', athr);
  } else {
    ditherArgs.push('--no-dither');
  }

  // ` Dithering config: ${ditherArgs.length > 0 ? ditherArgs.join(' ' : 'none'}`);

  const baseArgs = workflow ? `--workflow ${workflow}` : '';
  const seedArgs = seed !== '-1' ? `--seed ${seed}` : '';

  // ` Generating complete asset pack for avatar: ${avatar}`
  // ` Workflow: ${workflow || 'default'}`
  // ` Seed: ${seed}`
  // ''

  // Get avatar vibe from style-map
  let vibe = 'neutral';
  try {
    // const styleMapPath = path.join(process.cwd(), "app/lib/style-map.ts");
    // if (fs.existsSync(styleMapPath)) {
    //   const styleMap = await import(pathToFileURL(styleMapPath).href);
    //   const getVibeForAvatar = styleMap.getVibeForAvatar as (a: string, o?: string) => string;
    //   vibe = getVibeForAvatar ? getVibeForAvatar(avatar, packVibeOverride) : (styleMap.avatarVibes?.[avatar.toLowerCase()] ?? "neutral");
    // }
    // ' Using default vibe: neutral'
  } catch (error) {
    console.warn(" Could not determine avatar vibe, using 'neutral'");
  }

  // ` Avatar vibe detected: ${vibe}`
  if (packVibeOverride) {
    // ` Pack-level vibe override: ${packVibeOverride}`
  }

  const classes = ['ui', 'icons', 'textures', 'avatars'] as const;

  for (const className of classes) {
    // ` Generating ${className}...`

    // Check if we have a workflow for this class
    if (!workflow) {
      // `   Skipping ${className} - no workflow specified`
      continue;
    }

    try {
      const cmd =
        `npm run gen:asset ${className} -- --avatar ${avatar} ${baseArgs} ${seedArgs} ${ditherArgs.join(' ')}`.trim();
      // `  → ${cmd}`

      const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
      if (stdout) // stdout
      if (stderr) // stderr

      // ` ${className} generated successfully\n`
    } catch (error: any) {
      console.error(` Failed to generate ${className}:`, error.message);
      if (error.stdout) // error.stdout
      if (error.stderr) // error.stderr
      // ''
    }
  }

  // Auto-run SFX generation at the end
  // ` Generating SFX for ${avatar} (${vibe} vibe...`);
  try {
    const cmd = `npm run gen:sfx -- --avatar ${avatar} --vibe ${vibe} --count 6`.trim();
    // `  → ${cmd}`

    const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
    if (stdout) // stdout
    if (stderr) // stderr

    // ` SFX generated successfully\n`
  } catch (error: any) {
    console.error(` Failed to generate SFX:`, error.message);
    if (error.stdout) // error.stdout
    if (error.stderr) // error.stderr
    // ''
  }

  // ' Asset pack generation complete!'
  // " Next: run 'npm run assets:sync' to update the manifest."
}

main().catch((e) => {
  console.error(' Pack generation failed:', e);
  process.exit(1);
});
