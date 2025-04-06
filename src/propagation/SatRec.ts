export enum SatRecError {
  /**
   * No error, propagation for the last supplied date is successful
   */
  None = 0,
  /**
   * Mean eccentricity is out of range 0 ≤ e < 1
   */
  MeanEccentricityOutOfRange = 1,
  /**
   * Mean motion has fallen below zero.
   */
  MeanMotionBelowZero = 2,
  /**
   * Perturbed eccentricity is out of range 0 ≤ e < 1
   */
  PerturbedEccentricityOutOfRange = 3,
  /**
   * Length of the orbit’s semi-latus rectum has fallen below zero.
   */
  SemiLatusRectumBelowZero = 4,
  // 5 is not used
  /**
   * Orbit has decayed: the computed position is underground.
   */
  Decayed = 6,
}

/**
 * A structure that contains all the information needed to propagate a satellite's orbit using the SGP4 model.
 * 
 * Mostly you can consider it opaque as you only need to pass it to `propagate` function.
 * All properties should be considered read-only as they're used and set by SGP4 model internally.
 * 
 * This interface is a direct translation of C++ struct `elsetrec` from the source code by David Vallado;
 * all changes to the original struct are documented.
 */
export interface SatRec {
  /**
   * Stringified satellite number, usually from NORAD catalog
   */
  satnum: string;
  /**
   * Full four-digit year of this element set's epoch moment
   */
  epochyr: number;
  epochtynumrev: number;
  /**
   * Error code produced by the most recent SGP4 propagation you performed with this element set.
   */
  error: SatRecError;
  /**
   * A single character that directs SGP4 to either operate in its modern 'i' improved mode or
   * in its legacy 'a' AFSPC mode.
   */
  operationmode: 'a' | 'i';
  init: 'y' | 'n';
  /**
   * A single character, chosen automatically when the orbital elements were loaded, that
   * indicates whether SGP4 has chosen to use its built-in 'n' Near Earth or 'd' Deep Space
   * mode for this satellite.
   */
  method: 'n' | 'd';

  /* Near Earth */
  isimp: number;
  aycof: number;
  con41: number;
  cc1: number;
  cc4: number;
  cc5: number;
  d2: number;
  d3: number;
  d4: number;
  delmo: number;
  eta: number;
  argpdot: number;
  omgcof: number;
  sinmao: number;
  /**
   * The time you gave when you most recently asked SGP4 to compute this satellite’s position,
   * measured in minutes before (negative) or after (positive) the satellite’s epoch.
   */
  t: number;
  t2cof: number;
  t3cof: number;
  t4cof: number;
  t5cof: number;
  x1mth2: number;
  x7thm1: number;
  mdot: number;
  nodedot: number;
  xlcof: number;
  xmcof: number;
  nodecf: number;

  /* Deep Space */
  irez: number;
  d2201: number;
  d2211: number;
  d3210: number;
  d3222: number;
  d4410: number;
  d4422: number;
  d5220: number;
  d5232: number;
  d5421: number;
  d5433: number;
  dedt: number;
  del1: number;
  del2: number;
  del3: number;
  didt: number;
  dmdt: number;
  dnodt: number;
  domdt: number;
  e3: number;
  ee2: number;
  peo: number;
  pgho: number;
  pho: number;
  pinco: number;
  plo: number;
  se2: number;
  se3: number;
  sgh2: number;
  sgh3: number;
  sgh4: number;
  sh2: number;
  sh3: number;
  si2: number;
  si3: number;
  sl2: number;
  sl3: number;
  sl4: number;
  gsto: number;
  xfact: number;
  xgh2: number;
  xgh3: number;
  xgh4: number;
  xh2: number;
  xh3: number;
  xi2: number;
  xi3: number;
  xl2: number;
  xl3: number;
  xl4: number;
  xlamo: number;
  zmol: number;
  zmos: number;
  atime: number;
  xli: number;
  xni: number;

  a: number;
  altp: number;
  alta: number;
  /**
   * Fractional days into the year of the epoch moment in UTC.
   */
  epochdays: number;
  /**
   * Julian date of the epoch (computed from epochyr and epochdays).
   */
  jdsatepoch: number;
  // fractional part is not needed for JS as it's retained in the `jdsatepoch` field
  // jdsatepochF: number;
  /**
   * Second time derivative of the mean motion (ignored by SGP4).
   */
  nddot: number;
  /**
   * First time derivative of the mean motion (ignored by SGP4).
   */
  ndot: number;
  /**
   * Ballistic drag coefficient B* in inverse earth radii.
   */
  bstar: number;
  // not used by the library
  // rcse: number;
  /**
   * Inclination in radians.
   */
  inclo: number;
  /**
   * Right ascension of ascending node in radians.
   */
  nodeo: number;
  /**
   * Eccentricity.
   */
  ecco: number;
  /**
   * Argument of perigee in radians.
   */
  argpo: number;
  /**
   * Mean anomaly in radians.
   */
  mo: number;
  /**
   * Mean motion in radians per minute.
   */
  no: number;
  
  // sgp4fix add unkozai'd variable
  // not used by the library
  // no_unkozai: number;
  
  // sgp4fix add singly averaged variables
  // this is instead returned in propagation results
  // am: number;
  // em: number;
  // im: number;
  // Om: number;
  // om: number;
  // mm: number;
  // nm: number;
}

export type SatRecInit = Pick<SatRec,
  "error" |
  "satnum" |
  "epochyr" |
  "epochdays" |
  "ndot" |
  "nddot" |
  "bstar" |
  "inclo" |
  "nodeo" |
  "ecco" |
  "argpo" |
  "mo" |
  "no" |
  "jdsatepoch"
>
