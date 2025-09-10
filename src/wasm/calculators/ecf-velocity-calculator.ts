import type { MainModule } from '../../../wasm-build/release/index.js';
import type { Calculator } from './calculator-interface.js';

const DIMENSIONS = 3;

export interface EcfVelocityFormattedOutput {
  x: number; y: number; z: number
}

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
 * Provides formatted output under `ecfVelocity` property, @see EcfVelocityFormattedOutput.
 */
export class EcfVelocityCalculator implements Calculator<'ecfVelocity', 2, ['eci', 'gmst'], Float64Array, EcfVelocityFormattedOutput> {
  readonly name = 'ecfVelocity';

  readonly dependencies: ['eci', 'gmst'] = ['eci', 'gmst'];

  private satellitesCount!: number;

  private datesCount!: number;

  private module!: MainModule;

  private outputPointer!: number;

  init(
    module: MainModule,
    outputPointer: number,
    satellitesCount: number,
    datesCount: number,
  ): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): EcfVelocityFormattedOutput {
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

  run(
    _satellitesPointer: number,
    _satellitesCount: number,
    _datesPointer: number,
    _datesCount: number,
    dependenciesOutputsPointers: [number, number],
  ): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    const eciVelocityPointer = eciBasePointer
      + this.satellitesCount * this.datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
    this.module._calculate_ecf_position_or_velocity(
      eciVelocityPointer,
      this.satellitesCount,
      gmstPointer,
      this.datesCount,
      this.outputPointer,
    );
  }
}
