#!/usr/bin/env tsx
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface AssetRole {
  id: string;
  name: string;
  description: string;
  license: string;
  url: string;
  author: string;
  category: 'ui' | 'games' | 'audio' | 'cosmetics';
}

const ASSET_CREDITS: AssetRole[] = [
  // UI Assets
  {
    id: 'ui-hub-icons',
    name: 'Hub Navigation Icons',
    description: 'Minimalist navigation icons for the GameCube hub',
    license: 'MIT',
    url: 'https://github.com/feathericons/feather',
    author: 'Feather Icons',
    category: 'ui',
  },
  {
    id: 'ui-placeholders',
    name: 'Placeholder Assets',
    description: 'Fallback images and placeholders for missing content',
    license: 'MIT',
    url: 'https://github.com/otakumori/placeholders',
    author: 'Otakumori Team',
    category: 'ui',
  },

  // Game Assets
  {
    id: 'game-samurai',
    name: 'Samurai Game Assets',
    description: 'Samurai-themed sprites and backgrounds',
    license: 'CC0',
    url: 'https://kenney.nl/assets/fantasy-ui-borders',
    author: 'Kenney',
    category: 'games',
  },
  {
    id: 'game-memory',
    name: 'Memory Match Cards',
    description: 'Anime character cards for memory matching game',
    license: 'CC BY-NC 4.0',
    url: 'https://unsplash.com/collections/anime',
    author: 'Various Artists',
    category: 'games',
  },
  {
    id: 'game-bubble',
    name: 'Bubble Pop Particles',
    description: 'Bubble particle effects and sprites',
    license: 'CC0',
    url: 'https://kenney.nl/assets/particle-pack',
    author: 'Kenney',
    category: 'games',
  },
  {
    id: 'game-rhythm',
    name: 'Rhythm Game Assets',
    description: 'Beat-em-up sprites and rhythm lane graphics',
    license: 'CC BY 4.0',
    url: 'https://ansimuz.itch.io/gothicvania-patreon-collection',
    author: 'Ansimuz',
    category: 'games',
  },

  // Audio Assets
  {
    id: 'audio-sfx',
    name: 'Sound Effects',
    description: 'Game sound effects and UI audio',
    license: 'CC0',
    url: 'https://freesound.org/',
    author: 'Various Artists',
    category: 'audio',
  },
  {
    id: 'audio-music',
    name: 'Background Music',
    description: 'Game background music and ambient tracks',
    license: 'CC BY 4.0',
    url: 'https://incompetech.com/',
    author: 'Kevin MacLeod',
    category: 'audio',
  },

  // Cosmetic Assets
  {
    id: 'cosmetic-frames',
    name: 'Profile Frames',
    description: 'Avatar frames and profile decorations',
    license: 'MIT',
    url: 'https://github.com/otakumori/cosmetics',
    author: 'Otakumori Team',
    category: 'cosmetics',
  },
  {
    id: 'cosmetic-overlays',
    name: 'Profile Overlays',
    description: 'Special effects and overlays for profiles',
    license: 'MIT',
    url: 'https://github.com/otakumori/cosmetics',
    author: 'Otakumori Team',
    category: 'cosmetics',
  },
];

function generateCreditsJson(): void {
  const creditsPath = join(process.cwd(), 'public', 'assets', 'credits.json');

  const credits = {
    generated: new Date().toISOString(),
    version: '1.0.0',
    assets: ASSET_CREDITS,
    licenses: {
      MIT: 'https://opensource.org/licenses/MIT',
      CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
      'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
      'CC BY-NC 4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
    },
    acknowledgments: [
      'Special thanks to all asset creators and contributors',
      'This project uses assets under various open source licenses',
      'Please respect individual asset licenses and attribution requirements',
    ],
  };

  // Ensure directory exists
  const dir = join(process.cwd(), 'public', 'assets');
  if (!existsSync(dir)) {
    // 'Creating assets directory...'
    require('fs').mkdirSync(dir, { recursive: true });
  }

  writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
  // ` Generated credits.json at ${creditsPath}`
}

function validateAssetRoles(): void {
  const rolesPath = join(process.cwd(), 'assets-roles.json');

  if (!existsSync(rolesPath)) {
    console.error(' assets-roles.json not found');
    process.exit(1);
  }

  try {
    const roles = JSON.parse(readFileSync(rolesPath, 'utf8'));
    // ' assets-roles.json is valid JSON'

    // Check for required sections
    const requiredSections = ['ui', 'games', 'sections', 'cosmetics', 'fallbacks'];
    for (const section of requiredSections) {
      if (!roles[section]) {
        console.warn(`  Missing section: ${section}`);
      }
    }

    // Check for fallback assets
    if (roles.fallbacks) {
      const fallbackTypes = ['image', 'audio', 'video'];
      for (const type of fallbackTypes) {
        if (!roles.fallbacks[type]) {
          console.warn(`  Missing fallback for: ${type}`);
        }
      }
    }

    // ' Asset roles validation complete'
  } catch (error) {
    console.error(' Failed to validate assets-roles.json:', error);
    process.exit(1);
  }
}

function main(): void {
  // ' Otakumori Assets Compilation'
  // '================================\n'

  try {
    validateAssetRoles();
    generateCreditsJson();

    // '\n Assets compilation completed successfully!'
    // '\nNext steps:'
    // '1. Place actual asset files in /public/assets/'
    // '2. Update assets-roles.json with real paths'
    // '3. Verify all fallback assets exist'
    // '4. Test asset loading in development'
  } catch (error) {
    console.error('\n Assets compilation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
