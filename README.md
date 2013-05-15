satellite.js
==============
Introduction
--------------
Provides the functions necessary for SGP4/SDP4 calculations, as modular blocks. Also provides functions for coordinate transforms.

First, Start Here: [SpaceTrack Report #3, by Hoots and Roehrich](http://celestrak.com/NORAD/documentation/spacetrk.pdf).

The javascript in this library is heavily based (straight copied) from:
*   The python [sgp4 1.1 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/)
*   The C++ code by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/)

The coordinate transforms are based off T.S. Kelso's columns:
*   [Part I](http://celestrak.com/columns/v02n01/)
*   [Part II](http://celestrak.com/columns/v02n02/)
*   [Part III](http://celestrak.com/columns/v02n03/)

And the coursework for UC Boulder's ASEN students
*   [Coodinate Transforms @ UC Boulder](http://ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

I would recommend anybody interested in satellite tracking or orbital propagation to read [all of TS Kelso's columns](http://celestrak.com/columns/). Without his work, this project would not be possible.

Makefile
--------
The code is divided up into separate files, but the final library will be a single file called satellite.js. The Makefile concatenates all the dependencies into a single file, for inclusion in a web application.
The HEAD and TAIL files encapsulate the functions, wrapping them so that they are private, only exposing the necessary functions.

```cat ${SAT_HEADER} ${SGP4SOURCES} ${COORDINATES} ${DOPPLER} ${SAT_TAIL} > ${FINAL}```

Usage
-----
When you include satellite.js as a script in your html, the object 'satellite' is defined in global scope. You use this object to access all the functions in the satellite library.

EX:
```javascript
var position_velocity = satellite.sgp4 (test_sat, test_time);
```

Exposed Functions
---
###Initialization
```javascript
var sat_rec = satellite.twoline2satrec(longstr1, longstr2)
```
returns satrec object, created from the TLEs passed in. The satrec object is vastly complicated, but you don't have to do anything with it, except pass it around.
NOTE! You are responsible for providing TLEs. [Get your free Space Track account here.](https://www.space-track.org/auth/login)
longstr1 and longstr2 are the two lines of the TLE, properly formatted by NASA and NORAD standards. if you use Space Track, there should be no problem.


###Propogation
Both propagation function return position_velocity in a 2D array of the form:

```[[position_x, position_y, position_z], [velocity_x, velocity_y, velocity_z]]```

position is in km, velocity is in km/s, both the ECI coordinate frame.

```javascript
var position_velocity = satellite.propagate(satrec, year, month, day, hour, minute, second)
```
Returns position and velocity, given a satrec and the calendar date. Is merely a wrapper for sgp4(), converts the calendar day to julian time since satellite epoch. Sometimes it's better to ask for position and velocity given a specific date.
```javascript
var position_velocity = satellite.sgp4(satrec, time_since_epoch_seconds)
```
Returns position and velocity, given a satrec and the time in seconds since epoch. Sometimes it's better to ask for position and velocity given the time elapsed since epoch.

###Coordinate Transforms
####Greenwich Mean Sidereal Time
You'll need to provide some of the coordinate transform functions with your current GMST aka GSTIME. You can use Julian Day or a calendar date.
```javascript
var gmst = satellite.gstime_from_jday(julian_day)
```
```javascript
var gmst = satellite.gstime_from_date(year, mon, day, hr, minute, sec)
```
####Transforms
Most of these are self explanatory from their names. Coords are arrays of three floats EX: [1.1, 1.2, 1.3] in kilometers. Once again, read the following first:
The coordinate transforms are based off T.S. Kelso's columns:
*   [Part I](http://celestrak.com/columns/v02n01/)
*   [Part II](http://celestrak.com/columns/v02n02/)
*   [Part III](http://celestrak.com/columns/v02n03/)

And the coursework for UC Boulder's ASEN students
*   [Coodinate Transforms @ UC Boulder](http://ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

These four are used to convert between ECI, ECF, and Geodetic, as you need them. ECI and ECF coordinates are in km or km/s. Geodetic coords are in radians.
```javascript
var ecf_coords = satellite.eci_to_ecf(eci_coords, gmst)
```
```javascript
var eci_coords = satellite.ecf_to_eci(ecf_coords, gmst)
```
```javascript
var geodetic_coords = satellite.eci_to_geodetic (eci_coords, gmst)
```
```javascript
var ecf_coords = satellite.geodetic_to_ecf(geodetic_coords)
```

These two are used to compute your look angle. I'm considering coupling them into one function.
```javascript
satellite.ecf_to_topocentric(observer_coords_geodetic, satellite_coords_ecf)
```
```javascript
satellite.topocentric_to_look_angles (topocentric)
```
Returns an array of [Azimuth, Elevation, Range]. Az, El are in radians, Range is in km.

####Latitude and Longitude
These two functions will return human readable Latitude or Longitude strings (Ex: "125.35W" or "45.565N") from geodetic_coords.
```javascript
var latitude_string = satellite.degrees_lat (geodetic_radians)
```
```javascript
var longitude_string = satellite.degrees_long (geodetic_radians)
```

Note about Code Conventions
---------------------------
Like Brandon Rhodes before me, I chose to maintain as little difference between this implementation and the prior works. This is to make adapting future changes suggested by Vallado much simpler. Thus, some of the conventions used in this library are very weird.

How this was written
--------------------
I took advantage of the fact that Python and JavaScript are nearly semantically identical. Most of the code is just copied straight from Python. Brandon Rhodes did me the favor of including semi-colons on most of the lines of code. JavaScript doesn't support multiple values returned per statement, so I had to rewrite the function calls. Absolutely none of the mathematical logic had to be rewritten.

Testing
-------
I've included a small testing app, that provides some benchmarking tools and verifies SGP4 and SDP4 using the Test Criteria provided by SpaceTrack Report #3. The testing app is a Chrome Packaged App that uses the angular. js framework.

To run the test, open up Chrome, go to the extensions page, and check "Developer Mode". Then, click "Load Unpacked App", and select the "sgp4_verification" folder. Then run the app from within Chrome. The test file is located within the "sgp4_verification" directory, as a JSON file called "spacetrack-report-3.json".

Acknowledgments
---------------
Major thanks go to Brandon Rhodes, TS Kelso, and David Vallado's team. Also, I'd like to thank Professor Steve Petersen (AC6P) of UCSC for pointing me in the correct directions.
