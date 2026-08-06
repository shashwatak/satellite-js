---
sidebar_position: 2
title: Initialization
description: Parse orbital elements (OMM or TLE) into a SatRec object
---

# Initialization

:::note
You are responsible for providing OMM or TLE. See [Get orbital elements](intro.md#get-orbital-elements).
:::

## `json2satrec` - From OMM (preferred for new applications) {/* #json-to-satrec */}

```ts
import { json2satrec, OMMJsonObject } from 'satellite.js';

const omm: OMMJsonObject = {
  "CCSDS_OMM_VERS":"3.0",
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

Returns a `SatRec` object, created from a JSON object that follows OMM format (see [Orbit Data Messages standard](https://www.nasa.gov/wp-content/uploads/2017/12/orbit_data_messages.pdf)). **OMM is a preferred default method for new applications**.

The function implementation is a bit more relaxed on the precense of required fields according to the OMM standard. This is because Celestrak and Space-Track do not follow the standard precisely.

The function currently supports OMM format **version 3** (this is actually the first production version; previous ones were testing). The function parameter, `OMMJsonObject`, is hence fairly strict.

## `twoline2satrec` - From TLE {/* #twoline-to-satrec */}

```ts
import { twoline2satrec } from 'satellite.js';

const tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
      tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';

const satrec = twoline2satrec(tleLine1, tleLine2);
```

Returns a `SatRec` object, created from the TLEs passed in. `tleLine1` and `tleLine2` are the two lines of the TLE, properly formatted (careful with spaces!).

## `SatRec`

The `SatRec` object is immense and complex; it contains are the Keplerian Elements and the other values pulled from the TLE/OMM, along with calculated values for SGP4 algorithm. While it is vastly complicated, for the basic usage you don't have to do anything with it, except pass it around to [propagation](propagation/index.md) functions and access the `error` property.

### Key properties

`SatRec` has dozens of properties; for the full list please check the interface in your editor. Below are some of the most commonly accessed properties.

| Property | Description |
|---|---|
| `error` | The error code that is set by SGP4 algorithm in case when propagation fails (see [`SatRecError`](propagation/index.md#satrecerror)) |
| `satnum` | Unique satellite identifier, usually NORAD number |
| `epochyr` | Full four-digit year of this element set's epoch moment |
| `epochdays` | Fractional days into the year of the epoch moment |
| `jdsatepoch` | Julian date of the epoch (computed from `epochyr` and `epochdays`) |
| `ndot` | First time derivative of the mean motion, in radians/minute² |
| `nddot` | Second time derivative of the mean motion, in radians/minute³ |
| `bstar` | Ballistic drag coefficient B\* in inverse earth radii |
| `inclo` | Inclination in radians |
| `nodeo` | Right ascension of ascending node in radians |
| `ecco` | Eccentricity |
| `argpo` | Argument of perigee in radians |
| `mo` | Mean anomaly in radians |
| `no` | Mean motion in radians per minute |
