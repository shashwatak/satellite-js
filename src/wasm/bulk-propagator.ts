import type { SatRec } from '../propagation/SatRec.js';
import type { MainModule } from '../../wasm-build/release/index.js';
import type { Calculator } from './calculators/calculator-interface.js';
import type { TupleOf } from './calculators/tuple-of.js';
import type { TypedArray } from './typed-array.js';
import { topologicalSort } from './toposort.js';
import { allocateNativeStructArrayFromSatrecArray } from './native-structs-from-js.js';
import { allocateDatesArray, writeDatesArray } from './date-to-wasm.js';

export type CalculatorsToFormattedOutput<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any>[]> = {
  [K in Calculators[number]['name']]: ReturnType<Extract<Calculators[number], { name: K }>['getFormattedOutput']>;
};
export type CalculatorsToRawOutput<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any>[]> = {
  [K in Calculators[number]['name']]: ReturnType<Extract<Calculators[number], { name: K }>['getRawOutput']>;
};

type RunParamsOf<C> = C extends Calculator<any, any, any, any, any, infer RP> ? RP : never;

type IsEmptyRunParams<T> = {} extends T ? (T extends {} ? true : false) : false;

type CalculatorsRunParamsByName<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any>[]> = {
  [C in Calculators[number] as C extends { name: infer Name extends string }
    ? (IsEmptyRunParams<RunParamsOf<C>> extends true ? never : Name)
    : never]: RunParamsOf<C>
};

type BulkPropagatorRunArgs = { dates: readonly Date[] }

type BulkPropagatorRunArgsWithCalculatorParams<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any>[]> = BulkPropagatorRunArgs & CalculatorsRunParamsByName<Calculators>;

function ceilToMultipleOf64Bit(bytes: number): number {
  const bytesPer64Bit = 8;
  return Math.ceil(bytes / bytesPer64Bit) * bytesPer64Bit;
}

export class BulkPropagator<const Calculators extends readonly Calculator<string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, unknown>[]> implements Disposable {
  private readonly calculators: Calculators;
  private readonly satrecsPointer: number;
  private readonly satrecsCount: number;
  private readonly datesPointer: number;
  private readonly datesCount: number;
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
    this.datesCount = datesCount;

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
    if (args.dates.length !== this.datesCount) {
      throw new Error('length of `dates` must be the same as the `datesCount` passed to the BulkPropagator constructor');
    }
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

  getFormattedOutput(satelliteIndex: number, dateIndex: number): CalculatorsToFormattedOutput<Calculators> | undefined {
    if (satelliteIndex >= this.satrecsCount || dateIndex >= this.datesCount) {
      return undefined;
    }
    const result: Record<string, unknown> = {};
    for (const calculator of this.calculators) {
      const output = calculator.getFormattedOutput(satelliteIndex, dateIndex);
      result[calculator.name] = output;
    }
    return result as CalculatorsToFormattedOutput<Calculators>;
  }

  getRawOutput(): CalculatorsToRawOutput<Calculators> {
    const result: Record<string, unknown> = {}
    for (const calculator of this.calculators) {
      const output = calculator.getRawOutput();
      result[calculator.name] = output;
    }
    return result as CalculatorsToRawOutput<Calculators>;
  }

  dispose(): void {
    this.module._free(this.satrecsPointer);
    this.module._free(this.outputPointer);
    this.module._free(this.datesPointer);
  }

  [Symbol.dispose]!: () => void
}
