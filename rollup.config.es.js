import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'satellite',
    file: 'dist/satellite.es.js',
    format: 'es',
  },
  external: [],
  plugins: [
    babel({
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
    }),
  ],
};
