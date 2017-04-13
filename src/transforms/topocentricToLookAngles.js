import { pi } from '../constants';

/**
 * @param {Object} topocentric
 * @param {Number} topocentric.topS Positive horizontal vector S due south.
 * @param {Number} topocentric.topE Positive horizontal vector E due east.
 * @param {Number} topocentric.topZ Vector Z normal to the surface of the earth (up).
 * @returns {Object}
 */
export default function (topocentric) {
  const { topS, topE, topZ } = topocentric;
  const rangeSat = Math.sqrt((topS * topS) + (topE * topE) + (topZ * topZ));
  const El = Math.asin(topZ / rangeSat);
  const Az = Math.atan2(-topE, topS) + pi;

  return {
    azimuth: Az,
    elevation: El,
    rangeSat, // Range in km
  };
}
