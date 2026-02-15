import createWasmModuleSingleThread from '../../../wasm-build/base-release/index.js';
import createWasmModuleMultiThread from '../../../wasm-build/pthreads-release/index.js';
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
