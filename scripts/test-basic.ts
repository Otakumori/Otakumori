#!/usr/bin/env tsx

console.log(' Basic test script starting...');
console.log('Current working directory:', process.cwd());
console.log('Node version:', process.version);

// Test basic imports
try {
  const fs = require('node:fs');
  const path = require('node:path');
  console.log(' Node.js modules working');

  // Test if style-map.ts exists
  const styleMapPath = path.join(process.cwd(), 'app/lib/style-map.ts');
  if (fs.existsSync(styleMapPath)) {
    console.log(' style-map.ts found at:', styleMapPath);
  } else {
    console.log(' style-map.ts not found');
  }

  // Test if ComfyUI workflows exist
  const uiWorkflow = path.join(process.cwd(), 'comfy/ui-workflow.json');
  const charWorkflow = path.join(process.cwd(), 'comfy/char-workflow.json');

  if (fs.existsSync(uiWorkflow)) {
    console.log(' ui-workflow.json found');
  } else {
    console.log(' ui-workflow.json not found');
  }

  if (fs.existsSync(charWorkflow)) {
    console.log(' char-workflow.json found');
  } else {
    console.log(' char-workflow.json not found');
  }
} catch (error) {
  console.error(' Error testing basic setup:', error);
}

console.log(' Basic test completed!');
