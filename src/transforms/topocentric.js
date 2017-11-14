import geodeticToEcf from './geodeticToEcf';

export default function topocentric(observerCoords, satelliteCoords) {
  // http://www.celestrak.com/columns/v02n02/
  // TS Kelso's method, except I'm using ECF frame
  // and he uses ECI.

  const {
    longitude,
    latitude,
  } = observerCoords;

  const observerEcf = geodeticToEcf(observerCoords);

  const rx = satelliteCoords.x - observerEcf.x;
  const ry = satelliteCoords.y - observerEcf.y;
  const rz = satelliteCoords.z - observerEcf.z;

  const topS =
    ((Math.sin(latitude) * Math.cos(longitude) * rx) +
    (Math.sin(latitude) * Math.sin(longitude) * ry)) -
    (Math.cos(latitude) * rz);

  const topE =
    (-Math.sin(longitude) * rx) +
    (Math.cos(longitude) * ry);

  const topZ =
    (Math.cos(latitude) * Math.cos(longitude) * rx) +
    (Math.cos(latitude) * Math.sin(longitude) * ry) +
    (Math.sin(latitude) * rz);

  return { topS, topE, topZ };
}
