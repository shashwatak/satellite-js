/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    './geodetic-to-ecf'
], function(
    geodeticToEcf
) {
    'use strict';

    return function(observerCoords, satelliteCoords) {
        // http://www.celestrak.com/columns/v02n02/
        // TS Kelso's method, except I'm using ECF frame
        // and he uses ECI.

        var longitude   = observerCoords.longitude;
        var latitude    = observerCoords.latitude;

        // TODO: defined but never used
        //var height      = observerCoords.height;

        var observerEcf = geodeticToEcf (observerCoords);

        var rx      = satelliteCoords.x - observerEcf.x;
        var ry      = satelliteCoords.y - observerEcf.y;
        var rz      = satelliteCoords.z - observerEcf.z;

        var topS   = ( (Math.sin(latitude) * Math.cos(longitude) * rx) +
        (Math.sin(latitude) * Math.sin(longitude) * ry) -
        (Math.cos(latitude) * rz));
        var topE   = ( -Math.sin(longitude) * rx) + (Math.cos(longitude) * ry);
        var topZ   = ( (Math.cos(latitude)*Math.cos(longitude)*rx) +
        (Math.cos(latitude)*Math.sin(longitude)*ry) +
        (Math.sin(latitude)*rz));
        return { topS : topS, topE : topE, topZ : topZ };
    };
});