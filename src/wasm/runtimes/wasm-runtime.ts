import { RunData } from '../run-data.js';
import { WasmModuleMultiThread, WasmModuleSingleThread } from './wasm-module-interfaces.js';

export interface BaseWasmRuntime extends Disposable {
  mode: string;
  dispose(): void;
}

export interface SingleThreadRuntime extends BaseWasmRuntime {
  readonly mode: 'single';
  module: WasmModuleSingleThread;
  compute(runDataPointer: number): void;
}

export interface MultiThreadRuntime extends BaseWasmRuntime {
  readonly mode: 'multi';
  module: WasmModuleMultiThread;
  compute(runData: RunData): Promise<void>;
  isBusy(): boolean;
  dispose(): void;
  [Symbol.dispose](): void;
}

export type WasmRuntime = SingleThreadRuntime | MultiThreadRuntime;
