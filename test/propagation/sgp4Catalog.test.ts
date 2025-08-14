import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { sgp4, twoline2satrec } from '../../src/index.js';
import expected from './sgp4CatalogResults.json' with { type: "json" };

const satellitesPerTestSuite = 500;

type NumericValues<T> = { [K in keyof T]: number };

function haveValuesClose<T extends NumericValues<T>>(actual: T, expected: T, precision = 13): boolean {
  for (const key in expected) {
    if (expected.hasOwnProperty(key) && actual.hasOwnProperty(key)) {
      const expectedNumber = expected[key];
      const actualNumber = actual[key];
      if (typeof expectedNumber !== 'number' || typeof actualNumber !== 'number') {
        return false;
      }
      const pass = Math.abs(actualNumber - expectedNumber) < Math.pow(10, -precision) / 2;
      if (!pass) {
        return false;
      }
    }
  }
  return true;
}

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

tleSuites.forEach((tleSuite, tleSuiteIndex) => {
  const testSuiteName = `sgp4catalog ${(tleSuiteIndex + 1).toString().padStart(2, '0')}`;
  const satellitesRange = `${tleSuiteIndex * satellitesPerTestSuite + 1} — ${(tleSuiteIndex + 1) * satellitesPerTestSuite}`;
  describe(`${testSuiteName} (${satellitesRange})`, () => {
    tleSuite.forEach((tle, tleIndex) => {
      const satrec = twoline2satrec(tle.line1, tle.line2);
      it(`satellite ${String(satrec.satnum).padStart(5, '0')} measurements`, () => {
        [0, 360, 720, 1080, 1440].forEach((time, timeIndex) => {
          const result = sgp4(satrec, time);
          if (!result) {
            expect(result).toEqual((expected as any)[tleSuiteIndex][tleIndex][timeIndex]);
            return;
          }
          expect(expected).toBeDefined();
          expect(haveValuesClose(result.position, (expected as any)[tleSuiteIndex][tleIndex][timeIndex].meanElements)).toBe(true);
          expect(haveValuesClose(result.velocity, (expected as any)[tleSuiteIndex][tleIndex][timeIndex].meanElements)).toBe(true);
          expect(haveValuesClose(result.meanElements, (expected as any)[tleSuiteIndex][tleIndex][timeIndex].meanElements)).toBe(true);
        });
      });
    });
  });
});
