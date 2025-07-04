# Changelog

## 6.0.1 (2025-07-04)

- fix: `json2satrec` couldn't parse OMM `EPOCH` that was ending with Z
- fix: `OMMJsonObject.REV_AT_EPOCH` is made optional according to OMM spec

## 6.0.0 (2025-04-06)

- chore: The library is rewritten to TypeScript and type definitions are now not hand-written
but compiled from source code.
- feature: New `json2satrec` function that allows parsing orbital elements in
[OMM](https://www.nasa.gov/wp-content/uploads/2017/12/orbit_data_messages.pdf) format,
**encoded as JSON**. Orbital elements in OMM format are already available for download
from Celestrak and Space-Track. `json2satrec` supports both of these sources and aims 
to support all sources of properly formatted OMM data.

To obtain OMM as JSON from Celestrak, select "JSON" option at the top of "Current GP
Element Sets" page or follow
[this link](https://celestrak.org/NORAD/elements/index.php?FORMAT=json) where it will
be already selected.

Space-Track doesn't expose the JSON format in their UI, so to get JSON encoded OMM,
on "Recent ELSETs" page, from "Current Catalog Files", copy a URL for the needed category
and change the ending part of the URL from `/format/xml` to be `/format/json`.
- **BREAKING**: The return type of the `sgp4` and `propagate` functions is changed from:
```ts
{
  position: EciVec3<Kilometer> | false
  velocity: EciVec3<KilometerPerSecond> | false
}
```
to:
```ts
null | {
  position: EciVec3<Kilometer>
  velocity: EciVec3<KilometerPerSecond>
  meanElements: MeanElements
}
```
Where, if propagation failed, `null` is returned instead of individual keys set to `false`.
- **BREAKING**: removed overloads of `gstime` and return types of `sgp4` and `propagate` that
were not documented by TypeScript definitions as of v5.0.0, but could happen in runtime with v5.0.0.
- feature: New `SatRecError` enum that lists all error codes that can be set on `SatRec.error`.
- feature: `sgp4` and `propagate` function result object returns `meanElements` key,
which is orbit parameters as they have evolved at the propagation moment. Since they are always
internally calculated by SGP4 model, this doesn't impact performance.
- feature: New `sunPos` function that calculates Sun position at date, useful to calculate if
a satellite is in Earth umbra. Its accuracy is within 0.01 angular degree between years
1950 and 2050.
- feature: Many additional properties of `SatRec` are documented
- fix: `dopplerFactor` produces correct results depending on if the satellite is moving
towards or away from the observer.

## 5.0.0 (2023-01-06)

- Errors in calculations are fixed, WGS72 is used instead of WGS84 (#107).
- Dependencies are upgraded.

## 4.1.4 (2022-07-18)

- TypeScript definition for `ecfToEci` function is added. 

## 4.1.3 (2020-12-18)

- Fixed calculation of Doppler effect (`dopplerFactor`).

## 4.1.2 (2020-10-13)

- Expose `error` in TypeScript definition of `SatRec`.
- Fix TypeScript definition for `PositionAndVelocity` to allow error handling.

## 4.1.1 (2020-09-15)

- Fix TypeScript definition for `gstime` (#73).
- Fix documentation and TypeScript definition for `degreesLong` and `degreesLat` (#74).

## 4.1.0 (2020-09-14)

- TypeScript support is added via new TypeScript definitions file (#71).
- Rollup and some other dependencies are upgraded.

## 4.0.0 (2020-01-21)

- Node.js 12 support is added. Node.js 6 and Node.js 8 support is dropped (breaking change).
- Mocha, Chai and Istanbul are replaced by [Jest](https://jestjs.io/).
- Dependencies are upgraded.

## 3.0.1 (2019-03-14)

- Unnecessary calculations in `sgp4` function are reduced (#47).
- `vkmpersec` calculation is moved to constants (#50).
- `degreesToRadians` function is used in docs instead of `deg2rad` constant (#53).
- Typos' fixes (#54).

## 3.0.0 (2018-11-26)

- Node.js 4 support is dropped (breaking change).
- Deprecated functions `gstimeFromJday` and `gstimeFromDate` are removed (breaking change).
- New transformation functions are added: `radiansToDegrees`, `degreesToRadians`, `radiansLat`, `radiansLong`.

## 2.0.3 (2018-09-15)

- `satrec` object is not cloned in `sgp4` and `sgp4init` functions due to [performance reasons](https://github.com/shashwatak/satellite-js/issues/45).

## 2.0.2 (2018-04-16)

- [Wrong predictions for Molniya 3-47 orbits](https://github.com/shashwatak/satellite-js/issues/43) are fixed. Special thanks to [@nhamer](https://github.com/nhamer).

## 2.0.1 (2018-03-01)

- `sgp4` function's call result is used in `sgp4init`.
- Longitude of `eciToGeodetic` result is in [-PI; PI] range now.

## 2.0.0 (2017-12-23)

- Library became ES and Common.js compatible.
- Source code is reorganized to match [original Python library](https://pypi.python.org/pypi/sgp4/).
- `degreesLat` and `degreesLong` don't adjust input radians value and throw `RangeError` if it's out of bounds (breaking change).
- `invjday` function is added.
- [Julian day calculations take account of milliseconds](https://github.com/shashwatak/satellite-js/issues/31)
([#38](https://github.com/shashwatak/satellite-js/pull/38)).
- [Incorrect position and velocity bug](https://github.com/shashwatak/satellite-js/issues/26) for times not close to TLE epoch is fixed ([#37](https://github.com/shashwatak/satellite-js/pull/37)).
- Continuous integration and test coverage are provided.
- [Bower support is dropped](https://github.com/shashwatak/satellite-js/issues/40).
