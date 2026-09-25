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
  const sinLat = Math.sin(latitude);
  const cosLat = Math.cos(latitude);
  const sinLon = Math.sin(longitude);
  const cosLon = Math.cos(longitude);

  const normal =
    a / Math.sqrt(1 - e2 * (sinLat * sinLat));

  const x = (normal + height) * cosLat * cosLon;
  const y = (normal + height) * cosLat * sinLon;
  const z = (normal * (1 - e2) + height) * sinLat;

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

  const kmax = 20;
  let k = 0;
  let latitude = Math.atan2(eci.z, Math.sqrt(eci.x * eci.x + eci.y * eci.y));
  let C = 0;
  while (k++ < kmax) {
    C = 1 / Math.sqrt(1 - e2 * (Math.sin(latitude) * Math.sin(latitude)));
    latitude = Math.atan2(eci.z + a * C * e2 * Math.sin(latitude), R);
  }
  const height = R / Math.cos(latitude) - a * C;
  return { longitude, latitude, height };
}

export function ecfToEci(ecf: EcfVec3<number>, gmst: GMSTime): EciVec3<number> {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  const cosGmst = Math.cos(gmst);
  const sinGmst = Math.sin(gmst);
  const X = ecf.x * cosGmst - ecf.y * sinGmst;
  const Y = ecf.x * sinGmst + ecf.y * cosGmst;
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

  const cosGmst = Math.cos(gmst);
  const sinGmst = Math.sin(gmst);
  const x = eci.x * cosGmst + eci.y * sinGmst;
  const y = eci.x * -sinGmst + eci.y * cosGmst;
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

  const sinLat = Math.sin(latitude);
  const cosLat = Math.cos(latitude);
  const sinLon = Math.sin(longitude);
  const cosLon = Math.cos(longitude);

  const topS =
    sinLat * cosLon * rx +
    sinLat * sinLon * ry -
    cosLat * rz;

  const topE = -sinLon * rx + cosLon * ry;

  const topZ =
    cosLat * cosLon * rx +
    cosLat * sinLon * ry +
    sinLat * rz;

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
