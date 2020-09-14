import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const { NODE_ENV } = process.env;

const globals = {};
const external = Object.keys(globals);

const babelOptions = {
  babelrc: false,
  babelHelpers: 'bundled',
  presets: [
    ['@babel/preset-env', { modules: false }],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    '@babel/plugin-proposal-json-strings',
  ],
  exclude: 'node_modules/**',
};

const plugins = [
  babel(babelOptions),
];

if (NODE_ENV === 'production') {
  plugins.push(terser());
}

export default {
  input: 'src/indexUmd.js',
  output: {
    name: 'satellite',
    file: `dist/satellite${NODE_ENV === 'production' ? '.min' : ''}.js`,
    format: 'umd',
    globals,
  },
  external,
  plugins,
};
