/** biome-ignore-all lint/style/noNonNullAssertion: lots of index arithmetic */
import { describe, expect, it } from 'vitest';
import createMultiThreadModule from 'wasm-module-multi-thread/index.js';
import createSingleThreadModule from 'wasm-module-single-thread/index.js';
import { dopplerFactor } from '../../src/dopplerFactor.js';
import { jday } from '../../src/ext.js';
import { twoline2satrec } from '../../src/io.js';
import { gstime } from '../../src/propagation/gstime.js';
import { propagate } from '../../src/propagation.js';
import { shadowFraction } from '../../src/shadow.js';
import { sunPos } from '../../src/sun.js';
import {
  degreesToRadians, ecfToLookAngles, eciToEcf, eciToGeodetic, geodeticToEcf,
} from '../../src/transforms.js';
import {
  BulkPropagator,
  DopplerFactorCalculator,
  EcfPositionCalculator,
  EcfVelocityCalculator,
  EciBaseCalculator,
  GeodeticPositionCalculator,
  GmstCalculator,
  LookAnglesCalculator,
  ShadowFractionCalculator,
  SunPositionCalculator,
} from '../../src/wasm/index.js';
import { createMultiThreadRuntimeFromModule } from '../../src/wasm/runtimes/multi-thread-runtime.js';
import { createSingleThreadRuntimeFromModule } from '../../src/wasm/runtimes/single-thread-runtime.js';
import { topologicalSort } from '../../src/wasm/toposort.js';
import { compareVectors } from '../compareVectors.js';
import badTleData from '../io-edge.json' with { type: 'json' };

const singleThreadRuntime = await createSingleThreadRuntimeFromModule(
  await createSingleThreadModule(),
);
const multiThreadRuntime = await createMultiThreadRuntimeFromModule(
  await createMultiThreadModule(),
  { threadsCount: 4 },
);

const TLE1_1 = '1 25544U 98067A   25191.49368601  .00007939  00000-0  14455-3 0  9995';
const TLE1_2 = '2 25544  51.6350 191.5447 0002161   1.4001 135.0516 15.50469967518770';

const TLE2_1 = '1     5U 58002B   25189.55838196 -.00000055  00000-0 -47510-4 0  9993';
const TLE2_2 = '2     5  34.2469 294.9296 1841370  29.1499 340.0354 10.85926006406011';

const satRecs = [twoline2satrec(TLE1_1, TLE1_2), twoline2satrec(TLE2_1, TLE2_2)];

const dates = [new Date('2025-07-11T00:00:12.345'), new Date('2025-07-12T00:00:12.345')] as const;

const observerGeodetic = {
  latitude: degreesToRadians(41),
  longitude: degreesToRadians(-71),
  height: 1,
};

describe('BulkPropagator basic flow errors', () => {
  it('should throw if run is called before setting satRecs', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setDates(dates);
    expect(() => bp.run()).toThrow(/setSatRecs/);
  });
  it('should throw if run is called before setting dates', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    expect(() => bp.run()).toThrow(/setDates/);
  });
  it('should throw if setDates is called during a run', async () => {
    using multiThreadBp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    multiThreadBp.setSatRecs(satRecs);
    multiThreadBp.setDates(dates);
    const runPromise = multiThreadBp.run();
    expect(() => multiThreadBp.setDates(dates)).toThrow(/Cannot set dates while a run is in progress/);
    await runPromise;
  });
  it('should throw if used after disposal', () => {
    using multiThreadBp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    multiThreadBp.setSatRecs(satRecs);
    multiThreadBp.setDates(dates);
    multiThreadBp.dispose();
    expect(() => multiThreadBp.run()).toThrow();
  });
  it('should not throw during dispose even if run is in progress', async () => {
    using multiThreadBp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    multiThreadBp.setSatRecs(satRecs);
    multiThreadBp.setDates(dates);
    const promise = multiThreadBp.run();
    multiThreadBp.dispose();
    await promise;
  });
});

