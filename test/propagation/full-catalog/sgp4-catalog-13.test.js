/* eslint-disable no-sync */

import * as fs from 'fs';

import twoline2satrec from '../../../src/io';
import sgp4 from '../../../src/propagation/sgp4';

const fileName = 'TLE_13';
const rawData = fs.readFileSync(`test/propagation/full-catalog/${fileName}.json`, 'utf8');
// Convert to JSON
const sgp4Data = JSON.parse(rawData);

describe('OscState13 testing', () => {
  sgp4Data.forEach((sgp4DataItem) => {
    // Fetching satellite record from TLE lines
    const satrec = twoline2satrec(sgp4DataItem.line1, sgp4DataItem.line2);
    const satnum = sgp4DataItem.line1.slice(2, 7);

    it(`${satnum} measurements match snapshot`, () => {
      expect(sgp4(satrec, 0)).toMatchSnapshot();
      expect(sgp4(satrec, 360)).toMatchSnapshot();
      expect(sgp4(satrec, 720)).toMatchSnapshot();
      expect(sgp4(satrec, 1080)).toMatchSnapshot();
      expect(sgp4(satrec, 1440)).toMatchSnapshot();
    });
  });
});
