import { describe, expect, it } from 'vitest';
import { jday } from '../src/ext.js';
import { twoline2satrec } from '../src/io.js';
import { propagate } from '../src/propagation.js';
import { shadowFraction } from '../src/shadow.js';
import { sunPos } from '../src/sun.js';
import goodData from './io.json' with { type: 'json' };

const numDigits = 8;

// biome-ignore lint/style/noNonNullAssertion: no "as const" json import
const iss = goodData[0]!;
const issSatrec = twoline2satrec(iss.tleLine1, iss.tleLine2);

function shadowFractionAt(isoDate: string): number {
  const date = new Date(isoDate);
  const state = propagate(issSatrec, date);
  expect(state).not.toBeNull();
  const { rsun } = sunPos(jday(date));
  // biome-ignore lint/style/noNonNullAssertion: asserted above
  return shadowFraction(rsun, state!.position);
}

describe('shadowFraction', () => {
  it('returns 0 for a sun-lit ISS position from io.json', () => {
    expect(shadowFractionAt(`${iss.EPOCH}Z`)).toBe(0);
  });

  it('returns 1 for an ISS position in umbra', () => {
    expect(shadowFractionAt('2023-08-19T13:25:27.896Z')).toBe(1);
  });

  it('returns a value between 0 and 1 in penumbra', () => {
    // This pass crosses the penumbra in about 8.5 s. The sample sits mid-way
    // through it; correcting the sunPos mean anomaly moved that crossing 12.9 s
    // earlier, so this timestamp shifted with it.
    const fraction = shadowFractionAt('2023-08-22T01:25:14.896Z');

    expect(fraction).toBeGreaterThan(0);
    expect(fraction).toBeLessThan(1);
    expect(fraction).toBeCloseTo(0.500521371489901, numDigits);
  });

  it('integrates propagate, sunPos, and shadowFraction for ISS', () => {
    const date = new Date(`${iss.EPOCH}Z`);
    const state = propagate(issSatrec, date);
    expect(state).not.toBeNull();

    const { rsun } = sunPos(jday(date));
    // biome-ignore lint/style/noNonNullAssertion: asserted above
    const fraction = shadowFraction(rsun, state!.position);

    expect(fraction).toBe(0);
  });
});
