---
sidebar_position: 4
title: Coordinate Transforms
description: Transform between ECI, ECF, geodetic, and look-angle coordinate frames
---

# Coordinate Transforms

These functions implement reference frame and unit conversions.

:::tip[Units]
Usually:

- Positions, ranges, and heights are in **km**
- Velocities are in **km/s**
- Angles are in **radians**

The library provides synonyms for
- `number` type: `Kilometer`, `AU`, `KilometerPerSecond`, `Radians` etc
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

Rotates a vector from ECI axes to ECF axes. For a velocity, this keeps the Earth's rotation in the vector; see `eciToEcfVelocity` below for a velocity relative to the rotating Earth.

```ts
import { eciToEcf } from 'satellite.js';

const positionEcf = eciToEcf(positionEci, gmst);
const velocityEcf = eciToEcf(velocityEci, gmst); // rotated into ECF axes only
```

### `eciToEcfVelocity` - ECI velocity → ECF velocity

An ECF velocity is the velocity relative to the rotating Earth. `eciToEcfVelocity` rotates the ECI velocity into ECF axes and subtracts the velocity of the rotating frame at the satellite's position, ω × r. `eciToEcf(velocityEci, gmst)` alone still contains the Earth's rotation, ω × r: about 0.5 km/s for a satellite in low Earth orbit and 3 km/s at geostationary radius.

```ts
import { eciToEcfVelocity } from 'satellite.js';

const velocityEcf = eciToEcfVelocity(positionEci, velocityEci, gmst);
```

:::note
[`dopplerFactor`](doppler-factor.md) still expects the rotated-only velocity from `eciToEcf(velocityEci, gmst)` in this major version and compensates for the observer's rotation itself. The next major version switches it to the true ECF velocity.
:::

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
