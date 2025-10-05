#!/usr/bin/env node

/**
 * Build-time validation script for games.meta.json
 * Ensures no duplicates and validates structure
 */

const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '../lib/games.meta.json');

function validateGamesRegistry() {
  console.log('🎮 Validating games registry...');

  if (!fs.existsSync(registryPath)) {
    console.error('❌ games.meta.json not found!');
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  // Check for duplicates
  const ids = registry.games.map((g) => g.id);
  const slugs = registry.games.map((g) => g.slug);
  const titles = registry.games.map((g) => g.title);

  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);

  if (duplicateIds.length > 0) {
    console.error('❌ Duplicate game IDs found:', duplicateIds);
    process.exit(1);
  }

  if (duplicateSlugs.length > 0) {
    console.error('❌ Duplicate game slugs found:', duplicateSlugs);
    process.exit(1);
  }

  if (duplicateTitles.length > 0) {
    console.error('❌ Duplicate game titles found:', duplicateTitles);
    process.exit(1);
  }

  // Validate required fields
  const requiredFields = [
    'id',
    'slug',
    'title',
    'description',
    'category',
    'difficulty',
    'ageRating',
    'features',
    'enabled',
  ];

  for (const game of registry.games) {
    for (const field of requiredFields) {
      if (!(field in game)) {
        console.error(`❌ Game "${game.id}" missing required field: ${field}`);
        process.exit(1);
      }
    }

    // Validate age rating
    if (!registry.ageRatings[game.ageRating]) {
      console.error(`❌ Game "${game.id}" has invalid age rating: ${game.ageRating}`);
      process.exit(1);
    }

    // Validate category
    if (!registry.categories[game.category]) {
      console.error(`❌ Game "${game.id}" has invalid category: ${game.category}`);
      process.exit(1);
    }

    // Validate features array
    const validFeatures = ['scoreboard', 'saves', 'unlocks', 'petals', 'avatars', 'achievements'];
    for (const feature of game.features) {
      if (!validFeatures.includes(feature)) {
        console.error(`❌ Game "${game.id}" has invalid feature: ${feature}`);
        process.exit(1);
      }
    }
  }

  // Check NSFW games have proper age rating
  const nsfwGames = registry.games.filter((g) => g.nsfw);
  for (const game of nsfwGames) {
    if (game.ageRating !== 'M') {
      console.error(`❌ NSFW game "${game.id}" must have age rating "M"`);
      process.exit(1);
    }
  }

  console.log(`✅ Registry validation passed! ${registry.games.length} games validated.`);
  console.log(`   - Action: ${registry.games.filter((g) => g.category === 'action').length}`);
  console.log(`   - Puzzle: ${registry.games.filter((g) => g.category === 'puzzle').length}`);
  console.log(`   - Physics: ${registry.games.filter((g) => g.category === 'physics').length}`);
  console.log(`   - Rhythm: ${registry.games.filter((g) => g.category === 'rhythm').length}`);
  console.log(
    `   - Microgames: ${registry.games.filter((g) => g.category === 'microgames').length}`,
  );
  console.log(`   - Adventure: ${registry.games.filter((g) => g.category === 'adventure').length}`);
  console.log(`   - NSFW: ${nsfwGames.length}`);
}

if (require.main === module) {
  validateGamesRegistry();
}

module.exports = { validateGamesRegistry };
