/* global module: false */
module.exports = function(grunt) {
    'use strict';

    return {
        unit: {
            options: {
                singleRun: true,
                frameworks: ['jasmine', 'requirejs'],
                browsers: ['PhantomJS']
            },
            files: [{
                src: [
                    'lib/**/*.js'
                ],
                included: false
            }, {
                src: [
                    'src/**/*.js'
                ],
                included: false
            }, {
                src: [
                    'test/**/*.spec.js',
                    'test/**/*.json'
                ],
                included: false
            }, {
                src: [
                    'test/main.js'
                ]
            }]
        }
    };
};