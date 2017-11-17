import chai from 'chai';

import './jday.spec';
import compareVectors from './compareVectors';
import sgp4data from './sgp4.json';

import twoline2satrec from '../src/propagate/twoline2satrec';
import sgp4 from '../src/sgp4';

chai.should();

const epsilon = 1e-7;

describe('SGP4', () => {
  for (let i = 0; i < sgp4data.length; i += 1) {
    const sgp4dataItem = sgp4data[i];

    // Fetching satellite record from TLE lines
    const satrec = twoline2satrec(sgp4dataItem.tleLine1, sgp4dataItem.tleLine2);
    for (let j = 0; j < sgp4dataItem.results.length; j += 1) {
      it(`TLE: ${i + 1}, measurement: ${j + 1}`, () => {
        const result = sgp4dataItem.results[j];
        const sgp4Result = sgp4(satrec, result.time);
        compareVectors(sgp4Result.position, result.position, epsilon);
        compareVectors(sgp4Result.velocity, result.velocity, epsilon);
      });
    }
  }
});
