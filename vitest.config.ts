import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './src/wasm-wrapping',
    environment: 'node',
  }
})