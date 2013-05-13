SGP4 Verification Chrome App
============================

This app uses a skeletal angular.js structure. The app accepts test inputs and expected values from a json file. I made use of the chrome sample app ["Filesystem Access"](https://github.com/GoogleChrome/chrome-app-samples/tree/master/filesystem-access) for file reading and writing, copyright by Google under Apache License, 2008

The app then runs satellite.js, using the json file's input parameters,
comparing the output to the expected results.
The results are displayed, and can be written to a file, as json.

