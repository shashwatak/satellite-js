import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['/dist', '/lib', '*.mjs']
  },
  {
    rules: {
      '@typescript-eslint/unified-signatures': ['error', {
        'ignoreDifferentlyNamedParameters': true
      }],
      // since much of the propagation code is built on loops and if statements,
      // and typescript doesn't follow when a variable is assigned there,
      // this rule is disabled
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  }
);
