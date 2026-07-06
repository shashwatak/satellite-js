import { describe, it, expect } from 'vitest';
import goodData from './io.json' with { type: 'json' };
import { sunPos } from '../src/sun.js';
import { shadowFraction } from '../src/shadow.js';
import { jday } from '../src/ext.js';
import { twoline2satrec } from '../src/io.js';
import { propagate } from '../src/propagation.js';

const numDigits = 8;

const iss = goodData[0]!;
const issSatrec = twoline2satrec(iss.tleLine1, iss.tleLine2);

function shadowFractionAt(isoDate: string): number {
  const date = new Date(isoDate);
  const state = propagate(issSatrec, date);
  expect(state).not.toBeNull();
  const { rsun } = sunPos(jday(date));
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
    const fraction = shadowFractionAt('2023-08-22T01:25:27.896Z');

    expect(fraction).toBeGreaterThan(0);
    expect(fraction).toBeLessThan(1);
    expect(fraction).toBeCloseTo(0.5148640536131047, numDigits);
  });

  it('integrates propagate, sunPos, and shadowFraction for ISS', () => {
    const date = new Date(`${iss.EPOCH}Z`);
    const state = propagate(issSatrec, date);
    expect(state).not.toBeNull();

    const { rsun } = sunPos(jday(date));
    const fraction = shadowFraction(rsun, state!.position);

    expect(fraction).toBe(0);
  });
});
