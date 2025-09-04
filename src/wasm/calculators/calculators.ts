import type { MainModule } from '../../../wasm-build/release/index.js';
import type { EcfVec3, GeodeticLocation, Kilometer, LookAngles } from '../../common-types.js';
import type { SatRecError } from '../../propagation/SatRec.js';
import type { Calculator } from './calculator-interface.js';

const DIMENSIONS = 3;
const BYTES_PER_VECTOR = DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;

export interface EciBaseFormattedOutput {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  error: SatRecError;
};

export class EciBaseCalculator implements Calculator<'eci', 0, [], { position: Float64Array, velocity: Float64Array, error: Int8Array }, EciBaseFormattedOutput> {
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
    const velocity = new Float64Array(this.module.HEAP8.buffer, position.byteOffset + position.byteLength, vectorsSize)
    const error = new Int8Array(this.module.HEAP8.buffer, velocity.byteOffset + velocity.byteLength, this.satellitesCount * this.datesCount);
    return {
      position,
      velocity,
      error,
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return BYTES_PER_VECTOR * satellitesCount * datesCount * 2 + Int8Array.BYTES_PER_ELEMENT * satellitesCount * datesCount;
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

export class GmstCalculator implements Calculator<'gmst', 0, [], Float64Array, number> {
  readonly name = 'gmst';
  readonly dependencies: [] = [];

  private module!: MainModule;
  private outputPointer!: number;
  private datesCount!: number;

  getOutputBufferSize(_satellitesCount: number, datesCount: number): number {
    return datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  init(module: MainModule, outputPointer: number, _satellitesCount: number, datesCount: number): void {
    this.module = module;
    this.outputPointer = outputPointer;
    this.datesCount = datesCount;
  }

  run(_satellitesPointer: number, _satellitesCount: number, datesPointer: number, datesCount: number): void {
    this.module._calculate_gmst(datesPointer, datesCount, this.outputPointer);
  }

  getRawOutput(): Float64Array {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.datesCount);
  }

  getFormattedOutput(_satelliteIndex: number, dateIndex: number): number {
    return this.getRawOutput()[dateIndex]!;
  }
}

export interface EcfPositionFormattedOutput {
  x: number; y: number; z: number
};

export class EcfPositionCalculator implements Calculator<'ecfPosition', 2, ['eci', 'gmst'], Float64Array, EcfPositionFormattedOutput> {
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
      x: rawOutput[index]!,
      y: rawOutput[index + 1]!,
      z: rawOutput[index + 2]!,
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  getRawOutput() {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS);
  }

  run(_satellitesPointer: number, _satellitesCount: number, _datesPointer: number, _datesCount: number, dependenciesOutputsPointers: [number, number]): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    this.module._calculate_ecf_position_or_velocity(eciBasePointer, this.satellitesCount, gmstPointer, this.datesCount, this.outputPointer);
  }
}

export interface EcfVelocityFormattedOutput {
  x: number; y: number; z: number
};

export class EcfVelocityCalculator implements Calculator<'ecfVelocity', 2, ['eci', 'gmst'], Float64Array, EcfVelocityFormattedOutput> {
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
      x: rawOutput[index]!,
      y: rawOutput[index + 1]!,
      z: rawOutput[index + 2]!,
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  getRawOutput() {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS)
  }

  run(_satellitesPointer: number, _satellitesCount: number, _datesPointer: number, _datesCount: number, dependenciesOutputsPointers: [number, number]): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    this.module._calculate_ecf_position_or_velocity(eciBasePointer + this.satellitesCount * this.datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT, this.satellitesCount, gmstPointer, this.datesCount, this.outputPointer);
  }
}

export type GeodeticPositionFormattedOutput = GeodeticLocation;

export class GeodeticPositionCalculator implements Calculator<'geodeticPosition', 2, ['eci', 'gmst'], Float64Array, GeodeticPositionFormattedOutput> {
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
      latitude: rawOutput[index]!,
      longitude: rawOutput[index + 1]!,
      height: rawOutput[index + 2]!,
    }
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  getRawOutput() {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS)
  }

  run(_satellitesPointer: number, _satellitesCount: number, _datesPointer: number, _datesCount: number, dependenciesOutputsPointers: [number, number]): void {
    const [eciBasePointer, gmstPointer] = dependenciesOutputsPointers;
    this.module._calculate_geodetic_positions(eciBasePointer, this.satellitesCount, gmstPointer, this.datesCount, this.outputPointer);
  }
}

export type LookAnglesFormattedOutput = LookAngles;

export class LookAnglesCalculator implements Calculator<'lookAngles', 1, ['ecfPosition'], Float64Array, LookAnglesFormattedOutput, { observer: GeodeticLocation }> {
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
      azimuth: rawOutput[index]!,
      elevation: rawOutput[index + 1]!,
      rangeSat: rawOutput[index + 2]!,
    }
  }

  getRawOutput() {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount * DIMENSIONS)
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * DIMENSIONS * Float64Array.BYTES_PER_ELEMENT;
  }

  run(_satellitesPointer: number, _satellitesCount: number, _datesPointer: number, _datesCount: number, dependenciesOutputsPointers: [number], runParameters: { observer: GeodeticLocation }): void {
    const [ecfPointer] = dependenciesOutputsPointers;
    const { latitude, longitude, height } = runParameters.observer;
    this.module._calculate_look_angles(ecfPointer, this.satellitesCount, this.datesCount, longitude, latitude, height, this.outputPointer);
  }
}

export class DopplerFactorCalculator implements Calculator<'dopplerFactor', 2, ['ecfPosition', 'ecfVelocity'], Float64Array, number, { observer: EcfVec3<Kilometer> }> {
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

  getFormattedOutput(satelliteIndex: number, dateIndex: number): number {
    const rawOutput = this.getRawOutput();
    const index = (satelliteIndex * this.datesCount + dateIndex);
    return rawOutput[index]!
  }

  getRawOutput() {
    return new Float64Array(this.module.HEAP8.buffer, this.outputPointer, this.satellitesCount * this.datesCount)
  }

  getOutputBufferSize(satellitesCount: number, datesCount: number): number {
    return satellitesCount * datesCount * Float64Array.BYTES_PER_ELEMENT;
  }

  run(_satellitesPointer: number, _satellitesCount: number, _datesPointer: number, _datesCount: number, dependenciesOutputsPointers: [number, number], runParameters: { observer: EcfVec3<Kilometer> }): void {
    const [ecfPositionPointer, ecfVelocityPointer] = dependenciesOutputsPointers;
    const { x, y, z } = runParameters.observer;
    this.module._calculate_doppler_factor(ecfPositionPointer, ecfVelocityPointer, this.satellitesCount, this.datesCount, x, y, z, this.outputPointer);
  }
}
