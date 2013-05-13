satellite.js
==============

Introduction
--------------
Provides the functions necessary for SGP4/SDP4 calculations as modular blocks. Also provides math for coordinate transforms.

Based off:
*   The python [sgp4 1.1 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/)
*   The C++ code by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/)
*   The original, [SpaceTrack Report #3, by Hoots and Roehrich](http://celestrak.com/NORAD/documentation/spacetrk.pdf).
*   The coordinate transforms are based off T.S. Kelso's columns:
    *   [Part I](http://celestrak.com/columns/v02n01/)
    *   [Part II](http://celestrak.com/columns/v02n02/)
    *   [Part III](http://celestrak.com/columns/v02n03/)

I would recommend everybody interested in satellite tracking or orbital propagation read [all of Kelso's columns](http://celestrak.com/columns/).

Makefile
--------
The code is divided up into separate files, but the final library will be a single file called satellite.js. The Makefile concatenates all the dependencies into a single file, for inclusion in a web application.

    cat ${SGP4SOURCES} ${COORDINATES} ${DOPPLER} > ${FINAL}

Note about Code Conventions
---------------------------
Like Brandon Rhodes before me, I chose to maintain as little difference between this implementation and the prior works. This is to make adapting future changes suggested by Vallado much simpler. Thus, some of the conventions used in this library are very weird.

How this was written
--------------------
I took advantage of the fact that Python and JavaScript are nearly semantically identical. Most of the code is just copied straight from Python. Brandon Rhodes did me the favor of including semi-colons on most of the lines of code. JavaScript doesn't support multiple values returned per statement, so I had to rewrite the function calls. Absolutely none of the mathematical logic had to be rewritten.

Testing
-------
I've included a small testing app, that provides some benchmarking tools and verifies SGP4 and SDP4 using the Test Criteria provided by SpaceTrack Report #3. The testing app is a Chrome Packaged App that uses the angular.js framework
