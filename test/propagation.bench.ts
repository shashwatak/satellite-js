import { bench } from 'vitest';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import createMultiThreadModule from 'wasm-module-multi-thread/index.js';
import { createSingleThreadRuntimeFromModule } from '../src/wasm/runtimes/single-thread-runtime.js';
import { createMultiThreadRuntimeFromModule } from '../src/wasm/runtimes/multi-thread-runtime.js';
import { BulkPropagator, EciBaseCalculator } from '../src/wasm/index.js';
import { json2satrec, propagate, SatRecError } from '../src/index.js';
import type { OMMJsonObject } from '../src/common-types.js';
import ommData from './omm.json' with { type: 'json' };

const singleThreadRuntime = await createSingleThreadRuntimeFromModule(
  await createSingleThreadModule(),
);
const multiThreadRuntime = await createMultiThreadRuntimeFromModule(
  await createMultiThreadModule(),
  { threadsCount: 4 },
);

const DATES_COUNT = 1;
const DATE_START = new Date('2025-07-12T00:00:00.123Z');
const DATE_STEP_MS = 60 * 60 * 1000;

const satrecs = (ommData as OMMJsonObject[])
  .map((obj) => json2satrec(obj));
const dates = Array.from(
  { length: DATES_COUNT },
  (_, i) => new Date(DATE_START.getTime() + i * DATE_STEP_MS),
);

// `using` here throws because benchmarks are executed separately after bp is disposed
const bp = new BulkPropagator({
  runtime: singleThreadRuntime,
  calculators: [new EciBaseCalculator()],
  satRecs: satrecs,
  datesCount: dates.length,
});
const multiThreadBp = new BulkPropagator({
  runtime: multiThreadRuntime,
  calculators: [new EciBaseCalculator()],
  satRecs: satrecs,
  datesCount: dates.length,
});

let sideEffectSink = 0; // avoid elimination of loops

bench('WASM Single-Thread BulkPropagator', () => {
  bp.run({ dates });
  let local = 0;
  for (let si = 0; si < satrecs.length; si++) {
    for (let di = 0; di < dates.length; di++) {
      const out = bp.getFormattedOutput(si, di)!.eci;
      if (out.error === SatRecError.None) {
        local += out.position.x + out.velocity.y;
      }
    }
  }
  sideEffectSink = local;
});

bench('WASM Multi-Thread BulkPropagator', async () => {
  await multiThreadBp.run({ dates });
  let local = 0;
  for (let si = 0; si < satrecs.length; si++) {
    for (let di = 0; di < dates.length; di++) {
      const out = bp.getFormattedOutput(si, di)!.eci;
      if (out.error === SatRecError.None) {
        local += out.position.x + out.velocity.y;
      }
    }
  }
  sideEffectSink = local;
});

bench('Pure JS propagate loop', () => {
  let local = 0;
  for (const date of dates) {
    for (const satrec of satrecs) {
      const pv = propagate(satrec, date);
      if (pv) {
        local += pv.position.x + pv.velocity.y;
      }
    }
  }
  sideEffectSink = local;
});

export const benchmarkGuard = () => sideEffectSink;
