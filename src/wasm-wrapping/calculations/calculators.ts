import type { MainModule } from '../../../wasm-build/release/index.js';
import type { SatRecError } from '../../propagation/SatRec.js';
import type { Calculator } from './calculator.js';

const DIMENSIONS = 3;
const BYTES_PER_VECTOR = DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;

interface EciBaseFormattedOutput {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  error: SatRecError;
};

export class EciBaseCalculator implements Calculator<'eci', 0, [], { eciPosition: Float64Array, eciVelocity: Float64Array, sgp4Error: Int32Array }, EciBaseFormattedOutput> {
  readonly name = 'eci';
  readonly dependencies: [] = [];

  private satellitesCount!: number;
  private timesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, timesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.timesCount = timesCount;
  }

  getFormattedOutput(satelliteIndex: number, timeIndex: number): EciBaseFormattedOutput {
    const { eciPosition, eciVelocity, sgp4Error } = this.getRawOutput();
    return {
      position: {
        x: eciPosition[(satelliteIndex * this.timesCount + timeIndex) * DIMENSIONS]!,
        y: eciPosition[(satelliteIndex * this.timesCount + timeIndex) * DIMENSIONS + 1]!,
        z: eciPosition[(satelliteIndex * this.timesCount + timeIndex) * DIMENSIONS + 2]!,
      },
      velocity: {
        x: eciVelocity[(satelliteIndex * this.timesCount + timeIndex) * DIMENSIONS]!,
        y: eciVelocity[(satelliteIndex * this.timesCount + timeIndex) * DIMENSIONS + 1]!,
        z: eciVelocity[(satelliteIndex * this.timesCount + timeIndex) * DIMENSIONS + 2]!,
      },
      error: sgp4Error[(satelliteIndex * this.timesCount + timeIndex)] as SatRecError,
    };
  }

  getRawOutput(): { eciPosition: Float64Array; eciVelocity: Float64Array, sgp4Error: Int32Array } {
    const vectorsSize = this.satellitesCount * this.timesCount * DIMENSIONS;
    return {
      eciPosition: new Float64Array(this.module.HEAPF64.buffer, this.outputPointer, vectorsSize),
      eciVelocity: new Float64Array(this.module.HEAPF64.buffer, this.outputPointer + vectorsSize * Float64Array.BYTES_PER_ELEMENT, vectorsSize),
      sgp4Error: new Int32Array(this.module.HEAP32.buffer, this.outputPointer + 2 * vectorsSize * Float64Array.BYTES_PER_ELEMENT, this.satellitesCount * this.timesCount),
    }
  }

  getOutputBufferSize(satellitesCount: number, timesCount: number): number {
    return BYTES_PER_VECTOR * satellitesCount * timesCount * 2 + Int32Array.BYTES_PER_ELEMENT * satellitesCount * timesCount;
  }

  run(
    elsetrecsPointer: number,
    elsetrecsCount: number,
    timesPointer: number,
    timesCount: number,
  ): void {
    this.module._calculate_eci_base(
      elsetrecsPointer,
      elsetrecsCount,
      timesPointer,
      timesCount,
      this.outputPointer,
      this.outputPointer + BYTES_PER_VECTOR * this.satellitesCount * this.timesCount,
    );
  }
}