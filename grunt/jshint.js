/* global module: false */
module.exports = function(grunt) {
    'use strict';

    return {
        options: {
            jshintrc: '.jshintrc'
        },
        gruntfile: {
            files: {
                src: [
                    'Gruntfile.js',
                    'grunt/**/*.js'
                ]
            }
        },
        library: {
            files: {
                src: [
                    'src/**/*.js'
                ]
            }
        },
        test: {
            files: {
                src: [
                    'test/**/*.js'
                ]
            }
        }
    };
};