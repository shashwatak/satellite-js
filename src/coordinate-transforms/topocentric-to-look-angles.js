/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    '../constants'
], function(
    constants
) {
    'use strict';

    /**
     * @param {Object} topocentric
     * @param {Number} topocentric.topS
     * @param {Number} topocentric.topE
     * @param {Number} topocentric.topZ
     */
    return function(topocentric) {
        var topS = topocentric.topS;
        var topE = topocentric.topE;
        var topZ = topocentric.topZ;
        var rangeSat    = Math.sqrt((topS*topS) + (topE*topE) + (topZ*topZ));
        var El      = Math.asin (topZ/rangeSat);
        var Az      = Math.atan2 (-topE, topS) + constants.pi;

        return {
            azimuth : Az,
            elevation : El,
            rangeSat : rangeSat
        };
    };
});