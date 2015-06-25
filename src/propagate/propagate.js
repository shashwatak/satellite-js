/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    '../constants',
    '../gstime/jday',
    '../sgp4'
], function(
    constants,
    jday,
    sgp4
) {
    'use strict';

    return function propagate(satrec, year, month, day, hour, minute, second){
        //Return a position and velocity vector for a given date and time.
        var j = jday(year, month, day, hour, minute, second);
        var m = (j - satrec.jdsatepoch) * constants.minutesPerDay;
        return sgp4(satrec, m);
    };
});