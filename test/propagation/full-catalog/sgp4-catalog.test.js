/* eslint-disable no-sync */

import * as fs from 'fs';

import sgp4 from '../../../src/propagation/sgp4';
import twoline2satrec from '../../../src/io';

for (let i = 0; i < 50; i += 1) {
  const fileName = `TLE_${i}`;
  const rawData = fs.readFileSync(
    `test/propagation/full-catalog/${fileName}.json`,
    'utf8',
  );
  const sgp4Data = JSON.parse(rawData);

  describe(`OscState${i} testing`, () => {
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
}
