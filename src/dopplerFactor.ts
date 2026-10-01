import type { EcfVec3, Kilometer, KilometerPerSecond } from './common-types.js';

const earthRotation = 7.292115e-5;
const c = 299792.458; // Speed of light in km/s

/**
 * `velocityEcf` is the ECI velocity rotated into ECF axes, as returned by
 * `eciToEcf(velocityEci, gmst)`; the observer's rotation velocity is subtracted
 * here. Do not pass the output of `eciToEcfVelocity` to this version: that is a
 * true ECF velocity and would put the range rate off by up to ω·R·cos(latitude),
 * about 0.46 km/s at the equator. The next major version switches this function
 * to the true ECF velocity.
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

  const rangeVel = {
    x: velocityEcf.x + earthRotation * observerCoordsEcf.y,
    y: velocityEcf.y - earthRotation * observerCoordsEcf.x,
    z: velocityEcf.z,
  };

  const rangeRate =
    (rangeX * rangeVel.x + rangeY * rangeVel.y + rangeZ * rangeVel.z) / length;

  return 1 - rangeRate / c;
}