describe('BulkPropagator single thread sanity check', () => {
  it('propagates and returns finite values', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    const out0 = bp.getFormattedOutput(0, 0)!.eci;
    const out1 = bp.getFormattedOutput(0, 1)!.eci;

    expect(Number.isFinite(out0.position.x)).toBe(true);
    expect(Number.isFinite(out1.velocity.y)).toBe(true);
  });

  it('returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    const pureJsResults = satRecs.flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });
  });

  it('returns undefined if out of bounds', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    const out0 = bp.getFormattedOutput(satRecs.length, 0);
    expect(out0).toBeUndefined();
  });

  it('returns the same results after the memory is grown', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    const pureJsResults = satRecs.flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    const oldMemorySize = singleThreadRuntime.module.HEAP8.buffer.byteLength;
    const dummyMemory = singleThreadRuntime.module._malloc(50_000_000);
    expect(oldMemorySize).toBeLessThan(singleThreadRuntime.module.HEAP8.buffer.byteLength);
    const wasmResultsAfterGrowth = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );
    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterGrowth[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterGrowth[i]!.velocity, 11);
    });
    singleThreadRuntime.module._free(dummyMemory);
  });

  it('returns correct results when increasing input sizes between runs', async () => {
    const smallerDatesBatch = dates.slice(0, 1);
    const smallerSatRecsBatch = satRecs.slice(0, 1);
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: smallerSatRecsBatch.length,
      datesCount: smallerDatesBatch.length,
    });
    bp.setSatRecs(smallerSatRecsBatch);
    bp.setDates(smallerDatesBatch);
    bp.run();

    const pureJsResults = smallerSatRecsBatch
      .flatMap((satRec) => smallerDatesBatch.map((date) => propagate(satRec, date)));
    const wasmResults = smallerSatRecsBatch.flatMap(
      (_satRec, i) => smallerDatesBatch.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    bp.setDates(dates);
    bp.run();

    const pureJsResultsAfterIncreasedDates = smallerSatRecsBatch
      .flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResultsAfterIncreasedDates = smallerSatRecsBatch.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterIncreasedDates.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterIncreasedDates[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterIncreasedDates[i]!.velocity, 11);
    });

    bp.setSatRecs(satRecs);
    bp.run();

    const pureJsResultsAfterIncreasedSatRecs = satRecs
      .flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResultsAfterIncreasedSatRecs = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterIncreasedSatRecs.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterIncreasedSatRecs[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterIncreasedSatRecs[i]!.velocity, 11);
    });
  });

  it('returns correct results when decreasing input sizes between runs', async () => {
    const smallerDatesBatch = dates.slice(0, 1);
    const smallerSatRecsBatch = satRecs.slice(0, 1);
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    const pureJsResults = satRecs
      .flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    bp.setDates(smallerDatesBatch);
    bp.run();

    const pureJsResultsAfterDecreasedDates = satRecs
      .flatMap((satRec) => smallerDatesBatch.map((date) => propagate(satRec, date)));
    const wasmResultsAfterDecreasedDates = satRecs.flatMap(
      (_satRec, i) => smallerDatesBatch.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterDecreasedDates.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterDecreasedDates[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterDecreasedDates[i]!.velocity, 11);
    });

    bp.setSatRecs(smallerSatRecsBatch);
    bp.run();

    const pureJsResultsAfterDecreasedSatRecs = smallerSatRecsBatch
      .flatMap((satRec) => smallerDatesBatch.map((date) => propagate(satRec, date)));
    const wasmResultsAfterDecreasedSatRecs = smallerSatRecsBatch.flatMap(
      (_satRec, i) => smallerDatesBatch.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterDecreasedSatRecs.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterDecreasedSatRecs[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterDecreasedSatRecs[i]!.velocity, 11);
    });
  });
});

