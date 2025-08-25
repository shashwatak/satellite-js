import type { MainModule } from '../../../wasm-build/release/index.js';
import { EcfVec3, GeodeticLocation, Kilometer, LookAngles } from '../../common-types.js';
import type { SatRecError } from '../../propagation/SatRec.js';
import { geodeticToEcf } from '../../transforms.js';
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
  private datesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, timeIndex: number): EciBaseFormattedOutput {
    const { eciPosition, eciVelocity, sgp4Error } = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + timeIndex) * DIMENSIONS;
    return {
      position: {
        x: eciPosition[index]!,
        y: eciPosition[index + 1]!,
        z: eciPosition[index + 2]!,
      },
      velocity: {
        x: eciVelocity[index]!,
        y: eciVelocity[index + 1]!,
        z: eciVelocity[index + 2]!,
      },
      error: sgp4Error[(satelliteIndex * this.datesCount + timeIndex)] as SatRecError,
    };
  }

  getRawOutput(): { eciPosition: Float64Array; eciVelocity: Float64Array, sgp4Error: Int32Array } {
    const vectorsSize = this.satellitesCount * this.datesCount * DIMENSIONS;
    const eciPosition = new Float64Array(this.module.HEAP8.buffer, this.outputPointer, vectorsSize);
    const eciVelocity = new Float64Array(this.module.HEAP8.buffer, eciPosition.byteOffset + eciPosition.byteLength, vectorsSize)
    const sgp4Error = new Int32Array(this.module.HEAP8.buffer, eciVelocity.byteOffset + eciVelocity.byteLength, this.satellitesCount * this.datesCount);
    return {
      eciPosition,
      eciVelocity,
      sgp4Error,
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return BYTES_PER_VECTOR * satellitesCount * datesCount * 2 + Int32Array.BYTES_PER_ELEMENT * satellitesCount * datesCount;
  }

  run(
    satellitesPointer: number,
    satellitesCount: number,
    datesPointer: number,
    datesCount: number,
  ): void {
    const velocitiesPointer = this.outputPointer + BYTES_PER_VECTOR * this.satellitesCount * this.datesCount;
    const errorsPointer = velocitiesPointer + BYTES_PER_VECTOR * this.satellitesCount * this.datesCount;
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

export class GmstCalculator implements Calculator<'gmst', 0, [], { gmst: Float64Array }, number> {
  readonly name = 'gmst';
  readonly dependencies: [] = [];

  private module!: MainModule;
  private outputPointer!: number;
  private datesCount!: number;

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.datesCount = datesCount;
  }

  run(satellitesPointer: number, satellitesCount: number, datesPointer: number, datesCount: number, dependenciesOutputsPointers: []): void {
    this.module._calculate_gmst(datesPointer, datesCount, this.outputPointer);
  }

  getRawOutput(): { gmst: Float64Array } {
    return {
      gmst: new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.datesCount),
    };
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): number {
    return this.getRawOutput().gmst[dateIndex]!;
  }
}

export interface EcfPositionFormattedOutput {
  ecfPosition: { x: number; y: number; z: number };
};

export class EcfPositionCalculator implements Calculator<'ecfPosition', 2, ['eci', 'gmst'], { ecfPosition: Float64Array }, EcfPositionFormattedOutput> {
  readonly name = 'ecfPosition';
  readonly dependencies: ['eci', 'gmst'] = ['eci', 'gmst'];

  private satellitesCount!: number;
  private datesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): EcfPositionFormattedOutput {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      ecfPosition: {
        x: rawOutput.ecfPosition[index]!,
        y: rawOutput.ecfPosition[index + 1]!,
        z: rawOutput.ecfPosition[index + 2]!,
      }
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  getRawOutput() {
    return {
      ecfPosition: new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS),
    }
  }

  run(satellitesPointer: number, satellitesCount: number, datesPointer: number, datesCount: number, dependenciesOutputsPointers: [number, number]): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    this.module._calculate_ecf_position_or_velocity(eciBasePointer, this.satellitesCount, gmstPointer, this.datesCount, this.outputPointer);
  }
}

export interface EcfVelocityFormattedOutput {
  ecfVelocity: { x: number; y: number; z: number };
};

export class EcfVelocityCalculator implements Calculator<'ecfVelocity', 2, ['eci', 'gmst'], { ecfVelocity: Float64Array }, EcfVelocityFormattedOutput> {
  readonly name = 'ecfVelocity';
  readonly dependencies: ['eci', 'gmst'] = ['eci', 'gmst'];

