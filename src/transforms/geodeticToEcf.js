export default function geodeticToEcf(geodeticCoords) {
  const longitude = geodeticCoords.longitude;
  const latitude = geodeticCoords.latitude;
  const height = geodeticCoords.height;
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
