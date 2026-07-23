import type { EcfVec3, Kilometer } from '../../common-types.js';
import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { Calculator } from './calculator-interface.js';

/**
 * Calculator for Doppler factor.
 *
 * Depends on:
 * @see EcfPositionCalculator
 * @see EcfVelocityCalculator
 *
 * Raw outputs are always sorted by satellite index first, then by date index, and packed as:
 *   - `Float64Array`, packed as [dopplerFactor0, dopplerFactor1, ...] for each satellite/date pair
 *
 * Provides formatted output as a number under `dopplerFactor` property.
 */
export class DopplerFactorCalculator
  implements
    Calculator<
      'dopplerFactor',
      2,
      ['ecfPosition', 'ecfVelocity'],
      Float64Array,
      number,
      { observer: EcfVec3<Kilometer> }
    >
{
  readonly name = 'dopplerFactor';

  readonly dependencies: ['ecfPosition', 'ecfVelocity'] = [
    'ecfPosition',
    'ecfVelocity',
  ];

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
    // biome-ignore lint/style/noNonNullAssertion: index math
    return rawOutput[index]!;
  }

  getRawOutput() {
    return new Float64Array(
      this.module.HEAP8.buffer,
      this.outputPointer,
      this.satellitesCount * this.datesCount,
    );
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  getExecutionDescriptor(runParameters: { observer: EcfVec3<Kilometer> }) {
    return {
      dopplerFactorEnabled: true,
      observerEcfX: runParameters.observer.x,
      observerEcfY: runParameters.observer.y,
      observerEcfZ: runParameters.observer.z,
      dopplerFactors: this.outputPointer,
    };
  }
}
