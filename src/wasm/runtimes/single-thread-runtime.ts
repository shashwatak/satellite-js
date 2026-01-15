import createWasmModule from '../../../wasm-build/release/index.js';
import { getNativeStructFieldLayout } from '../native-structs-from-js.js';
import { passRunDataToWasm, RunData } from '../run-data.js';
import { SingleThreadRuntime } from './wasm-runtime.js';

export async function createSingleThreadRuntime(): Promise<SingleThreadRuntime> {
  const wasmModule = await createWasmModule();

  const runDataStructLayoutStringPointer = wasmModule
    ._create_rundata_struct_layout_string_pointer();
  const runDataLayout = getNativeStructFieldLayout<keyof RunData>(
    runDataStructLayoutStringPointer,
    wasmModule,
  );
  wasmModule._free(runDataStructLayoutStringPointer);

  const compute = async (runData: RunData) => {
    const runDataPointer = passRunDataToWasm(wasmModule, runDataLayout, runData);
    try {
      wasmModule._compute(runDataPointer);
    } finally {
      wasmModule._free(runDataPointer);
    }
  };

  return {
    mode: 'single',
    module: wasmModule,
    compute,
    dispose: () => {
      // noop
    },
    [Symbol.dispose]: () => {},
  };
}
