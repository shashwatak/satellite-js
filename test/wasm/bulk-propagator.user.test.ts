import { describe, it, expect } from 'vitest';
import WasmModuleFactory from 'wasm-module/index.js';
import { BulkPropagator } from '../../src/wasm-wrapping/calculations/bulk-propagator.js';
import { EciBaseCalculator } from '../../src/wasm-wrapping/calculations/calculators.js';
import { twoline2satrec } from '../../src/io.js';
import { propagate } from '../../src/propagation.js';
import compareVectors from '../compareVectors.js';

const module = await WasmModuleFactory();

const TLE1_1 = '1 25544U 98067A   25191.49368601  .00007939  00000-0  14455-3 0  9995';
const TLE1_2 = '2 25544  51.6350 191.5447 0002161   1.4001 135.0516 15.50469967518770';

const TLE2_1 = "1     5U 58002B   25189.55838196 -.00000055  00000-0 -47510-4 0  9993";
const TLE2_2 = "2     5  34.2469 294.9296 1841370  29.1499 340.0354 10.85926006406011";

const satRecs = [twoline2satrec(TLE1_1, TLE1_2), twoline2satrec(TLE2_1, TLE2_2)];

const dates = [new Date('2025-07-11T00:00:12.345'), new Date('2025-07-12T00:00:12.345')] as const;

describe('BulkPropagator user-facing API', () => {
  it('propagates and returns finite values', () => {
    using bp = new BulkPropagator({
      wasmModule: module,
      calculators: [new EciBaseCalculator()],
      satRecs: satRecs,
      datesCount: dates.length,
    });
    bp.run(dates);

    const out0 = bp.getFormattedOutput(0, 0).eci;
    const out1 = bp.getFormattedOutput(0, 1).eci;

    expect(Number.isFinite(out0.position.x)).toBe(true);
    expect(Number.isFinite(out1.velocity.y)).toBe(true);
  });

  it('returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      wasmModule: module,
      calculators: [new EciBaseCalculator()],
      satRecs: satRecs,
      datesCount: dates.length,
    });
    bp.run(dates);
    
    const pureJsResults = satRecs.flatMap(satRec => dates.map(date => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap((satRec, i) => dates.map((date, j) => bp.getFormattedOutput(i, j).eci));

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });
  });
});
