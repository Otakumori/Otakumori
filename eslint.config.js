import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import drizzle from 'eslint-plugin-drizzle';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unusedImports from 'eslint-plugin-unused-imports';
import otmPlugin from './eslint-plugin-otm/index.js';

export default [
  {
    ignores: [
      // build + deps
      'node_modules/',
      '.next/',
      'out/',
      'coverage/',
      'dist/',
      '**/dist/**',
      // assets & third-party stuff
      'public/',
      'public/**',
      'docs/**',
      'comfy/**',
      'public/games/**',
      'public/assets/**',
      // styles (we're not ESLinting CSS)
      '**/*.css',
      '**/*.scss',
      '**/*.sass',
      // misc
      '*.lock',
      '*.log',
      '*.md',
      '*.json',
      '*.yaml',
      '*.yml',
      '*.svg',
      '*.png',
      '*.jpg',
      '*.jpeg',
      '*.gif',
      '*.ico',
      '*.woff',
      '*.woff2',
      '*.ttf',
      '*.eot',
    ],
  },
  // Main application files - strict rules
  {
    files: [
      'app/**/*.{js,jsx,ts,tsx}',
      'components/**/*.{js,jsx,ts,tsx}',
      'lib/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      drizzle,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11y,
      'unused-imports': unusedImports,
      otm: otmPlugin,
    },
    rules: {
      ...tseslint.configs['flat/recommended'].rules,
      ...tseslint.configs['flat/recommended-type-checked'].rules,
      ...tseslint.configs['flat/stylistic-type-checked'].rules,
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'warn',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': 'off', // Disabled due to type information requirements
      // Unused imports cleanup
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      // Console.log restriction
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // No emoji policy
      // 'otm/no-emoji': 'error', // Disabled - use CSS to control emoji display
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: " Do not use `process.env` directly. Use `env` from '@/env' instead.",
        },
      ],
      'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: ['db', 'ctx.db'] }],
      'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: ['db', 'ctx.db'] }],
      // Reduce noise during development
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      // Next.js rules
      '@next/next/no-img-element': 'off',
      // Accessibility rules - re-enabled after fixes
      'jsx-a11y/accessible-emoji': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/control-has-associated-label': 'off', // Disabled: some controls have implicit labels
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/prefer-tag-over-role': 'off', // Disabled: intentional use of role="img" for decorative elements
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
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
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'jsx-a11y/scope': 'warn',
      'jsx-a11y/tabindex-no-positive': 'warn',
    },
  },
  {
    // Allow process.env in env.ts file
    files: ['env.ts', 'app/env.ts', '**/env.ts', 'app/lib/env.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Allow process.env for NEXT_PUBLIC_ variables in client components
    files: ['**/*.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Scripts and CJS: allow require(), looser parsing
    files: ['scripts/**/*.{js,cjs}', '**/*.cjs'],
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 'latest',
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Tests can use require in setup
    files: ['**/__tests__/**/*', 'jest.*', 'jest.setup.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  // Scripts and tests - more relaxed rules
  {
    files: [
      'scripts/**/*.{js,ts}',
      'tests/**/*.{js,jsx,ts,tsx}',
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
    },
    rules: {
      // Relaxed rules for scripts and tests
      'no-console': 'off', // Allow console in scripts
      'unused-imports/no-unused-vars': 'warn', // Warn instead of error
      '@typescript-eslint/no-var-requires': 'off', // Allow require() in scripts
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // Other files - basic rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'off', // Disabled - handled by unused-imports
    },
  },
];
