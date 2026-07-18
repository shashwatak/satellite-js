import type { NativeFieldType } from './native-field-type.js';
import type { WasmModuleBase } from './runtimes/wasm-module-interfaces.js';

/**
 * Map of names of fields in C++ `elsetrec` struct, together with their types, offsets and sizes
 */
export type NativeStructLayout<NativeField extends string> = Map<
  NativeField,
  { type: NativeFieldType; offset: number; size: number }
>;

export function getNativeStructFieldLayout<NativeField extends string>(
  structLayoutStringPointer: number,
  module: WasmModuleBase,
): NativeStructLayout<NativeField> {
  const structureJsonString = module.UTF8ToString(structLayoutStringPointer);
  const structureJson = JSON.parse(structureJsonString) as [
    NativeField,
    NativeFieldType,
    number,
    number,
  ][];
  return new Map(
    structureJson.map(([field, type, offset, size]) => [
      field,
      { type, offset, size },
    ]),
  );
}
