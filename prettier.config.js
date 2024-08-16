/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  printWidth: 80,
  arrowParens: 'always',
  trailingComma: 'all',
  bracketSpacing: true,
  useTabs: false,
  bracketSameLine: false,
  jsxSingleQuote: false,
  quoteProps: 'consistent',
  endOfLine: 'auto',
}

export default config
