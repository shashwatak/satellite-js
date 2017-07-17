/* global module: false */
module.exports = function(grunt) {
    'use strict';

    return {
        options: {
            almond: true,
            baseUrl: 'src',
            include: [
                'satellite'
            ],
            preserveLicenseComments: false,
            findNestedDependencies: true,
            stubModules: [
                'text'
            ],
            wrap: {
                startFile: 'src/wrap/start.frag',
                endFile: 'src/wrap/end.frag'
            }
        },
        development: {
            options: {
                out: 'dist/satellite.js',
                generateSourceMaps: true,
                optimize: 'none'
            }
        },
        production: {
            options: {
                out: 'dist/satellite.min.js',
                generateSourceMaps: false,
                optimize: 'uglify2'
            }
        }
    };
};