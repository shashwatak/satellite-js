export default function dopplerFactor(location, position, velocity) {
  const currentRange = Math.sqrt(
      Math.pow(position.x - location.x, 2) +
      Math.pow(position.y - location.y, 2) +
      Math.pow(position.z - location.z, 2));

  const nextPos = {
    x: position.x + velocity.x,
    y: position.y + velocity.y,
    z: position.z + velocity.z,
  };

  const nextRange = Math.sqrt(
      Math.pow(nextPos.x - location.x, 2) +
      Math.pow(nextPos.y - location.y, 2) +
      Math.pow(nextPos.z - location.z, 2));

  let rangeRate = nextRange - currentRange;

  function sign(value) {
    return value >= 0 ? 1 : -1;
  }

  rangeRate *= sign(rangeRate);
  const c = 299792.458; // Speed of light in km/s
  return (1 + rangeRate / c);
}
