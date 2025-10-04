/**
 * Custom ESLint plugin for Otaku-mori project rules
 */

const emojiRegex =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F018}-\u{1F270}]/gu;

// Allowlisted symbols (Unicode symbols and ASCII art only)
const allowlistedSymbols = [
  // Arrows and navigation
  '←',
  '→',
  '↑',
  '↓',
  '↕',
  '◄',
  '►',
  '▲',
  '▼',
  '◀',
  '▶',

  // Basic shapes
  '●',
  '○',
  '■',
  '□',
  '◆',
  '◇',
  '',
  '',
  '▲',
  '▼',
  '◄',
  '►',

  // Symbols and signs
  '',
  '',
  '◆',
  '●',
  '■',
  '▲',
  '▼',
  '◄',
  '►',
  '◀',
  '▶',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',

  // Text and communication
  'ⓘ',
  '©',
  '®',
  '',
  '',
  '',
  '',
  '',
  '⌕',

  // Special characters
  '֎',
  '',
  '†',
  '🃝',
  '︎',
  '',

  // Custom patterns
  '◄►',
  '▲▼',
  '◆◇',
  '',
  '●○',
  '■□',
  '►◄',
];

// Complex allowlisted patterns
const allowlistedPatterns = [
  /\(｡>\\<\)/, // Shy but wants to interact
  /\(˵ •̀ ᴗ - ˵ \) /, // Good Job
  />ᴗ</, // Excited
];

function containsDisallowedEmoji(text) {
  if (typeof text !== 'string') return false;

  // Check for allowlisted symbols first
  for (const symbol of allowlistedSymbols) {
    if (text.includes(symbol)) {
      text = text.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
    }
  }

  // Check for allowlisted patterns
  for (const pattern of allowlistedPatterns) {
    text = text.replace(pattern, '');
  }

  // Check if any emojis remain
  return emojiRegex.test(text);
}

module.exports = {
  rules: {
    'no-emoji': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow emojis except for allowlisted symbols',
          category: 'Stylistic Issues',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          noEmoji:
            'Emojis are not allowed. Use Unicode symbols instead: ← → ↑ ↓ ↕ ◄ ► ▲ ▼ ◀ ▶ ● ○ ■ □ ◆ ◇                                ⓘ © ®      ⌕ ֎  † 🃝 ︎  (｡>\\<) (˵ •̀ ᴗ - ˵ )  >ᴗ<',
        },
      },
      create(context) {
        return {
          Literal(node) {
            if (containsDisallowedEmoji(node.value)) {
              context.report({
                node,
                messageId: 'noEmoji',
              });
            }
          },
          JSXText(node) {
            if (containsDisallowedEmoji(node.value)) {
              context.report({
                node,
                messageId: 'noEmoji',
              });
            }
          },
          TemplateLiteral(node) {
            node.quasis.forEach((quasi) => {
              if (containsDisallowedEmoji(quasi.value.raw)) {
                context.report({
                  node: quasi,
                  messageId: 'noEmoji',
                });
              }
            });
          },
        };
      },
    },
  },
};
