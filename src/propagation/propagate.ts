import type { PositionAndVelocity } from '../common-types.js';
import { minutesPerDay } from '../constants.js';
import { jday } from '../ext.js';
import { checkForDecay } from './check-for-decay.js';
import { type SatRec, SatRecError } from './SatRec.js';
import { sgp4 } from './sgp4.js';

export interface PropagateOptions {
  /**
   * Opt in to the community fix for satellites that decayed long ago, which SGP4
   * would otherwise propagate to meaningless positions instead of reporting as
   * decayed.
   *
   * This check is NOT part of the official SGP4 algotithm, so if you need completely compliant
   * SGP4 output *despite* it sometimes giving garbage positions for decayed satellites,
   * you should NOT use it.
   */
  communityDecayCheckEnabled: boolean;
}

export function propagate(
  satrec: SatRec,
  date: Date,
  options?: PropagateOptions,
): PositionAndVelocity | null;
export function propagate(
  satrec: SatRec,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  options?: PropagateOptions,
): PositionAndVelocity | null;
export function propagate(
  satrec: SatRec,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number | undefined,
  options?: PropagateOptions,
): PositionAndVelocity | null;
export function propagate(
  satrec: SatRec,
  // Deliberately permissive: the overloads above define the public contract, and
  // TypeScript only requires the implementation signature to be compatible with
  // all of them.
  ...args: (Date | number | PropagateOptions | undefined)[]
): PositionAndVelocity | null {
  // Return a position and velocity vector for a given date and time.
  const last = args.at(-1);
  const options =
    typeof last === 'object' && !(last instanceof Date) ? last : undefined;
  const jdayArgs = (options ? args.slice(0, -1) : args) as Parameters<
    typeof jday
  >;

  const j = jday(...jdayArgs);
  const m = (j - satrec.jdsatepoch) * minutesPerDay;
  const result = sgp4(satrec, m);

  // sgp4 sometimes propagates satellites that decayed long ago to meaningless positions
  // rather than reporting them as decayed; opting in reports them like sgp4 does.
  if (options?.communityDecayCheckEnabled && result && checkForDecay(satrec)) {
    satrec.error = SatRecError.Decayed;
    return null;
  }
  return result;
}
