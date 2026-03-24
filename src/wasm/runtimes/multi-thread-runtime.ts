import { getNativeStructFieldLayout } from '../native-structs-from-js.js';
import { passRunDataToWasm, RunData } from '../run-data.js';
import { WasmModuleMultiThread } from './wasm-module-interfaces.js';
import { MultiThreadRuntime } from './wasm-runtime.js';

export async function createMultiThreadRuntimeFromModule(
  wasmModule: WasmModuleMultiThread,
  options: {
    threadsCount: number;
  },
): Promise<MultiThreadRuntime> {
  const runDataStructLayoutStringPointer = wasmModule
    ._create_rundata_struct_layout_string_pointer();
  const runDataLayout = getNativeStructFieldLayout<keyof RunData>(
    runDataStructLayoutStringPointer,
    wasmModule,
  );
  wasmModule._free(runDataStructLayoutStringPointer);

  const originalCompute: (threadCount: number, runDataPointer: number)
    => Promise<number> = wasmModule.cwrap('compute', 'number', ['number', 'number'], { async: true });
  let isRunning = false;

  const compute = async (runData: RunData, runDataPointer: number) => {
    if (isRunning) {
      throw new Error('Cannot run multiple computations in parallel on the same WASM runtime. Make sure to await for the previous computation to finish before starting a new one.');
    }
    isRunning = true;
    passRunDataToWasm(wasmModule, runDataLayout, runData, runDataPointer);
    try {
      await originalCompute(options.threadsCount, runDataPointer);
    } finally {
      isRunning = false;
    }
  };

  const runtime: MultiThreadRuntime = {
    mode: 'multi',
    module: wasmModule,
    compute,
    dispose: () => {
      wasmModule._exit_runtime();
    },
    [Symbol.dispose]() {
      this.dispose();
    },
  };
  return runtime;
}
