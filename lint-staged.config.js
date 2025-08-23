export default {
  // ESLint only on code files
  "**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
  
  // Prettier on all text files
  "**/*.{js,jsx,ts,tsx,md,mdx,json,yml,yaml,css,scss}": ["prettier --write"]
};
