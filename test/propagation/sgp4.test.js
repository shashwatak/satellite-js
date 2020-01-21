import '../ext.test';

import compareVectors from '../compareVectors';

import twoline2satrec from '../../src/io';
import sgp4 from '../../src/propagation/sgp4';

import sgp4Data from './sgp4.json';

const numDigits = 6;

describe('SGP4', () => {
  sgp4Data.forEach((sgp4DataItem, i) => {
    // Fetching satellite record from TLE lines
    const satrec = twoline2satrec(sgp4DataItem.tleLine1, sgp4DataItem.tleLine2);

    sgp4DataItem.results.forEach((expected, j) => {
      it(`TLE: ${i + 1}, measurement: ${j + 1}`, () => {
        const sgp4Result = sgp4(satrec, expected.time);

        if (expected.position) {
          compareVectors(sgp4Result.position, expected.position, numDigits);
        }

        if (expected.velocity) {
          compareVectors(sgp4Result.velocity, expected.velocity, numDigits);
        }
      });
    });
  });
});
