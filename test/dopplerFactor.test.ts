import { describe, expect, it } from 'vitest';
import { dopplerFactor } from '../src/dopplerFactor.js';
import { jday } from '../src/ext.js';
import { twoline2satrec } from '../src/io.js';
import { gstime, propagate, sgp4 } from '../src/propagation.js';
import {
  degreesToRadians,
  ecfToEci,
  eciToEcf,
  eciToEcfVelocity,
  geodeticToEcf,
} from '../src/transforms.js';

const numDigits = 8;

const earthRadius = 6378.137;
const sincos45deg = Math.sqrt(2) / 2;

describe('Doppler factor', () => {
  it('without observer movement', () => {
    // North Pole
    const observerEcf = {
      x: 0,
      y: 0,
      z: earthRadius,
    };
    const positionEcf = {
      x: 0,
      y: 0,
      z: earthRadius + 500,
    };
    // Escape velocity
    const velocityEcf = {
      x: 7.91,
      y: 0,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1, numDigits);
  });

  it('movement of observer is not affected', () => {
    const observerEcf = {
      x: earthRadius,
      y: 0,
      z: 0,
    };
    const positionEcf = {
      x: earthRadius + 500,
      y: 0,
      z: 0,
    };
    const velocityEcf = {
      x: 0,
      y: 7.91,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1, numDigits);
  });

  // Object moving away from observer
  it('special case', () => {
    const observerEcf = {
      x: earthRadius,
      y: 0,
      z: 0,
    };
    const positionEcf = {
      x: (earthRadius + 500) * sincos45deg, // z*sin(45)
      y: (earthRadius + 500) * sincos45deg, // z*cos(45)
      z: 0,
    };
    const velocityEcf = {
      x: 7.91 * sincos45deg,
      y: 7.91 * sincos45deg,
      z: 0,
    };
    // Expected value derived by hand for a true ECF velocity, with s = sin 45°:
    //   range = position - observer = ((R + 500) s - R, (R + 500) s, 0)
    //   range · velocity = 7.91 s (2 (R + 500) s - R) = 7.91 ((R + 500) - R s)
    //   |range|² = (R + 500)² - 2 R (R + 500) s + R²
    //   factor = 1 - (range · velocity) / (|range| c)
    //          = 1 - 18731.774430868... / (5093.944967893... × 299792.458)
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(0.9999877339715508, numDigits);
  });

  it('calculated from a negative range rate', () => {
    // North Pole
    const observerEcf = {
      x: -500,
      y: 0,
      z: earthRadius + 500,
    };
    const positionEcf = {
      x: 500,
      y: 0,
      z: earthRadius,
    };
    // Escape velocity
    const velocityEcf = {
      x: -7.91,
      y: -3.12,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1.0000235993898179, numDigits);
  });
});

