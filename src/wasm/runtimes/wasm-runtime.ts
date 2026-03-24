import { RunData } from '../run-data.js';
import { WasmModuleMultiThread, WasmModuleSingleThread } from './wasm-module-interfaces.js';

export interface BaseWasmRuntime extends Disposable {
  mode: string;
  dispose(): void;
}

export interface SingleThreadRuntime extends BaseWasmRuntime {
  readonly mode: 'single';
  module: WasmModuleSingleThread;
  compute(runData: RunData, runDataPointer: number): void;
}

export interface MultiThreadRuntime extends BaseWasmRuntime {
  readonly mode: 'multi';
  module: WasmModuleMultiThread;
  compute(runData: RunData, runDataPointer: number): Promise<void>;
  dispose(): void;
  [Symbol.dispose](): void;
}

export type WasmRuntime = SingleThreadRuntime | MultiThreadRuntime;
