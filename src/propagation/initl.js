import {
  twoPi,
  xke,
  j2,
  x2o3,
} from '../constants';

import gstime from './gstime';

/*-----------------------------------------------------------------------------
 *
 *                           procedure initl
 *
 *  this procedure initializes the sgp4 propagator. all the initialization is
 *    consolidated here instead of having multiple loops inside other routines.
 *
 *  author        : david vallado                  719-573-2600   28 jun 2005
 *
 *  inputs        :
 *    ecco        - eccentricity                           0.0 - 1.0
 *    epoch       - epoch time in days from jan 0, 1950. 0 hr
 *    inclo       - inclination of satellite
 *    no          - mean motion of satellite
 *    satn        - satellite number
 *
 *  outputs       :
 *    ainv        - 1.0 / a
 *    ao          - semi major axis
 *    con41       -
 *    con42       - 1.0 - 5.0 cos(i)
 *    cosio       - cosine of inclination
 *    cosio2      - cosio squared
 *    eccsq       - eccentricity squared
 *    method      - flag for deep space                    'd', 'n'
 *    omeosq      - 1.0 - ecco * ecco
 *    posq        - semi-parameter squared
 *    rp          - radius of perigee
 *    rteosq      - square root of (1.0 - ecco*ecco)
 *    sinio       - sine of inclination
 *    gsto        - gst at time of observation               rad
 *    no          - mean motion of satellite
 *
 *  locals        :
 *    ak          -
 *    d1          -
 *    del         -
 *    adel        -
 *    po          -
 *
 *  coupling      :
 *    getgravconst
 *    gstime      - find greenwich sidereal time from the julian date
 *
 *  references    :
 *    hoots, roehrich, norad spacetrack report #3 1980
 *    hoots, norad spacetrack report #6 1986
 *    hoots, schumacher and glover 2004
 *    vallado, crawford, hujsak, kelso  2006
 ----------------------------------------------------------------------------*/
export default function initl(options) {
  const {
    ecco,
    epoch,
    inclo,
    opsmode,
  } = options;

  let {
    no,
  } = options;

  // sgp4fix use old way of finding gst
  // ----------------------- earth constants ---------------------
  // sgp4fix identify constants and allow alternate values

  // ------------- calculate auxillary epoch quantities ----------
  const eccsq = ecco * ecco;
  const omeosq = 1.0 - eccsq;
  const rteosq = Math.sqrt(omeosq);
  const cosio = Math.cos(inclo);
  const cosio2 = cosio * cosio;

  // ------------------ un-kozai the mean motion -----------------
  const ak = ((xke / no) ** x2o3);
  const d1 = (0.75 * j2 * ((3.0 * cosio2) - 1.0)) / (rteosq * omeosq);
  let delPrime = d1 / (ak * ak);
  const adel = ak * (1.0 - (delPrime * delPrime)
    - (delPrime * ((1.0 / 3.0) + ((134.0 * delPrime * delPrime) / 81.0))));
  delPrime = d1 / (adel * adel);
  no /= (1.0 + delPrime);

  const ao = ((xke / no) ** x2o3);
  const sinio = Math.sin(inclo);
  const po = ao * omeosq;
  const con42 = 1.0 - (5.0 * cosio2);
  const con41 = -con42 - cosio2 - cosio2;
  const ainv = 1.0 / ao;
  const posq = po * po;
  const rp = ao * (1.0 - ecco);
  const method = 'n';

  //  sgp4fix modern approach to finding sidereal time
  let gsto;
  if (opsmode === 'a') {
    //  sgp4fix use old way of finding gst
    //  count integer number of days from 0 jan 1970
    const ts70 = epoch - 7305.0;
    const ds70 = Math.floor(ts70 + 1.0e-8);
    const tfrac = ts70 - ds70;

    //  find greenwich location at epoch
    const c1 = 1.72027916940703639e-2;
    const thgr70 = 1.7321343856509374;
    const fk5r = 5.07551419432269442e-15;
    const c1p2p = c1 + twoPi;
    gsto = (thgr70 + (c1 * ds70) + (c1p2p * tfrac) + (ts70 * ts70 * fk5r)) % twoPi;
    if (gsto < 0.0) {
      gsto += twoPi;
    }
  } else {
    gsto = gstime(epoch + 2433281.5);
  }

  return {
    no,

    method,

    ainv,
    ao,
    con41,
    con42,
    cosio,

    cosio2,
    eccsq,
    omeosq,
    posq,

    rp,
    rteosq,
    sinio,
    gsto,
  };
}