describe('BulkPropagator single thread errors', () => {
  it('Should correctly return SGP4 errors', () => {
    badTleData.forEach((tleDataItem) => {
      const satRec = twoline2satrec(tleDataItem.tleLine1, tleDataItem.tleLine2);
      using bp = new BulkPropagator({
        runtime: singleThreadRuntime,
        calculators: [new EciBaseCalculator()],
        datesCount: 1,
        satRecsCount: 1,
      });
      const date = new Date((satRec.jdsatepoch - 2440587.5) * 86400000);
      bp.setSatRecs([satRec]);
      bp.setDates([date]);
      bp.run();
      expect(bp.getFormattedOutput(0, 0)!.eci.error).toEqual(tleDataItem.results[0]!.error);
    });
  });
});

describe('Single thread Calculator comparisons with JS transforms', () => {
  it('GmstCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator(), new GmstCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    dates.forEach((date, j) => {
      const jsGmst = gstime(date);
      const wasmGmst = bp.getFormattedOutput(0, j)!.gmst;
      expect(wasmGmst).toBeCloseTo(jsGmst, 11);
    });
  });

  it('EcfPositionCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator(), new GmstCalculator(), new EcfPositionCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const jsEcfPosition = eciToEcf(eciResult!.position, gmst);
        const wasmEcfPosition = bp.getFormattedOutput(i, j)!.ecfPosition;

        compareVectors(jsEcfPosition, wasmEcfPosition, 11);
      });
    });
  });

  it('EcfVelocityCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator(), new GmstCalculator(), new EcfVelocityCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const jsEcfVelocity = eciToEcf(eciResult!.velocity, gmst);
        const wasmEcfVelocity = bp.getFormattedOutput(i, j)!.ecfVelocity;

        compareVectors(jsEcfVelocity, wasmEcfVelocity, 11);
      });
    });
  });

  it('GeodeticPositionCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new GeodeticPositionCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const jsGeodeticPosition = eciToGeodetic(eciResult!.position, gmst);
        const wasmGeodeticPosition = bp.getFormattedOutput(i, j)!.geodeticPosition;

        expect(wasmGeodeticPosition.latitude).toBeCloseTo(jsGeodeticPosition.longitude, 11);
        expect(wasmGeodeticPosition.longitude).toBeCloseTo(jsGeodeticPosition.latitude, 11);
        expect(wasmGeodeticPosition.height).toBeCloseTo(jsGeodeticPosition.height, 11);
      });
    });
  });

  it('LookAnglesCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new LookAnglesCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run({ lookAngles: { observer: observerGeodetic } });

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const ecfPosition = eciToEcf(eciResult!.position, gmst);
        const jsLookAngles = ecfToLookAngles(observerGeodetic, ecfPosition);

        const wasmLookAngles = bp.getFormattedOutput(i, j)!.lookAngles;

        expect(wasmLookAngles.azimuth).toBeCloseTo(jsLookAngles.azimuth, 11);
        expect(wasmLookAngles.elevation).toBeCloseTo(jsLookAngles.elevation, 11);
        expect(wasmLookAngles.rangeSat).toBeCloseTo(jsLookAngles.rangeSat, 11);
      });
    });
  });

  it('DopplerFactorCalculator returns values close to pure JS implementation', () => {
    const observerEcf = geodeticToEcf(observerGeodetic);

    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new EcfVelocityCalculator(),
        new DopplerFactorCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run({ dopplerFactor: { observer: observerEcf } });

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const ecfPosition = eciToEcf(eciResult!.position, gmst);
        const ecfVelocity = eciToEcf(eciResult!.velocity, gmst);

        const jsDopplerFactor = dopplerFactor(observerEcf, ecfPosition, ecfVelocity);
        const wasmDopplerFactor = bp.getFormattedOutput(i, j)!.dopplerFactor;

        expect(wasmDopplerFactor).toBeCloseTo(jsDopplerFactor, 11);
      });
    });
  });

  it('SunPositionCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [new EciBaseCalculator(), new SunPositionCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    dates.forEach((date, j) => {
      const jsSunPosition = sunPos(jday(date)).rsun;
      const wasmSunPosition = bp.getFormattedOutput(0, j)!.sunPosition;

      expect(wasmSunPosition.x).toBeCloseTo(jsSunPosition.x, 11);
      expect(wasmSunPosition.y).toBeCloseTo(jsSunPosition.y, 11);
      expect(wasmSunPosition.z).toBeCloseTo(jsSunPosition.z, 11);
    });
  });

  it('ShadowFractionCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new SunPositionCalculator(),
        new ShadowFractionCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const jsSunPosition = sunPos(jday(date)).rsun;
        const jsShadowFraction = shadowFraction(jsSunPosition, eciResult!.position);
        const wasmShadowFraction = bp.getFormattedOutput(i, j)!.shadowFraction;

        expect(wasmShadowFraction).toBeCloseTo(jsShadowFraction, 11);
      });
    });
  });

  it('BulkPropagator and Calculators raw results are the same as formatted results', () => {
    const observerEcf = geodeticToEcf(observerGeodetic);

    using bp = new BulkPropagator({
      runtime: singleThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new EcfVelocityCalculator(),
        new DopplerFactorCalculator(),
        new LookAnglesCalculator(),
        new SunPositionCalculator(),
        new ShadowFractionCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });

    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    bp.run({
      dopplerFactor: { observer: observerEcf },
      lookAngles: { observer: observerGeodetic },
    });

    const formattedResults = bp.getFormattedOutput(1, 0)!;
    const rawResults = bp.getRawOutput();
    expect(formattedResults.eci).toEqual({
      error: rawResults.eci.error[2],
      position: {
        x: rawResults.eci.position[3 * 2],
        y: rawResults.eci.position[3 * 2 + 1],
        z: rawResults.eci.position[3 * 2 + 2],
      },
      velocity: {
        x: rawResults.eci.velocity[3 * 2],
        y: rawResults.eci.velocity[3 * 2 + 1],
        z: rawResults.eci.velocity[3 * 2 + 2],
      },
    });
    expect(formattedResults.ecfPosition).toEqual({
      x: rawResults.ecfPosition[3 * 2],
      y: rawResults.ecfPosition[3 * 2 + 1],
      z: rawResults.ecfPosition[3 * 2 + 2],
    });
    expect(formattedResults.ecfVelocity).toEqual({
      x: rawResults.ecfVelocity[3 * 2],
      y: rawResults.ecfVelocity[3 * 2 + 1],
      z: rawResults.ecfVelocity[3 * 2 + 2],
    });
    expect(formattedResults.gmst).toEqual(rawResults.gmst[0]);
    expect(formattedResults.dopplerFactor).toEqual(rawResults.dopplerFactor[2]);
    expect(formattedResults.lookAngles).toEqual({
      azimuth: rawResults.lookAngles[3 * 2],
      elevation: rawResults.lookAngles[3 * 2 + 1],
      rangeSat: rawResults.lookAngles[3 * 2 + 2],
    });
    expect(formattedResults.sunPosition).toEqual({
      x: rawResults.sunPosition[3 * 0],
      y: rawResults.sunPosition[3 * 0 + 1],
      z: rawResults.sunPosition[3 * 0 + 2],
    });
    expect(formattedResults.shadowFraction).toEqual(rawResults.shadowFraction[2]);
  });
});

