const fs = require('fs');
const path = require('path');

// Create a simple petal texture as a base64 PNG
const createPetalTexture = () => {
  // 1x1 pink pixel PNG in base64
  const base64PNG =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  const buffer = Buffer.from(base64PNG, 'base64');
  const outputPath = path.join(__dirname, '..', 'public', 'textures', 'petal.png');

  fs.writeFileSync(outputPath, buffer);
  console.log('✅ Created placeholder petal texture');
};

createPetalTexture();
