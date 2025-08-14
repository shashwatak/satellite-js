import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      include: [
        'src/**/*.ts',
      ],
      // skipFull: true,
    },
    onConsoleLog(log, type) {
      return !(type === 'stderr' && log.includes('LeakSanitizer'))
    },
    projects: [
      {
        test: {
          name: 'JS',
          include: [
            'test/*.test.ts',
          ],
          environment: 'node',
        }
      },
      // {
      //   test: {
      //     name: 'JS: Entire catalog run',
      //     include: [
      //       'test/propagation/sgp4Catalog.test.ts'
      //     ],
      //     environment: 'node',
      //   },
      // },
      {
        test: {
          name: 'WASM release',
          include: [
            'test/wasm/**/*.user.test.ts',
          ],
          environment: 'node',
        },
        resolve: {
          alias: {
            'wasm-module/index.js': path.resolve('./wasm-build/release/index.js'),
          },
        },
      },
      {
        test: {
          name: 'WASM debug',
          include: [
            'test/wasm/**/*.user.test.ts',
            'test/wasm/**/*.struct.test.ts',
            'test/wasm/**/*.leaks.test.ts',
          ],
          environment: 'node',
        },
        resolve: {
          alias: {
            'wasm-module/index.js': path.resolve('./wasm-build/debug/index.js'),
          },
        },
      }
    ]
  }
})
