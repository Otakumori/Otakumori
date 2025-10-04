module.exports = {
  presets: ['next/babel'],
  plugins: [
    ...(process.env.NODE_ENV === 'production'
      ? [['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]]
      : []),
  ],
};
