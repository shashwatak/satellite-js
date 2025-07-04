# satellite.js

[![NPM version](https://img.shields.io/npm/v/satellite.js.svg)](https://www.npmjs.com/package/satellite.js)
[![Downloads/month](https://img.shields.io/npm/dm/satellite.js.svg)](https://www.npmjs.com/package/satellite.js)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE.md)

## Introduction

A library to make satellite propagation via TLEs or [OMM](https://www.nasa.gov/wp-content/uploads/2017/12/orbit_data_messages.pdf)
possible in the web. Provides the functions necessary for SGP4/SDP4 calculations, as callable javascript. Also provides
functions for coordinate transforms.

The internals of this library are nearly identical to
[Brandon Rhode's sgp4 python library](https://pypi.python.org/pypi/sgp4/).

Special thanks to all contributors for improving usability and bug fixes :)

- [ezze (Dmitriy Pushkov)](https://github.com/ezze)
- [davidcalhoun (David Calhoun)](https://github.com/davidcalhoun)
- [tikhonovits (Nikos Sagias)](https://github.com/tikhonovits)
- [dangodev (Drew Powers)](https://github.com/dangodev)
- [thkruz (Theodore Kruczek)](https://github.com/thkruz)
- [bakercp (Christopher Baker)](https://github.com/bakercp)
- [kylegmaxwell (Kyle G. Maxwell)](https://github.com/kylegmaxwell)
- [iamthechad (Chad Johnston)](https://github.com/iamthechad)
- [drom (Aliaksei Chapyzhenka)](https://github.com/drom)
- [PeterDaveHello (Peter Dave Hello)](https://github.com/PeterDaveHello)
- [Alesha72003](https://github.com/Alesha72003)
- [nhamer](https://github.com/nhamer)
- [owntheweb](https://github.com/owntheweb)
- [Zigone](https://github.com/Zigone)

Sites using the library can be found [here](https://github.com/shashwatak/satellite-js/wiki/Sites-using-satellite.js).

## Installation

```bash
npm install satellite.js
```

```bash
yarn add satellite.js
```

## Usage

### ES Modules

```js
import { sgp4 } from 'satellite.js';
...
const positionAndVelocity = sgp4(satrec, time);
```

### Common.js ([Node.js](https://nodejs.org))

```js
const satellite = require('satellite.js');
...
const positionAndVelocity = satellite.sgp4(satrec, time);
```

### AMD ([Require.js](http://requirejs.org/))

```js
define(['path/to/dist/satellite'], function(satellite) {
    ...
    var positionAndVelocity = satellite.sgp4(satrec, time);
});
```

### Script tag

Include `dist/satellite.min.js` as a script in your html:

```html
<script src="path/to/dist/satellite.min.js"></script>
```

`satellite` object will be available in global scope:

```js
const positionAndVelocity = satellite.sgp4(satrec, time);
```

## Sample Usage: calculate Look Angles, Geodetic Position etc
    
```js
// Sample TLE
const tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
      tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';

// Initialize a satellite record
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

// Or sample OMM - preferred for new applications
const omm = {
  "OBJECT_NAME": "HELIOS 2A",
  "OBJECT_ID": "2004-049A",
  "EPOCH": "2025-03-26T05:19:34.116960",
  "MEAN_MOTION": 15.00555103,
  "ECCENTRICITY": 0.000583,
  "INCLINATION": 98.3164,
  "RA_OF_ASC_NODE": 103.8411,
  "ARG_OF_PERICENTER": 20.5667,
  "MEAN_ANOMALY": 339.5789,
  "EPHEMERIS_TYPE": 0,
  "CLASSIFICATION_TYPE": "U",
  "NORAD_CAT_ID": 28492,
  "ELEMENT_SET_NO": 999,
  "REV_AT_EPOCH": 8655,
  "BSTAR": 0.00048021,
  "MEAN_MOTION_DOT": 0.00005995,
  "MEAN_MOTION_DDOT": 0
};

const satrecFromOmm = satellite.json2satrec(omm);

//  Propagate satellite using time since epoch (in minutes).
const positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);

//  Or you can use a JavaScript Date
const positionAndVelocity = satellite.propagate(satrec, new Date());

// if the result is `null`, it means that the propagation failed;
// consult `satrec.error` property for a specific reason.
if (positionAndVelocity === null) {
  switch (satrec.error) {
    // all possible values are listed in SatRecError enum:
    case satellite.SatRecError.Decayed:
      console.log('The satellite has decayed')
    // ...
  }
}

// The positionAndVelocity result is a pair of ECI coordinates.
// These are the base results from which all other coordinates are derived.
const positionEci = positionAndVelocity.position,
      velocityEci = positionAndVelocity.velocity;

// Set the Observer at 122.03 West by 36.96 North, in RADIANS
const observerGd = {
  longitude: satellite.degreesToRadians(-122.0308),
  latitude: satellite.degreesToRadians(36.9613422),
  height: 0.370
};

// You will need GMST for some of the coordinate transforms.
// http://en.wikipedia.org/wiki/Sidereal_time#Definition
const gmst = satellite.gstime(new Date());

// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
const positionEcf   = satellite.eciToEcf(positionEci, gmst),
      observerEcf   = satellite.geodeticToEcf(observerGd),
      positionGd    = satellite.eciToGeodetic(positionEci, gmst),
      lookAngles    = satellite.ecfToLookAngles(observerGd, positionEcf),
      dopplerFactor = satellite.dopplerFactor(observerCoordsEcf, positionEcf, velocityEcf);

// The coordinates are all stored in key-value pairs.
// ECI and ECF are accessed by `x`, `y`, `z` properties.
const satelliteX = positionEci.x,
      satelliteY = positionEci.y,
      satelliteZ = positionEci.z;

// Look Angles may be accessed by `azimuth`, `elevation`, `rangeSat` properties.
const azimuth   = lookAngles.azimuth,
      elevation = lookAngles.elevation,
      rangeSat  = lookAngles.rangeSat;

// Geodetic coords are accessed via `longitude`, `latitude`, `height`.
const longitude = positionGd.longitude,
      latitude  = positionGd.latitude,
      height    = positionGd.height;

//  Convert the RADIANS to DEGREES.
const longitudeDeg = satellite.degreesLong(longitude),
      latitudeDeg  = satellite.degreesLat(latitude);
```

## Resources

- [TS Kelso's Columns for Satellite Times](http://celestrak.com/columns/), Orbital Propagation Parts I and II a must!
- [Wikipedia: Simplified Perturbations Model](http://en.wikipedia.org/wiki/Simplified_perturbations_models)
- [SpaceTrack Report #3, by Hoots and Roehrich](http://celestrak.com/NORAD/documentation/spacetrk.pdf).

The TypeScript in this library is heavily based (propagation procedures straight copied) from:

- The python [sgp4 1.1 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/)
- The C++ code by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/)

The original PKG-INFO file from the python library is included.

The coordinate transforms are based off T.S. Kelso's columns:

- [Part I](http://celestrak.com/columns/v02n01/)
- [Part II](http://celestrak.com/columns/v02n02/)
- [Part III](http://celestrak.com/columns/v02n03/)

And the coursework for UC Boulder's ASEN students
- [Coodinate Transforms @ UC Boulder](http://ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

I would recommend anybody interested in satellite tracking or orbital propagation to read
[all of TS Kelso's columns](http://celestrak.com/columns/). Without his work, this project would not be possible.

Get a free [Space Track account](https://www.space-track.org/auth/login) and download your own up to date TLEs or OMM
for use with this library.

## Exposed Objects

### SatRec

The `SatRec` object comes from the original code by Rhodes as well as Vallado. It is immense and complex, but the
most important values it contains are the Keplerian Elements and the other values pulled from the TLE/OMM. I do not
suggest that anybody try to simplify it unless they have absolute understanding of Orbital Mechanics.

- `satnum`      Unique satellite number given in the TLE file.
- `epochyr`     Full four-digit year of this element set's epoch moment.
- `epochdays`   Fractional days into the year of the epoch moment.
- `jdsatepoch`  Julian date of the epoch (computed from `epochyr` and `epochdays`).
- `ndot`        First time derivative of the mean motion (ignored by SGP4).
- `nddot`       Second time derivative of the mean motion (ignored by SGP4).
- `bstar`       Ballistic drag coefficient B* in inverse earth radii.
- `inclo`       Inclination in radians.
- `nodeo`       Right ascension of ascending node in radians.
- `ecco`        Eccentricity.
- `argpo`       Argument of perigee in radians.
- `mo`          Mean anomaly in radians.
- `no`          Mean motion in radians per minute.
- `error`       The error code that is set by SGP4 model in case when propagation fails.

### SatRecError

The enum that lists all possible error codes in `SatRec.error property:
- `None` - No error, propagation for the last supplied date is successful
- `MeanEccentricityOutOfRange` - Mean eccentricity is out of range 0 ≤ e < 1
- `MeanMotionBelowZero` - Mean motion has fallen below zero
- `PerturbedEccentricityOutOfRange` - Perturbed eccentricity is out of range 0 ≤ e < 1
- `SemiLatusRectumBelowZero` - Length of the orbit’s semi-latus rectum has fallen below zero
- `Decayed` - Orbit has decayed: the computed position is underground

## Exposed Functions

### Initialization

NOTE! You are responsible for providing OMM or TLE.
[Get your free Space Track account here.](https://www.space-track.org/auth/login)
If you use Space Track, there should be no problem.

#### From OMM (preferred for new applications)

```js
const satrec = satellite.json2satrec(ommObject);
```

returns satrec object, created from JSON object that follows
[OMM format](https://www.nasa.gov/wp-content/uploads/2017/12/orbit_data_messages.pdf).
**OMM is a preferred default method for new applications**, since TLE format is constrained
to 5 digits in NORAD section and the number of catalogued objects quickly approches 100 000.

To obtain OMM as JSON from Celestrak, select "JSON" option at the top of "Current GP
Element Sets" page or follow
[this link](https://celestrak.org/NORAD/elements/index.php?FORMAT=json) where it will
be already selected.

Space-Track doesn't expose the JSON format in their UI, so to get JSON encoded OMM,
on "Recent ELSETs" page, from "Current Catalog Files", copy a URL for the needed category
and change the ending part of the URL from `/format/xml` to be `/format/json`.

#### From TLE

```js
const satrec = satellite.twoline2satrec(longstr1, longstr2);
```

returns satrec object, created from the TLEs passed in. longstr1 and longstr2 are the two lines of the TLE,
properly formatted by NASA and NORAD standards.

___

The satrec object is vastly complicated, but you don't have to do anything with it, except pass it around.

### Propagation

Both `propagate()` and `sgp4()` functions return position and velocity; as well as mean elements:

```json
{
  "position": { "x" : 1, "y" : 1, "z" : 1 },
  "velocity": { "x" : 1, "y" : 1, "z" : 1 },
  "meanElements": {
    "Om": 2.2835713400168607,
    "am": 1.3043985097733939,
    "em": 0.166565,
    "im": 0.5743651675510579,
    "mm": -4.361270622785478,
    "nm": 0.049918822378349076,
    "om": 4.074394344293675,
  }
}
```

position is in km, velocity is in km/s, both the ECI coordinate frame. Mean elements are satellite orbit elements as they
evolved at the propagation date: `am` (semi-major axis, Earth radii), `em` (eccentricity), `im` (inclination, radians),
`Om` (right ascension of ascending node, radians), `om` (argument of perigee, radians),
`nm` (mean motion, radians per minute).

```js
const positionAndVelocity = satellite.propagate(satrec, new Date());
```

Returns position and velocity, given a satrec and the calendar date. Is merely a wrapper for `sgp4()`, converts the
calendar day to Julian time since satellite epoch. Sometimes it's better to ask for position and velocity given
a specific date.

```js
const positionAndVelocity = satellite.sgp4(satrec, timeSinceTleEpochMinutes);
```

Returns position and velocity, given a satrec and the time in minutes since epoch. Sometimes it's better to ask for
position and velocity given the time elapsed since epoch.

### Doppler

You can get the satellites current Doppler factor, relative to your position, using the `dopplerFactor()` function.
Use either ECI or ECF coordinates, but don't mix them.

```js
const dopplerFactor = satellite.dopplerFactor(observer, position, velocity);
```

See the section on Coordinate Transforms to see how to get ECF/ECI/Geodetic coordinates.

### Coordinate Transforms

#### Greenwich Mean Sidereal Time

You'll need to provide some of the coordinate transform functions with your current GMST aka GSTIME. You can use
Julian Day:

```js
const gmst = satellite.gstime(julianDay);
```

or a JavaScript Date:

```js
const gmst = satellite.gstime(new Date());
```

#### Transforms

Most of these are self explanatory from their names. Coords are arrays of three floats EX: [1.1, 1.2, 1.3] in
kilometers. Once again, read the following first.

The coordinate transforms are based off T.S. Kelso's columns:
* [Part I](http://celestrak.com/columns/v02n01/)
* [Part II](http://celestrak.com/columns/v02n02/)
* [Part III](http://celestrak.com/columns/v02n03/)

And the coursework for UC Boulder's ASEN students
* [Coodinate Transforms @ UC Boulder](http://ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

These four are used to convert between ECI, ECF, and Geodetic, as you need them. ECI and ECF coordinates are in
km or km/s. Geodetic coords are in radians.

```js
const ecfCoords = satellite.eciToEcf(eciCoords, gmst);
```

```js
const eciCoords = satellite.ecfToEci(ecfCoords, gmst);
```

```js
const geodeticCoords = satellite.eciToGeodetic(eciCoords, gmst);
```

```js
const ecfCoords = satellite.geodeticToEcf(geodeticCoords);
```

These function is used to compute the look angle, from your geodetic position to a satellite in ECF coordinates.
Make sure you convert the ECI output from sgp4() and propagate() to ECF first.

```js
const lookAngles = satellite.ecfToLookAngles(observerGeodetic, satelliteEcf);
```

#### Latitude and Longitude

These two functions will return human readable Latitude or Longitude strings (Ex: "125.35W" or "45.565N")
from `geodeticCoords`:

```js
const latitudeStr = satellite.degreesLat(geodeticRadians),
      longitudeStr = satellite.degreesLong(geodeticRadians);
```

#### Sun position

This function returns Sun position at the given date. This is useful to further calculate if a given satellite
is in Earth umbra. Position is returned as geocentric equatorial vector pointing at the sun,
along with Right Ascension and Declination. This is the low precision formula and is valid for years from 1950
to 2050. Accuracy of apparent coordinates is 0.01 degrees.
```js
const jday = satellite.jday(new Date())
const sunPosition = satellite.sunPos(jday)

{
  rsun: [1, 1, 1], // x, y, z; astronomical units
  rtasc: 0.5, // radians
  decl: 0.5 // radians
}
```

## Contributing

This repo follows [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).
Before starting a work on new [pull request](https://github.com/shashwatak/satellite-js/compare), please, checkout your
feature or bugfix branch from `develop` branch:

```bash
git checkout develop
git fetch origin
git merge origin/develop
git checkout -b my-feature
```

Make sure that your changes don't break the existing code by running

```bash
npm test
```

and that your code follows [Airbnb](https://www.npmjs.com/package/eslint-config-airbnb-base) style

```bash
npm run lint
npm run lint:test
```

Implementing new functions or features, please, if possible, provide tests to cover them and mention your works in
[Changelog](CHANGELOG.md). Please don't change version number in `package.json` and don't add it to `CHANGELOG.md`.
All these things should be done later with [raise-version](https://github.com/ezze/node-raise-version) when
merging to `master`:

```bash
npm run raise major
```

or

```bash
npm run raise minor
```

or

```bash
npm run raise patch
```

In order to get test code coverage run the following:

```bash
npm run test:coverage
```

## Building

The source code is written in [TypeScript](https://www.typescriptlang.org/) and uses a strict tsconfig.

In order to build the library follow these steps:

- install [Node.js](https://nodejs.org/) and [Node Package Manager](https://www.npmjs.com/);

- install all required packages with NPM by running the following command from repository's root directory:

    ```bash
    npm install
    ```

- run the following NPM script to build everything:

    ```bash
    npm run build
    ```

- run the following NPM script to run test specs `test/*.spec.js` files with [Mocha](https://mochajs.org/):

    ```bash
    npm test
    ```

These is a full list of all available NPM scripts:

- `build`           builds everything;
- `transpile`       transpiles ES source files located in `src` directory to Common.js compatible modules and saves
                    the resulting files in `lib` directory;
- `dist`            builds ES and UMD modules in `dist` directory;
- `dist:es`         builds ES module in `dist` directory;
- `dist:umd`        builds [UMD](https://github.com/umdjs/umd) module in `dist` directory (both non-compressed and
                    compressed versions);
- `dist:umd:dev`    builds non-compressed version of UMD module in `dist` directory;
- `dist:umd:prod`   builds compressed version of UMD module in `dist` directory; 
- `watch:es`        watches for changes in `src` directory and automatically rebuilds ES module;
- `copy`            copies built library from `dist` to [SGP4 verification](#benchmarking) application's directory;
- `lint`            lints sources code located in `src` directory with [ESLint](http://eslint.org/) with
                    [Airbnb shared configuration]((https://www.npmjs.com/package/eslint-config-airbnb));
- `lint:test`       lints tests located in `test` directory with ESLint;
- `test`            runs tests;
- `test:coverage`   runs tests with [Istanbul](https://github.com/gotwarlost/istanbul) coverage summary;

## ES5 and satellite.min.js

Only the "src" directory is included in the Git repository, "dist" and "lib" directories are ignored. It's done intentionally to retain the size of the repository as small as possible. A full detailed explanation of why is located [here](https://github.com/shashwatak/satellite-js/issues/80#issuecomment-749225324).

You should install satellite.js with your package manager (npm or yarn) and then find satellite.js and satellite.min.js in node_modules/satellite.js/dist directory.

## Note about Code Conventions

Like Brandon Rhodes before me, I chose to maintain as little difference between this implementation and the prior
works. This is to make adapting future changes suggested by Vallado much simpler. Thus, some of the conventions
used in this library are very weird.

## How this was written

I took advantage of the fact that Python and JavaScript are nearly semantically identical. Most of the code is
just copied straight from Python. Brandon Rhodes did me the favor of including semi-colons on most of the lines of
code. JavaScript doesn't support multiple values returned per statement, so I had to rewrite the function calls.
Absolutely none of the mathematical logic had to be rewritten.

## Benchmarking

I've included a small testing app, that provides some benchmarking tools and verifies SGP4 and SDP4 using the
Test Criteria provided by SpaceTrack Report #3, and is based off
[System Benchmarking](http://celestrak.com/columns/v02n04/) by TS Kelso.

The testing app is a Chrome Packaged App that uses the `angular.js` framework.

Before running the app build the library and copy resulting files from `dist` directory to app's directory with
the following command:

```bash
npm run copy
```

To run the test, open up Chrome, go to the extensions page, and check "Developer Mode". Then, click "Load Unpacked App",
and select the `sgp4_verification` folder. Then run the app from within Chrome. The test file is located within
the `sgp4_verification` directory, as a JSON file called `spacetrack-report-3.json`.

## Acknowledgments

Major thanks go to Brandon Rhodes, TS Kelso, and David Vallado's team. Also, I'd like to thank Professor Steve
Petersen (AC6P) of UCSC for pointing me in the correct directions.

## License

All files marked with the License header at the top are Licensed. Any files unmarked by me or others are
unlicensed, and are kept only as a resource for [Shashwat Kandadai and other developers] for testing.

I chose the [MIT License](LICENSE.md) because this library is a derivative work off
[Brandon Rhodes sgp4](https://pypi.python.org/pypi/sgp4/), and that is licensed with MIT.

I worked in the Dining Hall at UCSC for a month, which means I signed a form that gives UCSC partial ownership of
anything I make while under their aegis, so I included them as owners of the copyright.

Please email all complaints to help@ucsc.edu
