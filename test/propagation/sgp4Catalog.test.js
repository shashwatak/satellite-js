import path from 'path';
import fs from 'fs';

import * as satellite from '../../dist/satellite.es';
const { sgp4, twoline2satrec } = satellite;

const satellitesPerTestSuite = 500;

function getTleSuites() {
  const tleSuites = [];
  const lines = fs.readFileSync(path.resolve(__dirname, 'tle.txt'), 'utf-8')
    // remove BOM marker
    .replace(/^\uFEFF/, '')
    .split('\n');
  while (lines.length > 0) {
    const suiteLines = lines.splice(0, 2 * satellitesPerTestSuite);
    const tleSuite = [];
    for (let i = 0; i < suiteLines.length; i += 2) {
      const line1 = suiteLines[i];
      const line2 = suiteLines[i + 1];
      tleSuite.push({ line1, line2 });
    }
    tleSuites.push(tleSuite);
  }
  return tleSuites;
}

const tleSuites = getTleSuites();

tleSuites.forEach((tleSuite, i) => {
  const testSuiteName = `sgp4catalog ${(i + 1).toString().padStart(2, '0')}`;
  const satellitesRange = `${i * satellitesPerTestSuite + 1} — ${(i + 1) * satellitesPerTestSuite}`;
  describe(`${testSuiteName} (${satellitesRange})`, () => {
    tleSuite.forEach((tle) => {
      const satrec = twoline2satrec(tle.line1, tle.line2);
      it(`satellite ${satrec.satnum.padStart(5, '0')} measurements`, () => {
        for (const time of [0, 360, 720, 1080, 1440]) {
          const result = sgp4(satrec, time)
          expect(result).toMatchSnapshot();
        }
      });
    });
  });
});
