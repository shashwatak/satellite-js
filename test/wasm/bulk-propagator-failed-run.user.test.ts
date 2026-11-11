import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import createMultiThreadModule from 'wasm-module-multi-thread/index.js';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import type { GeodeticLocation } from '../../src/common-types.js';
import { twoline2satrec } from '../../src/io.js';
import {
  BulkPropagator,
  EcfPositionCalculator,
  EciBaseCalculator,
  GmstCalculator,
  LookAnglesCalculator,
} from '../../src/wasm/index.js';
import { createMultiThreadRuntimeFromModule } from '../../src/wasm/runtimes/multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from '../../src/wasm/runtimes/single-thread-runtime.js';
import type { WasmRuntime } from '../../src/wasm/runtimes/wasm-runtime.js';

const satRec = twoline2satrec(
  '1 25544U 98067A   25191.49368601  .00007939  00000-0  14455-3 0  9995',
  '2 25544  51.6350 191.5447 0002161   1.4001 135.0516 15.50469967518770',
);
const dates = [new Date('2025-07-10T12:00:00Z')];
const observer = { latitude: 0.7, longitude: -1.2, height: 0.1 };
// A JavaScript caller can leave out the height; writing the run data into WASM
// memory then throws, so the run fails before the C++ computation starts.
const observerWithoutHeight = {
  latitude: 0.7,
  longitude: -1.2,
} as GeodeticLocation;

function newPropagator<Runtime extends WasmRuntime>(runtime: Runtime) {
  const bp = new BulkPropagator({
    runtime,
    calculators: [
      new EciBaseCalculator(),
      new GmstCalculator(),
      new EcfPositionCalculator(),
      new LookAnglesCalculator(),
    ],
    satRecsCount: 1,
    datesCount: dates.length,
  });
  bp.setSatRecs([satRec]);
  bp.setDates(dates);
  return bp;
}

async function newMultiThreadRuntime() {
  return createMultiThreadRuntimeFromModule(await createMultiThreadModule(), {
    threadsCount: 2,
  });
}

// A multi-thread runtime that records each free and its exit in `events`, in
// order.
async function newRecordingMultiThreadRuntime(events: string[]) {
  const module = await createMultiThreadModule({
    onExit: () => events.push('exit'),
  });
  const free = module._free.bind(module);
  module._free = (pointer: number) => {
    events.push('free');
    free(pointer);
  };
  return createMultiThreadRuntimeFromModule(module, { threadsCount: 2 });
}

const nextMacrotask = () => new Promise((resolve) => setTimeout(resolve, 20));

// Records unhandled rejections during each test. While this listener is
// attached, Vitest leaves unhandled rejections to it, so every test ends by
// checking that none are left. A rejection counts as unhandled once the
// microtasks after it have run, so the check waits a macrotask first.
let unhandled: unknown[] = [];
const recordUnhandled = (reason: unknown) => {
  unhandled.push(reason);
};
beforeEach(() => {
  unhandled = [];
  process.on('unhandledRejection', recordUnhandled);
});
afterEach(async () => {
  await nextMacrotask();
  process.off('unhandledRejection', recordUnhandled);
  expect(unhandled).toEqual([]);
});

describe('BulkPropagator after a failed run', () => {
  it('multi-thread: rejects for the caller only, and the propagator keeps working', async () => {
    using runtime = await newMultiThreadRuntime();
    using bp = newPropagator(runtime);

    await expect(
      bp.run({ lookAngles: { observer: observerWithoutHeight } }),
    ).rejects.toThrow('heightKm');
    await nextMacrotask();
    expect(unhandled).toEqual([]);

    expect(() => bp.setSatRecs([satRec])).not.toThrow();
    expect(() => bp.setDates(dates)).not.toThrow();
    await expect(bp.run({ lookAngles: { observer } })).resolves.toBeUndefined();
  });

  it('multi-thread: a failure that nobody handles is still reported, once', async () => {
    using runtime = await newMultiThreadRuntime();
    using bp = newPropagator(runtime);

    // Nobody handles the promise this run returns.
    bp.run({ lookAngles: { observer: observerWithoutHeight } });
    await nextMacrotask();
    expect(unhandled).toHaveLength(1);
    expect(String(unhandled[0])).toContain('heightKm');
    // This one was expected; the check after the test covers anything else.
    unhandled = [];
  });

  it('single-thread: throws to the caller, and the propagator keeps working', async () => {
    using runtime = await createSingleThreadRuntimeFromModule(
      await createSingleThreadModule(),
    );
    using bp = newPropagator(runtime);

    expect(() =>
      bp.run({ lookAngles: { observer: observerWithoutHeight } }),
    ).toThrow('heightKm');

    expect(() => bp.setSatRecs([satRec])).not.toThrow();
    expect(() => bp.setDates(dates)).not.toThrow();
    expect(() => bp.run({ lookAngles: { observer } })).not.toThrow();
  });
});

describe('BulkPropagator disposed during a run', () => {
  it('frees its memory before code awaiting the run resumes, so before the runtime exits', async () => {
    const events: string[] = [];
    const runtime = await newRecordingMultiThreadRuntime(events);
    const bp = newPropagator(runtime);
    events.length = 0;

    const run = bp.run({ lookAngles: { observer } });
    bp.dispose();
    // The run still uses the memory, so dispose() must not free it right away.
    events.push('dispose returned');
    await run;
    runtime.dispose();

    expect(events).toEqual([
      'dispose returned',
      'free',
      'free',
      'free',
      'free',
      'exit',
    ]);
  });

  it('does the same when the run fails, and leaves no unhandled rejection', async () => {
    const events: string[] = [];
    const runtime = await newRecordingMultiThreadRuntime(events);
    const bp = newPropagator(runtime);
    events.length = 0;

    const run = bp.run({ lookAngles: { observer: observerWithoutHeight } });
    bp.dispose();
    events.push('dispose returned');
    await expect(run).rejects.toThrow('heightKm');
    runtime.dispose();

    expect(events).toEqual([
      'dispose returned',
      'free',
      'free',
      'free',
      'free',
      'exit',
    ]);
    await nextMacrotask();
    expect(unhandled).toEqual([]);
  });
});
