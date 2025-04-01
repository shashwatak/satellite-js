import { PositionAndVelocity } from '../common-types.js';
import { minutesPerDay } from '../constants';
import { jday } from '../ext';
import sgp4 from './sgp4';
import { SatRec } from './SatRec.js';

export default function propagate(satrec: SatRec, date: Date): PositionAndVelocity {
  // Return a position and velocity vector for a given date and time.
  const j = jday(date);
  const m = (j - satrec.jdsatepoch) * minutesPerDay;
  return sgp4(satrec, m);
}
