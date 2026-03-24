import type { WasmModuleBase } from '../runtimes/wasm-module-interfaces.js';
import type { TupleOf } from './tuple-of.js';
import type { TypedArray } from '../typed-array.js';
import type { RunData } from '../run-data.js';

export interface Calculator<
  Name extends string,
  DependenciesCount extends number,
  Dependencies extends TupleOf<string, DependenciesCount>,
  RawOutputs extends TypedArray | Record<string, TypedArray>,
  FormattedOutput,
  RunParameters extends Record<string, unknown> = {},
  ExecutionDescriptor extends Partial<RunData> = Partial<RunData>
> {
  readonly name: Name;
  readonly dependencies: Dependencies;
  init(
    module: WasmModuleBase,
    outputPointer: number,
    satellitesCount: number,
    datesCount: number
  ): void;
  getFormattedOutput(satelliteIndex: number, dateIndex: number): FormattedOutput;
  getOutputBufferSize(satellitesCount: number, datesCount: number): number;
  getRawOutput(): RawOutputs;
  getExecutionDescriptor(runParameters: RunParameters): ExecutionDescriptor;
}
