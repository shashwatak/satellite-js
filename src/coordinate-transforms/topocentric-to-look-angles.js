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
     * @param {Number} topocentric.topS Positive horizontal vector S due south.
     * @param {Number} topocentric.topE Positive horizontal vector E due east.
     * @param {Number} topocentric.topZ Vector Z normal to the surface of the earth (up).
     * @returns {Object}
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
            rangeSat : rangeSat  // Range in km.
        };
    };
});
