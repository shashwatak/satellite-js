/* global window: false */
(function() {
    'use strict';

    var specFiles = [];
    for (var file in window.__karma__.files) {
        if (/spec\.js$/.test(file)) {
            specFiles.push(file);
        }
    }
    console.log('Test files loaded: ' + specFiles.length);

    requirejs.config({
        baseUrl: '/base/src',   // Karma serves files from '/base'
        paths: {
            test: '../test',
            lib: '../lib',
            json: '../lib/requirejs-plugins/src/json',
            text: '../lib/requirejs-plugins/lib/text'
        },
        deps: specFiles         // ask Require.js to load all specFiles
    });

    require(specFiles, function () {
        window.__karma__.start();
    });
})();