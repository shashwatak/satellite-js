/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([], function() {
    'use strict';

    return function(eciCoords, gmst){
        // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
        //
        // [X]     [C -S  0][X]
        // [Y]  =  [S  C  0][Y]
        // [Z]eci  [0  0  1][Z]ecf
        //
        //
        // Inverse:
        // [X]     [C  S  0][X]
        // [Y]  =  [-S C  0][Y]
        // [Z]ecf  [0  0  1][Z]eci

        var X = (eciCoords.x * Math.cos(gmst))    + (eciCoords.y * Math.sin(gmst));
        var Y = (eciCoords.x * (-Math.sin(gmst))) + (eciCoords.y * Math.cos(gmst));
        var Z =  eciCoords.z;
        return { x : X, y : Y, z : Z };
    };
});