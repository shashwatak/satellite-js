import { SatRec } from '../../propagation/SatRec.js';
import { topologicalSort } from './toposort.js';

import type { MainModule } from '../../../wasm-build/release/index.js';
import { allocateNativeStructArrayFromSatrecArray } from '../native-struct.js';
import { allocateDatesArray, writeDatesArray } from '../date-to-wasm.js';
import type { Calculator } from './calculator.js';
import type { TupleOf } from './tuple-of.js';
import type { TypedArray } from './typed-array.js';

type CalculatorsToFormattedOutput<Calculators extends readonly Calculator<string, number, TupleOf<string, number>, Record<string, TypedArray>, unknown>[]> = {
  [K in Calculators[number]['name']]: ReturnType<Extract<Calculators[number], { name: K }>['getFormattedOutput']>;
};

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
      const sizeBytes = calculator.getOutputBufferSize(satRecs.length, datesCount);
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

  run(dates: readonly Date[]) {
    writeDatesArray(this.module, this.datesPointer, dates);

    for (const calculator of this.calculators) {
      calculator.run(
        this.satrecsPointer,
        this.satrecsCount,
        this.datesPointer,
        dates.length,
        this.calculatorDependenciesOutputsPointers.get(calculator.name)!
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
