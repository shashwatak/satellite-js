import { jday } from '../ext.js';
import type { WasmModuleBase } from './runtimes/wasm-module-interfaces.js';

export function allocateDatesArray(
  module: WasmModuleBase,
  datesCount: number,
): number {
  const pointer = module._malloc(datesCount * Float64Array.BYTES_PER_ELEMENT);
  return pointer;
}

export function writeDatesArray(
  module: WasmModuleBase,
  pointer: number,
  dates: readonly Date[],
): void {
  const startOffset = pointer / Float64Array.BYTES_PER_ELEMENT;
  dates.forEach((date, index) => {
    module.HEAPF64[startOffset + index] = jday(date);
  });
}
