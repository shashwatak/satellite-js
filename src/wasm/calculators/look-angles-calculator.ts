import type { MainModule } from '../../../wasm-build/release/index.js';
import type { GeodeticLocation, LookAngles } from '../../common-types.js';
import type { Calculator } from './calculator-interface.js';

const OUTPUTS_PER_SATELLITE = 3;

export type LookAnglesFormattedOutput = LookAngles;

/**
 * Calculator for Look Angles (azimuth, elevation, rangeSat).
 *
 * Requires observer location as a parameter for `BulkPropagator.run()` method.
 *
 * Depends on:
 * @see EcfPositionCalculator
 *
 * Raw outputs are always sorted by satellite index first, then by date index, and packed as:
 *   - `Float64Array`, packed as [az0, el0, range0, az1, el1, range1, ...]
 * for each satellite/date pair
 *
 * Provides formatted output under `lookAngles` property, @see LookAnglesFormattedOutput.
 *
 * @example
 * ```ts
 * bulkPropagator.run({
 *   dates: [...],
 *   lookAngles: {
 *     observer: {
 *      latitude: degreesToRadians(41),
 *      longitude: degreesToRadians(-71),
 *      height: 0.1,
 *    }
 *   }
 * });
 *
 * bulkPropagator.getFormattedOutput(satelliteIndex, dateIndex).lookAngles.azimuth;
 * ```
 */
export class LookAnglesCalculator implements Calculator<'lookAngles', 1, ['ecfPosition'], Float64Array, LookAnglesFormattedOutput, { observer: GeodeticLocation }> {
  readonly name = 'lookAngles';

  readonly dependencies: ['ecfPosition'] = ['ecfPosition'];

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

  getFormattedOutput(satelliteIndex: number, dateIndex: number): LookAngles {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * OUTPUTS_PER_SATELLITE;
    return {
      azimuth: rawOutput[index]!,
      elevation: rawOutput[index + 1]!,
      rangeSat: rawOutput[index + 2]!,
    };
  }

  getRawOutput() {
    return new Float64Array(
      this.module.HEAP8.buffer,
      this.outputPointer,
      this.satellitesCount * this.datesCount * OUTPUTS_PER_SATELLITE,
    );
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * OUTPUTS_PER_SATELLITE * Float64Array.BYTES_PER_ELEMENT;
  }

  run(
    _satellitesPointer: number,
    _satellitesCount: number,
    _datesPointer: number,
    _datesCount: number,
    dependenciesOutputsPointers: [number],
    runParameters: { observer: GeodeticLocation },
  ): void {
    const [ecfPointer] = dependenciesOutputsPointers;
    const { latitude, longitude, height } = runParameters.observer;
    this.module._calculate_look_angles(
      ecfPointer,
      this.satellitesCount,
      this.datesCount,
      longitude,
      latitude,
      height,
      this.outputPointer,
    );
  }
}
