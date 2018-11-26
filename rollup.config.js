import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const { NODE_ENV } = process.env;

const globals = {};
const external = Object.keys(globals);

const babelOptions = {
  babelrc: false,
  presets: [
    ['@babel/preset-env', { modules: false }],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    '@babel/plugin-proposal-json-strings'
  ],
  exclude: 'node_modules/**',
};

const plugins = [
  babel(babelOptions),
];

if (NODE_ENV === 'production') {
  plugins.push(uglify({}, minify));
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
