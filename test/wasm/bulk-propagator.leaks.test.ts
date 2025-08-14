import { describe, it, expect } from 'vitest';
import WasmModuleFactory from 'wasm-module/index.js';
import { BulkPropagator } from '../../src/wasm-wrapping/calculations/bulk-propagator.js';
import { EciBaseCalculator } from '../../src/wasm-wrapping/calculations/calculators.js';
import { twoline2satrec } from '../../src/io.js';

const module = await WasmModuleFactory();

const TLE1 = '1 25544U 98067A   20344.91782528  .00001264  00000-0  29621-4 0  9993';
const TLE2 = '2 25544  51.6466  54.5795 0002012  70.2257  59.7266 15.49390871257157';

const sat = twoline2satrec(TLE1, TLE2);

const dates = [new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:10:00Z')];

describe('BulkPropagator memory disposal', () => {
  it('supports using-syntax disposal', () => {
    {
      using bp = new BulkPropagator({
        wasmModule: module,
        calculators: [new EciBaseCalculator()],
        satRecs: [sat],
        datesCount: 2,
      });
      bp.run(dates);
      const out = bp.getFormattedOutput(0, 0).eci;
      expect(out).toHaveProperty('position');
      expect(module.___lsan_do_recoverable_leak_check()).not.toBe(0);
    }

    expect(module.___lsan_do_recoverable_leak_check()).toBe(0);
  });

  it('supports manual disposal', () => {
    const bp = new BulkPropagator({
      wasmModule: module,
      calculators: [new EciBaseCalculator()],
      satRecs: [sat],
      datesCount: 2,
    });
    bp.run(dates);
    const out = bp.getFormattedOutput(0, 0).eci;
    expect(out).toHaveProperty('position');
    expect(module.___lsan_do_recoverable_leak_check()).not.toBe(0);

    bp.dispose();
    expect(module.___lsan_do_recoverable_leak_check()).toBe(0);
  });
});
