// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: ['prettier'],
    extends: ['prettier'],
    ignores: ['dist/*', 'node_modules/**'],
    rules: { 'prettier/prettier': 'warn' },
  },
]);
