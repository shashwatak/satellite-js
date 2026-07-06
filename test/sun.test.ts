import { describe, it, expect } from 'vitest';
import goodData from './io.json' with { type: 'json' };
import { sunPos } from '../src/sun.js';
import { jday } from '../src/ext.js';

const numDigits = 8;
const mockData = goodData[0]!;
const regressionDate = new Date(`${mockData.EPOCH}Z`);

function rsunMagnitude(rsun: { x: number; y: number; z: number }): number {
  return Math.sqrt(rsun.x * rsun.x + rsun.y * rsun.y + rsun.z * rsun.z);
}

describe('sunPos', () => {
  it('returns a sun vector with magnitude close to 1 AU', () => {
    const { rsun } = sunPos(jday(regressionDate));
    // Vallado low-precision model includes orbital eccentricity (~0.98–1.02 AU).
    expect(rsunMagnitude(rsun)).toBeCloseTo(1, 1);
  });

  it('gives the same result for jday(Date) and jday(components)', () => {
    const date = regressionDate;
    const fromDate = sunPos(jday(date));
    const fromComponents = sunPos(jday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ));

    expect(fromComponents.rsun.x).toBeCloseTo(fromDate.rsun.x, numDigits);
    expect(fromComponents.rsun.y).toBeCloseTo(fromDate.rsun.y, numDigits);
    expect(fromComponents.rsun.z).toBeCloseTo(fromDate.rsun.z, numDigits);
    expect(fromComponents.rtasc).toBeCloseTo(fromDate.rtasc, numDigits);
    expect(fromComponents.decl).toBeCloseTo(fromDate.decl, numDigits);
  });

  it('matches regression snapshot', () => {
    const result = sunPos(jday(regressionDate));
    expect({
      rsun: {
        x: result.rsun.x,
        y: result.rsun.y,
        z: result.rsun.z,
      },
      rtasc: result.rtasc,
      decl: result.decl,
    }).toMatchSnapshot();
  });
});
