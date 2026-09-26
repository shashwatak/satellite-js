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

## `alpha5ToNumber` - Catalog number from a TLE field {/* #alpha5-to-number */}

```ts
import { alpha5ToNumber, twoline2satrec } from 'satellite.js';

const tleLine1 = '1 A0000U 26067CY  26195.90649229  .00004770  00000+0  22159-3 0  9994',
      tleLine2 = '2 A0000  97.4593 154.0970 0005590 270.5113  89.5482 15.20467281 15911';

const satrec = twoline2satrec(tleLine1, tleLine2);

satrec.satnum;                 // 'A0000'
alpha5ToNumber(satrec.satnum); // 100000
```

Returns the catalog number written in a TLE's five-character catalog number field, as a number. Numbers above 99999 are written in Alpha-5 format: a leading letter stands for 10 to 33 in the ten-thousands place, skipping I and O, so `'A0000'` is 100000, `'J0000'` is 180000 and `'Z9999'` is 339999. A five-digit field is returned as its number: `'25544'` is 25544 and `'00404'` is 404.

A blank or whitespace-only field gives `NaN`. Any other field goes through `Number()`: a field starting with I or O, which Alpha-5 never uses, gives `NaN`, and so does a malformed one such as `'a0404'`, `'A000'` or `'AA000'`. `twoline2satrec` is unchanged: `satnum` keeps the field as written, and this function converts it only when you need a number.

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
