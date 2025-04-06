import { EcfVec3, Kilometer, KilometerPerSecond } from './common-types.js';

const earthRotation = 7.292115E-5;
const c = 299792.458; // Speed of light in km/s

/**
 * Negative range rate means the satellite is moving towards the observer and
 * its frequency is shifted higher because 1 minus a negative range rate is
 * positive. If the range rate is positive, the satellite is moving away from
 * the observer and its frequency is shifted lower.
 */
export default function dopplerFactor(
  observerCoordsEcf: EcfVec3<Kilometer>,
  positionEcf: EcfVec3<Kilometer>,
  velocityEcf: EcfVec3<KilometerPerSecond>
): number {
  const rangeX = positionEcf.x - observerCoordsEcf.x;
  const rangeY = positionEcf.y - observerCoordsEcf.y;
  const rangeZ = positionEcf.z - observerCoordsEcf.z;
  const length = Math.sqrt(rangeX ** 2 + rangeY ** 2 + rangeZ ** 2);

  const rangeVel = {
    x: velocityEcf.x + earthRotation * observerCoordsEcf.y,
    y: velocityEcf.y - earthRotation * observerCoordsEcf.x,
    z: velocityEcf.z,
  };

  const rangeRate = (rangeX * rangeVel.x + rangeY * rangeVel.y + rangeZ * rangeVel.z) / length;

  return 1 - rangeRate / c;
}