  private satellitesCount!: number;
  private datesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }
  getFormattedOutput(satelliteIndex: number, dateIndex: number): EcfVelocityFormattedOutput {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      ecfVelocity: {
        x: rawOutput.ecfVelocity[index]!,
        y: rawOutput.ecfVelocity[index + 1]!,
        z: rawOutput.ecfVelocity[index + 2]!,
      }
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  getRawOutput() {
    return {
      ecfVelocity: new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS),
    }
  }

  run(satellitesPointer: number, satellitesCount: number, datesPointer: number, datesCount: number, dependenciesOutputsPointers: [number, number]): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    this.module._calculate_ecf_position_or_velocity(eciBasePointer + this.satellitesCount * this.datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT, this.satellitesCount, gmstPointer, this.datesCount, this.outputPointer);
  }
}

export interface GeodeticPositionFormattedOutput {
  geodeticPosition: GeodeticLocation
};

export class GeodeticPositionCalculator implements Calculator<'geodeticPosition', 2, ['eci', 'gmst'], { geodeticPosition: Float64Array }, GeodeticPositionFormattedOutput> {
  readonly name = 'geodeticPosition';
  readonly dependencies: ['eci', 'gmst'] = ['eci', 'gmst'];

  private satellitesCount!: number;
  private datesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): GeodeticPositionFormattedOutput {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      geodeticPosition: {
        latitude: rawOutput.geodeticPosition[index]!,
        longitude: rawOutput.geodeticPosition[index + 1]!,
        height: rawOutput.geodeticPosition[index + 2]!,
      }
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  getRawOutput() {
    return {
      geodeticPosition: new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS),
    }
  }

  run(satellitesPointer: number, satellitesCount: number, datesPointer: number, datesCount: number, dependenciesOutputsPointers: [number, number]): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    this.module._calculate_geodetic_positions(eciBasePointer, this.satellitesCount, gmstPointer, this.datesCount, this.outputPointer);
  }
}

export class LookAnglesCalculator implements Calculator<'lookAngles', 1, ['ecfPosition'], { lookAngles: Float64Array }, LookAngles, { observer: GeodeticLocation }> {
  readonly name = 'lookAngles';
  readonly dependencies: ['ecfPosition'] = ['ecfPosition'];

  private satellitesCount!: number;
  private datesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): LookAngles {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex) * DIMENSIONS;
    return {
      azimuth: rawOutput.lookAngles[index]!,
      elevation: rawOutput.lookAngles[index + 1]!,
      rangeSat: rawOutput.lookAngles[index + 2]!,
    }
  }

  getRawOutput(): { lookAngles: Float64Array; } {
    return {
      lookAngles: new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS),
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  run(satellitesPointer: number, satellitesCount: number, datesPointer: number, datesCount: number, dependenciesOutputsPointers: [number], runParameters: { observer: GeodeticLocation }): void {
    const [ecfPointer] = dependenciesOutputsPointers;
    const { latitude, longitude, height } = runParameters.observer;
    this.module._calculate_look_angles(ecfPointer, this.satellitesCount, this.datesCount, longitude, latitude, height, this.outputPointer);
  }
}

export interface DopplerFactorFormattedOutput {
  dopplerFactor: number;
} 

export class DopplerFactorCalculator implements Calculator<'dopplerFactor', 2, ['ecfPosition', 'ecfVelocity'], { dopplerFactor: Float64Array }, DopplerFactorFormattedOutput, { observer: EcfVec3<Kilometer> }> {
  readonly name = 'dopplerFactor';
  readonly dependencies: ['ecfPosition', 'ecfVelocity'] = ['ecfPosition', 'ecfVelocity'];

  private satellitesCount!: number;
  private datesCount!: number;
  private module!: MainModule;
  private outputPointer!: number;

  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.satellitesCount = satellitesCount;
    this.datesCount = datesCount;
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): DopplerFactorFormattedOutput {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex);
    return {
      dopplerFactor: rawOutput.dopplerFactor[index]!,
    }
  }

  getRawOutput(): { dopplerFactor: Float64Array; } {
    return {
      dopplerFactor: new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount),
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  run(satellitesPointer: number, satellitesCount: number, datesPointer: number, datesCount: number, dependenciesOutputsPointers: [number, number], runParameters: { observer: EcfVec3<Kilometer> }): void {
    const [ecfPositionPointer, ecfVelocityPointer] = dependenciesOutputsPointers;
    const { x, y, z } = runParameters.observer;
    this.module._calculate_doppler_factor(ecfPositionPointer, ecfVelocityPointer, this.satellitesCount, this.datesCount, x, y, z, this.outputPointer);
  }
}
