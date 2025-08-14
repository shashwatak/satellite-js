import { describe, it, expect, beforeAll } from 'vitest';
import WasmModuleFactory, { type MainModule } from 'wasm-module/index.js';
import { getNativeStructSize, getNativeStructFieldLayout } from '../../src/wasm-wrapping/native-struct.js';

const module = await WasmModuleFactory();

describe('WASM elsetrec struct (debug only)', () => {
  it('has size exactly 992 bytes', async () => {
    expect(getNativeStructSize(module)).toBe(992);
  });
});
