import type { WasmModuleBase } from './wasm-module-interfaces.js';

/**
 * Creates a runtime's `dispose()`: it exits the module's Emscripten runtime
 * once (in the multi-thread build this terminates its worker threads), and
 * later calls do nothing.
 *
 * Emscripten's `exit()` unwinds by throwing an `ExitStatus` object, and under
 * Node it also sets `process.exitCode`. A clean exit (status 0) is the expected
 * outcome of disposal, so that throw is caught; anything else, such as the
 * non-zero status LeakSanitizer reports in the debug build, is rethrown. The
 * host's `process.exitCode` is restored either way, because disposing a runtime
 * must not change how the process exits.
 *
 * Emscripten throws the same `ExitStatus(0)` when it declines to exit because
 * an async call is keeping the runtime alive, so this must not be called while
 * a computation is running; the multi-thread runtime checks that first.
 */
export function createRuntimeDispose(wasmModule: WasmModuleBase): () => void {
  let isDisposed = false;
  return () => {
    if (isDisposed) return;
    isDisposed = true;

    const nodeProcess = (
      globalThis as {
        process?: { exitCode?: number | string | null | undefined };
      }
    ).process;
    const exitCode = nodeProcess?.exitCode;
    try {
      wasmModule._exit_runtime();
    } catch (error) {
      if (!isCleanExit(error)) {
        throw error;
      }
    } finally {
      if (nodeProcess) {
        nodeProcess.exitCode = exitCode;
      }
    }
  };
}

function isCleanExit(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'ExitStatus' &&
    'status' in error &&
    error.status === 0
  );
}
