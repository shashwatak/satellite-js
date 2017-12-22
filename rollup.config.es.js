import babel from 'rollup-plugin-babel';

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
      presets: [
        ['env', { modules: false }],
        'stage-3',
      ],
      plugins: [
        'external-helpers',
      ],
      exclude: 'node_modules/**',
    }),
  ],
};
