/*
 * satellite-js v1.1
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

function gstime (jdut1){
    /* -----------------------------------------------------------------------------
    *
    *                           function gstime
    *
    *  this function finds the greenwich sidereal time.
    *
    *  author        : david vallado                  719-573-2600    1 mar 2001
    *
    *  inputs          description                    range / units
    *    jdut1       - julian date in ut1             days from 4713 bc
    *
    *  outputs       :
    *    gstime      - greenwich sidereal time        0 to 2pi rad
    *
    *  locals        :
    *    temp        - temporary variable for doubles   rad
    *    tut1        - julian centuries from the
    *                  jan 1, 2000 12 h epoch (ut1)
    *
    *  coupling      :
    *    none
    *
    *  references    :
    *    vallado       2004, 191, eq 3-45
    * --------------------------------------------------------------------------- */

    'use strict';
    var tut1 = (jdut1 - 2451545.0) / 36525.0;
    var temp = -6.2e-6* tut1 * tut1 * tut1 + 0.093104 * tut1 * tut1 +
            (876600.0*3600 + 8640184.812866) * tut1 + 67310.54841;  //#  sec
    temp = (temp * deg2rad / 240.0) % twopi; // 360/86400 = 1/240, to deg, to rad

    //  ------------------------ check quadrants ---------------------
    if (temp < 0.0){
        temp += twopi;
    }
    return temp;
}

function days2mdhms(year, days){
    /* -----------------------------------------------------------------------------
    *
    *                           procedure days2mdhms
    *
    *  this procedure converts the day of the year, days, to the equivalent month
    *    day, hour, minute and second.
    *
    *  algorithm     : set up array for the number of days per month
    *                  find leap year - use 1900 because 2000 is a leap year
    *                  loop through a temp value while the value is < the days
    *                  perform int conversions to the correct day and month
    *                  convert remainder into h m s using type conversions
    *
    *  author        : david vallado                  719-573-2600    1 mar 2001
    *
    *  inputs          description                    range / units
    *    year        - year                           1900 .. 2100
    *    days        - julian day of the year         0.0  .. 366.0
    *
    *  outputs       :
    *    mon         - month                          1 .. 12
    *    day         - day                            1 .. 28,29,30,31
    *    hr          - hour                           0 .. 23
    *    min         - minute                         0 .. 59
    *    sec         - second                         0.0 .. 59.999
    *
    *  locals        :
    *    dayofyr     - day of year
    *    temp        - temporary extended values
    *    inttemp     - temporary int value
    *    i           - index
    *    lmonth[12]  - int array containing the number of days per month
    *
    *  coupling      :
    *    none.
    * --------------------------------------------------------------------------- */
    'use strict';
    var lmonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    var dayofyr = Math.floor(days);
    //  ----------------- find month and day of month ----------------
    if ((year % 4) === 0){
       lmonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    }

    var i = 1;
    var inttemp = 0;
    while ((dayofyr > (inttemp + lmonth[i-1])) && i < 12) {
        inttemp = inttemp + lmonth[i-1];
        i += 1;
    }
    var mon = i;
    var day = dayofyr - inttemp;

    //  ----------------- find hours minutes and seconds -------------
    var temp = (days - dayofyr) * 24.0;
    var hr   = Math.floor(temp);
    temp = (temp - hr) * 60.0;
    var minute  = Math.floor(temp);
    var sec  = (temp - minute) * 60.0;

    var mdhms_result = {
        mon : mon,
        day : day,
        hr : hr,
        minute : minute,
        sec : sec
    };

    return mdhms_result;
}

function jday(year, mon, day, hr, minute, sec){
    'use strict';
    return (367.0 * year -
          Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
          Math.floor( 275 * mon / 9.0 ) +
          day + 1721013.5 +
          ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
          //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
          );
}

satellite.gstime_from_jday = function (julian_day) {
    return gstime (julian_day);
}

satellite.gstime_from_date = function (year, mon, day, hr, minute, sec) {
    var julian_day = jday(year, mon, day, hr, minute, sec);
    return gstime (julian_day);
}
