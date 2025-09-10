import type { MainModule } from '../../wasm-build/release/index.js';
import { jday } from '../ext.js';

export function allocateDatesArray(module: MainModule, datesCount: number): number {
  const pointer = module._malloc(datesCount * Float64Array.BYTES_PER_ELEMENT);
  return pointer;
}

export function writeDatesArray(module: MainModule, pointer: number, dates: readonly Date[]): void {
  const startOffset = pointer / Float64Array.BYTES_PER_ELEMENT;
  dates.forEach((date, index) => {
    // eslint-disable-next-line no-param-reassign
    module.HEAPF64[startOffset + index] = jday(date);
  });
}
