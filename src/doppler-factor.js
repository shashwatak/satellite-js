/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([], function() {
    'use strict';

    return function (myLocation, position, velocity) {
        var currentRange = Math.sqrt(
            Math.pow(position.x - myLocation.x, 2) +
            Math.pow(position.y - myLocation.y, 2) +
            Math.pow(position.z - myLocation.z, 2));
        var nextPos   = {
            x : position.x + velocity.x,
            y : position.y + velocity.y,
            z : position.z + velocity.z
        };
        var nextRange =  Math.sqrt(
            Math.pow(nextPos.x - myLocation.x, 2) +
            Math.pow(nextPos.y - myLocation.y, 2) +
            Math.pow(nextPos.z - myLocation.z, 2));
        var rangeRate =  nextRange - currentRange;

        function sign(value) {
            return value >= 0 ? 1 : -1;
        }

        rangeRate *= sign(rangeRate);
        var c = 299792.458; // Speed of light in km/s
        var factor = (1 + rangeRate/c);
        return factor;
    };
});