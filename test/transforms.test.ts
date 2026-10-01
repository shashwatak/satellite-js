import { describe, expect, it } from 'vitest';
import {
  degreesLat,
  degreesLong,
  ecfToEci,
  ecfToLookAngles,
  eciToEcf,
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

describe('ECI to geodetic at and near the poles', () => {
  const b = 6356.7523142; // WGS84 semi-minor axis, the ellipsoid's polar radius

  it('returns the height above the pole for points on the rotation axis', () => {
    for (const z of [7000, -7000, b, 42164]) {
      const lla = eciToGeodetic({ x: 0, y: 0, z }, 0);
      expect(lla.latitude).toBeCloseTo(Math.sign(z) * (Math.PI / 2), 12);
      expect(lla.height).toBeCloseTo(Math.abs(z) - b, 9);
    }
  });

  it('is continuous 1 mm off the rotation axis', () => {
    const lla = eciToGeodetic({ x: 1e-6, y: 0, z: 7000 }, 0);
    expect(lla.height).toBeCloseTo(7000 - b, 9);
  });

  it('inverts geodeticToEcf from pole to pole', () => {
    const longitude = 0.3;
    const latitudesDegrees = [
      -90, -89.999999, -80, -60, -40, -20, 0, 20, 40, 60, 80, 89.999999, 90,
    ];
    for (const latitudeDegrees of latitudesDegrees) {
      for (const height of [0, 400, 35786]) {
        const latitude = (latitudeDegrees * Math.PI) / 180;
        const lla = eciToGeodetic(
          geodeticToEcf({ longitude, latitude, height }),
          0,
        );
        expect(lla.latitude).toBeCloseTo(latitude, 9);
        expect(lla.height).toBeCloseTo(height, 9);
        if (Math.abs(latitudeDegrees) < 90) {
          expect(lla.longitude).toBeCloseTo(longitude, 9);
        }
      }
    }
  });
});
