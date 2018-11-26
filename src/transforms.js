import {
  pi,
  twoPi,
  rad2deg,
  deg2rad,
} from './constants';

export function radiansToDegrees(radians) {
  return radians * rad2deg;
}

export function degreesToRadians(degrees) {
  return degrees * deg2rad;
}

export function degreesLat(radians) {
  if (radians < (-pi / 2) || radians > (pi / 2)) {
    throw new RangeError('Latitude radians must be in range [-pi/2; pi/2].');
  }
  return radiansToDegrees(radians);
}

export function degreesLong(radians) {
  if (radians < -pi || radians > pi) {
    throw new RangeError('Longitude radians must be in range [-pi; pi].');
  }
  return radiansToDegrees(radians);
}

export function radiansLat(degrees) {
  if (degrees < -90 || degrees > 90) {
    throw new RangeError('Latitude degrees must be in range [-90; 90].');
  }
  return degreesToRadians(degrees);
}

export function radiansLong(degrees) {
  if (degrees < -180 || degrees > 180) {
    throw new RangeError('Longitude degrees must be in range [-180; 180].');
  }
  return degreesToRadians(degrees);
}

export function geodeticToEcf(geodetic) {
  const {
    longitude,
    latitude,
    height,
  } = geodetic;

  const a = 6378.137;
  const b = 6356.7523142;
  const f = (a - b) / a;
  const e2 = ((2 * f) - (f * f));
  const normal = a / Math.sqrt(1 - (e2 * (Math.sin(latitude) * Math.sin(latitude))));

  const x = (normal + height) * Math.cos(latitude) * Math.cos(longitude);
  const y = (normal + height) * Math.cos(latitude) * Math.sin(longitude);
  const z = ((normal * (1 - e2)) + height) * Math.sin(latitude);

  return {
    x,
    y,
    z,
  };
}

export function eciToGeodetic(eci, gmst) {
  // http://www.celestrak.com/columns/v02n03/
  const a = 6378.137;
  const b = 6356.7523142;
  const R = Math.sqrt((eci.x * eci.x) + (eci.y * eci.y));
  const f = (a - b) / a;
  const e2 = ((2 * f) - (f * f));

  let longitude = Math.atan2(eci.y, eci.x) - gmst;
  while (longitude < -pi) {
    longitude += twoPi;
  }
  while (longitude > pi) {
    longitude -= twoPi;
  }

  const kmax = 20;
  let k = 0;
  let latitude = Math.atan2(
    eci.z,
    Math.sqrt((eci.x * eci.x) + (eci.y * eci.y)),
  );
  let C;
  while (k < kmax) {
    C = 1 / Math.sqrt(1 - (e2 * (Math.sin(latitude) * Math.sin(latitude))));
    latitude = Math.atan2(eci.z + (a * C * e2 * Math.sin(latitude)), R);
    k += 1;
  }
  const height = (R / Math.cos(latitude)) - (a * C);
  return { longitude, latitude, height };
}

export function ecfToEci(ecf, gmst) {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  const X = (ecf.x * Math.cos(gmst)) - (ecf.y * Math.sin(gmst));
  const Y = (ecf.x * (Math.sin(gmst))) + (ecf.y * Math.cos(gmst));
  const Z = ecf.z;
  return { x: X, y: Y, z: Z };
}

export function eciToEcf(eci, gmst) {
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

  const x = (eci.x * Math.cos(gmst)) + (eci.y * Math.sin(gmst));
  const y = (eci.x * (-Math.sin(gmst))) + (eci.y * Math.cos(gmst));
  const { z } = eci;

  return {
    x,
    y,
    z,
  };
}

function topocentric(observerGeodetic, satelliteEcf) {
  // http://www.celestrak.com/columns/v02n02/
  // TS Kelso's method, except I'm using ECF frame
  // and he uses ECI.

  const {
    longitude,
    latitude,
  } = observerGeodetic;

  const observerEcf = geodeticToEcf(observerGeodetic);

  const rx = satelliteEcf.x - observerEcf.x;
  const ry = satelliteEcf.y - observerEcf.y;
  const rz = satelliteEcf.z - observerEcf.z;

  const topS = ((Math.sin(latitude) * Math.cos(longitude) * rx)
      + (Math.sin(latitude) * Math.sin(longitude) * ry))
    - (Math.cos(latitude) * rz);

  const topE = (-Math.sin(longitude) * rx)
    + (Math.cos(longitude) * ry);

  const topZ = (Math.cos(latitude) * Math.cos(longitude) * rx)
    + (Math.cos(latitude) * Math.sin(longitude) * ry)
    + (Math.sin(latitude) * rz);

  return { topS, topE, topZ };
}

/**
 * @param {Object} tc
 * @param {Number} tc.topS Positive horizontal vector S due south.
 * @param {Number} tc.topE Positive horizontal vector E due east.
 * @param {Number} tc.topZ Vector Z normal to the surface of the earth (up).
 * @returns {Object}
 */
function topocentricToLookAngles(tc) {
  const { topS, topE, topZ } = tc;
  const rangeSat = Math.sqrt((topS * topS) + (topE * topE) + (topZ * topZ));
  const El = Math.asin(topZ / rangeSat);
  const Az = Math.atan2(-topE, topS) + pi;

  return {
    azimuth: Az,
    elevation: El,
    rangeSat, // Range in km
  };
}

export function ecfToLookAngles(observerGeodetic, satelliteEcf) {
  const topocentricCoords = topocentric(observerGeodetic, satelliteEcf);
  return topocentricToLookAngles(topocentricCoords);
}
