const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultPresets = [
  // Hair presets
  {
    name: 'Classic Spiky',
    description: 'Retro anime spiky hair',
    category: 'hair',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'hair_spiky.png',
    },
    colorPalette: ['#8B4513', '#654321', '#A0522D', '#D2691E'],
    rarity: 'common',
    isDefault: true,
  },
  {
    name: 'Long Flowing',
    description: 'Elegant long hair',
    category: 'hair',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1.5, 0, 0, 1.5, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'hair_long.png',
    },
    colorPalette: ['#000000', '#8B4513', '#654321', '#A0522D'],
    rarity: 'rare',
    unlockCondition: { requiresLevel: 5 },
  },
  {
    name: 'Pink Highlights',
    description: 'Trendy pink highlights',
    category: 'hair',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'hair_pink.png',
    },
    colorPalette: ['#FF69B4', '#FF1493', '#DC143C', '#B22222'],
    rarity: 'epic',
    unlockCondition: { requiresPetals: 100 },
  },

  // Face presets
  {
    name: 'Friendly Smile',
    description: 'Warm and welcoming expression',
    category: 'face',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'face_friendly.png',
    },
    colorPalette: ['#FFB6C1', '#FFC0CB', '#FFA0B4', '#FF8FA3'],
    rarity: 'common',
    isDefault: true,
  },
  {
    name: 'Mysterious Eyes',
    description: 'Enigmatic and alluring',
    category: 'face',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'face_mysterious.png',
    },
    colorPalette: ['#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB'],
    rarity: 'rare',
    unlockCondition: { requiresAchievement: 'mystery_master' },
  },

  // Body presets
  {
    name: 'Athletic Build',
    description: 'Strong and fit physique',
    category: 'body',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 2, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'body_athletic.png',
    },
    colorPalette: ['#F4A460', '#DEB887', '#D2B48C', '#BC9A6A'],
    rarity: 'common',
    isDefault: true,
  },
  {
    name: 'Elegant Stance',
    description: 'Graceful and refined posture',
    category: 'body',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 2, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'body_elegant.png',
    },
    colorPalette: ['#FFB6C1', '#FFC0CB', '#FFA0B4', '#FF8FA3'],
    rarity: 'rare',
    unlockCondition: { requiresLevel: 10 },
  },

  // Clothing presets
  {
    name: 'Casual Hoodie',
    description: 'Comfortable everyday wear',
    category: 'clothing',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1.5, 0, 0, 1.5, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'clothing_hoodie.png',
    },
    colorPalette: ['#4169E1', '#1E90FF', '#00BFFF', '#87CEEB'],
    rarity: 'common',
    isDefault: true,
  },
  {
    name: 'Gaming Jacket',
    description: 'Cool gaming aesthetic',
    category: 'clothing',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 1.5, 0, 0, 1.5, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'clothing_gaming.png',
    },
    colorPalette: ['#000000', '#333333', '#666666', '#999999'],
    rarity: 'epic',
    unlockCondition: { requiresPetals: 200 },
  },
  {
    name: 'Magical Robes',
    description: 'Mystical and enchanting',
    category: 'clothing',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 2, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'clothing_robes.png',
    },
    colorPalette: ['#8A2BE2', '#9932CC', '#9400D3', '#8B008B'],
    rarity: 'legendary',
    unlockCondition: { requiresAchievement: 'magic_master', requiresLevel: 20 },
  },

  // Accessories presets
  {
    name: 'Retro Glasses',
    description: 'Classic 90s style frames',
    category: 'accessories',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 0.3, 0, 0, 0.3, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'accessories_glasses.png',
    },
    colorPalette: ['#000000', '#333333', '#666666', '#999999'],
    rarity: 'common',
    isDefault: true,
  },
  {
    name: 'Gaming Headset',
    description: 'Professional gaming gear',
    category: 'accessories',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 0.5, 0, 0, 0.5, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'accessories_headset.png',
    },
    colorPalette: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    rarity: 'rare',
    unlockCondition: { requiresLevel: 15 },
  },
  {
    name: 'Magical Crown',
    description: 'Royal and majestic',
    category: 'accessories',
    meshData: {
      vertices: [0, 0, 0, 1, 0, 0, 1, 0.4, 0, 0, 0.4, 0],
      faces: [0, 1, 2, 0, 2, 3],
      normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    },
    textureData: {
      uv: [0, 0, 1, 0, 1, 1, 0, 1],
      texture: 'accessories_crown.png',
    },
    colorPalette: ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50'],
    rarity: 'legendary',
    unlockCondition: { requiresAchievement: 'royal_guardian', requiresPetals: 500 },
  },
];

async function seedCharacterPresets() {
  try {
    console.log('Seeding character presets...');

    for (const preset of defaultPresets) {
      await prisma.characterPreset.upsert({
        where: { name: preset.name },
        update: preset,
        create: preset,
      });
      console.log(` Seeded preset: ${preset.name}`);
    }

    console.log('Character presets seeded successfully!');
  } catch (error) {
    console.error('Error seeding character presets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCharacterPresets();
