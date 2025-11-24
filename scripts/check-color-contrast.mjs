#!/usr/bin/env node

/**
 * Color Contrast Checker
 * Checks WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(color) {
  let r, g, b;
  
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    r = rgb.r / 255;
    g = rgb.g / 255;
    b = rgb.b / 255;
  } else if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return 0;
    r = parseInt(match[1]) / 255;
    g = parseInt(match[2]) / 255;
    b = parseInt(match[3]) / 255;
    const alpha = match[4] ? parseFloat(match[4]) : 1;
    // For rgba, blend with black background
    r = r * alpha;
    g = g * alpha;
    b = b * alpha;
  } else {
    return 0;
  }

  const [rs, gs, bs] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(color1, color2, isLargeText = false) {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Color combinations to check
const checks = [
  {
    name: 'Primary text on base background',
    foreground: '#ffffff',
    background: '#080611',
    isLargeText: false,
  },
  {
    name: 'Secondary text on base background',
    foreground: '#d4d4d8',
    background: '#080611',
    isLargeText: false,
  },
  {
    name: 'Muted text on base background',
    foreground: 'rgba(255, 255, 255, 0.6)',
    background: '#080611',
    isLargeText: false,
  },
  {
    name: 'Link text on base background',
    foreground: '#c08497', // Updated for better contrast
    background: '#080611',
    isLargeText: false,
  },
  {
    name: 'Link hover on base background',
    foreground: '#f472b6',
    background: '#080611',
    isLargeText: false,
  },
  {
    name: 'Primary text on glass background',
    foreground: '#ffffff',
    background: 'rgba(255, 255, 255, 0.1)',
    isLargeText: false,
  },
  {
    name: 'Pink button text on pink button (primary)',
    foreground: '#ffffff',
    background: '#db2777', // pink-600 (default primary color)
    isLargeText: false,
  },
  {
    name: 'Large text - Primary on base',
    foreground: '#ffffff',
    background: '#080611',
    isLargeText: true,
  },
  {
    name: 'Large text - Secondary on base',
    foreground: '#d4d4d8',
    background: '#080611',
    isLargeText: true,
  },
  {
    name: 'Large text - Muted on base',
    foreground: 'rgba(255, 255, 255, 0.6)',
    background: '#080611',
    isLargeText: true,
  },
];

console.log('Color Contrast Check\n');
console.log('='.repeat(80));

let passCount = 0;
let failCount = 0;

checks.forEach((check) => {
  const ratio = getContrastRatio(check.foreground, check.background);
  const passes = meetsWCAGAA(check.foreground, check.background, check.isLargeText);
  const required = check.isLargeText ? 3 : 4.5;

  if (passes) {
    passCount++;
    console.log(`✓ ${check.name}`);
  } else {
    failCount++;
    console.log(`✗ ${check.name}`);
  }
  console.log(`  Ratio: ${ratio.toFixed(2)}:1 (Required: ${required}:1)`);
  console.log(`  Foreground: ${check.foreground}`);
  console.log(`  Background: ${check.background}`);
  console.log('');
});

console.log('='.repeat(80));
console.log(`Passed: ${passCount}/${checks.length}`);
console.log(`Failed: ${failCount}/${checks.length}`);

if (failCount > 0) {
  console.log('\n⚠️  Some color combinations do not meet WCAG AA standards!');
  process.exit(1);
} else {
  console.log('\n✓ All color combinations meet WCAG AA standards!');
  process.exit(0);
}

