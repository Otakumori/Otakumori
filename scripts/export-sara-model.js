#!/usr/bin/env node
/**
 * Node.js wrapper for Blender export
 * Calls Blender command line to convert .blend to .glb
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const blendFile = path.join(projectRoot, 'Goth Girl Sara Release Model v1.2.blend');
const outputFile = path.join(projectRoot, 'public', 'models', 'goth-girl-sara.glb');
const pythonScript = path.join(projectRoot, 'scripts', 'blender-export.py');

console.log('🎨 Blender Model Export Script\n');

// Check if blend file exists
if (!fs.existsSync(blendFile)) {
  console.error('❌ Error: Blend file not found at:', blendFile);
  process.exit(1);
}

console.log('✅ Found blend file');

// Common Blender paths on Windows
const blenderPaths = [
  'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe',
  'C:\\Program Files\\Blender Foundation\\Blender\\blender.exe',
  'blender', // Try PATH
];

// Find Blender
let blenderExe = null;
for (const p of blenderPaths) {
  if (p === 'blender' || fs.existsSync(p)) {
    blenderExe = p;
    break;
  }
}

if (!blenderExe) {
  console.error('❌ Error: Blender not found!');
  console.error('\nPlease install Blender from: https://www.blender.org/download/');
  console.error('\nOr set BLENDER_PATH environment variable:');
  console.error('  set BLENDER_PATH=C:\\Path\\To\\blender.exe');
  process.exit(1);
}

console.log(`✅ Found Blender: ${blenderExe}\n`);

// Create output directory
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Created output directory\n`);
}

// Run Blender export
console.log('🚀 Starting Blender export (1-2 minutes)...\n');

const blender = spawn(blenderExe, [
  '--background',
  blendFile,
  '--python', pythonScript,
  '--', 
  outputFile
], {
  stdio: 'inherit'
});

blender.on('close', (code) => {
  console.log('');
  if (code === 0 && fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('🎉 SUCCESS! Model exported!');
    console.log(`   File: ${outputFile}`);
    console.log(`   Size: ${sizeMB} MB\n`);
    console.log('✨ Next step: Test it!');
    console.log('   Navigate to: http://localhost:3000/test/sara-creator\n');
  } else {
    console.error('❌ Export failed');
    process.exit(1);
  }
});

