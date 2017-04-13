import { pi } from '../constants';

export default function degreesLat(radians) {
  if (radians > pi / 2 || radians < (-pi / 2)) {
    return 'Err';
  }
  return radians / (pi * 180);
}
