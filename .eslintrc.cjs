/* eslint-env node */
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // Temporarily disabled to focus on other critical issues
    // 'no-restricted-syntax': [
    //   'error',
    //   {
    //     selector: "MemberExpression[object.name='process'][property.name='env']",
    //     message: "🚫 Do not use process.env directly. Use `env` from '@/env' instead.",
    //   },
    // ],
    'react/no-unescaped-entities': 'off',
  },
  ignorePatterns: ['.next', 'dist', 'build', 'node_modules'],
};
