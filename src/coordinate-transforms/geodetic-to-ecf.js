/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([], function() {
    'use strict';

    return function (geodeticCoords) {
        var longitude   = geodeticCoords.longitude;
        var latitude    = geodeticCoords.latitude;
        var height      = geodeticCoords.height;
        var a           = 6378.137;
        var b           = 6356.7523142;
        var f           = (a - b)/a;
        var e2          = ((2*f) - (f*f));
        var normal      = a / Math.sqrt( 1 - (e2*(Math.sin(latitude)*Math.sin(latitude))));

        var X           = (normal + height) * Math.cos (latitude) * Math.cos (longitude);
        var Y           = (normal + height) * Math.cos (latitude) * Math.sin (longitude);
        var Z           = ((normal*(1-e2)) + height) * Math.sin (latitude);
        return { x : X, y : Y, z : Z };
    };
});