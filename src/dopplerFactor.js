export default function dopplerFactor(location, position, velocity) {
  const earthRotation = 7.292115E-5;
  const c = 299792.458; // Speed of light in km/s

  const range = {
    x: position.x - location.x,
    y: position.y - location.y,
    z: position.z - location.z,
  };
  range.w = Math.sqrt(range.x ** 2 + range.y ** 2 + range.z ** 2);

  const rangeVel = {
    x: velocity.x + earthRotation * location.y,
    y: velocity.y - earthRotation * location.x,
    z: velocity.z,
  };

  const rangeRate = (range.x * rangeVel.x + range.y * rangeVel.y + range.z * rangeVel.z) / range.w;

  // Negative range rate means the satellite is moving towards the observer and
  // its frequency is shifted higher because 1 minus a negative range rate is
  // positive. If the range rate is positive, the satellite is moving away from
  // the observer and its frequency is shifted lower.
  return 1 - rangeRate / c;
}
