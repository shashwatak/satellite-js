export default function eciToGeodetic(eciCoords, gmst) {
  // http://www.celestrak.com/columns/v02n03/
  const a = 6378.137;
  const b = 6356.7523142;
  const R = Math.sqrt((eciCoords.x * eciCoords.x) + (eciCoords.y * eciCoords.y));
  const f = (a - b) / a;
  const e2 = ((2 * f) - (f * f));
  const longitude = Math.atan2(eciCoords.y, eciCoords.x) - gmst;
  const kmax = 20;
  let k = 0;
  let latitude = Math.atan2(
    eciCoords.z,
    Math.sqrt((eciCoords.x * eciCoords.x) + (eciCoords.y * eciCoords.y)),
  );
  let C;
  while (k < kmax) {
    C = 1 / Math.sqrt(1 - (e2 * (Math.sin(latitude) * Math.sin(latitude))));
    latitude = Math.atan2(eciCoords.z + (a * C * e2 * Math.sin(latitude)), R);
    k += 1;
  }
  const height = (R / Math.cos(latitude)) - (a * C);
  return { longitude, latitude, height };
}
