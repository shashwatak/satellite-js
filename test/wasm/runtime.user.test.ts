import { describe, expect, it } from 'vitest';
import createMultiThreadModule from 'wasm-module-multi-thread/index.js';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import { twoline2satrec } from '../../src/io.js';
import { BulkPropagator, EciBaseCalculator } from '../../src/wasm/index.js';
import type { RunData } from '../../src/wasm/run-data.js';
import { createMultiThreadRuntimeFromModule } from '../../src/wasm/runtimes/multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from '../../src/wasm/runtimes/single-thread-runtime.js';
import type { WasmRuntime } from '../../src/wasm/runtimes/wasm-runtime.js';

// Every test creates its own module: once a runtime has exited, its module
// cannot be used again. Emscripten calls a module's onExit only when its
// runtime really exits, so `exits` records real exits, not just attempts.
const createRuntime = {
  'single-thread': async (exits: number[]) =>
    createSingleThreadRuntimeFromModule(
      await createSingleThreadModule({
        onExit: (code: number) => exits.push(code),
      }),
    ),
  'multi-thread': async (exits: number[]) =>
    createMultiThreadRuntimeFromModule(
      await createMultiThreadModule({
        onExit: (code: number) => exits.push(code),
      }),
      { threadsCount: 2 },
    ),
};

const satRec = twoline2satrec(
  '1 25544U 98067A   25191.49368601  .00007939  00000-0  14455-3 0  9995',
  '2 25544  51.6350 191.5447 0002161   1.4001 135.0516 15.50469967518770',
);

function newPropagator<Runtime extends WasmRuntime>(runtime: Runtime) {
  const bp = new BulkPropagator({
    runtime,
    calculators: [new EciBaseCalculator()],
    satRecsCount: 1,
    datesCount: 1,
  });
  bp.setSatRecs([satRec]);
  bp.setDates([new Date('2025-07-10T12:00:00Z')]);
  return bp;
}

// Propagate once, so the runtime has done real work (and the multi-thread
// runtime has started its worker threads) before it is disposed.
async function propagateOnce(runtime: WasmRuntime) {
  using bp = newPropagator(runtime);
  await bp.run();
}

describe.each(Object.entries(createRuntime))(
  '%s runtime disposal',
  (_name, create) => {
    it('exits the runtime without throwing or changing process.exitCode', async () => {
      const exits: number[] = [];
      const runtime = await create(exits);
      await propagateOnce(runtime);
      const exitCode = process.exitCode;
      process.exitCode = 3;
      let exitCodeAfterDispose: typeof process.exitCode;
      try {
        expect(() => runtime.dispose()).not.toThrow();
      } finally {
        exitCodeAfterDispose = process.exitCode;
        process.exitCode = exitCode;
      }
      expect(exitCodeAfterDispose).toBe(3);
      expect(exits).toEqual([0]);
    });

    it('is disposed at the end of a `using` scope, and a second dispose() does nothing', async () => {
      const exits: number[] = [];
      const runtime = await (async () => {
        using runtime = await create(exits);
        await propagateOnce(runtime);
        return runtime;
      })();
      expect(exits).toEqual([0]);

      expect(() => runtime.dispose()).not.toThrow();
      expect(exits).toEqual([0]);
    });

    it('rethrows anything other than a clean exit, and still restores process.exitCode', async () => {
      const runtime = await create([]);
      // What Emscripten does on a non-zero exit under Node, for example when
      // LeakSanitizer finds a leak in the debug build.
      const failedExit = {
        name: 'ExitStatus',
        message: 'Program terminated with exit(1)',
        status: 1,
      };
      runtime.module._exit_runtime = () => {
        process.exitCode = 1;
        throw failedExit;
      };
      const exitCode = process.exitCode;
      process.exitCode = 3;
      let thrown: unknown;
      let exitCodeAfterDispose: typeof process.exitCode;
      try {
        runtime.dispose();
      } catch (error) {
        thrown = error;
      } finally {
        exitCodeAfterDispose = process.exitCode;
        process.exitCode = exitCode;
      }
      expect(thrown).toBe(failedExit);
      expect(exitCodeAfterDispose).toBe(3);
    });
  },
);

describe('multi-thread runtime disposal during a computation', () => {
  // Emscripten cannot exit while an async call keeps the runtime alive, but it
  // still throws the ExitStatus(0) of a clean exit, so dispose() must refuse.
  it('throws a clear error and leaves the runtime alive, so a later dispose() exits it', async () => {
    const exits: number[] = [];
    const runtime = await createRuntime['multi-thread'](exits);
    const bp = newPropagator(runtime);
    const run = bp.run();

    expect(() => runtime.dispose()).toThrow('while a computation is running');
    expect(exits).toEqual([]);

    await run;
    bp.dispose();
    runtime.dispose();
    expect(exits).toEqual([0]);
  });

  it('is not left running when the run data cannot be written, so dispose() still exits it', async () => {
    const exits: number[] = [];
    const runtime = await createRuntime['multi-thread'](exits);
    const runDataPointer = runtime.module._malloc(
      runtime.module._get_rundata_size(),
    );
    // A value of the wrong type makes writing the run data into WASM memory
    // throw, before the C++ computation starts.
    const badRunData = { satellitesCount: 'one' } as unknown as RunData;
    try {
      await expect(runtime.compute(badRunData, runDataPointer)).rejects.toThrow(
        'satellitesCount',
      );
    } finally {
      runtime.module._free(runDataPointer);
    }

    runtime.dispose();
    expect(exits).toEqual([0]);
  });
});
