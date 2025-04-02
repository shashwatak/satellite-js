import { PositionAndVelocity } from '../common-types.js';
import { minutesPerDay } from '../constants';
import { jday } from '../ext';
import sgp4 from './sgp4';
import { SatRec } from './SatRec.js';

export function propagate (satrec: SatRec, date: Date): PositionAndVelocity;
export function propagate (satrec: SatRec, year: number, month: number, day: number, hour: number, minute: number, second: number, ms?: number): PositionAndVelocity;
export default function propagate(satrec: SatRec, ...jdayArgs: [Date] | [number, number, number, number, number, number, (number | undefined)?]): PositionAndVelocity {
  // Return a position and velocity vector for a given date and time.
  const j = jday(...jdayArgs as Parameters<typeof jday>);
  const m = (j - satrec.jdsatepoch) * minutesPerDay;
  return sgp4(satrec, m);
}