describe('BulkPropagator multi thread sanity check', () => {
  it('propagates and returns finite values', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    const out0 = bp.getFormattedOutput(0, 0)!.eci;
    const out1 = bp.getFormattedOutput(0, 1)!.eci;

    expect(Number.isFinite(out0.position.x)).toBe(true);
    expect(Number.isFinite(out1.velocity.y)).toBe(true);
  });

  it('returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    const pureJsResults = satRecs.flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });
  });

  it('returns undefined if out of bounds', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    const out0 = bp.getFormattedOutput(satRecs.length, 0);
    expect(out0).toBeUndefined();
  });

  it('returns the same results after the memory is grown', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    const pureJsResults = satRecs.flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    const oldMemorySize = multiThreadRuntime.module.HEAP8.buffer.byteLength;
    const dummyMemory = multiThreadRuntime.module._malloc(50_000_000);
    expect(oldMemorySize).toBeLessThan(multiThreadRuntime.module.HEAP8.buffer.byteLength);
    const wasmResultsAfterGrowth = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );
    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterGrowth[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterGrowth[i]!.velocity, 11);
    });
    multiThreadRuntime.module._free(dummyMemory);
  });

  it('returns correct results when increasing input sizes between runs', async () => {
    const smallerDatesBatch = dates.slice(0, 1);
    const smallerSatRecsBatch = satRecs.slice(0, 1);
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: smallerSatRecsBatch.length,
      datesCount: smallerDatesBatch.length,
    });
    bp.setSatRecs(smallerSatRecsBatch);
    bp.setDates(smallerDatesBatch);
    await bp.run();

    const pureJsResults = smallerSatRecsBatch
      .flatMap((satRec) => smallerDatesBatch.map((date) => propagate(satRec, date)));
    const wasmResults = smallerSatRecsBatch.flatMap(
      (_satRec, i) => smallerDatesBatch.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    bp.setDates(dates);
    await bp.run();

    const pureJsResultsAfterIncreasedDates = smallerSatRecsBatch
      .flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResultsAfterIncreasedDates = smallerSatRecsBatch.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterIncreasedDates.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterIncreasedDates[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterIncreasedDates[i]!.velocity, 11);
    });

    bp.setSatRecs(satRecs);
    await bp.run();

    const pureJsResultsAfterIncreasedSatRecs = satRecs
      .flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResultsAfterIncreasedSatRecs = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterIncreasedSatRecs.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterIncreasedSatRecs[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterIncreasedSatRecs[i]!.velocity, 11);
    });
  });

  it('returns correct results when decreasing input sizes between runs', async () => {
    const smallerDatesBatch = dates.slice(0, 1);
    const smallerSatRecsBatch = satRecs.slice(0, 1);
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    const pureJsResults = satRecs
      .flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    bp.setDates(smallerDatesBatch);
    await bp.run();

    const pureJsResultsAfterDecreasedDates = satRecs
      .flatMap((satRec) => smallerDatesBatch.map((date) => propagate(satRec, date)));
    const wasmResultsAfterDecreasedDates = satRecs.flatMap(
      (_satRec, i) => smallerDatesBatch.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterDecreasedDates.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterDecreasedDates[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterDecreasedDates[i]!.velocity, 11);
    });

    bp.setSatRecs(smallerSatRecsBatch);
    await bp.run();

    const pureJsResultsAfterDecreasedSatRecs = smallerSatRecsBatch
      .flatMap((satRec) => smallerDatesBatch.map((date) => propagate(satRec, date)));
    const wasmResultsAfterDecreasedSatRecs = smallerSatRecsBatch.flatMap(
      (_satRec, i) => smallerDatesBatch.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResultsAfterDecreasedSatRecs.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterDecreasedSatRecs[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterDecreasedSatRecs[i]!.velocity, 11);
    });
  });
});

