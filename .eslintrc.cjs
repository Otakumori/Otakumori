/* eslint-env node */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:jsx-a11y/strict',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jsx-a11y', 'filenames'],
  rules: {
    // TypeScript rules
    'no-unused-vars': 'off', // Turn off base rule
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    '@typescript-eslint/consistent-type-imports': 'error',
    
    // Next.js rules
    '@next/next/no-img-element': 'warn',
    'react/no-unescaped-entities': 'off',
    
    // Accessibility rules - focus on critical issues first
    'jsx-a11y/alt-text': 'warn', // Critical for images
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn', // Important for keyboard users
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/html-has-lang': 'error', // Critical - keep as error
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn', // Important for forms
    'jsx-a11y/control-has-associated-label': 'warn',
    'jsx-a11y/media-has-caption': 'warn',
    'jsx-a11y/no-aria-hidden-on-focusable': 'warn',
    'jsx-a11y/prefer-tag-over-role': 'warn',
    'jsx-a11y/accessible-emoji': 'warn', // Common issue - make warning for now
    'jsx-a11y/autocomplete-valid': 'warn',
    
    // File naming conventions - relaxed for now
    'filenames/match-regex': 'off', // Disable for now to focus on accessibility
    'filenames/match-exported': 'off', // Disable for now
    'filenames/no-index': 'off', // Allow index files
  },
  ignorePatterns: ['.next', 'dist', 'build', 'node_modules'],
};
