import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { Calculator } from './calculator-interface.js';

/**
 * Calculator for shadow fraction.
 *
 * Computes the fraction of the Sun's disc obscured by the Earth as seen from a satellite
 * at a date. This is the WASM equivalent of the pure-JS `shadowFunction`.
 *
 * Depends on:
 * @see EciBaseCalculator
 * @see SunPositionCalculator
 *
 * Raw outputs are always sorted by satellite index first, then by date index, and packed as:
 *   - `Float64Array`, packed as [shadow0, shadow1, ...] for each satellite/date pair
 *     where 0 = fully lit, 1 = umbra, 0–1 = penumbra fraction
 *
 * Provides formatted output as a number under `shadowFraction` property.
 */
export class ShadowFractionCalculator
  implements
    Calculator<
      'shadowFraction',
      2,
      ['eci', 'sunPosition'],
      Float64Array,
      number
    >
{
  readonly name = 'shadowFraction';

  readonly dependencies: ['eci', 'sunPosition'] = ['eci', 'sunPosition'];

  private satellitesCount!: number;

  private datesCount!: number;

  private module!: WasmModuleBase;

  private outputPointer!: number;

  init(
    module: WasmModuleBase,
    outputPointer: number,
    satellitesCount: number,
    datesCount: number,
  ): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): number {
    const rawOutput = this.getRawOutput();
    const index = satelliteIndex * this.datesCount + dateIndex;
    return rawOutput[index]!;
  }

  getRawOutput(): Float64Array {
    return new Float64Array(
      this.module.HEAP8.buffer,
      this.outputPointer,
      this.satellitesCount * this.datesCount,
    );
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  getExecutionDescriptor() {
    return {
      shadowFractionEnabled: true,
      shadowFractionValues: this.outputPointer,
    };
  }
}
