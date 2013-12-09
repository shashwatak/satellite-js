satellite.js v1.2
==================
Updates
--------------
Replaced all positional arrays with key-value objects. Vastly improves code readability for users of this library. For example:

```javascript
// Before
var x = position[0];
var y = position[1];
var z = position[2];

// Now
var x = position["x"];
var y = position["y"];
var z = position["z"];
```
See sample for more details.


Introduction
--------------
A library to make satellite propagation via TLEs possible in the web.
Provides the functions necessary for SGP4/SDP4 calculations, as callable javascript. Also provides functions for coordinate transforms.

The internals of this library are nearly identical to [Brandon Rhode's sgp4 python library](https://pypi.python.org/pypi/sgp4/). However, it is encapsulated in a standard JS library (self executing function), and exposes only the functionality needed to track satellites and propagate paths. The only changes I made to Brandon Rhode's code was to change the positional parameters of functions to key:value objects. This reduces the complexity of functions that require 50+ parameters, and doesn't require the parameters to be placed in the exact order.

**Start Here:**
* [TS Kelso's Columns for Satellite Times](http://celestrak.com/columns/), Orbital Propagation Parts I and II a must!
* [Wikipedia: Simplified Perturbations Model](http://en.wikipedia.org/wiki/Simplified_perturbations_models)
* [SpaceTrack Report #3, by Hoots and Roehrich](http://celestrak.com/NORAD/documentation/spacetrk.pdf).

The javascript in this library is heavily based (straight copied) from:
*   The python [sgp4 1.1 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/)
*   The C++ code by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/)

I've included the original PKG-INFO file from the python library.

The coordinate transforms are based off T.S. Kelso's columns:
*   [Part I](http://celestrak.com/columns/v02n01/)
*   [Part II](http://celestrak.com/columns/v02n02/)
*   [Part III](http://celestrak.com/columns/v02n03/)

And the coursework for UC Boulder's ASEN students
*   [Coodinate Transforms @ UC Boulder](http://ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

I would recommend anybody interested in satellite tracking or orbital propagation to read [all of TS Kelso's columns](http://celestrak.com/columns/). Without his work, this project would not be possible.

Get a free [Space Track account](https://www.space-track.org/auth/login) and download your own up to date TLEs for use with this library.

Sample Usage
----------------

```javascript
//  Sample TLE
var tle_line_1 = '1 25544U 98067A   13149.87225694  .00009369  00000-0  16828-3 0  9031'
var tle_line_2 = '2 25544 051.6485 199.1576 0010128 012.7275 352.5669 15.50581403831869'

// Initialize a satellite record
var satrec = satellite.twoline2satrec (tle_line_1, tle_line_2);

//  Propagate satellite using time since epoch (in minutes).
var position_and_velocity = satellite.sgp4 (satrec, time_since_tle_epoch_minutes);
//  Or you can use a calendar date and time (obtained from Javascript [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)).
var position_and_velocity = satellite.propagate (satrec, year, month, date_of_month, hour, minute, second);

// The position_velocity result is a key-value pair of ECI coordinates.
// These are the base results from which all other coordinates are derived.
var position_eci = position_and_velocity["position"];
var velocity_eci = position_and_velocity["velocity"];

// Set the Observer at 122.03 West by 36.96 North, in RADIANS
var deg2rad = Math.PI / 180;
var observer_gd = {
    longitude : -122.0308  * deg2rad,
    latitude  : 36.9613422 * deg2rad,
    height    : .370
};

// You will need GMST for some of the coordinate transforms
var gmst = satellite.gstime_from_date (year, month, date_of_month, hour, minute, second);

// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
var position_ecf   = satellite.eci_to_ecf (position_eci, gmst);
var observer_ecf   = satellite.geodetic_to_ecf (observer_gd);
var position_gd    = satellite.eci_to_geodetic (position_eci, gmst);
var look_angles    = satellite.ecf_to_look_angles (observer_gd, position_ecf);
var doppler_factor = satellite.doppler_factor (observer_coords_ecf, position_ecf, velocity_ecf);

// The coordinates are all stored in key-value pairs.
// ECI and ECF are accessed by "x", "y", "z".
var satellite_x = position_eci["x"];
var satellite_y = position_eci["y"];
var satellite_z = position_eci["z"];

// Look Angles may be accessed by "azimuth", "elevation", "range_sat".
var azimuth   = look_angles["azimuth"];
var elevation = look_angles["elevation"];
var rangeSat  = look_angles["rangeSat"];

// Geodetic coords are accessed via "longitude", "latitude", "height".
var longitude = position_gd["longitude"];
var latitude  = position_gd["latitude"];
var height    = position_gd["height"];

//  Convert the RADIANS to DEGREES for pretty printing (appends "N", "S", "E", "W". etc).
var longitude_str = satellite.degrees_long (longitude);
var latitude_str  = satellite.degrees_lat  (latitude);

```

TODO
------
Optional functions that utilize Worker Threads

Makefile
--------
The code is divided up into separate files, but the final library will be a single file called satellite.js. The Makefile concatenates all the dependencies into a single file, for inclusion in a web application.
The HEAD and TAIL files encapsulate the inner files, wrapping them so that they are private, only exposing the necessary functions via the return object.

In essence:
```cat HEAD JAVASCRIPT_1 JAVASCRIPT_2 ... TAIL > satellite.js ```

Run "make" to build satellite.js file.
Run "make test" to install the satellite.js library in the sgp4 verification app.

Usage
-----
When you include satellite.js as a script in your html, the object 'satellite' is defined in global scope. You use this object to access all the functions in the satellite library.

EX:
```javascript
var position_velocity = satellite.sgp4 (test_sat, test_time);
```

Exposed Objects
-----------------
###satrec
The `satrec` object comes from the original code by Rhodes as well as Vallado. It is immense and complex, but the most important values it contains are the Keplerian Elements and the other values pulled from the TLEs. I do not suggest that anybody try to simplify it unless they have absolute understanding of Orbital Mechanics.


`satnum`     Unique satellite number given in the TLE file.

`epochyr`    Full four-digit year of this element set's epoch moment.

`epochdays`  Fractional days into the year of the epoch moment.

`jdsatepoch` Julian date of the epoch (computed from `epochyr` and `epochdays`).

`ndot`       First time derivative of the mean motion (ignored by SGP4).

`nddot`      Second time derivative of the mean motion (ignored by SGP4).

`bstar`      Ballistic drag coefficient B* in inverse earth radii.

`inclo`      Inclination in radians.

`nodeo`      Right ascension of ascending node in radians.

`ecco`       Eccentricity.

`argpo`      Argument of perigee in radians.

`mo`         Mean anomaly in radians.

`no`         Mean motion in radians per minute.


Exposed Functions
-----------------
###Initialization
```javascript
var satrec = satellite.twoline2satrec(longstr1, longstr2)
```
returns satrec object, created from the TLEs passed in. The satrec object is vastly complicated, but you don't have to do anything with it, except pass it around.
NOTE! You are responsible for providing TLEs. [Get your free Space Track account here.](https://www.space-track.org/auth/login)
longstr1 and longstr2 are the two lines of the TLE, properly formatted by NASA and NORAD standards. if you use Space Track, there should be no problem.


###Propogation
Both propagate() and sgp4() functions return position_velocity as a dictionary of the form:

```
{
 "position" : { "x" : 1, "y" : 1, "z" : 1 },
 "velocity" : { "x" : 1, "y" : 1, "z" : 1 }
}
```
position is in km, velocity is in km/s, both the ECI coordinate frame.

```javascript
var position_velocity = satellite.propagate(satrec, year, month, day, hour, minute, second)
```
Returns position and velocity, given a satrec and the calendar date. Is merely a wrapper for sgp4(), converts the calendar day to Julian time since satellite epoch. Sometimes it's better to ask for position and velocity given a specific date.

```javascript
var position_velocity = satellite.sgp4(satrec, time_since_epoch_minutes)
```
Returns position and velocity, given a satrec and the time in minutes since epoch. Sometimes it's better to ask for position and velocity given the time elapsed since epoch.

###Doppler
You can get the satellites current Doppler factor, relative to your position, using the doppler_factor() function. Use either ECI or ECF coordinates, but don't mix them.
```javascript
var doppler_factor = satellite.doppler_factor (observer, position, velocity);
```


See the section on Coordinate Transforms to see how to get ECF/ECI/Geodetic coordinates.

###Coordinate Transforms
####Greenwich Mean Sidereal Time
You'll need to provide some of the coordinate transform functions with your current GMST aka GSTIME. You can use Julian Day or a calendar date.
```javascript
var gmst = satellite.gstime_from_jday(julian_day)
```
```javascript
var gmst = satellite.gstime_from_date(year, mon, date_of_month, hr, minute, sec)
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

These function is used to compute the look angle, from your geodetic position to a satellite in ECF coordinates. Make sure you convert the ECI output from sgp4() and propagate() to ECF first.
```javascript
var look_angles = satellite.ecf_to_look_angles = function (observer_geodetic, satellite_ecf)
```

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
I've included a small testing app, that provides some benchmarking tools and verifies SGP4 and SDP4 using the Test Criteria provided by SpaceTrack Report #3, and is based off [System Benchmarking](http://celestrak.com/columns/v02n04/) by TS Kelso.

The testing app is a Chrome Packaged App that uses the angular.js framework.

To run the test, open up Chrome, go to the extensions page, and check "Developer Mode". Then, click "Load Unpacked App", and select the "sgp4_verification" folder. Then run the app from within Chrome. The test file is located within the "sgp4_verification" directory, as a JSON file called "spacetrack-report-3.json".

Acknowledgments
---------------
Major thanks go to Brandon Rhodes, TS Kelso, and David Vallado's team. Also, I'd like to thank Professor Steve Petersen (AC6P) of UCSC for pointing me in the correct directions.

License
----------------
All files marked with the License header at the top are Licensed. Any files unmarked by me or others are unlicensed, and are kept only as a resource for [Shashwat Kandadai and other developers] for testing.

I chose the MIT License because this library is a derivative work off [Brandon Rhodes sgp4](https://pypi.python.org/pypi/sgp4/), and that is licensed with MIT. It just seemed simpler this way, sub-licensing freedoms notwithstanding.

I worked in the Dining Hall at UCSC for a month, which means I signed a form that gives UCSC partial ownership of anything I make while under their aegis, so I included them as owners of the copyright.

Please email all complaints to help@ucsc.edu
