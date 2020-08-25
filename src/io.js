import {
  pi,
  tumin,
  deg2rad,
} from './constants';

import {
  jday,
  days2mdhms,
} from './ext';

import sgp4init from './propagation/sgp4init';

/* -----------------------------------------------------------------------------
 *
 *                           function twoline2rv
 *
 *  this function converts the two line element set character string data to
 *    variables and initializes the sgp4 variables. several intermediate varaibles
 *    and quantities are determined. note that the result is a structure so multiple
 *    satellites can be processed simultaneously without having to reinitialize. the
 *    verification mode is an important option that permits quick checks of any
 *    changes to the underlying technical theory. this option works using a
 *    modified tle file in which the start, stop, and delta time values are
 *    included at the end of the second line of data. this only works with the
 *    verification mode. the catalog mode simply propagates from -1440 to 1440 min
 *    from epoch and is useful when performing entire catalog runs.
 *
 *  author        : david vallado                  719-573-2600    1 mar 2001
 *
 *  inputs        :
 *    longstr1    - first line of the tle
 *    longstr2    - second line of the tle
 *    typerun     - type of run                    verification 'v', catalog 'c',
 *                                                 manual 'm'
 *    typeinput   - type of manual input           mfe 'm', epoch 'e', dayofyr 'd'
 *    opsmode     - mode of operation afspc or improved 'a', 'i'
 *    whichconst  - which set of constants to use  72, 84
 *
 *  outputs       :
 *    satrec      - structure containing all the sgp4 satellite information
 *
 *  coupling      :
 *    getgravconst-
 *    days2mdhms  - conversion of days to month, day, hour, minute, second
 *    jday        - convert day month year hour minute second into julian date
 *    sgp4init    - initialize the sgp4 variables
 *
 *  references    :
 *    norad spacetrack report #3
 *    vallado, crawford, hujsak, kelso  2006
 --------------------------------------------------------------------------- */

/**
 * Return a Satellite imported from two lines of TLE data.
 *
 * Provide the two TLE lines as strings `longstr1` and `longstr2`,
 * and select which standard set of gravitational constants you want
 * by providing `gravity_constants`:
 *
 * `sgp4.propagation.wgs72` - Standard WGS 72 model
 * `sgp4.propagation.wgs84` - More recent WGS 84 model
 * `sgp4.propagation.wgs72old` - Legacy support for old SGP4 behavior
 *
 * Normally, computations are made using letious recent improvements
 * to the algorithm.  If you want to turn some of these off and go
 * back into "afspc" mode, then set `afspc_mode` to `True`.
 */
export default function twoline2satrec(longstr1, longstr2) {
  const opsmode = 'i';
  const xpdotp = 1440.0 / (2.0 * pi); // 229.1831180523293;
  let year = 0;

  const satrec = {};
  satrec.error = 0;

  satrec.satnum = longstr1.substring(2, 7);

  satrec.epochyr = parseInt(longstr1.substring(18, 20), 10);
  satrec.epochdays = parseFloat(longstr1.substring(20, 32));
  satrec.ndot = parseFloat(longstr1.substring(33, 43));
  satrec.nddot = parseFloat(
    `.${parseInt(longstr1.substring(44, 50), 10)
    }E${longstr1.substring(50, 52)}`,
  );
  satrec.bstar = parseFloat(
    `${longstr1.substring(53, 54)
    }.${parseInt(longstr1.substring(54, 59), 10)
    }E${longstr1.substring(59, 61)}`,
  );

  // satrec.satnum = longstr2.substring(2, 7);
  satrec.inclo = parseFloat(longstr2.substring(8, 16));
  satrec.nodeo = parseFloat(longstr2.substring(17, 25));
  satrec.ecco = parseFloat(`.${longstr2.substring(26, 33)}`);
  satrec.argpo = parseFloat(longstr2.substring(34, 42));
  satrec.mo = parseFloat(longstr2.substring(43, 51));
  satrec.no = parseFloat(longstr2.substring(52, 63));

  // ---- find no, ndot, nddot ----
  satrec.no /= xpdotp; //   rad/min
  // satrec.nddot= satrec.nddot * Math.pow(10.0, nexp);
  // satrec.bstar= satrec.bstar * Math.pow(10.0, ibexp);

  // ---- convert to sgp4 units ----
  satrec.a = ((satrec.no * tumin) ** (-2.0 / 3.0));
  satrec.ndot /= (xpdotp * 1440.0); // ? * minperday
  satrec.nddot /= (xpdotp * 1440.0 * 1440);

  // ---- find standard orbital elements ----
  satrec.inclo *= deg2rad;
  satrec.nodeo *= deg2rad;
  satrec.argpo *= deg2rad;
  satrec.mo *= deg2rad;

  satrec.alta = (satrec.a * (1.0 + satrec.ecco)) - 1.0;
  satrec.altp = (satrec.a * (1.0 - satrec.ecco)) - 1.0;

  // ----------------------------------------------------------------
  // find sgp4epoch time of element set
  // remember that sgp4 uses units of days from 0 jan 1950 (sgp4epoch)
  // and minutes from the epoch (time)
  // ----------------------------------------------------------------

  // ---------------- temp fix for years from 1957-2056 -------------------
  // --------- correct fix will occur when year is 4-digit in tle ---------

  if (satrec.epochyr < 57) {
    year = satrec.epochyr + 2000;
  } else {
    year = satrec.epochyr + 1900;
  }

  const mdhmsResult = days2mdhms(year, satrec.epochdays);

  const {
    mon,
    day,
    hr,
    minute,
    sec,
  } = mdhmsResult;
  satrec.jdsatepoch = jday(year, mon, day, hr, minute, sec);

  //  ---------------- initialize the orbit at sgp4epoch -------------------
  sgp4init(satrec, {
    opsmode,
    satn: satrec.satnum,
    epoch: satrec.jdsatepoch - 2433281.5,
    xbstar: satrec.bstar,
    xecco: satrec.ecco,
    xargpo: satrec.argpo,
    xinclo: satrec.inclo,
    xmo: satrec.mo,
    xno: satrec.no,
    xnodeo: satrec.nodeo,
  });

  return satrec;
}
