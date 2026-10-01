import { describe, expect, it } from 'vitest';
import {
  degreesLat,
  degreesLong,
  ecfToEci,
  ecfToLookAngles,
  eciToEcf,
  eciToEcfVelocity,
  eciToGeodetic,
  geodeticToEcf,
  radiansLat,
  radiansLong,
} from '../src/transforms.js';
import { compareVectors } from './compareVectors.js';
import transformData from './transforms.json' with { type: 'json' };

const numDigits = 6;

describe('Latitude & longitude conversions', () => {
  const {
    validLatitudes,
    validLongitudes,
    validGeodeticToEcf,
    validEciToGeodetic,
    validEciToEcf,
    validEcfToEci,
    validEcfToLookangles,
    invalidLatitudes,
    invalidLongitudes,
  } = transformData;

  validLatitudes.forEach((item) => {
    it(`convert valid latitude value (${item.radians} radians) to degrees`, () => {
      expect(degreesLat(item.radians)).toBeCloseTo(item.degrees, numDigits);
    });
    it(`convert valid latitude value (${item.degrees} degrees) to radians`, () => {
      expect(radiansLat(item.degrees)).toBeCloseTo(item.radians, numDigits);
    });
  });

  validLongitudes.forEach((item) => {
    it(`convert valid longitude value (${item.radians} radians) to degrees`, () => {
      expect(degreesLong(item.radians)).toBeCloseTo(item.degrees, numDigits);
    });
    it(`convert valid longitude value (${item.degrees} degrees) to radians`, () => {
      expect(radiansLong(item.degrees)).toBeCloseTo(item.radians, numDigits);
    });
  });

  validGeodeticToEcf.forEach((item) => {
    it('convert valid LLA coordinates to ECF', () => {
      const ecfCoordinates = geodeticToEcf(item.lla);
      compareVectors(ecfCoordinates, item.ecf, 8);
    });
  });

  validEciToGeodetic.forEach((item) => {
    it('convert valid ECI coordinates to LLA', () => {
      const llaCoordinates = eciToGeodetic(item.eci, item.gmst);
      expect(llaCoordinates.longitude).toBeCloseTo(item.lla.longitude);
      expect(llaCoordinates.latitude).toBeCloseTo(item.lla.latitude);
      expect(llaCoordinates.height).toBeCloseTo(item.lla.height);
    });
  });

  validEciToEcf.forEach((item) => {
    it('convert valid ECI coordinates to ECF', () => {
      const ecfCoordinates = eciToEcf(item.eci, item.gmst);
      compareVectors(ecfCoordinates, item.ecf, 8);
    });
  });

  validEcfToEci.forEach((item) => {
    it('convert valid ECF coordinates to ECI', () => {
      const eciCoordinates = ecfToEci(item.ecf, item.gmst);
      compareVectors(eciCoordinates, item.eci, 8);
    });
  });

  validEcfToLookangles.forEach((item) => {
    it('convert valid ECF coordinates to RAE', () => {
      const raeCoordinates = ecfToLookAngles(item.lla, item.satelliteEcf);
      expect(raeCoordinates.rangeSat).toBeCloseTo(item.rae.rangeSat);
      expect(raeCoordinates.azimuth).toBeCloseTo(item.rae.azimuth);
      expect(raeCoordinates.elevation).toBeCloseTo(item.rae.elevation);
    });
  });

  invalidLatitudes.forEach((item) => {
    it(`convert invalid latitude value (${item.radians} radians) to degrees`, () => {
      expect(() => degreesLat(item.radians)).toThrowError(RangeError);
    });
    it(`convert invalid latitude value (${item.degrees} degrees) to radians`, () => {
      expect(() => radiansLat(item.degrees)).toThrowError(RangeError);
    });
  });

  invalidLongitudes.forEach((item) => {
    it(`convert invalid longitude value (${item.radians} radians) to degrees`, () => {
      expect(() => degreesLong(item.radians)).toThrowError(RangeError);
    });
    it(`convert invalid longitude value (${item.degrees} degrees) to radians`, () => {
      expect(() => radiansLong(item.degrees)).toThrowError(RangeError);
    });
  });
});

describe('ECI to ECF velocity', () => {
  const earthRotation = 7.292115e-5;
  const gmst = 1.2345;

  it('is zero for a point fixed to the rotating Earth', () => {
    // In ECI a point on the equator moves east at ω R; relative to the Earth it is at rest.
    const radius = 6378.137;
    const positionEci = {
      x: radius * Math.cos(gmst),
      y: radius * Math.sin(gmst),
      z: 0,
    };
    const velocityEci = {
      x: -earthRotation * radius * Math.sin(gmst),
      y: earthRotation * radius * Math.cos(gmst),
      z: 0,
    };
    compareVectors(
      eciToEcfVelocity(positionEci, velocityEci, gmst),
      { x: 0, y: 0, z: 0 },
      9,
    );
  });

  it('only rotates the axes on the rotation axis, where ω × r is zero', () => {
    const positionEci = { x: 0, y: 0, z: 7000 };
    const velocityEci = { x: 1.5, y: -2.5, z: 0.25 };
    compareVectors(
      eciToEcfVelocity(positionEci, velocityEci, gmst),
      eciToEcf(velocityEci, gmst),
    );
  });
});
