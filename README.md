# Satellite.js

[![NPM version](https://img.shields.io/npm/v/satellite.js.svg)](https://www.npmjs.com/package/satellite.js)
[![Downloads/month](https://img.shields.io/npm/dm/satellite.js.svg)](https://www.npmjs.com/package/satellite.js)
[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE.md)

## Introduction

A library to make satellite propagation via TLEs or [OMM](https://www.nasa.gov/wp-content/uploads/2017/12/orbit_data_messages.pdf) possible in the web. Provides the functions necessary for SGP4/SDP4 calculations, as callable javascript. Also provides functions for coordinate transforms and essentials like doppler factor and shadow calculation.

## [📃 Docs](https://shashwatak.github.io/satellite-js/) | [🚀 Quick Start](https://shashwatak.github.io/satellite-js/docs/intro)

Special thanks to all contributors for improving usability and bug fixes :)

<a href="https://github.com/shashwatak/satellite-js/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=shashwatak/satellite-js" style="width:50%"/>
</a>

Sites using the library can be found [here](https://github.com/shashwatak/satellite-js/wiki/Sites-using-satellite.js).

## Installation

```bash
npm install satellite.js
```

## Sample Usage: calculate Look Angles, Geodetic Position etc
    
```js
import * as satellite from 'satellite.js';

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

- The python [sgp4 by Brandon Rhodes](https://pypi.python.org/pypi/sgp4/)
- The C++ code by [David Vallado, et al](http://www.celestrak.com/publications/AIAA/2006-6753/)

The original PKG-INFO file from the python library is included.

The coordinate transforms are based off T.S. Kelso's columns:

- [Part I](http://celestrak.com/columns/v02n01/)
- [Part II](http://celestrak.com/columns/v02n02/)
- [Part III](http://celestrak.com/columns/v02n03/)

And the coursework for UC Boulder's ASEN students
- [Coodinate Transforms @ UC Boulder](http://ccar.colorado.edu/ASEN5070/handouts/coordsys.doc)

I would recommend anybody interested in satellite tracking or orbital propagation to read [all of TS Kelso's columns](http://celestrak.com/columns/). Without his work, this project would not be possible.

Get a free [Space Track account](https://www.space-track.org/auth/login) and download your own up to date TLEs or OMM for use with this library.

## Contributing

See [Contributing](https://shashwatak.github.io/satellite-js/docs/contributing) section on the site.

## Note about Code Conventions

Like Brandon Rhodes before, there is as little difference as possible between this implementation and the prior works on SGP4 algorithm. This is to make adapting future changes suggested by Vallado much simpler. Thus, some of the code conventions used in this library are very weird.

## Acknowledgments

Major thanks go to Brandon Rhodes, TS Kelso, David Vallado's team, and Professor Steve Petersen (AC6P) of UCSC.

## License

The [MIT License](LICENSE.md) is chosen because this library is originally a derivative work off [Brandon Rhodes sgp4](https://pypi.python.org/pypi/sgp4/), and that is licensed with MIT.

Shashwat Kandadai worked in the Dining Hall at UCSC for a month, which means he signed a form that gives UCSC partial ownership of anything he make while under their aegis, so it is included as owners of the copyright. Please email all complaints to help@ucsc.edu
