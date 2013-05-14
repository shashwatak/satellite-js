satellite.js
==============

Introduction
--------------
Provides the functions necessary for SGP4/SDP4 calculations as modular blocks. Also provides math for coordinate transforms.

First, Start Here: [SpaceTrack Report #3, by Hoots and Roehrich](http://celestrak.com/NORAD/documentation/spacetrk.pdf).

The javascript in this library is heavily based (straight copied) from:
*   The python [sgp4 1.1 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/)
*   The C++ code by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/)

The coordinate transforms are based off T.S. Kelso's columns:
*   [Part I](http://celestrak.com/columns/v02n01/)
*   [Part II](http://celestrak.com/columns/v02n02/)
*   [Part III](http://celestrak.com/columns/v02n03/)
And the coursework for UC Boulder's ASEN students
*   [Coodinate Transforms @ UC Boulder](ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

I would recommend anybody interested in satellite tracking or
orbital propagation to read [all of TS Kelso's columns](http://celestrak.com/columns/).
Without his work, this project would not be possible.

Makefile
--------
The code is divided up into separate files, but the final library will be a single file called satellite.js. The Makefile concatenates all the dependencies into a single file, for inclusion in a web application.

    cat ${SGP4SOURCES} ${COORDINATES} ${DOPPLER} > ${FINAL}

Usage
-----
When you include satellite.js as a script in your html,
the object 'satellite' is defined in global scope.
You use this object to access all the functions in
the satellite library.

EX:
    satellite.sgp4 (test_sat, test_time);

Exposed Functions
---
###Initialization
    satellite.twoline2satrec(longstr1, longstr2)
returns satrec object, created from the TLEs passed in.
The satrec object is vastly complicated, but you don't
have to do anything with it, except pass it around.
NOTE!
You are responsible for providing TLEs.
[Get your free Space Track account here.](https://www.space-track.org/auth/login)
longstr1 and longstr2 are the two lines of the TLE, properly
formatted by NASA and NORAD standards. if you use Space Track,
there should be no problem.


###Propogation
    satellite.propagate(satrec, year, month, day, hour, minute, second)
returns position and velocity, given a satrec and the calendar date.
is merely a wrapper for sgp4(), converts the calendar day to julian
time since satellite epoch. Sometimes it's better to ask for position
and velocity given a specific date.
    satellite.sgp4(satrec, time_since_epoch_seconds)
returns position and velocity, given a satrec and time delta.
Sometimes it's better to ask for position and velocity given the
time elapsed since epoch.

###Coordinate Transforms
####Greenwich Mean Sidereal Time
You'll need to provide some of the coordinate transform functions with your
current GMST aka GSTIME. You can use Julian Day or a calendar date.
    satellite.gstime_from_jday(julian_day)
    satellite.gstime_from_date(year, mon, day, hr, minute, sec)
####Transforms
Most of these are self explanatory from their names.
Coords are arrays of three floats EX: [1.1, 1.2, 1.3]
in kilometers. Once again, read the following first:
The coordinate transforms are based off T.S. Kelso's columns:
*   [Part I](http://celestrak.com/columns/v02n01/)
*   [Part II](http://celestrak.com/columns/v02n02/)
*   [Part III](http://celestrak.com/columns/v02n03/)
And the coursework for UC Boulder's ASEN students
*   [Coodinate Transforms @ UC Boulder](ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

These four are used to convert between ECI, ECF, and Geodetic,
as you need them.
    satellite.eci_to_ecf(eci_coords, gmst)
    satellite.ecf_to_eci(ecf_coords, gmst)
    satellite.eci_to_geodetic (eci_coords, gmst)
    satellite.geodetic_to_ecf(geodetic_coords)
These two are used to compute your look angle.
    satellite.ecf_to_topocentric(observer_coords_lat_long, satellite_coords)
NOTE: Observer Coords are provided as Lat/Long in RADIANS!
    satellite.topocentric_to_look_angles (topocentric)
        returns Azimuth, Elevation, Range
I'm considering coupling them into one function.

####Latitude and Longitude
These two functions will return human readable Latitude or Longitude
(Ex: "125.35W" or "45.565N") from radians.
    satellite.degrees_lat (radians)
    satellite.degrees_long (radians)
Note about Code Conventions
---------------------------
Like Brandon Rhodes before me, I chose to maintain as little difference between this implementation and the prior works. This is to make adapting future changes suggested by Vallado much simpler. Thus, some of the conventions used in this library are very weird.

How this was written
--------------------
I took advantage of the fact that Python and JavaScript are nearly semantically identical. Most of the code is just copied straight from Python. Brandon Rhodes did me the favor of including semi-colons on most of the lines of code. JavaScript doesn't support multiple values returned per statement, so I had to rewrite the function calls. Absolutely none of the mathematical logic had to be rewritten.

Testing
-------
I've included a small testing app, that provides some benchmarking tools
and verifies SGP4 and SDP4 using the Test Criteria provided by SpaceTrack
Report #3. The testing app is a Chrome Packaged App that uses the angular.
js framework.

To run the test, open up Chrome, go to the extensions page, and check
"Developer Mode". Then, click "Load Unpacked App", and select the
"sgp4_verification" folder. Then run the app from within Chrome.
The test file is located within the "sgp4_verification" directory, as a
JSON file called "spacetrack-report-3.json".