describe('BulkPropagator multi thread errors', () => {
  it('Should correctly return SGP4 errors', async () => {
    for (const tleDataItem of badTleData) {
      const satRec = twoline2satrec(tleDataItem.tleLine1, tleDataItem.tleLine2);
      using bp = new BulkPropagator({
        runtime: multiThreadRuntime,
        calculators: [new EciBaseCalculator()],
        datesCount: 1,
        satRecsCount: 1,
      });
      const date = new Date((satRec.jdsatepoch - 2440587.5) * 86400000);
      bp.setSatRecs([satRec]);
      bp.setDates([date]);
      await bp.run();
      expect(bp.getFormattedOutput(0, 0)!.eci.error).toEqual(tleDataItem.results[0]!.error);
    }
  });
});

describe('multi thread Calculator comparisons with JS transforms', () => {
  it('GmstCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator(), new GmstCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    dates.forEach((date, j) => {
      const jsGmst = gstime(date);
      const wasmGmst = bp.getFormattedOutput(0, j)!.gmst;
      expect(wasmGmst).toBeCloseTo(jsGmst, 11);
    });
  });

  it('EcfPositionCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator(), new GmstCalculator(), new EcfPositionCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const jsEcfPosition = eciToEcf(eciResult!.position, gmst);
        const wasmEcfPosition = bp.getFormattedOutput(i, j)!.ecfPosition;

        compareVectors(jsEcfPosition, wasmEcfPosition, 11);
      });
    });
  });

  it('EcfVelocityCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator(), new GmstCalculator(), new EcfVelocityCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const jsEcfVelocity = eciToEcf(eciResult!.velocity, gmst);
        const wasmEcfVelocity = bp.getFormattedOutput(i, j)!.ecfVelocity;

        compareVectors(jsEcfVelocity, wasmEcfVelocity, 11);
      });
    });
  });

  it('GeodeticPositionCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new GeodeticPositionCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const jsGeodeticPosition = eciToGeodetic(eciResult!.position, gmst);
        const wasmGeodeticPosition = bp.getFormattedOutput(i, j)!.geodeticPosition;

        expect(wasmGeodeticPosition.latitude).toBeCloseTo(jsGeodeticPosition.longitude, 11);
        expect(wasmGeodeticPosition.longitude).toBeCloseTo(jsGeodeticPosition.latitude, 11);
        expect(wasmGeodeticPosition.height).toBeCloseTo(jsGeodeticPosition.height, 11);
      });
    });
  });

  it('LookAnglesCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new LookAnglesCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run({ lookAngles: { observer: observerGeodetic } });

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const ecfPosition = eciToEcf(eciResult!.position, gmst);
        const jsLookAngles = ecfToLookAngles(observerGeodetic, ecfPosition);

        const wasmLookAngles = bp.getFormattedOutput(i, j)!.lookAngles;

        expect(wasmLookAngles.azimuth).toBeCloseTo(jsLookAngles.azimuth, 11);
        expect(wasmLookAngles.elevation).toBeCloseTo(jsLookAngles.elevation, 11);
        expect(wasmLookAngles.rangeSat).toBeCloseTo(jsLookAngles.rangeSat, 11);
      });
    });
  });

  it('DopplerFactorCalculator returns values close to pure JS implementation', async () => {
    const observerEcf = geodeticToEcf(observerGeodetic);

    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new EcfVelocityCalculator(),
        new DopplerFactorCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run({ dopplerFactor: { observer: observerEcf } });

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const gmst = gstime(date);
        const ecfPosition = eciToEcf(eciResult!.position, gmst);
        const ecfVelocity = eciToEcf(eciResult!.velocity, gmst);

        const jsDopplerFactor = dopplerFactor(observerEcf, ecfPosition, ecfVelocity);
        const wasmDopplerFactor = bp.getFormattedOutput(i, j)!.dopplerFactor;

        expect(wasmDopplerFactor).toBeCloseTo(jsDopplerFactor, 11);
      });
    });
  });

  it('SunPositionCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new EciBaseCalculator(), new SunPositionCalculator()],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    dates.forEach((date, j) => {
      const jsSunPosition = sunPos(jday(date)).rsun;
      const wasmSunPosition = bp.getFormattedOutput(0, j)!.sunPosition;

      expect(wasmSunPosition.x).toBeCloseTo(jsSunPosition.x, 11);
      expect(wasmSunPosition.y).toBeCloseTo(jsSunPosition.y, 11);
      expect(wasmSunPosition.z).toBeCloseTo(jsSunPosition.z, 11);
    });
  });

  it('ShadowFractionCalculator returns values close to pure JS implementation', async () => {
    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new SunPositionCalculator(),
        new ShadowFractionCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });
    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run();

    satRecs.forEach((satRec, i) => {
      dates.forEach((date, j) => {
        const eciResult = propagate(satRec, date);
        const jsSunPosition = sunPos(jday(date)).rsun;
        const jsShadowFraction = shadowFraction(jsSunPosition, eciResult!.position);
        const wasmShadowFraction = bp.getFormattedOutput(i, j)!.shadowFraction;

        expect(wasmShadowFraction).toBeCloseTo(jsShadowFraction, 11);
      });
    });
  });

  it('BulkPropagator and Calculators raw results are the same as formatted results', async () => {
    const observerEcf = geodeticToEcf(observerGeodetic);

    using bp = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new EcfVelocityCalculator(),
        new DopplerFactorCalculator(),
        new LookAnglesCalculator(),
        new SunPositionCalculator(),
        new ShadowFractionCalculator(),
      ],
      satRecsCount: satRecs.length,
      datesCount: dates.length,
    });

    bp.setSatRecs(satRecs);
    bp.setDates(dates);
    await bp.run({
      dopplerFactor: { observer: observerEcf },
      lookAngles: { observer: observerGeodetic },
    });

    const formattedResults = bp.getFormattedOutput(1, 0)!;
    const rawResults = bp.getRawOutput();
    expect(formattedResults.eci).toEqual({
      error: rawResults.eci.error[2],
      position: {
        x: rawResults.eci.position[3 * 2],
        y: rawResults.eci.position[3 * 2 + 1],
        z: rawResults.eci.position[3 * 2 + 2],
      },
      velocity: {
        x: rawResults.eci.velocity[3 * 2],
        y: rawResults.eci.velocity[3 * 2 + 1],
        z: rawResults.eci.velocity[3 * 2 + 2],
      },
    });
    expect(formattedResults.ecfPosition).toEqual({
      x: rawResults.ecfPosition[3 * 2],
      y: rawResults.ecfPosition[3 * 2 + 1],
      z: rawResults.ecfPosition[3 * 2 + 2],
    });
    expect(formattedResults.ecfVelocity).toEqual({
      x: rawResults.ecfVelocity[3 * 2],
      y: rawResults.ecfVelocity[3 * 2 + 1],
      z: rawResults.ecfVelocity[3 * 2 + 2],
    });
    expect(formattedResults.gmst).toEqual(rawResults.gmst[0]);
    expect(formattedResults.dopplerFactor).toEqual(rawResults.dopplerFactor[2]);
    expect(formattedResults.lookAngles).toEqual({
      azimuth: rawResults.lookAngles[3 * 2],
      elevation: rawResults.lookAngles[3 * 2 + 1],
      rangeSat: rawResults.lookAngles[3 * 2 + 2],
    });
    expect(formattedResults.sunPosition).toEqual({
      x: rawResults.sunPosition[3 * 0],
      y: rawResults.sunPosition[3 * 0 + 1],
      z: rawResults.sunPosition[3 * 0 + 2],
    });
    expect(formattedResults.shadowFraction).toEqual(rawResults.shadowFraction[2]);
  });
});

describe('Toposort for BulkPropagator', () => {
  it('Should throw if there is a cyclic dependency', () => {
    expect(() => {
      topologicalSort([{ provides: 'thing', hasDependencies: ['otherThing'] }, { provides: 'otherThing', hasDependencies: ['thing'] }]);
    }).toThrow();
  });
});
