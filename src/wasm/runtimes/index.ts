import createWasmModuleSingleThread from 'wasm-module-single-thread/index.js';
import createWasmModuleMultiThread from 'wasm-module-multi-thread/index.js';
import { createMultiThreadRuntimeFromModule } from './multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from './single-thread-runtime.js';
import { MultiThreadRuntime, SingleThreadRuntime } from './wasm-runtime.js';

export async function createSingleThreadRuntime(): Promise<SingleThreadRuntime> {
  return createSingleThreadRuntimeFromModule(await createWasmModuleSingleThread());
}

export async function createMultiThreadRuntime(options: {
  threadsCount: number;
}): Promise<MultiThreadRuntime> {
  return createMultiThreadRuntimeFromModule(await createWasmModuleMultiThread(), options);
}
