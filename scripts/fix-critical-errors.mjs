#!/usr/bin/env node

import fs from 'node:fs';

const fixes = [
  // Fix RetroSoundVisualizer
  {
    file: 'app/components/audio/RetroSoundVisualizer.tsx',
    replacements: [
      ['Object.keys(playingSounds)', 'Object.keys(_playingSounds)']
    ]
  },
  
  // Fix PetalPhysicsDemo
  {
    file: 'app/components/demos/PetalPhysicsDemo.tsx',
    replacements: [
      ['wind.direction', 'wind._direction']
    ]
  },
  
  // Fix AdvancedPetalSystem
  {
    file: 'app/components/effects/AdvancedPetalSystem.tsx',
    replacements: [
      ['const _distance = Math.sqrt(', 'const distance = Math.sqrt('],
      ['const _angle = Math.atan2(petal.y, petal.x);', 'const angle = Math.atan2(petal.y, petal.x);']
    ]
  },
  
  // Fix DungeonGame
  {
    file: 'app/mini-games/dungeon-of-desire/DungeonGame.tsx',
    replacements: [
      ['const { _saveOnExit, autoSave }', 'const { saveOnExit, autoSave }'],
      ['enemy.direction', 'enemy._direction']
    ]
  },
  
  // Fix BeatEmUpGame
  {
    file: 'app/mini-games/otaku-beat-em-up/BeatEmUpGame.tsx',
    replacements: [
      ['const _distance = Math.hypot(dx, dy);', 'const distance = Math.hypot(dx, dy);'],
      ['_enemySpawnTimer = 0;', 'enemySpawnTimer = 0;']
    ]
  },
  
  // Fix audioStore
  {
    file: 'app/stores/audioStore.ts',
    replacements: [
      ['const playing = playingSounds[playingId];', 'const playing = _playingSounds[playingId];'],
      ['const { masterGainNode, playingSounds }', 'const { masterGainNode, _playingSounds }'],
      ['Object.values(_playingSounds)', 'Object.values(_playingSounds)'],
      ['get().playingSounds[id]', 'get()._playingSounds[id]'],
      ['const playing = playingSounds[playingId];', 'const playing = _playingSounds[playingId];']
    ]
  },
  
  // Fix session-tracker
  {
    file: 'lib/analytics/session-tracker.ts',
    replacements: [
      ['return sessionId;', 'return _sessionId;'],
      ['const _session = await this.getSession(_sessionId);\n    if (!session || session.synced)', 'const session = await this.getSession(_sessionId);\n    if (!session || session.synced)'],
      ['`session-${sessionId}`', '`session-${_sessionId}`'],
      ['session.synced = true;', 'session.synced = true;'],
      ['await this.db.put(\'sessions\', _session);', 'await this.db.put(\'sessions\', session);']
    ]
  }
];

async function applyFixes() {
  console.log('🔧 Applying critical TypeScript fixes...\n');
  
  let fixedCount = 0;
  
  for (const { file, replacements } of fixes) {
    try {
      if (!fs.existsSync(file)) {
        console.log(`⏭️  File not found: ${file}`);
        continue;
      }
      
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;
      
      for (const [search, replace] of replacements) {
        if (content.includes(search)) {
          content = content.replace(search, replace);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      } else {
        console.log(`⏭️  No changes needed: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✨ Applied fixes to ${fixedCount} files`);
}

applyFixes().catch(console.error);
