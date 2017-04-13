import {
  pi,
  tumin,
  deg2rad,
} from '../constants';

import sgp4init from '../sgp4init';
import days2mdhms from '../gstime/days2mdhms';
import jday from '../gstime/jday';

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

  // satrec.satnum   = longstr2.substring(2, 7);
  satrec.inclo = parseFloat(longstr2.substring(8, 16));
  satrec.nodeo = parseFloat(longstr2.substring(17, 25));
  satrec.ecco = parseFloat(`.${longstr2.substring(26, 33)}`);
  satrec.argpo = parseFloat(longstr2.substring(34, 42));
  satrec.mo = parseFloat(longstr2.substring(43, 51));
  satrec.no = parseFloat(longstr2.substring(52, 63));

  //  ---- find no, ndot, nddot ----
  satrec.no /= xpdotp; //   rad/min
  // satrec.nddot= satrec.nddot * Math.pow(10.0, nexp);
  // satrec.bstar= satrec.bstar * Math.pow(10.0, ibexp);

  //  ---- convert to sgp4 units ----
  satrec.a = Math.pow(satrec.no * tumin, (-2.0 / 3.0));
  satrec.ndot /= (xpdotp * 1440.0);  //   ? * minperday
  satrec.nddot /= (xpdotp * 1440.0 * 1440);

  //  ---- find standard orbital elements ----
  satrec.inclo *= deg2rad;
  satrec.nodeo *= deg2rad;
  satrec.argpo *= deg2rad;
  satrec.mo *= deg2rad;

  satrec.alta = (satrec.a * (1.0 + satrec.ecco)) - 1.0;
  satrec.altp = satrec.a * ((1.0 - satrec.ecco)) - 1.0;


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
  const mon = mdhmsResult.mon;
  const day = mdhmsResult.day;
  const hr = mdhmsResult.hr;
  const minute = mdhmsResult.minute;
  const sec = mdhmsResult.sec;
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
