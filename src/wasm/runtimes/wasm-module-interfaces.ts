/**
 * This interface defines methods and properties which are required from the WebAssembly module.
 */
export interface WasmModuleBase {
  UTF8ToString(
    ptr: number,
    maxBytesToRead?: number | undefined,
    ignoreNul?: boolean | undefined,
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
  _exit_runtime(): void;
}

export interface WasmModuleSingleThread extends WasmModuleBase {
  _compute(runDataPointer: number): void;
}

// map Emscripten type strings to TypeScript primitives
type EmscriptenTypeMap = {
  number: number;
  string: string;
  array: number[]; // or other typed arrays
  boolean: boolean;
  // biome-ignore lint/suspicious/noConfusingVoidType: it's used as a return type in cwrap
  void: void;
};

// Convert string arrays to a tuple of TypeScript types
type MapArgs<T extends string[]> = {
  [K in keyof T]: T[K] extends keyof EmscriptenTypeMap
    ? EmscriptenTypeMap[T[K]]
    : never;
};

export interface WasmModuleMultiThread extends WasmModuleBase {
  _compute(threadsCount: number, runDataPointer: number): number;
  cwrap<
    Ret extends keyof EmscriptenTypeMap,
    const Args extends (keyof EmscriptenTypeMap)[],
    Async extends boolean = false,
  >(
    ident: string,
    returnType: Ret,
    argTypes?: Args,
    options?: { async: Async },
  ): (
    ...args: MapArgs<Args>
  ) => Async extends true
    ? Promise<EmscriptenTypeMap[Ret]>
    : EmscriptenTypeMap[Ret];
}
