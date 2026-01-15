/**
 * This interface defines methods and properties which are required from the WebAssembly module.
 */
export interface WasmModuleBase {
  UTF8ToString(
    ptr: number,
    maxBytesToRead?: number | undefined,
    ignoreNul?: boolean | undefined
  ): string;
  HEAP8: Int8Array;
  HEAPF64: Float64Array;
  _get_elsetrec_size(): number;
  _get_rundata_size(): number;
  _create_elsetrec_struct_layout_string_pointer(): number;
  _create_rundata_struct_layout_string_pointer(): number;
  _free_struct_layout_string(ptr: number): void;
  _malloc(bytes: number): number;
  _calloc_one(bytes: number): number;
  _free(ptr: number): void;
}

export interface WasmModuleSingleThread extends WasmModuleBase {
  _compute(runDataPointer: number): void;
}

export interface WasmModuleMultiThread extends WasmModuleBase {
  _compute(threadsCount: number, runDataPointer: number): number;
}
