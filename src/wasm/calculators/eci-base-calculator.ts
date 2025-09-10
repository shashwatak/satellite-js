import type { MainModule } from '../../../wasm-build/release/index.js';
import type { SatRecError } from '../../propagation/SatRec.js';
import type { Calculator } from './calculator-interface.js';

const DIMENSIONS = 3;
const BYTES_PER_VECTOR = DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;

export interface EciBaseFormattedOutput {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  error: SatRecError;
}

/**
 * Performs SGP4 propagation, producing ECI (Earth-Centered Fixed) position
 * and velocity vectors. Base calculator with no dependencies.
 *
 * Raw outputs are always sorted by satellite index first, then by date index, and packed as:
 *   - `position`: `Float64Array`, packed as [x0, y0, z0, x1, y1, z1, ...]
 * for each satellite/date pair
 *   - `velocity`: `Float64Array`, packed as [vx0, vy0, vz0, vx1, vy1, vz1, ...]
 * for each satellite/date pair
 *   - `error`: `Int8Array`, equal to SatRec.error, packed as [err0, err1, ...]
 * for each satellite/date pair
 *
 * Provides formatted output under `eci` property, @see EciBaseFormattedOutput.
 */
export class EciBaseCalculator implements Calculator<'eci', 0, [], { position: Float64Array, velocity: Float64Array, error: Int8Array }, EciBaseFormattedOutput> {
  readonly name = 'eci';

  readonly dependencies: [] = [];

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

  getFormattedOutput(satelliteIndex: number, dateIndex: number): EciBaseFormattedOutput {
    const { position, velocity, error } = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      position: {
        x: position[index]!,
        y: position[index + 1]!,
        z: position[index + 2]!,
      },
      velocity: {
        x: velocity[index]!,
        y: velocity[index + 1]!,
        z: velocity[index + 2]!,
      },
      error: error[(satelliteIndex * this.datesCount + dateIndex)] as SatRecError,
    };
  }

  getRawOutput(): { position: Float64Array; velocity: Float64Array, error: Int8Array } {
    const vectorsSize = this.satellitesCount * this.datesCount * DIMENSIONS;
    const position = new Float64Array(this.module.HEAP8.buffer, this.outputPointer, vectorsSize);
    const velocity = new Float64Array(
      this.module.HEAP8.buffer,
      position.byteOffset + position.byteLength,
      vectorsSize,
    );
    const error = new Int8Array(
      this.module.HEAP8.buffer,
      velocity.byteOffset + velocity.byteLength,
      this.satellitesCount * this.datesCount,
    );
    return {
      position,
      velocity,
      error,
    };
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return BYTES_PER_VECTOR * satellitesCount * datesCount * 2
      + Int8Array.BYTES_PER_ELEMENT * satellitesCount * datesCount;
  }

  run(
    satellitesPointer: number,
    satellitesCount: number,
    datesPointer: number,
    datesCount: number,
  ): void {
    const velocitiesPointer = this.outputPointer
      + BYTES_PER_VECTOR * this.satellitesCount * this.datesCount;
    const errorsPointer = velocitiesPointer
      + BYTES_PER_VECTOR * this.satellitesCount * this.datesCount;
    this.module._calculate_eci_base(
      satellitesPointer,
      satellitesCount,
      datesPointer,
      datesCount,
      this.outputPointer,
      velocitiesPointer,
      errorsPointer,
    );
  }
}
