import { describe, expect, it } from 'vitest';
import { jday } from '../src/ext.js';
import { sunPos } from '../src/sun.js';
import goodData from './io.json' with { type: 'json' };

const numDigits = 8;
// biome-ignore lint/style/noNonNullAssertion: no "as const" for json imports
const mockData = goodData[0]!;
const regressionDate = new Date(`${mockData.EPOCH}Z`);

function rsunMagnitude(rsun: { x: number; y: number; z: number }): number {
  return Math.sqrt(rsun.x * rsun.x + rsun.y * rsun.y + rsun.z * rsun.z);
}

/**
 * Day of year (1-based, UTC) at which the Earth-Sun distance reaches its
 * extremum during `year`, sampled hourly.
 */
function extremumDayOfYear(year: number, kind: 'min' | 'max'): number {
  const startJday = jday(year, 1, 1, 0, 0, 0);
  let bestJday = startJday;
  let best =
    kind === 'min' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  for (let hour = 0; hour < 365 * 24; hour++) {
    const currentJday = startJday + hour / 24;
    const distance = rsunMagnitude(sunPos(currentJday).rsun);
    const isBetter = kind === 'min' ? distance < best : distance > best;
    if (isBetter) {
      best = distance;
      bestJday = currentJday;
    }
  }

  return Math.floor(bestJday - startJday) + 1;
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
    const fromComponents = sunPos(
      jday(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds(),
      ),
    );

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

/**
 * Checks on Earth's orbit that any correct solar model reproduces, so they
 * need no external ephemeris.
 *
 * These look at a full year instead of one date on purpose: an error in the
 * mean anomaly shows up as a sinusoid with a one-year period, so it passes
 * through zero twice a year and a single date can show almost nothing.
 */
describe('sunPos orbital geometry', () => {
  // Spanning the model's documented 1950-2050 validity window.
  const years = [1950, 2000, 2026, 2050];

  it.each(years)('puts perihelion in early January (%i)', (year) => {
    // Earth reaches perihelion on Jan 2-5. An error in the mean anomaly shifts
    // the eccentricity term in phase and moves this by weeks.
    const dayOfYear = extremumDayOfYear(year, 'min');
    expect(dayOfYear).toBeGreaterThanOrEqual(1);
    expect(dayOfYear).toBeLessThanOrEqual(10);
  });

  it.each(years)('puts aphelion in early July (%i)', (year) => {
    // Aphelion falls on Jul 3-7, i.e. day of year 184-188.
    const dayOfYear = extremumDayOfYear(year, 'max');
    expect(dayOfYear).toBeGreaterThanOrEqual(180);
    expect(dayOfYear).toBeLessThanOrEqual(190);
  });

  it('reproduces the Earth-Sun distance at the J2000.0 epoch', () => {
    // 2000-01-01 12:00 UT is a few days after perihelion, so the Sun is near
    // its closest: 0.9833 AU.
    const distance = rsunMagnitude(sunPos(jday(2000, 1, 1, 12, 0, 0)).rsun);
    expect(distance).toBeCloseTo(0.9833, 3);
  });
});
