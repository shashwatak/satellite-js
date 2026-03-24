---
sidebar_position: 1
---

# Quick Start

This tutorial covers the basic usage of the library:
1. Parse the orbital elements;
2. Propagate satellite orbit for a given date and get basic coordinates;
3. Transform the coordinates into different coordinate frames, such as Look Angles (azimuth, elevation, range)
   for a given observer.

:::note

For this tutorial it is assumed that you are familiar with the basics of orbital mechanics (what is SGP4) and the concept of different orbital coordinate systems (*Earth-Centered Inertial*, *Earth-Centered Fixed* etc).

Otherwise, please first refer to the following:
- [TS Kelso's Columns for Satellite Times](https://celestrak.com/columns/), specifically:
  - **Orbital Propagation**
  - **Orbital Coordinate Systems**
- [Wikipedia: Simplified Perturbations Model](https://en.wikipedia.org/wiki/Simplified_perturbations_models)

:::

## Key concepts

1. Orbital elements formats:
    - **Two-Line Element Set (TLE)** is an old established format of orbital elements, that usually consists of - funny enough - three lines of text. This is because the first line contains satellite identifiers, and only the following two - hence the "Two-Line" - contain actual parameters of its orbit. It has multiple issues which led to the introduction of OMM.
    - **Orbit Mean-Elements Message (OMM)** - is a new format of orbital elements. It has no issues of its predecessor, it's more universal and is human-readable.

    The library supports both TLE and OMM formats of orbital elements, although for new apps, we recommend using OMM. For the OMM format, the library supports **JSON** flavour only.
2. `SatRec` - is an object that you will get by parsing TLE or OMM. It is complex, but for this tutorial you don't need to do anything with it except passing around to library functions and accessing the `error` property.
3. Coordinate frames: This tutorial uses *Earth-Centered Inertial (ECI)* and *Earth-Centered Fixed (ECF)* coordinate frames, but you don't need to know exactly how they work. The final step of the tutorial is getting Look Angles of a satellite: its azimuth and elevation in the sky. The other coordinate frames are used only in coordinate transform steps to arrive to Look Angles.

## Get orbital elements

It all starts from orbital elements. Use your favourite source to obtain them; we test this library using the following sources:
- [Celestrak](https://celestrak.com/)
- [Space-Track](https://www.space-track.org/) - full database available but requires free registration

<details>
  <summary>How to obtain OMM as JSON from Celestrak and Space-Track</summary>

  To obtain OMM as JSON from Celestrak, select "JSON" option at the top of "Current GP Element Sets" page or follow [this link](https://celestrak.org/NORAD/elements/index.php?FORMAT=json) where it will be already selected.

  Space-Track doesn't expose the JSON format in their UI, so to get JSON encoded OMM, on "Recent ELSETs" page, from "Current Catalog Files", copy a URL for the needed category and change the ending part of the URL from `/format/xml` to be `/format/json`. If you just need full catalog in JSON format, simply download [this link](https://www.space-track.org/basicspacedata/query/class/gp/EPOCH/%3Enow-30/orderby/NORAD_CAT_ID,EPOCH/format/json) (you have to be logged in).
</details>

## Initialize a *SatRec*

A **SatRec** is a container object that holds the information about the satellite orbit, needed for the SGP4. For this tutorial you can treat it as a black box, except for the `error` property, which is covered later.

```ts title="Parsing OMM"
import { json2satrec } from 'satellite.js';

// Sample OMM
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

const satrec = json2satrec(omm);
```

```ts title="Parsing TLE"
import { twoline2satrec } from 'satellite.js';
// Sample TLE
const tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
      tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';

const satrec = twoline2satrec(tleLine1, tleLine2);
```

## Calculate ECI state vector

Given a `SatRec` instance and a moment of time, you can calculate the state vector of the satellite, comprising of **position and velocity**, in **Earth-Centered Inertial (ECI)** frame.

:::note

The units of measurement are as follows:
- Position vectors, ranges and heights are in *km*
- Velocity vectors are in *km/s*
- Angles are measured in *radians*

:::

ECI frame is the base frame for all further coordinate transforms.

```ts
import { propagate, SatRecError } from 'satellite.js';

// you can propagate using a JS Date...
const date = new Date();
const state = propagate(satrec, date);

// If the result is `null`, it means that the propagation failed;
// consult `satrec.error` property for a specific reason.
if (state === null) {
  switch (satrec.error) {
    // all possible values are listed in SatRecError enum:
    case SatRecError.Decayed:
      console.log('The satellite has decayed')
    // ...
  }
  throw new Error("Couldn't propagate the satellite");
}

// Otherwise, the result is a pair of ECI coordinates, along with mean elements.

const positionEci = state.position,
      velocityEci = state.velocity;
```

Internally `propagate` converts the date to minutes since epoch and then calls `sgp4`, however you can call `sgp4` directly as well:
```ts
import { sgp4 } from 'satellite.js';

const minutesSinceEpoch = 60;
const state = sgp4(satrec, minutesSinceEpoch);
```

The cases of propagation errors are very rare, thus in practice, if you're propagating many satellites, you can simply filter out errored states by `!state` condition, and/or errored `SatRec` objects by `.error !== SatRecError.None`.

The `error` property of a `SatRec` instance is updated every time it is passed to a `propagate` or `sgp4` function. This way, it may error at one moment of time, but propagate successfully for another.

## Transform the state vector

You can transform the basic ECI position and velocity into:
- **Earth-Centered Fixed (ECF)** coordinates
- **Geodetic** coordinates: longitude, latitude, height
- **Look Angles** for an observer: elevation, azimuth, range

For some of the coordinate transforms you will need GMST (see [Wiki: Sidereal time](http://en.wikipedia.org/wiki/Sidereal_time#Definition)).

```ts title="Coordinate transforms"
import {
  gstime,
  degreesToRadians, radiansToDegrees, degreesLong, degreesLat,
  eciToEcf,
  geodeticToEcf,
  eciToGeodetic,
  ecfToLookAngles
} from 'satellite.js';

const gmst = gstime(new Date());

// Set the Observer at 122.03 West by 36.96 North, in RADIANS
// height is in kilometers, as mentioned
const observerGeodetic = {
  longitude: degreesToRadians(-122.0308),
  latitude: degreesToRadians(36.9613422),
  height: 0.370
};

// You can get ECF, Geodetic, and Look Angles
const positionEcf   = eciToEcf(positionEci, gmst),
      velocityEcf   = eciToEcf(velocityEci, gmst),
      observerEcf   = geodeticToEcf(observerGeodetic),
      positionGd    = eciToGeodetic(positionEci, gmst),
      lookAngles    = ecfToLookAngles(observerGeodetic, positionEcf);

// The coordinates are all stored in key-value pairs.
// ECI and ECF are accessed by `x`, `y`, `z` properties.
const satelliteX = positionEci.x,
      satelliteY = positionEci.y,
      satelliteZ = positionEci.z;

// Look Angles may be accessed by `azimuth`, `elevation`, `rangeSat` properties.
const azimuth   = lookAngles.azimuth,
      elevation = lookAngles.elevation,
      rangeSat  = lookAngles.rangeSat;

// As azimuth and elevation are in radians, they may be converted to degrees:
const azimuthDegrees = radiansToDegrees(azimuth);
const elevationDegrees = radiansToDegrees(elevation);

// Geodetic coords are accessed via `longitude`, `latitude`, `height`.
const longitude = positionGd.longitude,
      latitude  = positionGd.latitude,
      height    = positionGd.height;

//  Convert the RADIANS to DEGREES.
const longitudeDeg = degreesLong(longitude),
      latitudeDeg  = degreesLat(latitude);
```

## Next steps

Now that you know how to calculate satellite position in different coordinate frames, you can:
- Learn more about **[Coordinate Transforms](transforms.md)**: all available frame conversions and angle helpers
- Determine if a satellite is in sunlight or shadow: **[Sun & Shadow](sun-and-shadow.md)**
- Calculate frequency shift for radio communication: **[Doppler Factor](doppler-factor.md)**
- Propagate tens of thousands of satellites faster with a performance-tailored
  **[Bulk Propagation API](bulk-propagation/index.md)**
