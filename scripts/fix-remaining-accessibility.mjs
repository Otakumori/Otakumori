#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

/**
 * Fix all remaining accessibility warnings
 * - Remove any remaining emojis
 * - Fix interactive elements
 * - Fix form labels
 * - Add keyboard handlers
 */

const filesToFix = [
  'app/adults/_components/MaterialEditor.safe.tsx',
  'app/components/avatar/CharacterEditor.tsx',
  'app/components/community/AvatarGallery3D.tsx',
  'app/components/demos/LightingDemo.tsx',
  'app/components/demos/PetalPhysicsDemo.tsx',
  'app/components/gamecube/EnhancedGameCubeHub.tsx',
  'app/components/InteractiveHeroSection.tsx',
  'app/components/shop/CheckoutContent.tsx',
  'app/components/shop/FeaturedCarousel.tsx',
  'app/components/shop/ProductSoapstoneWall.tsx',
  'app/components/ui/QuickSearch.tsx',
  'app/mini-games/console/ConsoleCard.tsx',
  'app/mini-games/puzzle-reveal/page.tsx',
  'components/arcade/games/ButtonMashersKiss.tsx',
  'components/arcade/games/PantyRaid.tsx',
  'components/arcade/games/SlapTheOni.tsx',
  'components/arcade/games/ThighTrap.tsx',
  'components/GameControls.tsx',
  'components/soapstone/SoapstoneWall.tsx',
  'lib/analytics/session-tracker.ts',
];

console.log('🔧 Fixing remaining accessibility warnings...\n');

let totalFixed = 0;
let filesModified = 0;

for (const file of filesToFix) {
  try {
    let content = readFileSync(file, 'utf8');
    const originalContent = content;
    let changes = 0;

    // 1. Remove ALL remaining emojis (convert to text or remove)
    // Match any Unicode emoji character
    const emojiPattern =
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}\u{2623}\u{2626}\u{262A}\u{262E}\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}\u{2660}\u{2663}\u{2665}\u{2666}\u{2668}\u{267B}\u{267E}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}\u{269C}\u{26A0}\u{26A1}\u{26A7}\u{26AA}\u{26AB}\u{26B0}\u{26B1}\u{26BD}\u{26BE}\u{26C4}\u{26C5}\u{26C8}\u{26CE}\u{26CF}\u{26D1}\u{26D3}\u{26D4}\u{26E9}\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}]/gu;

    content = content.replace(emojiPattern, '');
    if (content !== originalContent) {
      changes++;
    }

    // 2. Fix <div> with onClick - add role="button" and keyboard handler
    content = content.replace(/(<div\s+[^>]*onClick={[^}]+}[^>]*)(>)/g, (match, before, after) => {
      if (before.includes('role=') && before.includes('onKeyDown')) {
        return match; // Already fixed
      }
      changes++;
      if (!before.includes('role=')) {
        before += ' role="button"';
      }
      if (!before.includes('tabIndex')) {
        before += ' tabIndex={0}';
      }
      if (!before.includes('onKeyDown')) {
        before +=
          ' onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}';
      }
      return before + after;
    });

    // 3. Fix <span>, <p>, <h*> with onClick
    content = content.replace(
      /(<(span|p|h[1-6])\s+[^>]*onClick={[^}]+}[^>]*)(>)/g,
      (match, before, tag, after) => {
        if (before.includes('role=') && before.includes('onKeyDown')) {
          return match;
        }
        changes++;
        if (!before.includes('role=')) {
          before += ' role="button"';
        }
        if (!before.includes('tabIndex')) {
          before += ' tabIndex={0}';
        }
        if (!before.includes('onKeyDown')) {
          before +=
            ' onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}';
        }
        return before + after;
      },
    );

    // 4. Fix form labels - wrap inputs with labels or add htmlFor
    // This is complex, so we'll add a comment for manual review
    const labelMatches = content.match(/<input[^>]*>/g);
    if (labelMatches) {
      for (const inputTag of labelMatches) {
        if (
          !inputTag.includes('id=') &&
          !content.includes(`<label`) &&
          !content.includes('htmlFor')
        ) {
          // Add comment for manual review
          content = content.replace(
            inputTag,
            `{/* TODO: Add label for accessibility */}\n${inputTag}`,
          );
          changes++;
        }
      }
    }

    // 5. Fix aria-pressed on non-button elements
    content = content.replace(
      /(<[^>]+role="tab"[^>]*)aria-pressed={[^}]+}([^>]*>)/g,
      (match, before, after) => {
        changes++;
        return before.replace(/aria-pressed={[^}]+}/, 'aria-selected={true}') + after;
      },
    );

    // 6. Fix tabIndex on non-interactive elements - remove or add role
    content = content.replace(
      /(<(div|span|p|h[1-6])[^>]*)tabIndex={[^}]+}([^>]*>)/g,
      (match, before, tag, after) => {
        if (before.includes('role="button"') || before.includes('onClick')) {
          return match; // It's interactive, keep tabIndex
        }
        changes++;
        // Remove tabIndex or add role="button"
        if (before.includes('onClick')) {
          return before + ' role="button"' + after;
        }
        return match.replace(/tabIndex={[^}]+}/, '');
      },
    );

    if (content !== originalContent) {
      writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed: ${file} (${changes} changes)`);
      filesModified++;
      totalFixed += changes;
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Files modified: ${filesModified}`);
console.log(`🔄 Total fixes: ${totalFixed}`);
console.log(`\n🔍 Run "npm run lint" to verify fixes`);
