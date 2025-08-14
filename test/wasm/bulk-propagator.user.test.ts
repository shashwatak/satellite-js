import { describe, it, expect } from 'vitest';
import WasmModuleFactory, { type MainModule } from 'wasm-module/index.js';
import { BulkPropagator } from '../../src/wasm-wrapping/calculations/bulk-propagator.js';
import { EciBaseCalculator } from '../../src/wasm-wrapping/calculations/calculators.js';
import { twoline2satrec } from '../../src/io.js';

const module: MainModule = await WasmModuleFactory();

const TLE1 = '1 25544U 98067A   20344.91782528  .00001264  00000-0  29621-4 0  9993';
const TLE2 = '2 25544  51.6466  54.5795 0002012  70.2257  59.7266 15.49390871257157';

const sat = twoline2satrec(TLE1, TLE2);

const dates = [new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:10:00Z')];

describe('BulkPropagator user-facing API', () => {
  it('propagates and returns finite values', async () => {
    using bp = new BulkPropagator({
      wasmModule: module,
      calculators: [new EciBaseCalculator()],
      satRecs: [sat],
      datesCount: 2,
    });

    bp.run(dates);

    const out0 = bp.getFormattedOutput(0, 0).eci;
    const out1 = bp.getFormattedOutput(0, 1).eci;

    expect(Number.isFinite(out0.position.x)).toBe(true);
    expect(Number.isFinite(out1.velocity.y)).toBe(true);
  });
});
