const fs = require('fs');
const path = require('path');

// Component files to fix
const componentFiles = [
  'app/components/blog/BlogIndex.tsx',
  'app/components/community/LeaderboardInterface.tsx',
  'app/components/community/SoapstoneCommunity.tsx',
  'app/components/games/Game404.tsx',
  'app/components/games/GamesGrid.tsx',
  'app/components/profile/AchievementsGrid.tsx',
  'app/components/profile/OrdersList.tsx',
  'app/components/profile/PetalsDashboard.tsx',
  'app/components/profile/ProfileHub.tsx',
  'app/components/search/SearchInterface.tsx',
  'app/components/shop/CartContent.tsx',
  'app/components/shop/CheckoutContent.tsx',
  'app/components/shop/ProductCard.tsx',
  'app/components/shop/ProductDetail.tsx',
  'app/components/shop/ShopCatalog.tsx',
];

// Import mappings for components
const importMappings = {
  '@/components/GlassPanel': './GlassPanel',
  '@/lib/microcopy': '../../lib/microcopy',
  '@/lib/contracts': '../../lib/contracts',
  '@/lib/http': '../../lib/http',
  '@/hooks/api': '../../hooks/api',
  '@/providers/cart': '../../providers/cart',
  '@/providers/petals': '../../providers/petals',
  '@/contexts/NSFWContext': '../../contexts/NSFWContext',
  '@/lib/assets/manifest': '../../lib/assets/manifest',
  '@/lib/shop/printify-adapter': '../../lib/shop/printify-adapter',
  '@/lib/printify/types': '../../lib/printify/types',
  '@/lib/printify': '../../lib/printify',
  '@/lib/upload': '../../lib/upload',
  '@/lib/logger': '../../lib/logger',
  '@/lib/db': '../../lib/db',
  '@/lib/env': '../../lib/env',
  '@/lib/contracts': '../../lib/contracts',
  '@/lib/http': '../../lib/http',
  '@/hooks/api': '../../hooks/api',
  '@/providers/cart': '../../providers/cart',
  '@/providers/petals': '../../providers/petals',
  '@/contexts/NSFWContext': '../../contexts/NSFWContext',
  '@/lib/assets/manifest': '../../lib/assets/manifest',
  '@/lib/shop/printify-adapter': '../../lib/shop/printify-adapter',
  '@/lib/printify/types': '../../lib/printify/types',
  '@/lib/printify': '../../lib/printify',
  '@/lib/upload': '../../lib/upload',
  '@/lib/logger': '../../lib/logger',
  '@/lib/db': '../../lib/db',
  '@/lib/env': '../../lib/env',
};

function fixImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldImport, newImport] of Object.entries(importMappings)) {
    const regex = new RegExp(
      `import\\s+[^'"]*\\s+from\\s+['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`,
      'g',
    );
    if (content.includes(oldImport)) {
      content = content.replace(regex, (match) => {
        return match.replace(oldImport, newImport);
      });
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  } else {
    console.log(`No changes needed for: ${filePath}`);
  }
}

// Fix all component files
componentFiles.forEach(fixImports);

console.log('Component import fixing complete!');
