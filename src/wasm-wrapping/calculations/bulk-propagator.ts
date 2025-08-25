import { SatRec } from '../../propagation/SatRec.js';
import { topologicalSort } from './toposort.js';

import type { MainModule } from '../../../wasm-build/release/index.js';
import { allocateNativeStructArrayFromSatrecArray } from '../native-struct.js';
import { allocateDatesArray, writeDatesArray } from '../date-to-wasm.js';
import type { Calculator } from './calculator.js';
import type { TupleOf } from './tuple-of.js';
import type { TypedArray } from './typed-array.js';

// Map calculator names to their formatted output type
type CalculatorsToFormattedOutput<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, Record<string, TypedArray>, any, any>[]> = {
  [K in Calculators[number]['name']]: ReturnType<Extract<Calculators[number], { name: K }>['getFormattedOutput']>;
};

type RunParamsOf<C> = C extends Calculator<any, any, any, any, any, infer RP> ? RP : never;

// Helper type to check if RunParams is effectively empty
type IsEmptyRunParams<T> = {} extends T ? (T extends {} ? true : false) : false;

type CalculatorsRunParamsByName<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, Record<string, TypedArray>, any, any>[]> = {
  [C in Calculators[number] as C extends { name: infer Name extends string }
    ? (IsEmptyRunParams<RunParamsOf<C>> extends true ? never : Name)
    : never]: RunParamsOf<C>
};

type BulkPropagatorRunArgs = { dates: readonly Date[] }

type BulkPropagatorRunArgsWithCalculatorParams<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, Record<string, TypedArray>, any, any>[]> = BulkPropagatorRunArgs & CalculatorsRunParamsByName<Calculators>;

function ceilToMultipleOf64Bit(bytes: number): number {
  const bytesPer64Bit = 8;
  return Math.ceil(bytes / bytesPer64Bit) * bytesPer64Bit;
}

export class BulkPropagator<const Calculators extends readonly Calculator<string, number, TupleOf<string, number>, Record<string, TypedArray>, unknown>[]> {
  private readonly calculators: Calculators;
  private readonly satrecsPointer: number;
  private readonly satrecsCount: number;
  private readonly datesPointer: number;
  private readonly module: MainModule;
  private readonly outputPointer: number;
  private readonly outputPointersByCalculator: Map<Calculators[number]['name'], number>;
  private readonly calculatorDependenciesOutputsPointers: Map<Calculators[number]['name'], number[]>;

  constructor({
    wasmModule,
    calculators,
    satRecs,
    datesCount: datesCount,
  }: {
    wasmModule: MainModule;
    calculators: Calculators;
    satRecs: SatRec[];
    datesCount: number;
  }) {
    this.module = wasmModule;
    if (Symbol.dispose) {
      this[Symbol.dispose] = () => this.dispose();
    }

    this.satrecsPointer = allocateNativeStructArrayFromSatrecArray(wasmModule, satRecs);
    this.satrecsCount = satRecs.length;
    this.datesPointer = allocateDatesArray(wasmModule, datesCount);

    const sorted = topologicalSort(calculators.map(calculator => ({ provides: calculator.name, hasDependencies: calculator.dependencies })));
    this.calculators = sorted.map(name => {
      const calculator = calculators.find(calc => calc.name === name);
      return calculator;
    }) as unknown as Calculators;

    const outputOffsetsByCalculator = new Map();
    let offsetBytes = 0;
    for (const calculator of this.calculators) {
      const sizeBytes = ceilToMultipleOf64Bit(calculator.getOutputBufferSize(satRecs.length, datesCount));
      outputOffsetsByCalculator.set(calculator.name, offsetBytes);
      offsetBytes += sizeBytes;
    } ;
    // offsetBytes is total size at this point
    this.outputPointer = wasmModule._malloc(offsetBytes);
    this.outputPointersByCalculator = new Map(Array.from(outputOffsetsByCalculator).map(([name, offset]) => [name, this.outputPointer + offset]));
    this.calculatorDependenciesOutputsPointers = new Map();
    for (const calculator of this.calculators) {
      const dependenciesPointers = calculator.dependencies.map(dependency => this.outputPointersByCalculator.get(dependency)!);
      this.calculatorDependenciesOutputsPointers.set(calculator.name, dependenciesPointers);

      calculator.init(wasmModule, this.outputPointersByCalculator.get(calculator.name)!, satRecs.length, datesCount);
    }
  }

  run(args: BulkPropagatorRunArgsWithCalculatorParams<Calculators>) {
    writeDatesArray(this.module, this.datesPointer, args.dates);

    for (const calculator of this.calculators) {
      const runParams = (args as Record<string, RunParamsOf<Calculators>> & BulkPropagatorRunArgs)[calculator.name];
      calculator.run(
        this.satrecsPointer,
        this.satrecsCount,
        this.datesPointer,
        args.dates.length,
        this.calculatorDependenciesOutputsPointers.get(calculator.name)!,
        runParams ?? {}
      );
    }
  }

  getFormattedOutput(satelliteIndex: number, dateIndex: number): CalculatorsToFormattedOutput<Calculators> {
    const result: Record<string, unknown> = {};
    for (const calculator of this.calculators) {
      const output = calculator.getFormattedOutput(satelliteIndex, dateIndex);
      result[calculator.name] = output;
    }
    return result as CalculatorsToFormattedOutput<Calculators>;
  }

  dispose(): void {
    this.module._free(this.satrecsPointer);
    this.module._free(this.outputPointer);
    this.module._free(this.datesPointer);
  }

  [Symbol.dispose]!: () => void
}
