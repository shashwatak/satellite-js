---
sidebar_position: 2
title: Coordinate Transforms
description: Transform between ECI, ECF, geodetic, and look-angle coordinate frames
---

# Coordinate Transforms

These functions convert satellite state vectors between reference frames.

:::tip Units
- Positions, ranges, and heights are in **km**
- Velocities are in **km/s**
- Angles are in **radians** unless stated otherwise

For this reason, the library provides synonyms for
- `number` type: `Kilometer`, `KilometerPerSecond`, `Radians` etc
- `{ x: number, y: number, z: number }` type: `EciVec3`, `EcfVec3` etc

They are **not structurally distinct**, they are only here to remind you of units passed around.
:::

## GMST

Several transforms need Greenwich Mean Sidereal Time.

```ts
import { gstime } from 'satellite.js';

// From a JS Date
const gmst = gstime(new Date());

// From a Julian Day number
const gmst2 = gstime(jday);

// From individual UTC components
const gmst3 = gstime(year, month, day, hour, minute, second);
```

## Frame transforms

### `eciToEcf` - ECI → ECF

```ts
import { eciToEcf } from 'satellite.js';

const positionEcf = eciToEcf(positionEci, gmst);
const velocityEcf = eciToEcf(velocityEci, gmst);
```

### `ecfToEci` - ECF → ECI

```ts
import { ecfToEci } from 'satellite.js';

const positionEci = ecfToEci(positionEcf, gmst);
```

### `eciToGeodetic` - ECI → Geodetic

```ts
import { eciToGeodetic } from 'satellite.js';

const geodetic = eciToGeodetic(positionEci, gmst);

const { longitude, latitude, height } = geodetic;
```

### `geodeticToEcf` - Geodetic → ECF

```ts
import { geodeticToEcf, degreesToRadians } from 'satellite.js';

const observerGeodetic = {
  longitude: degreesToRadians(-122.03),
  latitude: degreesToRadians(36.96),
  height: 0.370, // km
};

const observerEcf = geodeticToEcf(observerGeodetic);
```

### `ecfToLookAngles` - ECF → Look Angles

```ts
import { ecfToLookAngles } from 'satellite.js';

const lookAngles = ecfToLookAngles(observerGeodetic, satelliteEcf);

const { azimuth, elevation, rangeSat } = lookAngles;
```

## Angle helpers

| Function | Description |
|---|---|
| `degreesToRadians(deg)` | Degrees → radians |
| `radiansToDegrees(rad)` | Radians → degrees |
| `degreesLat(rad)` | Radians → degrees, throws if \|rad\| > π/2 |
| `degreesLong(rad)` | Radians → degrees, throws if \|rad\| > π |
| `radiansLat(deg)` | Degrees → radians, throws if \|deg\| > 90 |
| `radiansLong(deg)` | Degrees → radians, throws if \|deg\| > 180 |
