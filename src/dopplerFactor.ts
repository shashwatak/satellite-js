import type { EcfVec3, Kilometer, KilometerPerSecond } from './common-types.js';

const c = 299792.458; // Speed of light in km/s

/**
 * Doppler factor `1 - rangeRate / c`: the ratio of the frequency the observer
 * receives to the frequency the satellite transmits.
 *
 * All three vectors are in the ECF frame, in which the observer is stationary.
 * `velocityEcf` must be a true ECF velocity, such as the output of
 * `eciToEcfVelocity`. `eciToEcf(velocityEci, gmst)` is not one: it only rotates
 * the axes and still contains the Earth's rotation, so passing it here gives a
 * range rate that is wrong by up to about 0.46 km/s.
 *
 * Negative range rate means the satellite is moving towards the observer and
 * its frequency is shifted higher because 1 minus a negative range rate is
 * positive. If the range rate is positive, the satellite is moving away from
 * the observer and its frequency is shifted lower.
 */
export function dopplerFactor(
  observerCoordsEcf: EcfVec3<Kilometer>,
  positionEcf: EcfVec3<Kilometer>,
  velocityEcf: EcfVec3<KilometerPerSecond>,
): number {
  const rangeX = positionEcf.x - observerCoordsEcf.x;
  const rangeY = positionEcf.y - observerCoordsEcf.y;
  const rangeZ = positionEcf.z - observerCoordsEcf.z;
  const length = Math.sqrt(rangeX ** 2 + rangeY ** 2 + rangeZ ** 2);

  const rangeRate =
    (rangeX * velocityEcf.x + rangeY * velocityEcf.y + rangeZ * velocityEcf.z) /
    length;

  return 1 - rangeRate / c;
}
