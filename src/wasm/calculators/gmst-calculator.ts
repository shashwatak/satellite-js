import type { GMSTime } from '../../common-types.js';
import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { Calculator } from './calculator-interface.js';

/**
 * Calculator for GMST (Greenwich Mean Sidereal Time), required for many coordinate transforms.
 *
 * Raw output format:
 *   - `Float64Array`, packed as [gmst0, gmst1, ...] for each date. Not duplicated per satellite.
 *
 * Provides formatted output as a number under `gmst` property.
 */
export class GmstCalculator implements Calculator<'gmst', 0, [], Float64Array, GMSTime> {
  readonly name = 'gmst';

  readonly dependencies: [] = [];

  private module!: WasmModuleBase;

  private outputPointer!: number;

  private datesCount!: number;

  getOutputBufferSize(_satellitesCount: number, datesCount: number): number {
    return datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  init(
    module: WasmModuleBase,
    outputPointer: number,
    _satellitesCount: number,
    datesCount: number,
  ): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.datesCount = datesCount;
  }

  getRawOutput(): Float64Array {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.datesCount);
  }

  getFormattedOutput(_satelliteIndex: number, dateIndex: number): GMSTime {
    return this.getRawOutput()[dateIndex]!;
  }

  getExecutionDescriptor() {
    return {
      gmstEnabled: true,
      gmstValues: this.outputPointer,
    };
  }
}
