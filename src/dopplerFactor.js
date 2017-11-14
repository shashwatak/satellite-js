export default function dopplerFactor(location, position, velocity) {
  const currentRange = Math.sqrt(
    ((position.x - location.x) ** 2) +
    ((position.y - location.y) ** 2) +
    ((position.z - location.z) ** 2));

  const nextPos = {
    x: position.x + velocity.x,
    y: position.y + velocity.y,
    z: position.z + velocity.z,
  };

  const nextRange = Math.sqrt(
    ((nextPos.x - location.x) ** 2) +
    ((nextPos.y - location.y) ** 2) +
    ((nextPos.z - location.z) ** 2));

  let rangeRate = nextRange - currentRange;

  function sign(value) {
    return value >= 0 ? 1 : -1;
  }

  rangeRate *= sign(rangeRate);
  const c = 299792.458; // Speed of light in km/s
  return (1 + (rangeRate / c));
}