describe('Doppler factor of a propagated satellite', () => {
  // Same ISS TLE and observer as test/wasm/bulk-propagator.user.test.ts
  const satrec = twoline2satrec(
    '1 25544U 98067A   25191.49368601  .00007939  00000-0  14455-3 0  9995',
    '2 25544  51.6350 191.5447 0002161   1.4001 135.0516 15.50469967518770',
  );
  const observerGeodetic = {
    latitude: degreesToRadians(41),
    longitude: degreesToRadians(-71),
    height: 1,
  };
  const observerEcf = geodeticToEcf(observerGeodetic);
  const c = 299792.458; // km/s
  const earthRotation = 7.292115e-5; // rad/s

  // Eight instants 12 minutes apart, spanning most of an orbit, starting inside a pass
  // over the observer.
  const dates = Array.from(
    { length: 8 },
    (_, k) => new Date(Date.UTC(2025, 6, 10, 23, 49, 24) + k * 12 * 60_000),
  );

  type Vec3 = { x: number; y: number; z: number };
  const subtract = (a: Vec3, b: Vec3): Vec3 => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  });
  const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
  const length = (a: Vec3) => Math.sqrt(dot(a, a));

  // The documented way: everything in ECF, with the velocity from eciToEcfVelocity.
  function factorViaEcf(date: Date): number {
    const state = propagate(satrec, date);
    if (!state) throw new Error('propagation failed');
    const gmst = gstime(date);
    return dopplerFactor(
      observerEcf,
      eciToEcf(state.position, gmst),
      eciToEcfVelocity(state.position, state.velocity, gmst),
    );
  }

  it('is the same computed entirely in ECI, where the observer moves with the Earth', () => {
    for (const date of dates) {
      const state = propagate(satrec, date);
      if (!state) throw new Error('propagation failed');
      const gmst = gstime(date);
      const observerEci = ecfToEci(observerEcf, gmst);
      // A point fixed to the Earth moves at ω × r in ECI, with ω along the z axis.
      const observerVelocityEci = {
        x: -earthRotation * observerEci.y,
        y: earthRotation * observerEci.x,
        z: 0,
      };
      const range = subtract(state.position, observerEci);
      const relativeVelocity = subtract(state.velocity, observerVelocityEci);
      const eciFactor = 1 - dot(range, relativeVelocity) / length(range) / c;

      expect(factorViaEcf(date)).toBeCloseTo(eciFactor, 12);
    }
  });

  it('matches the finite difference of the slant range', () => {
    // Central difference of the distance between the satellite and the fixed
    // observer in ECF, 0.5 s either side. It uses sgp4() with minutes since the
    // epoch so no precision is lost in a Julian date, and it uses no velocity at
    // all, so it checks the sign and the Earth-rotation term independently.
    // Measured agreement is about 1e-10 (0.05 Hz at 437 MHz); the pre-fix
    // formula is 2e-8 to 9e-7 away at these instants.
    const deltaSeconds = 0.5;
    const rangeAt = (minutesSinceEpoch: number) => {
      const state = sgp4(satrec, minutesSinceEpoch);
      if (!state) throw new Error('propagation failed');
      const gmst = gstime(satrec.jdsatepoch + minutesSinceEpoch / 1440);
      return length(subtract(eciToEcf(state.position, gmst), observerEcf));
    };

    for (const date of dates) {
      const minutesSinceEpoch = (jday(date) - satrec.jdsatepoch) * 1440;
      const rangeRate =
        (rangeAt(minutesSinceEpoch + deltaSeconds / 60) -
          rangeAt(minutesSinceEpoch - deltaSeconds / 60)) /
        (2 * deltaSeconds);

      expect(factorViaEcf(date)).toBeCloseTo(1 - rangeRate / c, 9);
    }
  });

  it('matches Skyfield at 2025-07-10T23:49:24Z', () => {
    // Golden value from Skyfield 1.55 (sgp4 2.27), an independent implementation
    // that models the observer's motion itself, so its topocentric range rate
    // does not depend on the ECI/ECF convention this function uses:
    //
    //   from skyfield.api import EarthSatellite, load, wgs84
    //   ts = load.timescale(builtin=True)
    //   sat = EarthSatellite(line1, line2, 'ISS (ZARYA)', ts)
    //   observer = wgs84.latlon(41.0, -71.0, elevation_m=1000.0)
    //   t = ts.utc(2025, 7, 10, 23, 49, 24)
    //   *_, range_rate = (sat - observer).at(t).frame_latlon_and_rates(observer)
    //   range_rate.km_per_s  # -2.840436061197389; altitude 17.6°, range 1100.46 km
    //
    // The remaining difference is dominated by Skyfield rotating the Earth with
    // UT1 (UT1 - UTC = +53 ms on this date) where gstime uses UTC: about 19 m of
    // observer position and 0.1 m/s of range rate, or 3e-10 in the factor. The
    // pre-fix formula is 4e-7 (180 Hz at 437 MHz) away from this value.
    const skyfieldRangeRate = -2.840436061197389;

    expect(factorViaEcf(new Date('2025-07-10T23:49:24Z'))).toBeCloseTo(
      1 - skyfieldRangeRate / c,
      8,
    );
  });
});
