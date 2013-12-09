/*
 * satellite-js v1.1
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */


satellite = (function () {

    var satellite = { version : "1.2" };
/*
    satellite-head.js and satellite-tail.js sandwich all the other
    functions in the library.

    The exposed functions are returned out via the satellite object

    This is to separate the satellite.js namespace from the rest of
    the javascript environment.

    Consult the Makefile to see which files are going to be sandwiched.

})() The footer is in satellite-tail.js */
