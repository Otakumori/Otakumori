#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Convert color emojis to ASCII equivalents
 * This removes accessibility warnings AND makes the UI cleaner
 */

console.log('🔧 Converting emojis to ASCII...\n');

// Emoji to ASCII mapping
const emojiToAscii = {
  // Game/Entertainment
  '🎮': '[GAME]',
  '🎯': '[TARGET]',
  '🎨': '[ART]',
  '🎪': '[CIRCUS]',
  '🎭': '[THEATER]',
  '🎬': '[MOVIE]',
  '🎤': '[MIC]',
  '🎧': '[AUDIO]',
  '🎸': '[GUITAR]',
  '🎹': '[PIANO]',
  '🎺': '[TRUMPET]',
  '🎻': '[VIOLIN]',
  '🎲': '[DICE]',
  '🎰': '[SLOTS]',
  '🎳': '[BOWLING]',

  // UI/Status
  '⏳': '...',
  '👤': '[USER]',
  '👥': '[USERS]',
  '⭐': '*',
  '✨': '*',
  '🔥': '[HOT]',
  '💯': '100',
  '✅': '[✓]',
  '❌': '[✗]',
  '⚠️': '[!]',
  '⚠': '[!]',

  // Celebration
  '🎉': '[PARTY]',
  '🎊': '[CONFETTI]',
  '🎁': '[GIFT]',
  '🎈': '[BALLOON]',
  '🎀': '[RIBBON]',
  '🎂': '[CAKE]',
  '🎄': '[TREE]',
  '🎃': '[PUMPKIN]',
  '🎆': '[FIREWORKS]',
  '🎇': '[SPARKLER]',

  // Nature
  '🌸': '[BLOSSOM]',
  '🌺': '[FLOWER]',
  '🌻': '[SUNFLOWER]',
  '🌼': '[DAISY]',
  '🌷': '[TULIP]',
  '🌹': '[ROSE]',
  '💐': '[BOUQUET]',
  '🌾': '[GRAIN]',
  '🍀': '[CLOVER]',
  '🍁': '[LEAF]',
  '🍂': '[LEAVES]',
  '🍃': '[LEAF]',

  // Gestures
  '💪': '[STRONG]',
  '👍': '[+1]',
  '👎': '[-1]',
  '👏': '[CLAP]',
  '🙏': '[PRAY]',

  // Hearts
  '💖': '<3',
  '💕': '<3',
  '💓': '<3',
  '💗': '<3',
  '💘': '<3',
  '💝': '<3',
  '💞': '<3',
  '💟': '<3',
  '❤️': '<3',
  '❤': '<3',
  '💙': '<3',
  '💚': '<3',
  '💛': '<3',
  '💜': '<3',

  // Security
  '🔒': '[LOCKED]',
  '🔓': '[UNLOCKED]',
  '🔑': '[KEY]',

  // Sound
  '🔔': '[BELL]',
  '🔕': '[MUTED]',
  '🔊': '[SOUND]',
  '🔇': '[MUTE]',

  // Misc
  '🚀': '[ROCKET]',
  '🏆': '[TROPHY]',
  '🥇': '[1ST]',
  '🥈': '[2ND]',
  '🥉': '[3RD]',
  '🏅': '[MEDAL]',
  '📱': '[PHONE]',
  '💻': '[LAPTOP]',
  '🖥️': '[DESKTOP]',
  '🖥': '[DESKTOP]',
  '⚙️': '[SETTINGS]',
  '⚙': '[SETTINGS]',
  '🔧': '[TOOL]',
  '🔨': '[HAMMER]',
  '🎯': '[TARGET]',
  '📊': '[CHART]',
  '📈': '[UP]',
  '📉': '[DOWN]',
  '💰': '[$]',
  '💵': '[$]',
  '💴': '[¥]',
  '💶': '[€]',
  '💷': '[£]',
  '🔍': '[SEARCH]',
  '🔎': '[SEARCH]',
  '📝': '[NOTE]',
  '📋': '[CLIPBOARD]',
  '📌': '[PIN]',
  '📍': '[LOCATION]',
  '🗑️': '[TRASH]',
  '🗑': '[TRASH]',
  '✏️': '[EDIT]',
  '✏': '[EDIT]',
  '📂': '[FOLDER]',
  '📁': '[FOLDER]',
  '📄': '[FILE]',
  '📃': '[PAGE]',
  '🔗': '[LINK]',
  '⛓️': '[CHAIN]',
  '⛓': '[CHAIN]',
  '🔀': '[SHUFFLE]',
  '🔁': '[REPEAT]',
  '🔂': '[REPEAT-1]',
  '▶️': '[PLAY]',
  '▶': '[PLAY]',
  '⏸️': '[PAUSE]',
  '⏸': '[PAUSE]',
  '⏹️': '[STOP]',
  '⏹': '[STOP]',
  '⏺️': '[RECORD]',
  '⏺': '[RECORD]',
  '⏭️': '[NEXT]',
  '⏭': '[NEXT]',
  '⏮️': '[PREV]',
  '⏮': '[PREV]',
  '⏩': '[FF]',
  '⏪': '[RW]',
  '🔄': '[REFRESH]',
  '↩️': '[RETURN]',
  '↩': '[RETURN]',
  '↪️': '[FORWARD]',
  '↪': '[FORWARD]',
  '⬆️': '[UP]',
  '⬆': '[UP]',
  '⬇️': '[DOWN]',
  '⬇': '[DOWN]',
  '⬅️': '[LEFT]',
  '⬅': '[LEFT]',
  '➡️': '[RIGHT]',
  '➡': '[RIGHT]',
  '↗️': '[UP-RIGHT]',
  '↗': '[UP-RIGHT]',
  '↘️': '[DOWN-RIGHT]',
  '↘': '[DOWN-RIGHT]',
  '↙️': '[DOWN-LEFT]',
  '↙': '[DOWN-LEFT]',
  '↖️': '[UP-LEFT]',
  '↖': '[UP-LEFT]',
  '✔️': '[✓]',
  '✔': '[✓]',
  '✖️': '[✗]',
  '✖': '[✗]',
  '➕': '[+]',
  '➖': '[-]',
  '➗': '[÷]',
  '✖️': '[×]',
  '🟢': '[●]',
  '🔴': '[●]',
  '🟡': '[●]',
  '🟠': '[●]',
  '🟣': '[●]',
  '🔵': '[●]',
  '⚫': '[●]',
  '⚪': '[○]',
  '🟤': '[●]',
  '⬛': '[■]',
  '⬜': '[□]',
  '◼️': '[■]',
  '◼': '[■]',
  '◻️': '[□]',
  '◻': '[□]',
  '▪️': '[▪]',
  '▪': '[▪]',
  '▫️': '[▫]',
  '▫': '[▫]',
};

// Get all TSX/JSX files
const files = await glob('**/*.{tsx,jsx,ts,js}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'scripts/**'],
});

let totalConverted = 0;
let filesModified = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf8');
    const originalContent = content;
    let conversions = 0;

    // Convert each emoji to its ASCII equivalent
    for (const [emoji, ascii] of Object.entries(emojiToAscii)) {
      const regex = new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, ascii);
        conversions += matches.length;
      }
    }

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8');
      console.log(`✅ Converted: ${file} (${conversions} emojis → ASCII)`);
      filesModified++;
      totalConverted += conversions;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Files modified: ${filesModified}`);
console.log(`🔄 Emojis converted: ${totalConverted}`);
console.log(`\n🔍 Run "npm run lint" to verify - should see 0 emoji warnings!`);
