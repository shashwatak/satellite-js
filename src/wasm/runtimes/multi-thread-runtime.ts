import createWasmModule from '../../../wasm-build/release-pthreads/index.js';
import { getNativeStructFieldLayout } from '../native-structs-from-js.js';
import { passRunDataToWasm, RunData } from '../run-data.js';
import { MultiThreadRuntime } from './wasm-runtime.js';

export async function createMultiThreadRuntime(options: {
  threadsCount: number;
}): Promise<MultiThreadRuntime> {
  const wasmModule = await createWasmModule();

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

  const compute = async (runData: RunData) => {
    if (isRunning) {
      throw new Error('Cannot run multiple computations in parallel on the same WASM runtime. Make sure to await for the previous computation to finish before starting a new one.');
    }
    isRunning = true;
    const runDataPointer = passRunDataToWasm(wasmModule, runDataLayout, runData);
    try {
      await originalCompute(options.threadsCount, runDataPointer);
    } finally {
      isRunning = false;
      wasmModule._free(runDataPointer);
    }
  };

  const runtime: MultiThreadRuntime = {
    mode: 'multi',
    module: wasmModule,
    compute,
    dispose: () => {
      wasmModule.PThread.terminateAllThreads();
    },
    [Symbol.dispose]() {
      this.dispose();
    },
  };
  return runtime;
}
