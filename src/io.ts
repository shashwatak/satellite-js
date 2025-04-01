import { OMMJsonObject } from './common-types.js';
import { deg2rad, xpdotp } from './constants';

import { jday, days2mdhms } from './ext';
import { SatRecInit } from './propagation/SatRec.js';

import sgp4init from './propagation/sgp4init';

/* -----------------------------------------------------------------------------
 *
 *                           function twoline2satrec
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
 * Provide the two TLE lines as strings `tleLine1` and `tleLine2`,
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
export function twoline2satrec(longstr1: string, longstr2: string) {
  const opsmode = 'i';
  const error = 0;

  const satnum = longstr1.substring(2, 7);

  const epochyr = parseInt(longstr1.substring(18, 20), 10);
  const epochdays = parseFloat(longstr1.substring(20, 32));
  const ndot = parseFloat(longstr1.substring(33, 43));
  const nddot = parseFloat(
    `${longstr1.substring(44, 45)}.${longstr1.substring(45, 50)}E${longstr1.substring(50, 52)}`,
  );
  const bstar = parseFloat(
    `${longstr1.substring(53, 54)}.${longstr1.substring(54, 59)}E${longstr1.substring(59, 61)}`,
  );

  // satrec.satnum = longstr2.substring(2, 7);
  // ---- find standard orbital elements ----
  const inclo = parseFloat(longstr2.substring(8, 16)) * deg2rad;
  const nodeo = parseFloat(longstr2.substring(17, 25)) * deg2rad;
  const ecco = parseFloat(`.${longstr2.substring(26, 33)}`);
  const argpo = parseFloat(longstr2.substring(34, 42)) * deg2rad;
  const mo = parseFloat(longstr2.substring(43, 51)) * deg2rad;

  // ---- find no, ndot, nddot ----
  const no = parseFloat(longstr2.substring(52, 63)) / xpdotp;
  // satrec.nddot= satrec.nddot * Math.pow(10.0, nexp);
  // satrec.bstar= satrec.bstar * Math.pow(10.0, ibexp);

  // ---- convert to sgp4 units ----
  // satrec.ndot /= (xpdotp * 1440.0); // ? * minperday
  // satrec.nddot /= (xpdotp * 1440.0 * 1440);

  // ----------------------------------------------------------------
  // find sgp4epoch time of element set
  // remember that sgp4 uses units of days from 0 jan 1950 (sgp4epoch)
  // and minutes from the epoch (time)
  // ----------------------------------------------------------------

  // ---------------- temp fix for years from 1957-2056 -------------------
  // --------- correct fix will occur when year is 4-digit in tle ---------
  const year = epochyr < 57 ? epochyr + 2000 : epochyr + 1900;

  const mdhmsResult = days2mdhms(year, epochdays);

  const {
    mon, day, hr, minute, sec,
  } = mdhmsResult;
  const jdsatepoch = jday(year, mon, day, hr, minute, sec);

  const satrec: SatRecInit = {
    error,
    satnum,
    epochyr,
    epochdays,
    ndot,
    nddot,
    bstar,
    inclo,
    nodeo,
    ecco,
    argpo,
    mo,
    no,
    jdsatepoch,
  }

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

/* -----------------------------------------------------------------------------
 *
 *                           function json2satrec
 *
 *  this function converts the OMM json data to variables and initializes the sgp4 
 *    variables. several intermediate varaibles and quantities are determined. note 
 *    that the result is a structure so multiple satellites can be processed 
 *    simultaneously without having to reinitialize. the verification mode is an 
 *    important option that permits quick checks of any changes to the underlying 
 *    technical theory. this option works using a modified tle file in which the 
 *    start, stop, and delta time values are included at the end of the second line
 *    of data. this only works with the verification mode. the catalog mode simply 
 *    propagates from -1440 to 1440 min from epoch and is useful when performing 
 *    entire catalog runs.
 *
 *  author        : Hariharan Vitaladevuni                   18 Aug 2023
 *                  Theodore Kruczek                         19 Aug 2023
 *
 *  inputs        :
 *    jsonobj     - OMM json data
 *    opsmode     - mode of operation afspc or improved 'a', 'i'. Default: 'i'.
 *
 *  outputs       :
 *    satrec      - structure containing all the sgp4 satellite information
 *
 *  coupling      :
 *    days2mdhms  - conversion of days to month, day, hour, minute, second
 *    jday        - convert day month year hour minute second into julian date
 *    sgp4init    - initialize the sgp4 variables
 * 
 *  warning       : the epoch date in OMM format is more accurate than TLE format!
 *                  this will result in extremely close, but different 
 *                  position/velocity values. Depending on your use case, it may
 *                  be better to use twoline2satrec, but for the average user this
 *                  will provide comparable results.
 *
 *  references    :
 *    https://celestrak.org/NORAD/documentation/gp-data-formats.php
 --------------------------------------------------------------------------- */
export function json2satrec(jsonobj: OMMJsonObject, opsmode: 'a' | 'i' = 'i') {
  const error = 0;

  const satnum = jsonobj.NORAD_CAT_ID.toString();

  const epoch = new Date(jsonobj.EPOCH + 'Z');
  const year = epoch.getUTCFullYear();

  const epochyr = Number(year.toString().slice(-2));
  const epochdays =
    (epoch.valueOf() - new Date(Date.UTC(year, 0, 1, 0, 0, 0)).valueOf()) / (86400 * 1000) + 1;

  const ndot = Number(jsonobj.MEAN_MOTION_DOT);
  const nddot = Number(jsonobj.MEAN_MOTION_DDOT);
  const bstar = Number(jsonobj.BSTAR);

  const inclo = Number(jsonobj.INCLINATION) * deg2rad;
  const nodeo = Number(jsonobj.RA_OF_ASC_NODE) * deg2rad;
  const ecco = Number(jsonobj.ECCENTRICITY);
  const argpo = Number(jsonobj.ARG_OF_PERICENTER) * deg2rad;
  const mo = Number(jsonobj.MEAN_ANOMALY) * deg2rad;
  const no = Number(jsonobj.MEAN_MOTION) / xpdotp;

  // ----------------------------------------------------------------
  // find sgp4epoch time of element set
  // remember that sgp4 uses units of days from 0 jan 1950 (sgp4epoch)
  // and minutes from the epoch (time)
  // ----------------------------------------------------------------
  const mdhmsResult = days2mdhms(year, epochdays);

  const { mon, day, hr, minute, sec } = mdhmsResult;
  const jdsatepoch = jday(year, mon, day, hr, minute, sec);

  const satrec: SatRecInit = {
    error,
    satnum,
    epochyr,
    epochdays,
    ndot,
    nddot,
    bstar,
    inclo,
    nodeo,
    ecco,
    argpo,
    mo,
    no,
    jdsatepoch,
  }

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
