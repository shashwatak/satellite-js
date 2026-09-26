import { describe, expect, it } from 'vitest';
import {
  constants,
  json2satrec,
  type OMMJsonObject,
  propagate,
  type SatRec,
  SatRecError,
  sgp4,
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
      EPOCH: `${goodDataExample.EPOCH}Z`, // a Date round trip would drop the microseconds
    };
    expect(goodDataExampleWithEpochEndingInZ.EPOCH.endsWith('Z')).toBe(true);
    expect(
      json2satrec(goodDataExampleWithEpochEndingInZ as OMMJsonObject),
    ).toEqual(json2satrec(goodDataExample as OMMJsonObject));
  });

  it('must keep the digits beyond the millisecond', () => {
    // biome-ignore lint/style/noNonNullAssertion: no "as const" json import
    const goodDataExample = goodData[0]!;
    // the fixture's epoch carries microseconds; a Date would keep only the milliseconds
    const time = /T(\d\d):(\d\d):(\d\d\.\d{4,})$/.exec(goodDataExample.EPOCH);
    expect(time).not.toBeNull();
    const [, hh, mm, ss] = time as RegExpExecArray;
    const expected = Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
    const satrec = json2satrec(goodDataExample as OMMJsonObject);
    const secondsOfDay =
      (satrec.epochdays - Math.floor(satrec.epochdays)) * 86400;
    expect(Math.abs(secondsOfDay - expected)).toBeLessThan(1e-6);
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

describe('sgp4 decay issue', () => {
  it('should filter out satellite which has actually decayed, instead of garbage data', () => {
    const line1 =
      '1 45110U 20007A   23232.80903846 0.00110000  00000-0  32750-2 0    04';
    const line2 =
      '2 45110  69.9913 111.5649 0009740 159.9373 200.0626 15.34502222    06';

    const satrec = twoline2satrec(line1, line2);

    const date = new Date('2025-12-17T06:04:00Z');

    const result = propagate(satrec, date);

    expect(satrec.error).toBe(SatRecError.None);
    expect(result).not.toBeNull();

    const resultWithFlag = propagate(satrec, date, {
      communityDecayCheckEnabled: true,
    });
    expect(satrec.error).toBe(SatRecError.Decayed);
    expect(resultWithFlag).toBeNull();
  });

  it('allows passing empty options object or false flag', () => {
    const line1 =
      '1 45110U 20007A   23232.80903846 0.00110000  00000-0  32750-2 0    04';
    const line2 =
      '2 45110  69.9913 111.5649 0009740 159.9373 200.0626 15.34502222    06';

    const satrec = twoline2satrec(line1, line2);
    const date = new Date('2025-12-17T06:04:00Z');

    const resultEmptyOptions = propagate(satrec, date, {});
    expect(satrec.error).toBe(SatRecError.None);
    expect(resultEmptyOptions).not.toBeNull();

    const resultFalseFlag = propagate(satrec, date, {
      communityDecayCheckEnabled: false,
    });
    expect(satrec.error).toBe(SatRecError.None);
    expect(resultFalseFlag).not.toBeNull();
  });
});

describe('dspace resonance state persistence', () => {
  it('persists atime, xli, xni on satrec and matches direct propagation bit-for-bit', () => {
    // SYNCOM 2 (geosynchronous, resonant irez = 1)
    const l1 =
      '1 00553U 63004A   22218.37130816 -.00000093  00000-0  00000-0 0  9993';
    const l2 =
      '2 00553  29.6088 301.0790 0740538 155.7290 207.9962  1.16484432 19620';

    const satSeq = twoline2satrec(l1, l2);
    expect(satSeq.atime).toBe(0);

    // Step 1: 720 min (1 step)
    sgp4(satSeq, 720);
    expect(satSeq.atime).toBe(720);

    // Step 2: 1440 min (resumes from atime = 720)
    const res1440Seq = sgp4(satSeq, 1440);
    expect(satSeq.atime).toBe(1440);

    // Compare with direct fresh propagation from epoch
    const satDirect = twoline2satrec(l1, l2);
    const res1440Direct = sgp4(satDirect, 1440);

    expect(res1440Seq).not.toBeNull();
    expect(res1440Direct).not.toBeNull();
    if (res1440Seq && res1440Direct) {
      expect(res1440Seq.position.x).toBe(res1440Direct.position.x);
      expect(res1440Seq.position.y).toBe(res1440Direct.position.y);
      expect(res1440Seq.position.z).toBe(res1440Direct.position.z);
    }

    // Backward query resets atime cleanly
    const res360 = sgp4(satSeq, 360);
    const satDirect360 = twoline2satrec(l1, l2);
    const resDirect360 = sgp4(satDirect360, 360);
    expect(res360).not.toBeNull();
    expect(resDirect360).not.toBeNull();
    if (res360 && resDirect360) {
      expect(res360.position.x).toBe(resDirect360.position.x);
      expect(res360.position.y).toBe(resDirect360.position.y);
      expect(res360.position.z).toBe(resDirect360.position.z);
    }
  });
});
