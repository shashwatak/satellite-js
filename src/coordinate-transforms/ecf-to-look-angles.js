/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    './topocentric',
    './topocentric-to-look-angles'
], function(
    topocentric,
    topocentricToLookAngles
) {
    'use strict';

    return function (observerCoordsEcf, satelliteCoordsEcf) {
        var topocentricCoords = topocentric(observerCoordsEcf, satelliteCoordsEcf);
        return topocentricToLookAngles(topocentricCoords);
    };
});