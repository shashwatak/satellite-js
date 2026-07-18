import type { AU, EciVec3 } from '../../index.js';
import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { Calculator } from './calculator-interface.js';

const DIMENSIONS = 3;

/**
 * Calculator for Sun position in AU (equatorial ECI frame).
 *
 * Output is per-date only (not per-satellite), since the Sun position depends only
 * on the date.
 *
 * Raw output format:
 *   - `Float64Array`, packed as [x0, y0, z0, x1, y1, z1, ...] for each date.
 *
 * Provides formatted output under `sunPosition` property.
 */
export class SunPositionCalculator
  implements Calculator<'sunPosition', 0, [], Float64Array, EciVec3<AU>>
{
  readonly name = 'sunPosition';

  readonly dependencies: [] = [];

  private module!: WasmModuleBase;

  private outputPointer!: number;

  private datesCount!: number;

  getOutputBufferSize(_satellitesCount: number, datesCount: number): number {
    return datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
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
    return new Float64Array(
      this.module.HEAP8.buffer,
      this.outputPointer,
      this.datesCount * DIMENSIONS,
    );
  }

  getFormattedOutput(_satelliteIndex: number, dateIndex: number): EciVec3<AU> {
    const rawOutput = this.getRawOutput();
    const index = dateIndex * DIMENSIONS;
    return {
      // biome-ignore-start lint/style/noNonNullAssertion: index math
      x: rawOutput[index]!,
      y: rawOutput[index + 1]!,
      z: rawOutput[index + 2]!,
      // biome-ignore-end lint/style/noNonNullAssertion: index math
    };
  }

  getExecutionDescriptor() {
    return {
      sunPositionEnabled: true,
      sunPositions: this.outputPointer,
    };
  }
}
