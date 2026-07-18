import type { EcfVec3, KilometerPerSecond } from '../../common-types.js';
import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { Calculator } from './calculator-interface.js';

const DIMENSIONS = 3;

/**
 * Calculator for ECF (Earth-Centered Fixed) velocity.
 *
 * Depends on:
 * @see EciBaseCalculator
 * @see GmstCalculator
 *
 * Raw outputs are always sorted by satellite index first, then by date index, and packed as:
 *   - `Float64Array`, packed as [vx0, vy0, vz0, vx1, vy1, vz1, ...] for each satellite/date pair
 *
 * Provides formatted output under `ecfVelocity` property.
 */
export class EcfVelocityCalculator
  implements
    Calculator<
      'ecfVelocity',
      2,
      ['eci', 'gmst'],
      Float64Array,
      EcfVec3<KilometerPerSecond>
    >
{
  readonly name = 'ecfVelocity';

  readonly dependencies: ['eci', 'gmst'] = ['eci', 'gmst'];

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

  getFormattedOutput(
    satelliteIndex: number,
    dateIndex: number,
  ): EcfVec3<KilometerPerSecond> {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      // biome-ignore-start lint/style/noNonNullAssertion: index math
      x: rawOutput[index]!,
      y: rawOutput[index + 1]!,
      z: rawOutput[index + 2]!,
      // biome-ignore-end lint/style/noNonNullAssertion: index math
    };
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return (
      satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT
    );
  }

  getRawOutput() {
    return new Float64Array(
      this.module.HEAP8.buffer,
      this.outputPointer,
      this.satellitesCount * this.datesCount * DIMENSIONS,
    );
  }

  getExecutionDescriptor() {
    return {
      ecfVelocityEnabled: true,
      ecfVelocities: this.outputPointer,
    };
  }
}
