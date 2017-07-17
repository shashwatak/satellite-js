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

    return function propagate() {
        //Return a position and velocity vector for a given date and time.
        var satrec = arguments[0],
            date = Array.prototype.slice.call(arguments, 1),
            j = jday.apply(null, date),
            m = (j - satrec.jdsatepoch) * constants.minutesPerDay;
        return sgp4(satrec, m);
    };
});