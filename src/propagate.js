/*
 * satellite-js v1.1
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

function twoline2rv(longstr1, longstr2){
    /*Return a Satellite imported from two lines of TLE data.

    Provide the two TLE lines as strings `longstr1` and `longstr2`,
    and select which standard set of gravitational constants you want
    by providing `gravity_constants`:

    `sgp4.propagation.wgs72` - Standard WGS 72 model
    `sgp4.propagation.wgs84` - More recent WGS 84 model
    `sgp4.propagation.wgs72old` - Legacy support for old SGP4 behavior

    Normally, computations are made using various recent improvements
    to the algorithm.  If you want to turn some of these off and go
    back into "afspc" mode, then set `afspc_mode` to `True`. */
    'use strict';
    var opsmode = 'i';
    var xpdotp   =  1440.0 / (2.0 *pi);  //  229.1831180523293;
    var revnum = 0;
    var elnum = 0;
    var year = 0;

    var satrec = {};
    satrec.error = 0;

    var cardnumb        = parseInt(longstr1.substring(0, 1), 10);
    satrec.satnum       = longstr1.substring(2, 7);
    var classification  = longstr1.substring(7, 8);
    var intldesg        = longstr1.substring(9, 11);
    satrec.epochyr      = parseInt(longstr1.substring(18, 20), 10);
    satrec.epochdays    = parseFloat(longstr1.substring(20, 32));
    satrec.ndot         = parseFloat(longstr1.substring(33, 43));
    satrec.nddot        = parseFloat("." + parseInt(longstr1.substring(44, 50), 10) + "E" + longstr1.substring(50, 52));
    satrec.bstar        = parseFloat("." + parseInt(longstr1.substring(53, 59), 10) + "E" + longstr1.substring(59, 61));
    var numb            = parseInt(longstr1.substring(62, 63), 10);
    elnum               = parseInt(longstr1.substring(64, 68), 10);

    //satrec.satnum   = longstr2.substring(2, 7);
    satrec.inclo    = parseFloat(longstr2.substring(8, 16));
    satrec.nodeo    = parseFloat(longstr2.substring(17, 25));
    satrec.ecco     = parseFloat("." + longstr2.substring(26, 33));
    satrec.argpo    = parseFloat(longstr2.substring(34, 42));
    satrec.mo       = parseFloat(longstr2.substring(43, 51));
    satrec.no       = parseFloat(longstr2.substring(52, 63));
    revnum          = parseFloat(longstr2.substring(63, 68));


    //  ---- find no, ndot, nddot ----
    satrec.no   = satrec.no / xpdotp; //   rad/min
    //satrec.nddot= satrec.nddot * Math.pow(10.0, nexp);
    //satrec.bstar= satrec.bstar * Math.pow(10.0, ibexp);

    //  ---- convert to sgp4 units ----
    satrec.a    = Math.pow( satrec.no*tumin , (-2.0/3.0) );
    satrec.ndot = satrec.ndot  / (xpdotp*1440.0);  //   ? * minperday
    satrec.nddot= satrec.nddot / (xpdotp*1440.0*1440);

    //  ---- find standard orbital elements ----
    satrec.inclo = satrec.inclo  * deg2rad;
    satrec.nodeo = satrec.nodeo  * deg2rad;
    satrec.argpo = satrec.argpo  * deg2rad;
    satrec.mo    = satrec.mo     * deg2rad;

    satrec.alta = satrec.a*(1.0 + satrec.ecco) - 1.0;
    satrec.altp = satrec.a*(1.0 - satrec.ecco) - 1.0;


    // ----------------------------------------------------------------
    // find sgp4epoch time of element set
    // remember that sgp4 uses units of days from 0 jan 1950 (sgp4epoch)
    // and minutes from the epoch (time)
    // ----------------------------------------------------------------

    // ---------------- temp fix for years from 1957-2056 -------------------
    // --------- correct fix will occur when year is 4-digit in tle ---------

   if (satrec.epochyr < 57){
       year = satrec.epochyr + 2000;
   }
   else{
       year = satrec.epochyr + 1900;
   }


   var mdhms_result = days2mdhms(year, satrec.epochdays);
   var mon      = mdhms_result.mon;
   var day      = mdhms_result.day;
   var hr       = mdhms_result.hr;
   var minute   = mdhms_result.minute;
   var sec      = mdhms_result.sec;
   satrec.jdsatepoch = jday(year, mon, day, hr, minute, sec);

    //  ---------------- initialize the orbit at sgp4epoch -------------------
    var sgp4init_parameters = {
        opsmode : opsmode,
        satn : satrec.satnum,
        epoch : satrec.jdsatepoch-2433281.5,
        xbstar : satrec.bstar,

        xecco : satrec.ecco,
        xargpo : satrec.argpo,
        xinclo : satrec.inclo,
        xmo : satrec.mo,
        xno : satrec.no,

        xnodeo : satrec.nodeo,
    };

    sgp4init(satrec, sgp4init_parameters );

    return satrec;
}

function propagate(satrec, year, month, day, hour, minute, second){
    //Return a position and velocity vector for a given date and time.
    'use strict';
    var j = jday(year, month, day, hour, minute, second);
    var m = (j - satrec.jdsatepoch) * minutes_per_day;
    return sgp4(satrec, m);
}

satellite.twoline2satrec = function (longstr1, longstr2) {
    return twoline2rv (longstr1, longstr2);
}

satellite.propagate = function (satrec, year, month, day, hour, minute, second) {
    return propagate (satrec, year, month, day, hour, minute, second);
}

