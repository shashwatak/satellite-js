define([], function() {
    'use strict';

    return function(year, days){
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

        var mdhmsResult = {
            mon : mon,
            day : day,
            hr : hr,
            minute : minute,
            sec : sec
        };

        return mdhmsResult;
    };
});