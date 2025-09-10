import { describe, it, expect } from 'vitest';
import WasmModuleFactory from 'wasm-module/index.js';
import {
  BulkPropagator,
  EciBaseCalculator,
  GmstCalculator,
  EcfPositionCalculator,
  EcfVelocityCalculator,
  GeodeticPositionCalculator,
  DopplerFactorCalculator,
  LookAnglesCalculator,
} from '../../src/wasm/index.js';
import { twoline2satrec } from '../../src/io.js';
import { propagate } from '../../src/propagation.js';
import {
  degreesToRadians, ecfToLookAngles, eciToEcf, eciToGeodetic, geodeticToEcf,
} from '../../src/transforms.js';
import { dopplerFactor } from '../../src/dopplerFactor.js';
import { gstime } from '../../src/propagation/gstime.js';
import { compareVectors } from '../compareVectors.js';
import { topologicalSort } from '../../src/wasm/toposort.js';
import badTleData from '../io-edge.json' with { type: 'json' };

const wasmModule = await WasmModuleFactory();

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

describe('BulkPropagator sanity check', () => {
  it('propagates and returns finite values', () => {
    using bp = new BulkPropagator({
      wasmModule,
      calculators: [new EciBaseCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

    const out0 = bp.getFormattedOutput(0, 0)!.eci;
    const out1 = bp.getFormattedOutput(0, 1)!.eci;

    expect(Number.isFinite(out0.position.x)).toBe(true);
    expect(Number.isFinite(out1.velocity.y)).toBe(true);
  });

  it('returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      wasmModule,
      calculators: [new EciBaseCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

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
      wasmModule,
      calculators: [new EciBaseCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

    const out0 = bp.getFormattedOutput(satRecs.length, 0);
    expect(out0).toBeUndefined();
  });

  it("throws if dates.length doesn't match datesCount", () => {
    using bp = new BulkPropagator({
      wasmModule,
      calculators: [new EciBaseCalculator()],
      satRecs,
      datesCount: dates.length + 1,
    });

    expect(() => {
      bp.run({ dates });
    }).toThrow();
  });

  it('returns the same results after the memory is grown', () => {
    using bp = new BulkPropagator({
      wasmModule,
      calculators: [new EciBaseCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

    const pureJsResults = satRecs.flatMap((satRec) => dates.map((date) => propagate(satRec, date)));
    const wasmResults = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );

    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResults[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResults[i]!.velocity, 11);
    });

    const oldMemorySize = wasmModule.HEAP8.buffer.byteLength;
    const dummyMemory = wasmModule._malloc(50_000_000);
    expect(oldMemorySize).toBeLessThan(wasmModule.HEAP8.buffer.byteLength);
    const wasmResultsAfterGrowth = satRecs.flatMap(
      (_satRec, i) => dates.map((_date, j) => bp.getFormattedOutput(i, j)!.eci),
    );
    pureJsResults.forEach((jsResult, i) => {
      compareVectors(jsResult!.position, wasmResultsAfterGrowth[i]!.position, 11);
      compareVectors(jsResult!.velocity, wasmResultsAfterGrowth[i]!.velocity, 11);
    });
    wasmModule._free(dummyMemory);
  });
});

describe('BulkPropagator errors', () => {
  it('Should correctly return SGP4 errors', () => {
    badTleData.forEach((tleDataItem) => {
      const satRec = twoline2satrec(tleDataItem.tleLine1, tleDataItem.tleLine2);
      using bp = new BulkPropagator({
        calculators: [new EciBaseCalculator()],
        datesCount: 1,
        satRecs: [satRec],
        wasmModule,
      });
      const date = new Date((satRec.jdsatepoch - 2440587.5) * 86400000);
      bp.run({ dates: [date] });
      expect(bp.getFormattedOutput(0, 0)!.eci.error).toEqual(tleDataItem.results[0]!.error);
    });
  });
});

describe('Calculator comparisons with JS transforms', () => {
  it('GmstCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      wasmModule,
      calculators: [new GmstCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

    dates.forEach((date, j) => {
      const jsGmst = gstime(date);
      const wasmGmst = bp.getFormattedOutput(0, j)!.gmst;
      expect(wasmGmst).toBeCloseTo(jsGmst, 11);
    });
  });

  it('EcfPositionCalculator returns values close to pure JS implementation', () => {
    using bp = new BulkPropagator({
      wasmModule,
      calculators: [new EciBaseCalculator(), new GmstCalculator(), new EcfPositionCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

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
      wasmModule,
      calculators: [new EciBaseCalculator(), new GmstCalculator(), new EcfVelocityCalculator()],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

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
      wasmModule,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new GeodeticPositionCalculator(),
      ],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates });

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
      wasmModule,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new LookAnglesCalculator(),
      ],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates, lookAngles: { observer: observerGeodetic } });

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
      wasmModule,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new EcfVelocityCalculator(),
        new DopplerFactorCalculator(),
      ],
      satRecs,
      datesCount: dates.length,
    });
    bp.run({ dates, dopplerFactor: { observer: observerEcf } });

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

  it('BulkPropagator and Calculators raw results are the same as formatted results', () => {
    const observerEcf = geodeticToEcf(observerGeodetic);

    using bp = new BulkPropagator({
      wasmModule,
      calculators: [
        new EciBaseCalculator(),
        new GmstCalculator(),
        new EcfPositionCalculator(),
        new EcfVelocityCalculator(),
        new DopplerFactorCalculator(),
        new LookAnglesCalculator(),
      ],
      satRecs,
      datesCount: dates.length,
    });

    bp.run({
      dates,
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
  });
});

describe('Toposort for BulkPropagator', () => {
  it('Should throw if there is a cyclic dependency', () => {
    expect(() => {
      topologicalSort([{ provides: 'thing', hasDependencies: ['otherThing'] }, { provides: 'otherThing', hasDependencies: ['thing'] }]);
    }).toThrow();
  });
});
