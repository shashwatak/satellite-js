import { bench } from 'vitest';
import WasmModuleFactory from 'wasm-module/index.js';
import { BulkPropagator } from '../src/wasm/bulk-propagator.js';
import { EciBaseCalculator } from '../src/wasm/calculators/calculators.js';
import { json2satrec, propagate, SatRecError } from '../src/index.js';
import type { OMMJsonObject } from '../src/common-types.js';
import ommData from './omm.json' with { type: 'json' };

const MAX_SATELLITES = 20000;
const DATES_COUNT = 1;
const DATE_START = new Date('2025-07-12T00:00:00.123Z');
const DATE_STEP_MS = 60 * 60 * 1000;

const satrecs = (ommData as OMMJsonObject[]).slice(0, MAX_SATELLITES).map(obj => json2satrec(obj));
const dates = Array.from({ length: DATES_COUNT }, (_, i) => new Date(DATE_START.getTime() + i * DATE_STEP_MS));

const wasmModule = await WasmModuleFactory();
// `using` here throws because benchmarks are executed separately after bp is disposed
const bp = new BulkPropagator({
  wasmModule,
  calculators: [new EciBaseCalculator()],
  satRecs: satrecs,
  datesCount: dates.length,
});

let sideEffectSink = 0; // avoid elimination of loops

bench('WASM BulkPropagator', () => {
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

export const _benchmarkGuard = () => sideEffectSink;
