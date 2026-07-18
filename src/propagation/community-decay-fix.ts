import type { SatRec } from './SatRec.js';

// This check is authored by Theodore Kruczek for his library OOTK:
// https://github.com/thkruz/ootk
// Used with permission: https://github.com/thkruz/ootk/issues/31#issuecomment-4893495872
/**
 * In some cases, usually for objects decayed long time ago,
 * SGP4 would return garbage position and speed data instead of indicating that
 * the satellite has actually decayed. This check indicates if it's one of those cases.
 *
 * Note: this community check DOES NOT EXIST in the original SGP4 algorithm, so your results
 * MAY DIFFER from the results of official SGP4 propagation when using this check.
 *
 * @returns true if the satellite is truly decayed as a result of latest propagation call.
 *
 * @example
 * ```ts
 *   const result = sgp4(satrec, 0);
 *   if (result && checkForDecay(satrec)) {
 *     // here SGP4 model reported successful propagation,
 *     //but the check caught that the satellite has decayed.
 *   }
 * ```
 *
 * @example
 * ```ts
 *   const result = propagate(satrec, new Date(), { communityDecayFix: true })
 *   // result is non-null only if `checkForDecay` too indicates that the satellite HAS NOT decayed.
 * ```
 */
export const checkForDecay = (satrec: SatRec) => satrec.tempa <= 0;
