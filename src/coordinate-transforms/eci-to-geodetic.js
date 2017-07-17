/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([], function() {
    'use strict';

    return function (eciCoords, gmst) {
        // http://www.celestrak.com/columns/v02n03/
        var a   = 6378.137;
        var b   = 6356.7523142;
        var R   = Math.sqrt( (eciCoords.x * eciCoords.x) + (eciCoords.y * eciCoords.y) );
        var f   = (a - b)/a;
        var e2  = ((2*f) - (f*f));
        var longitude = Math.atan2(eciCoords.y, eciCoords.x) - gmst;
        var kmax = 20;
        var k = 0;
        var latitude = Math.atan2(eciCoords.z,
            Math.sqrt(eciCoords.x * eciCoords.x +
            eciCoords.y * eciCoords.y));
        var C;
        while (k < kmax){
            C = 1 / Math.sqrt( 1 - e2*(Math.sin(latitude)*Math.sin(latitude)) );
            latitude = Math.atan2 (eciCoords.z + (a*C*e2*Math.sin(latitude)), R);
            k += 1;
        }
        var height = (R/Math.cos(latitude)) - (a*C);
        return { longitude : longitude, latitude : latitude, height : height };
    };
});