import { describe, expect, it } from 'vitest';
import {
  constants,
  json2satrec,
  type OMMJsonObject,
  type SatRec,
  twoline2satrec,
} from '../src/index.js';
import goodData from './io.json' with { type: 'json' };
import badTleData from './io-edge.json' with { type: 'json' };

describe('JS propagation errors', () => {
  it('should convert twoline to satellite record', () => {
    badTleData.forEach((tleDataItem) => {
      const satrec = twoline2satrec(tleDataItem.tleLine1, tleDataItem.tleLine2);
      tleDataItem.results.forEach((expected) => {
        // Fetching satellite record from incorrectly formatted TLE lines
        expect(satrec.error).toEqual(expected.error);
      });
    });
  });
});

describe('OMM Format Conversion', () => {
  goodData.forEach((jsonObj) => {
    const satrec = json2satrec(jsonObj as OMMJsonObject);
    const origSatrec = twoline2satrec(jsonObj.tleLine1, jsonObj.tleLine2);
    for (const prop in origSatrec) {
      if (Object.hasOwn(origSatrec, prop)) {
        it(`should have a valid ${prop} property`, () => {
          switch (prop) {
            case 'satnum':
              break; // no normalization of satnum
            case 'epochdays':
            case 'jdsatepoch':
              expect(satrec[prop]).toBeCloseTo(origSatrec[prop], 7);
              break;
            case 'gsto':
              expect(satrec[prop]).toBeCloseTo(origSatrec[prop], 6);
              break;
            default:
              expect(satrec[prop as keyof SatRec]).toEqual(
                origSatrec[prop as keyof SatRec],
              );
              break;
          }
        });
      }
    }
  });
});

// PR #146
describe('OMM Epoch', () => {
  it('must be parsed with or without ending Z', () => {
    // biome-ignore lint/style/noNonNullAssertion: no "as const" json import
    const goodDataExample = goodData[0]!;
    expect(goodDataExample.EPOCH.endsWith('Z')).toBe(false);
    const goodDataExampleWithEpochEndingInZ = {
      ...goodDataExample,
      EPOCH: new Date(`${goodDataExample.EPOCH}Z`).toISOString(),
    };
    expect(goodDataExampleWithEpochEndingInZ.EPOCH.endsWith('Z')).toBe(true);
    expect(
      json2satrec(goodDataExampleWithEpochEndingInZ as OMMJsonObject),
    ).toEqual(json2satrec(goodDataExample as OMMJsonObject));
  });
});

describe('twoline2satrec', () => {
  it('should parse eccentricity padded with spaces correctly', () => {
    const tle1 = `1 99999U 25999A   25274.00000000 -.00000000  00000-0  00000-0 0    14`;
    const tle2 = `2 99999  50.0000 142.8988     123 180.0001 210.9293 14.73473854000071`;
    const satrec = twoline2satrec(tle1, tle2);
    expect(satrec.ecco).toBeCloseTo(0.0000123, 10);
  });
});

describe('mean motion', () => {
  it('should be stored with and without kozai', () => {
    const tle1 = `1 99999U 25999A   25274.00000000 -.00000000  00000-0  00000-0 0    14`;
    const tle2 = `2 99999  50.0000 142.8988     123 180.0001 210.9293 14.73473854000071`;
    const satrec = twoline2satrec(tle1, tle2);
    expect(satrec.no).toBeCloseTo(0.06428212791307905, 10);
    expect(satrec.nokozai).toBeCloseTo(0.06429242548587555, 10);
    expect(satrec.nokozai * constants.rad2deg * 4).toBeCloseTo(14.73473854, 10);
  });
});
