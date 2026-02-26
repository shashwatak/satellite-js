import { createMultiThreadRuntimeFromModule } from './multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from './single-thread-runtime.js';
import { MultiThreadRuntime, SingleThreadRuntime } from './wasm-runtime.js';

export async function createSingleThreadRuntime(): Promise<SingleThreadRuntime> {
  const { default: createWasmModuleSingleThread } = await import('#wasm-single-thread');
  return createSingleThreadRuntimeFromModule(await createWasmModuleSingleThread());
}

export async function createMultiThreadRuntime(options: {
  threadsCount: number;
}): Promise<MultiThreadRuntime> {
  const { default: createWasmModuleMultiThread } = await import('#wasm-multi-thread');
  return createMultiThreadRuntimeFromModule(await createWasmModuleMultiThread(), options);
}
