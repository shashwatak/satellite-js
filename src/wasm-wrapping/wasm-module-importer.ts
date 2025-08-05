import DebugModuleFactory from '../../wasm-build/debug/index.js';
import ReleaseModuleFactory from '../../wasm-build/release/index.js';

let wasmModuleFactory: typeof DebugModuleFactory | typeof ReleaseModuleFactory;
if (process?.env['NODE_ENV'] === 'development') {
  wasmModuleFactory = DebugModuleFactory;
} else {
  wasmModuleFactory = ReleaseModuleFactory;
}

export default wasmModuleFactory;
