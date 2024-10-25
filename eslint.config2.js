/** @type {import('eslint').Linter.Config} */
const config = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        node: true,
        es6: true,
    },
    rules: {
        // Customize your rules as needed
        'no-unused-vars': 'warn',
        'no-console': 'off', // Allow console logs
    },
};

module.exports = config;
