import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { sgp4, twoline2satrec } from '../../src/index.js';

const satellitesPerTestSuite = 500;

function getTleSuites() {
  const tleSuites: { line1: string; line2: string }[][] = [];
  const text = fs.readFileSync(path.resolve(import.meta.dirname, './tle.txt'), 'utf-8')
    // remove BOM marker
    .replace(/^\uFEFF/, '');
  const lines = text.split('\n');
  while (lines.length > 0) {
    const suiteLines = lines.splice(0, 2 * satellitesPerTestSuite);
    const tleSuite: { line1: string; line2: string }[] = [];
    for (let i = 0; i < suiteLines.length; i += 2) {
      const line1 = suiteLines[i]!;
      const line2 = suiteLines[i + 1]!;
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
      it(`satellite ${String(satrec.satnum).padStart(5, '0')} measurements`, () => {
        for (const time of [0, 360, 720, 1080, 1440]) {
          const result = sgp4(satrec, time)
          expect(result).toMatchSnapshot();
        }
      });
    });
  });
});
