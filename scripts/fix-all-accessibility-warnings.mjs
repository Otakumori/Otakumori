#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Comprehensive accessibility warning fixer
 * Fixes:
 * 1. Accessible emoji warnings
 * 2. Form label warnings
 * 3. Interactive element warnings
 * 4. Click handler keyboard warnings
 */

console.log('🔧 Fixing all accessibility warnings...\n');

// Get all TSX files
const files = await glob('**/*.{tsx,jsx}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
});

let totalFixed = 0;
let filesModified = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    const originalContent = content;
    let changes = 0;

    // 1. Fix accessible emoji - wrap standalone emojis in spans
    // Match emojis that are NOT already in a span with role="img"
    // NOTE: Simplified regex due to parser limitations with negative lookbehind
    const emojiRegex = /([\p{Emoji}\u200d]+)/gu;

    // Simple emoji map for common ones
    const emojiLabels = {
      '🎮': 'game controller',
      '🎯': 'target',
      '🎨': 'art palette',
      '🎪': 'circus tent',
      '🎭': 'performing arts',
      '🎬': 'movie camera',
      '🎤': 'microphone',
      '🎧': 'headphones',
      '🎸': 'guitar',
      '🎹': 'musical keyboard',
      '🎺': 'trumpet',
      '🎻': 'violin',
      '🎲': 'game die',
      '🎰': 'slot machine',
      '🎳': 'bowling',
      '⏳': 'hourglass',
      '👤': 'user',
      '👥': 'users',
      '⭐': 'star',
      '✨': 'sparkles',
      '🔥': 'fire',
      '💯': 'hundred points',
      '🎉': 'party popper',
      '🎊': 'confetti ball',
      '🎁': 'gift',
      '🎈': 'balloon',
      '🎀': 'ribbon',
      '🎂': 'birthday cake',
      '🎄': 'christmas tree',
      '🎃': 'jack-o-lantern',
      '🎆': 'fireworks',
      '🎇': 'sparkler',
      '🌸': 'cherry blossom',
      '🌺': 'hibiscus',
      '🌻': 'sunflower',
      '🌼': 'blossom',
      '🌷': 'tulip',
      '🌹': 'rose',
      '💐': 'bouquet',
      '🌾': 'sheaf of rice',
      '🍀': 'four leaf clover',
      '🍁': 'maple leaf',
      '🍂': 'fallen leaf',
      '🍃': 'leaf fluttering in wind',
      '✅': 'check mark',
      '❌': 'cross mark',
      '⚠️': 'warning',
      '💪': 'flexed biceps',
      '👍': 'thumbs up',
      '👎': 'thumbs down',
      '👏': 'clapping hands',
      '🙏': 'folded hands',
      '💖': 'sparkling heart',
      '💕': 'two hearts',
      '💓': 'beating heart',
      '💗': 'growing heart',
      '💘': 'heart with arrow',
      '💝': 'heart with ribbon',
      '💞': 'revolving hearts',
      '💟': 'heart decoration',
      '🔒': 'locked',
      '🔓': 'unlocked',
      '🔑': 'key',
      '🔔': 'bell',
      '🔕': 'bell with slash',
      '🔊': 'speaker high volume',
      '🔇': 'muted speaker',
      '🚀': 'rocket',
      '🎯': 'direct hit',
      '🏆': 'trophy',
      '🥇': 'first place medal',
      '🥈': 'second place medal',
      '🥉': 'third place medal',
      '🏅': 'sports medal',
    };

    // Fix emojis - this is complex, so let's use a simpler approach
    // We'll wrap any emoji that's not already in a span
    const lines = content.split('\n');
    const fixedLines = lines.map(line => {
      // Skip lines that already have role="img"
      if (line.includes('role="img"')) return line;
      
      // Find emojis in the line
      let fixedLine = line;
      const emojiMatches = [...line.matchAll(/([🎮🎯🎨🎪🎭🎬🎤🎧🎸🎹🎺🎻🎲🎰🎳⏳👤👥⭐✨🔥💯🎉🎊🎁🎈🎀🎂🎄🎃🎆🎇🌸🌺🌻🌼🌷🌹💐🌾🍀🍁🍂🍃✅❌⚠️💪👍👎👏🙏💖💕💓💗💘💝💞💟🔒🔓🔑🔔🔕🔊🔇🚀🏆🥇🥈🥉🏅])/g)];
      
      for (const match of emojiMatches.reverse()) { // Reverse to maintain indices
        const emoji = match[0];
        const index = match.index;
        const label = emojiLabels[emoji] || 'emoji';
        
        // Check if this emoji is already wrapped
        const before = fixedLine.substring(Math.max(0, index - 50), index);
        const after = fixedLine.substring(index + emoji.length, Math.min(fixedLine.length, index + emoji.length + 50));
        
        if (!before.includes('<span') || after.includes('</span>')) {
          // Not wrapped, wrap it
          const wrapped = `<span role="img" aria-label="${label}">${emoji}</span>`;
          fixedLine = fixedLine.substring(0, index) + wrapped + fixedLine.substring(index + emoji.length);
          changes++;
        }
      }
      
      return fixedLine;
    });
    
    content = fixedLines.join('\n');

    // 2. Fix form labels - add htmlFor and id
    // This is complex and context-dependent, so we'll skip for now
    // Manual review recommended

    // 3. Fix interactive elements - add keyboard handlers
    // Match: onClick without onKeyDown/onKeyPress
    content = content.replace(
      /(<div[^>]*onClick={[^}]+}[^>]*)(>)/g,
      (match, before, after) => {
        if (before.includes('onKeyDown') || before.includes('onKeyPress') || before.includes('role="button"')) {
          return match;
        }
        changes++;
        return `${before} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}${after}`;
      }
    );

    // 4. Fix non-interactive elements with click handlers
    // Add role="button" and keyboard support
    content = content.replace(
      /(<(span|p|h[1-6])[^>]*onClick={[^}]+}[^>]*)(>)/g,
      (match, before, tag, after) => {
        if (before.includes('role=') || before.includes('onKeyDown') || before.includes('onKeyPress')) {
          return match;
        }
        changes++;
        return `${before} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}${after}`;
      }
    );

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file} (${changes} changes)`);
      filesModified++;
      totalFixed += changes;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Files modified: ${filesModified}`);
console.log(`🔄 Total fixes: ${totalFixed}`);
console.log(`\n🔍 Run "npm run lint" to verify fixes`);
console.log(`⚠️  Note: Form labels require manual review`);

