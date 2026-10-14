import { getNativeStructFieldLayout } from '../native-structs-from-js.js';
import { passRunDataToWasm, type RunData } from '../run-data.js';
import { createRuntimeDispose } from './runtime-dispose.js';
import type { WasmModuleMultiThread } from './wasm-module-interfaces.js';
import type { MultiThreadRuntime } from './wasm-runtime.js';

export async function createMultiThreadRuntimeFromModule(
  wasmModule: WasmModuleMultiThread,
  options: {
    threadsCount: number;
  },
): Promise<MultiThreadRuntime> {
  const runDataStructLayoutStringPointer =
    wasmModule._create_rundata_struct_layout_string_pointer();
  const runDataLayout = getNativeStructFieldLayout<keyof RunData>(
    runDataStructLayoutStringPointer,
    wasmModule,
  );
  wasmModule._free(runDataStructLayoutStringPointer);

  const originalCompute = wasmModule.cwrap(
    'compute',
    'number',
    ['number', 'number'],
    { async: true },
  );
  let isRunning = false;

  const compute = async (runData: RunData, runDataPointer: number) => {
    if (isRunning) {
      throw new Error(
        'Cannot run multiple computations in parallel on the same WASM runtime. Make sure to await for the previous computation to finish before starting a new one.',
      );
    }
    isRunning = true;
    try {
      passRunDataToWasm(wasmModule, runDataLayout, runData, runDataPointer);
      await originalCompute(options.threadsCount, runDataPointer);
    } finally {
      isRunning = false;
    }
  };

  const disposeRuntime = createRuntimeDispose(wasmModule);

  const runtime: MultiThreadRuntime = {
    mode: 'multi',
    module: wasmModule,
    compute,
    dispose: () => {
      if (isRunning) {
        throw new Error(
          'Cannot dispose the WASM runtime while a computation is running. Make sure to await for the computation to finish before disposing the runtime.',
        );
      }
      disposeRuntime();
    },
    [Symbol.dispose]() {
      this.dispose();
    },
  };
  return runtime;
}
