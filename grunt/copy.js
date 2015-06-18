/* global module: false */
module.exports = function(grunt) {
    'use strict';

    return {
        sgp4verification: {
            files: [{
                expand: true,
                cwd: 'dist',
                src: ['*'],
                dest: 'sgp4_verification/lib/sgp4'
            }]
        }
    };
};