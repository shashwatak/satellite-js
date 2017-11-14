import { pi } from '../constants';

export default function degreesLong(radians) {
  let degrees = (radians / (pi * 180)) % 360;
  if (degrees > 180) {
    degrees = 360 - degrees;
  } else if (degrees < -180) {
    degrees = 360 + degrees;
  }
  return degrees;
}
