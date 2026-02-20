import { defineConfig, type Plugin } from 'vite';

// Emscripten-generated WASM loaders use import.meta.url to locate sibling
// .wasm binaries at runtime, so they must stay external. This map rewrites
// the bare specifiers used in source to the correct relative paths from dist/.
const wasmExternals: Record<string, string> = {
  'wasm-module-single-thread': '../wasm-build/base-release',
  'wasm-module-multi-thread': '../wasm-build/pthreads-release',
};

function externalizeWasm(): Plugin {
  return {
    name: 'externalize-wasm',
    resolveId(source) {
      for (const [key, value] of Object.entries(wasmExternals)) {
        if (source.startsWith(key)) {
          return { id: source.replace(key, value), external: true };
        }
      }
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: 'compiled/index.js',
      formats: ['es'],
      fileName: 'satellite',
    },
    target: [
      'es2022',
      'node20',
    ],
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [externalizeWasm()],
});
