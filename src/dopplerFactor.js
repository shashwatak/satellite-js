export default function dopplerFactor(location, position, velocity) {
  const mfactor = 7.292115E-5;
  const c = 299792.458; // Speed of light in km/s

  const range = {
    x: position.x - location.x,
    y: position.y - location.y,
    z: position.z - location.z,
  };
  range.w = Math.sqrt(range.x ** 2 + range.y ** 2 + range.z ** 2);

  const rangeVel = {
    x: velocity.x + mfactor * location.y,
    y: velocity.y - mfactor * location.x,
    z: velocity.z,
  };

  function sign(value) {
    return value >= 0 ? 1 : -1;
  }

  const rangeRate = (range.x * rangeVel.x + range.y * rangeVel.y + range.z * rangeVel.z) / range.w;

  return (1 + (rangeRate / c) * sign(rangeRate));
}
