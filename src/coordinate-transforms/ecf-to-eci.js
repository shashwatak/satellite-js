/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([], function() {
    'use strict';

    return function ecfToEci (ecfCoords, gmst){
        // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
        //
        // [X]     [C -S  0][X]
        // [Y]  =  [S  C  0][Y]
        // [Z]eci  [0  0  1][Z]ecf
        //
        var X = (ecfCoords.x * Math.cos(gmst))    - (ecfCoords.y * Math.sin(gmst));
        var Y = (ecfCoords.x * (Math.sin(gmst)))  + (ecfCoords.y * Math.cos(gmst));
        var Z =  ecfCoords.z;
        return { x : X, y : Y, z : Z };
    };
});