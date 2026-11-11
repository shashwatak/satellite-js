/** biome-ignore-all lint/style/noNonNullAssertion: index arithmetic */
import { describe, expect, it } from 'vitest';
import createMultiThreadModule from 'wasm-module-multi-thread/index.js';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import { twoline2satrec } from '../../src/io.js';
import { gstime } from '../../src/propagation/gstime.js';
import { propagate } from '../../src/propagation.js';
import { eciToGeodetic } from '../../src/transforms.js';
import {
  BulkPropagator,
  EciBaseCalculator,
  GeodeticPositionCalculator,
  GmstCalculator,
} from '../../src/wasm/index.js';
import { createMultiThreadRuntimeFromModule } from '../../src/wasm/runtimes/multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from '../../src/wasm/runtimes/single-thread-runtime.js';

const singleThreadRuntime = await createSingleThreadRuntimeFromModule(
  await createSingleThreadModule(),
);
const multiThreadRuntime = await createMultiThreadRuntimeFromModule(
  await createMultiThreadModule(),
  { threadsCount: 2 },
);

// A synthetic polar orbit (inclination 90 degrees) crosses the rotation axis
// every half revolution. At the first instant below it is 46 m from the axis,
// where the pre-fix height formula R / cos(latitude) - a C was off by 2.7e-8 km;
// a minute later it is 453 km away and the old formula was still 1.4e-11 km off.
// The parity tolerance of 11 digits is 5e-12 km, so this pins the kernel's
// height formula, which the mid-latitude comparisons cannot.
const satrec = twoline2satrec(
  '1 99999U 25001A   25190.50000000  .00000000  00000-0  00000-0 0  9995',
  '2 99999  90.0000   0.0000 0001000   0.0000   0.0000 15.00000000    14',
);
const dates = [
  new Date('2025-07-09T13:12:03.136Z'),
  new Date('2025-07-09T13:13:03.136Z'),
];

function expectHeightsToMatch(wasmHeightAt: (dateIndex: number) => number) {
  dates.forEach((date, j) => {
    const js = eciToGeodetic(propagate(satrec, date)!.position, gstime(date));
    expect(wasmHeightAt(j)).toBeCloseTo(js.height, 11);
  });
}

describe('GeodeticPositionCalculator over the pole', () => {
  it('matches eciToGeodetic to 11 digits on the single-thread runtime', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new GeodeticPositionCalculator(),
      ],
      satRecsCount: 1,
      datesCount: dates.length,
    });
    bp.setSatRecs([satrec]);
    bp.setDates(dates);
    bp.run();
    expectHeightsToMatch(
      (j) => bp.getFormattedOutput(0, j)!.geodeticPosition.height,
    );
  });

  it('matches eciToGeodetic to 11 digits on the multi-thread runtime', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new GeodeticPositionCalculator(),
      ],
      satRecsCount: 1,
      datesCount: dates.length,
    });
    bp.setSatRecs([satrec]);
    bp.setDates(dates);
    await bp.run();
    expectHeightsToMatch(
      (j) => bp.getFormattedOutput(0, j)!.geodeticPosition.height,
    );
  });
});
