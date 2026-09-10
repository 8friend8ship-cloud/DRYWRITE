import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  {
    files: ['api/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: { 'no-empty': 'off' },
  },
  {
    files: ['services/adsense.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
