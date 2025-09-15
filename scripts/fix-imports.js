const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'app/checkout/page.tsx',
  'app/community/soapstones/page.tsx',
  'app/games/page.tsx',
  'app/games/404/page.tsx',
  'app/leaderboards/page.tsx',
  'app/profile/page.tsx',
  'app/profile/achievements/page.tsx',
  'app/profile/orders/page.tsx',
  'app/profile/petals/page.tsx',
  'app/search/page.tsx',
  'app/shop/page.tsx',
  'app/shop/[slug]/page.tsx',
];

// Import mappings
const importMappings = {
  '@/components/StarfieldPurple': '../components/StarfieldPurple',
  '@/components/NavBar': '../components/NavBar',
  '@/components/FooterDark': '../components/FooterDark',
  '@/components/GlassPanel': '../components/GlassPanel',
  '@/components/blog/BlogIndex': '../components/blog/BlogIndex',
  '@/components/shop/CartContent': '../components/shop/CartContent',
  '@/components/shop/CheckoutContent': '../components/shop/CheckoutContent',
  '@/components/shop/ProductDetail': '../components/shop/ProductDetail',
  '@/components/shop/ShopCatalog': '../components/shop/ShopCatalog',
  '@/components/games/GamesGrid': '../components/games/GamesGrid',
  '@/components/games/Game404': '../components/games/Game404',
  '@/components/community/SoapstoneCommunity': '../components/community/SoapstoneCommunity',
  '@/components/community/LeaderboardInterface': '../components/community/LeaderboardInterface',
  '@/components/profile/ProfileHub': '../components/profile/ProfileHub',
  '@/components/profile/AchievementsGrid': '../components/profile/AchievementsGrid',
  '@/components/profile/OrdersList': '../components/profile/OrdersList',
  '@/components/profile/PetalsDashboard': '../components/profile/PetalsDashboard',
  '@/components/search/SearchInterface': '../components/search/SearchInterface',
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
      `import\\s+\\w+\\s+from\\s+['"]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`,
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

// Fix all files
filesToFix.forEach(fixImports);

console.log('Import fixing complete!');
