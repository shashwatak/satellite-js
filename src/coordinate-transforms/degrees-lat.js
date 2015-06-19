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

    return function(radians) {
        if (radians > constants.pi/2 || radians < (-constants.pi/2)){
            return 'Err';
        }
        var degrees = (radians/constants.pi*180);
        if (degrees < 0){
            degrees = degrees;
        }
        else{
            degrees = degrees;
        }
        return degrees;
    };
});