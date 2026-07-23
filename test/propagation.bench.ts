/** biome-ignore-all lint/style/noNonNullAssertion: lots of index arithmetic */
import { bench, describe } from 'vitest';
import createMultiThreadModule from 'wasm-module-multi-thread/index.js';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import type { OMMJsonObject } from '../src/common-types.js';
import {
  ecfToLookAngles,
  eciToEcf,
  gstime,
  json2satrec,
  propagate,
  SatRecError,
} from '../src/index.js';
import {
  BulkPropagator,
  EcfPositionCalculator,
  EciBaseCalculator,
  GmstCalculator,
  LookAnglesCalculator,
} from '../src/wasm/index.js';
import { createMultiThreadRuntimeFromModule } from '../src/wasm/runtimes/multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from '../src/wasm/runtimes/single-thread-runtime.js';
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

const satrecs = (ommData as OMMJsonObject[]).map((obj) => json2satrec(obj));
const dates = Array.from(
  { length: DATES_COUNT },
  (_, i) => new Date(DATE_START.getTime() + i * DATE_STEP_MS),
);

// `using` here throws because benchmarks are executed separately after bp is disposed

let sideEffectSink = 0; // avoid elimination of loops

const iterationSettings = { warmupIterations: 10, iterations: 20 };

describe('ECI', () => {
  const bp = new BulkPropagator({
    runtime: singleThreadRuntime,
    calculators: [new EciBaseCalculator()],
    satRecsCount: satrecs.length,
    datesCount: dates.length,
  });
  bp.setSatRecs(satrecs);
  const multiThreadBp = new BulkPropagator({
    runtime: multiThreadRuntime,
    calculators: [new EciBaseCalculator()],
    satRecsCount: satrecs.length,
    datesCount: dates.length,
  });
  multiThreadBp.setSatRecs(satrecs);

  bench(
    'WASM Single-Thread BulkPropagator',
    () => {
      bp.setDates(dates);
      bp.run();
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
    },
    iterationSettings,
  );

  bench(
    'WASM Multi-Thread BulkPropagator',
    async () => {
      multiThreadBp.setDates(dates);
      await multiThreadBp.run();
      let local = 0;
      for (let si = 0; si < satrecs.length; si++) {
        for (let di = 0; di < dates.length; di++) {
          const out = multiThreadBp.getFormattedOutput(si, di)!.eci;
          if (out.error === SatRecError.None) {
            local += out.position.x + out.velocity.y;
          }
        }
      }
      sideEffectSink = local;
    },
    iterationSettings,
  );

  bench(
    'Pure JS propagate loop',
    () => {
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
    },
    iterationSettings,
  );
});

describe('LookAngles', () => {
  const bp = new BulkPropagator({
    runtime: singleThreadRuntime,
    calculators: [
      new EciBaseCalculator(),
      new GmstCalculator(),
      new EcfPositionCalculator(),
      new LookAnglesCalculator(),
    ],
    satRecsCount: satrecs.length,
    datesCount: dates.length,
  });
  bp.setSatRecs(satrecs);

  const multiThreadBp = new BulkPropagator({
    runtime: multiThreadRuntime,
    calculators: [
      new EciBaseCalculator(),
      new GmstCalculator(),
      new EcfPositionCalculator(),
      new LookAnglesCalculator(),
    ],
    satRecsCount: satrecs.length,
    datesCount: dates.length,
  });
  multiThreadBp.setSatRecs(satrecs);

  bench(
    'WASM LookAngles Single-Thread BulkPropagator',
    () => {
      bp.setDates(dates);
      bp.run({
        lookAngles: { observer: { longitude: 0, latitude: 0, height: 0 } },
      });
      let local = 0;
      for (let si = 0; si < satrecs.length; si++) {
        for (let di = 0; di < dates.length; di++) {
          const out = bp.getFormattedOutput(si, di);
          if (out!.eci.error === SatRecError.None) {
            local += out!.lookAngles.azimuth + out!.lookAngles.elevation;
          }
        }
      }
      sideEffectSink = local;
    },
    iterationSettings,
  );

  bench(
    'WASM LookAngles Multi-Thread BulkPropagator',
    async () => {
      multiThreadBp.setDates(dates);
      await multiThreadBp.run({
        lookAngles: { observer: { longitude: 0, latitude: 0, height: 0 } },
      });
      let local = 0;
      for (let si = 0; si < satrecs.length; si++) {
        for (let di = 0; di < dates.length; di++) {
          const out = multiThreadBp.getFormattedOutput(si, di);
          if (out!.eci.error === SatRecError.None) {
            local += out!.lookAngles.azimuth + out!.lookAngles.elevation;
          }
        }
      }
      sideEffectSink = local;
    },
    iterationSettings,
  );

  bench(
    'LookAngles Pure JS propagate loop',
    () => {
      let local = 0;
      for (const date of dates) {
        const gmst = gstime(date);
        for (const satrec of satrecs) {
          const pv = propagate(satrec, date);
          if (pv) {
            const positionEcf = eciToEcf(pv.position, gmst);
            const lookAngles = ecfToLookAngles(
              { longitude: 0, latitude: 0, height: 0 },
              positionEcf,
            );
            local += lookAngles.azimuth + lookAngles.elevation;
          }
        }
      }
      sideEffectSink = local;
    },
    iterationSettings,
  );
});

// biome-ignore lint/suspicious/noExportsInTest: deliberate sink to disable any optimization
export const benchmarkGuard = () => sideEffectSink;
