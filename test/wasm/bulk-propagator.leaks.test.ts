import { describe, expect, it } from 'vitest';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import { twoline2satrec } from '../../src/io.js';
import { BulkPropagator, EciBaseCalculator } from '../../src/wasm/index.js';
import { createSingleThreadRuntimeFromModule } from '../../src/wasm/runtimes/single-thread-runtime.js';
import type { SingleThreadRuntime } from '../../src/wasm/runtimes/wasm-runtime.js';

type DebugRuntime = SingleThreadRuntime & {
  module: SingleThreadRuntime['module'] & {
    ___lsan_do_recoverable_leak_check(): number;
  };
};

const runtime = (await createSingleThreadRuntimeFromModule(
  await createSingleThreadModule(),
)) as DebugRuntime;

const TLE1 =
  '1 25544U 98067A   20344.91782528  .00001264  00000-0  29621-4 0  9993';
const TLE2 =
  '2 25544  51.6466  54.5795 0002012  70.2257  59.7266 15.49390871257157';

const sat = twoline2satrec(TLE1, TLE2);

const dates = [
  new Date('2022-01-01T00:00:00Z'),
  new Date('2022-01-01T00:10:00Z'),
];

describe('BulkPropagator memory disposal', () => {
  it('supports using-syntax disposal', () => {
    {
      using bp = new BulkPropagator({
        runtime,
        calculators: [new EciBaseCalculator()],
        satRecsCount: 1,
        datesCount: 2,
      });
      bp.setSatRecs([sat]);
      bp.setDates(dates);
      expect(runtime.module.___lsan_do_recoverable_leak_check()).not.toBe(0);
      bp.run();
      // biome-ignore lint/style/noNonNullAssertion: sure to exist due to settings above
      const out = bp.getFormattedOutput(0, 0)!.eci;
      expect(out).toHaveProperty('position');
    }

    expect(runtime.module.___lsan_do_recoverable_leak_check()).toBe(0);
  });

  it('supports manual disposal', () => {
    const bp = new BulkPropagator({
      runtime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: 1,
      datesCount: 2,
    });
    bp.setSatRecs([sat]);
    bp.setDates(dates);
    bp.run();
    // biome-ignore lint/style/noNonNullAssertion: sure to exist due to settings above
    const out = bp.getFormattedOutput(0, 0)!.eci;
    expect(out).toHaveProperty('position');
    expect(runtime.module.___lsan_do_recoverable_leak_check()).not.toBe(0);

    bp.dispose();
    expect(runtime.module.___lsan_do_recoverable_leak_check()).toBe(0);
  });
});
