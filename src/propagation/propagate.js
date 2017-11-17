import { minutesPerDay } from '../constants';

import { jday } from '../ext';

import sgp4 from './sgp4';

export default function propagate(...args) {
  // Return a position and velocity vector for a given date and time.
  const satrec = args[0];
  const date = Array.prototype.slice.call(args, 1);
  const j = jday(...date);
  const m = (j - satrec.jdsatepoch) * minutesPerDay;
  return sgp4(satrec, m);
}
