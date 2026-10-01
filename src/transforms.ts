import type {
  Degrees,
  EcfVec3,
  EciVec3,
  GeodeticLocation,
  GMSTime,
  Kilometer,
  LookAngles,
  Radians,
} from './common-types.js';
import { deg2rad, pi, rad2deg, twoPi } from './constants.js';

export function radiansToDegrees(radians: Radians): Degrees {
  return radians * rad2deg;
}

export function degreesToRadians(degrees: Degrees): Radians {
  return degrees * deg2rad;
}

export function degreesLat(radians: Radians): Degrees {
  if (radians < -pi / 2 || radians > pi / 2) {
    throw new RangeError('Latitude radians must be in range [-pi/2; pi/2].');
  }
  return radiansToDegrees(radians);
}

export function degreesLong(radians: Radians): Degrees {
  if (radians < -pi || radians > pi) {
    throw new RangeError('Longitude radians must be in range [-pi; pi].');
  }
  return radiansToDegrees(radians);
}

export function radiansLat(degrees: Degrees): Radians {
  if (degrees < -90 || degrees > 90) {
    throw new RangeError('Latitude degrees must be in range [-90; 90].');
  }
  return degreesToRadians(degrees);
}

export function radiansLong(degrees: Degrees): Radians {
  if (degrees < -180 || degrees > 180) {
    throw new RangeError('Longitude degrees must be in range [-180; 180].');
  }
  return degreesToRadians(degrees);
}

export function geodeticToEcf({
  longitude,
  latitude,
  height,
}: GeodeticLocation): EcfVec3<Kilometer> {
  const a = 6378.137;
  const b = 6356.7523142;
  const f = (a - b) / a;
  const e2 = 2 * f - f * f;
  const normal =
    a / Math.sqrt(1 - e2 * (Math.sin(latitude) * Math.sin(latitude)));

  const x = (normal + height) * Math.cos(latitude) * Math.cos(longitude);
  const y = (normal + height) * Math.cos(latitude) * Math.sin(longitude);
  const z = (normal * (1 - e2) + height) * Math.sin(latitude);

  return {
    x,
    y,
    z,
  };
}

export function eciToGeodetic(
  eci: EciVec3<Kilometer>,
  gmst: GMSTime,
): GeodeticLocation {
  // http://www.celestrak.com/columns/v02n03/
  const a = 6378.137;
  const b = 6356.7523142;
  const R = Math.sqrt(eci.x * eci.x + eci.y * eci.y);
  const f = (a - b) / a;
  const e2 = 2 * f - f * f;

  // the one-liner below is an alternative to the loops approach used originally:
  // let longitude = Math.atan2(eci.y, eci.x) - gmst;
  // while (longitude < -pi) {
  //   longitude += twoPi;
  // }
  // while (longitude > pi) {
  //   longitude -= twoPi;
  // }
  const longitude =
    ((((Math.atan2(eci.y, eci.x) - gmst + pi) % twoPi) + twoPi) % twoPi) - pi;

  // Iterate the latitude until its change is within tolerance, as Kelso's
  // column says to; 4 to 5 passes are typical, kmax is a safety cap.
  const kmax = 20;
  const tolerance = 1e-12;
  let k = 0;
  let latitude = Math.atan2(eci.z, R);
  let previousLatitude: number;
  do {
    previousLatitude = latitude;
    const sinLatitude = Math.sin(latitude);
    const C = 1 / Math.sqrt(1 - e2 * (sinLatitude * sinLatitude));
    latitude = Math.atan2(eci.z + a * C * e2 * sinLatitude, R);
  } while (Math.abs(latitude - previousLatitude) > tolerance && ++k < kmax);

  // height = R cos(lat) + z sin(lat) - a / C follows from geodeticToEcf and,
  // unlike R / cos(lat) - a C, has no singularity on the rotation axis.
  const sinLatitude = Math.sin(latitude);
  const cosLatitude = Math.cos(latitude);
  const C = 1 / Math.sqrt(1 - e2 * (sinLatitude * sinLatitude));
  const height = R * cosLatitude + eci.z * sinLatitude - a / C;
  return { longitude, latitude, height };
}

export function ecfToEci(ecf: EcfVec3<number>, gmst: GMSTime): EciVec3<number> {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  const X = ecf.x * Math.cos(gmst) - ecf.y * Math.sin(gmst);
  const Y = ecf.x * Math.sin(gmst) + ecf.y * Math.cos(gmst);
  const Z = ecf.z;
  return { x: X, y: Y, z: Z };
}

export function eciToEcf(eci: EciVec3<number>, gmst: GMSTime): EcfVec3<number> {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  //
  // Inverse:
  // [X]     [C  S  0][X]
  // [Y]  =  [-S C  0][Y]
  // [Z]ecf  [0  0  1][Z]eci

  const x = eci.x * Math.cos(gmst) + eci.y * Math.sin(gmst);
  const y = eci.x * -Math.sin(gmst) + eci.y * Math.cos(gmst);
  const { z } = eci;

  return {
    x,
    y,
    z,
  };
}

interface Topocentric {
  /**
   * Positive horizontal vector S due south.
   */
  topS: number;
  /**
   * Positive horizontal vector E due east.
   */
  topE: number;
  /**
   * Vector Z normal to the surface of the earth (up).
   */
  topZ: number;
}

function topocentric(
  observerGeodetic: GeodeticLocation,
  satelliteEcf: EcfVec3<Kilometer>,
): Topocentric {
  // http://www.celestrak.com/columns/v02n02/
  // TS Kelso's method, except I'm using ECF frame
  // and he uses ECI.

  const { longitude, latitude } = observerGeodetic;

  const observerEcf = geodeticToEcf(observerGeodetic);

  const rx = satelliteEcf.x - observerEcf.x;
  const ry = satelliteEcf.y - observerEcf.y;
  const rz = satelliteEcf.z - observerEcf.z;

  const topS =
    Math.sin(latitude) * Math.cos(longitude) * rx +
    Math.sin(latitude) * Math.sin(longitude) * ry -
    Math.cos(latitude) * rz;

  const topE = -Math.sin(longitude) * rx + Math.cos(longitude) * ry;

  const topZ =
    Math.cos(latitude) * Math.cos(longitude) * rx +
    Math.cos(latitude) * Math.sin(longitude) * ry +
    Math.sin(latitude) * rz;

  return { topS, topE, topZ };
}

function topocentricToLookAngles(tc: Topocentric): LookAngles {
  const { topS, topE, topZ } = tc;
  const rangeSat = Math.sqrt(topS * topS + topE * topE + topZ * topZ);
  const El = Math.asin(topZ / rangeSat);
  const Az = Math.atan2(-topE, topS) + pi;

  return {
    azimuth: Az,
    elevation: El,
    rangeSat, // Range in km
  };
}

export function ecfToLookAngles(
  observerGeodetic: GeodeticLocation,
  satelliteEcf: EcfVec3<Kilometer>,
): LookAngles {
  const topocentricCoords = topocentric(observerGeodetic, satelliteEcf);
  return topocentricToLookAngles(topocentricCoords);
}
