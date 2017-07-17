/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([], function() {
    'use strict';

    var pi = Math.PI,
        mu = 398600.5,                  // in km3 / s2
        earthRadius =  6378.137,        // in km
        xke = 60.0 / Math.sqrt(earthRadius * earthRadius * earthRadius / mu),
        j2 = 0.00108262998905,
        j3 = -0.00000253215306;

    return {
        pi: pi,
        twoPi: pi * 2,
        deg2rad: pi / 180.0,
        rad2deg: 180 / pi,
        minutesPerDay: 1440.0,
        mu: mu,
        earthRadius: earthRadius,
        xke: xke,
        tumin: 1.0 / xke,
        j2: j2,
        j3: j3,
        j4: -0.00000161098761,
        j3oj2: j3 / j2,
        x2o3: 2.0 / 3.0
    };
});