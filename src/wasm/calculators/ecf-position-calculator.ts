import type { EcfVec3, Kilometer } from '../../index.js';
import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { Calculator } from './calculator-interface.js';

const DIMENSIONS = 3;

/**
 * Calculator for ECF (Earth-Centered Fixed) position.
 *
 * Depends on:
 * @see EciBaseCalculator
 * @see GmstCalculator
 *
 * Raw outputs are always sorted by satellite index first, then by date index, and packed as:
 *   - `Float64Array`, packed as [x0, y0, z0, x1, y1, z1, ...] for each satellite/date pair
 *
 * Provides formatted output under `ecfPosition` property.
 */
export class EcfPositionCalculator implements Calculator<'ecfPosition', 2, ['eci', 'gmst'], Float64Array, EcfVec3<Kilometer>> {
  readonly name = 'ecfPosition';

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

  getFormattedOutput(satelliteIndex: number, dateIndex: number): EcfVec3<Kilometer> {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      x: rawOutput[index]!,
      y: rawOutput[index + 1]!,
      z: rawOutput[index + 2]!,
    };
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
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
      ecfPositionEnabled: true,
      ecfPositions: this.outputPointer,
    };
  }
}
