/** biome-ignore-all lint/style/noNonNullAssertion: lots of index arithmetic */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { days2mdhms, type JDay } from '../../src/ext.js';
import {
  BulkPropagator,
  EciBaseCalculator,
  type PositionAndVelocity,
  propagate,
  sgp4,
  twoline2satrec,
} from '../../src/index.js';
import {
  createMultiThreadRuntime,
  createSingleThreadRuntime,
} from '../../src/wasm/runtimes/index.js';
import expectedData from './sgp4CatalogResults.json' with { type: 'json' };

const singleThreadRuntime = await createSingleThreadRuntime();
const multiThreadRuntime = await createMultiThreadRuntime({ threadsCount: 4 });

const satellitesPerTestSuite = 500;

type NumericValues<T> = { [K in keyof T]: number };

function haveValuesClose<T extends NumericValues<T>>(
  actual: T,
  expected: T,
  precision = 13,
): boolean {
  for (const key in expected) {
    if (Object.hasOwn(expected, key) && Object.hasOwn(actual, key)) {
      const expectedNumber = expected[key];
      const actualNumber = actual[key];
      if (
        typeof expectedNumber !== 'number' ||
        typeof actualNumber !== 'number'
      ) {
        return false;
      }
      const pass =
        Math.abs(actualNumber - expectedNumber) < 10 ** -precision / 2;
      if (!pass) {
        return false;
      }
    }
  }
  return true;
}

function getTleSuites() {
  const tleSuites: { line1: string; line2: string }[][] = [];
  const text = fs
    .readFileSync(path.resolve(import.meta.dirname, './tle.txt'), 'utf-8')
    // remove BOM marker
    .replace(/^\uFEFF/, '');
  const lines = text.split('\n');
  while (lines.length > 0) {
    const suiteLines = lines.splice(0, 2 * satellitesPerTestSuite);
    const tleSuite: { line1: string; line2: string }[] = [];
    for (let i = 0; i < suiteLines.length; i += 2) {
      const line1 = suiteLines[i]!;
      const line2 = suiteLines[i + 1]!;
      tleSuite.push({ line1, line2 });
    }
    tleSuites.push(tleSuite);
  }
  return tleSuites;
}

const tleSuites = getTleSuites();

// this is a more precise version of invjday, which also takes milliseconds into account,
// although it still doesn't result in exact round-trip with jday. The
// reason for this is not clear (PRs welcome).
// Since BulkPropagator takes dates, but sgp4 takes time since epoch in minutes,
// it's impossible to compare them directly.
// Hence, this function is used to get a Date, albeit with some precision loss,
// to separately calculate propagate output and compare it to BulkPropagator output.
export function invjdayFull(jd: JDay) {
  // --------------- find year and days of the year -
  const temp = jd - 2415019.5;
  const tu = temp / 365.25;
  let year = 1900 + Math.floor(tu);
  let leapyrs = Math.floor((year - 1901) * 0.25);

  // optional nudge by 8.64x10-7 sec to get even outputs
  let days = temp - ((year - 1900) * 365.0 + leapyrs) + 0.00000000001;

  // ------------ check for case of beginning of a year -----------
  if (days < 1.0) {
    year -= 1;
    leapyrs = Math.floor((year - 1901) * 0.25);
    days = temp - ((year - 1900) * 365.0 + leapyrs);
  }

  // ----------------- find remaing data  -------------------------
  const mdhms = days2mdhms(year, days);

  const { mon, day, hr, minute } = mdhms;

  const sec = mdhms.sec - 0.000000864;

  return new Date(
    Date.UTC(year, mon - 1, day, hr, minute, Math.floor(sec), (sec % 1) * 1000),
  );
}

const tsince = [0, 360, 720, 1080, 1440];

const bp = new BulkPropagator({
  datesCount: 5,
  calculators: [new EciBaseCalculator()],
  satRecsCount: 1,
  runtime: singleThreadRuntime,
});
const bpMultiThread = new BulkPropagator({
  datesCount: 5,
  calculators: [new EciBaseCalculator()],
  satRecsCount: 1,
  runtime: multiThreadRuntime,
});

tleSuites.forEach((tleSuite, tleSuiteIndex) => {
  const testSuiteName = `sgp4catalog ${(tleSuiteIndex + 1).toString().padStart(2, '0')}`;
  const satellitesRange = `${tleSuiteIndex * satellitesPerTestSuite + 1} — ${(tleSuiteIndex + 1) * satellitesPerTestSuite}`;
  describe(`${testSuiteName} (${satellitesRange})`, () => {
    tleSuite.forEach((tle, tleIndex) => {
      const satrec = twoline2satrec(tle.line1, tle.line2);
      it(`satellite ${String(satrec.satnum).padStart(5, '0')} measurements`, async () => {
        bp.setSatRecs([satrec]);
        bpMultiThread.setSatRecs([satrec]);
        const satelliteEpoch = satrec.jdsatepoch;
        const dates = tsince.map((ts) =>
          invjdayFull(satelliteEpoch + ts / 1440),
        );
        bp.setDates(dates);
        bpMultiThread.setDates(dates);
        bp.run();
        await bpMultiThread.run();

        tsince.forEach((time, timeIndex) => {
          const result = sgp4(satrec, time);
          const expectedResult = (
            expectedData as Array<Array<Array<PositionAndVelocity | null>>>
          )[tleSuiteIndex]?.[tleIndex]?.[timeIndex];
          if (!result || !expectedResult) {
            expect(result).toEqual(expectedResult);
            return;
          }
          expect(expectedResult).toBeDefined();
          expect(
            haveValuesClose(result.position, expectedResult.position),
          ).toBe(true);
          expect(
            haveValuesClose(result.velocity, expectedResult.velocity),
          ).toBe(true);
          expect(
            haveValuesClose(result.meanElements, expectedResult.meanElements),
          ).toBe(true);

          // this compares propagate() output to BulkPropagator output
          // as mentioned above, due to precision loss in epoch to date conversion,
          // it's impossible to compare them directly to the expected output of sgp4()
          const resultPropagate = propagate(satrec, dates[timeIndex]!);
          const wasmResult = bp.getFormattedOutput(0, timeIndex)!.eci;
          const wasmResultMultiThread = bpMultiThread.getFormattedOutput(
            0,
            timeIndex,
          )!.eci;
          if (resultPropagate) {
            expect(
              haveValuesClose(wasmResult.position, resultPropagate.position, 9),
            ).toBe(true);
            expect(
              haveValuesClose(wasmResult.velocity, resultPropagate.velocity, 9),
            ).toBe(true);
            expect(
              haveValuesClose(
                wasmResultMultiThread.position,
                resultPropagate.position,
                9,
              ),
            ).toBe(true);
            expect(
              haveValuesClose(
                wasmResultMultiThread.velocity,
                resultPropagate.velocity,
                9,
              ),
            ).toBe(true);
          } else {
            expect(satrec.error).toEqual(wasmResult.error);
          }
        });
      });
    });
  });
});
