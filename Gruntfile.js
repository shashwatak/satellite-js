/* global module: false, require: false, process: false */
module.exports = function(grunt) {
    'use strict';

    var path = require('path');
    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt'),
        init: true,
        data: {
            pkg: grunt.file.readJSON('package.json')
        }
    });

    grunt.registerTask('test', [
        'jshint',
        'karma'
    ]);

    grunt.registerTask('build', [
        'jshint:gruntfile',
        'jshint:library',
        'requirejs',
        'copy'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};