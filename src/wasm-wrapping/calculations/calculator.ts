import type { MainModule } from '../../../wasm-build/release/index.js';
import type { TupleOf } from './tuple-of.js';
import type { TypedArray } from './typed-array.js';

export interface Calculator<
  Name extends string,
  DependenciesCount extends number,
  Dependencies extends TupleOf<string, DependenciesCount>,
  RawOutputs extends Record<string, TypedArray>,
  FormattedOutput,
  RunParameters extends Record<string, unknown> = {}
> {
  readonly name: Name;
  readonly dependencies: Dependencies;
  init(module: MainModule, outputPointer: number, satellitesCount: number, datesCount: number): void;
  getFormattedOutput(satelliteIndex: number, dateIndex: number): FormattedOutput;
  getOutputBufferSize(satellitesCount: number, datesCount: number): number;
  getRawOutput(): RawOutputs;
  run(
    elsetrecsPointer: number,
    elsetrecsCount: number,
    datesPointer: number,
    datesCount: number,
    dependenciesOutputsPointers: TupleOf<number, DependenciesCount>,
    runParameters: RunParameters
  ): void;
}