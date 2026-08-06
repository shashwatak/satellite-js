import type { AU, EciVec3, Kilometer } from './common-types.js';
import { earthRadius } from './constants.js';

const SUN_RADIUS = 695700;
const KM_PER_AU = 149597870.69098932;

type Vec3 = [number, number, number];

function vecLength(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function vecDot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vecNegate(v: Vec3): Vec3 {
  return [-v[0], -v[1], -v[2]];
}

function vecNormalize(v: Vec3): Vec3 {
  const len = vecLength(v);
  return [v[0] / len, v[1] / len, v[2] / len];
}

function vecScale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

/**
 * Calculate the fraction of the Sun's disc obscured by the Earth as seen from a satellite.
 *
 * @param sunEciAU - Sun position in AU, as returned by `sunPos().rsun`
 * @param satelliteEciKm - Satellite position in the ECI frame (km)
 * @returns Shadow fraction: 0 = fully lit, 1 = umbra,
 *          values between 0 and 1 indicate the fraction of the Sun covered by Earth.
 */
export function shadowFraction(
  sunEciAU: EciVec3<AU>,
  satelliteEciKm: EciVec3<Kilometer>,
): number {
  // Sun position in km (ECI)
  const sunECIinKM: Vec3 = vecScale(
    [sunEciAU.x, sunEciAU.y, sunEciAU.z],
    KM_PER_AU,
  );

  // Antisolar direction (unit vector pointing away from the Sun)
  const antisolar: Vec3 = vecNormalize(vecNegate(sunECIinKM));

  const positionVec: Vec3 = [
    satelliteEciKm.x,
    satelliteEciKm.y,
    satelliteEciKm.z,
  ];
  const positionLength = vecLength(positionVec);
  const positionAndAntisolarDot = vecDot(positionVec, antisolar);

  // means the satellite is on the Sun side of the Earth
  if (positionAndAntisolarDot <= 0) {
    return 0;
  }

  // angular radius of Earth and Sun as seen from the satellite
  const rE = Math.asin(earthRadius / positionLength);
  const rS = Math.asin(SUN_RADIUS / vecLength(sunECIinKM));

  // satellite-earth-antisolar angle,
  // which is equal to sun-satellite-earth angle (as vertically opposite angles)
  // i.e. the angle between the centers of earth and sun as seen from the satellite
  const d = Math.acos(positionAndAntisolarDot / positionLength);

  // fully inside shadow cone if the angular distance between the centers of Earth and Sun
  // is less Earth angular radius minus Sun angular radius
  if (d <= rE - rS) {
    return 1;
  }

  // fully outside shadow cone if the angular distance between the centers of Earth and Sun
  // is greater than Earth angular radius plus Sun angular radius
  if (d >= rE + rS) {
    return 0;
  }

  // otherwise in penumbra, calculate the fraction of the Sun's disc obscured by the Earth using
  // circle–circle intersection area formula
  const rS2 = rS * rS;
  const rE2 = rE * rE;
  const d2 = d * d;

  const part1 = rS2 * Math.acos((d2 + rS2 - rE2) / (2 * d * rS));
  const part2 = rE2 * Math.acos((d2 + rE2 - rS2) / (2 * d * rE));
  const part3 = 0.5 * Math.sqrt((-d + rS + rE) * (d + rS - rE) * (d - rS + rE) * (d + rS + rE));
  const overlapArea = part1 + part2 - part3;
  const sunDiscArea = Math.PI * rS2;

  return overlapArea / sunDiscArea;
}
