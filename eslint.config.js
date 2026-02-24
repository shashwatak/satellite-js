import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import { globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import { configs } from 'eslint-config-airbnb-extended/legacy';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = [
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  ...configs.base.recommended,
];

const typescriptConfig = [
  ...configs.base.typescript,
];

// eslint-disable-next-line import/no-default-export
export default [
  includeIgnoreFile(gitignorePath),
  ...jsConfig,
  ...typescriptConfig,
  {
    rules: {
      'linebreak-style': 'off',
      // sgp4 and sgp4init extensively use parameter reassignment
      'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['satrec'] }],
      // Emscripten compiles C++ functions to JS with underscores
      'no-underscore-dangle': ['off'],
      // almost identical to default, but allows for...of loops, which are used for performance
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],
      // allow ++ in for loops
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      // the first is disabled, and the second covers this
      'default-case': 'off',
      // prefer named exports since they autocomplete and refactor easily
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'error',
      // needed to implement Calculator interface
      'class-methods-use-this': ['error', { ignoreClassesWithImplements: 'public-fields' }],
    },
    settings: {
      'import/resolver': {
        typescript: {
          // we have separate tsconfigs for source, tests, and docs
          noWarnOnMultipleProjects: true,
          project: '*/tsconfig.json',
        },
      },
    },
  },
  globalIgnores([
    'sgp4_verification/*',
    'wasm-build/*',
    'docs/*',
    '*.config.{mjs,ts}',
    'rollup.*',
  ])
];
