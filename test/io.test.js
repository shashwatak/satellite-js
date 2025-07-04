import { twoline2satrec, json2satrec } from '../dist/satellite';
import badTleData from './io-edge.json';
import goodData from './io.json';

describe('Twoline', () => {
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
    goodData.forEach(jsonObj => {
        const satrec = json2satrec(jsonObj);
        const origSatrec = twoline2satrec(jsonObj.tleLine1, jsonObj.tleLine2);
        for (const prop in origSatrec) {
            it(`should have a valid ${prop} property`, () => {
                switch (prop) {
                    case 'satnum': break; // no normalization of satnum
                    case 'epochdays':
                    case 'jdsatepoch':
                        expect(satrec[prop]).toBeCloseTo(origSatrec[prop], 7);
                        break;
                    case 'gsto':
                        expect(satrec[prop]).toBeCloseTo(origSatrec[prop], 6);
                        break;
                    default:
                        expect(satrec[prop]).toEqual(origSatrec[prop]);
                        break;
                }
            });
        }
    });
})

// PR #146 
describe('OMM Epoch must be parsed with or without ending Z', () => {
  const goodDataExample = goodData[0];
  expect(goodDataExample.EPOCH.endsWith('Z')).toBe(false);
  const goodDataExampleWithEpochEndingInZ = {
    ...goodDataExample,
    EPOCH: new Date(goodDataExample.EPOCH + 'Z').toISOString(),
  };
  expect(goodDataExampleWithEpochEndingInZ.EPOCH.endsWith('Z')).toBe(true);
  expect(json2satrec(goodDataExampleWithEpochEndingInZ)).toEqual(json2satrec(goodDataExample));
});
