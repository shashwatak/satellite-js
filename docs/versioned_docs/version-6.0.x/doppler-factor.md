---
sidebar_position: 4
title: Doppler Factor
description: Calculate the relativistic Doppler factor for a satellite–observer pair
---

# Doppler Factor

The `dopplerFactor` function computes the relativistic Doppler ratio for a satellite as seen from a ground observer.

A value **less than 1** means the satellite is approaching (frequency shifted higher); a value **greater than 1** means it is receding (frequency shifted lower).

```ts
import { dopplerFactor } from 'satellite.js';

const factor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
```

| Parameter | Type | Description |
|---|---|---|
| `observerEcf` | `EcfVec3<Kilometer>` | Observer position in ECF |
| `positionEcf` | `EcfVec3<Kilometer>` | Satellite position in ECF |
| `velocityEcf` | `EcfVec3<KilometerPerSecond>` | Satellite velocity in ECF |

**Returns:** `number` - the Doppler factor.

## Full example

```ts
import {
  propagate, gstime,
  eciToEcf, geodeticToEcf,
  degreesToRadians,
  dopplerFactor,
  json2satrec,
} from 'satellite.js';

const satrec = json2satrec(omm);
const date = new Date();

const state = propagate(satrec, date);
if (!state) throw new Error('Propagation failed');

const gmst = gstime(date);

const observerGeodetic = {
  longitude: degreesToRadians(-122.03),
  latitude: degreesToRadians(36.96),
  height: 0.370,
};

const observerEcf  = geodeticToEcf(observerGeodetic);
const positionEcf  = eciToEcf(state.position, gmst);
const velocityEcf  = eciToEcf(state.velocity, gmst);

const factor = dopplerFactor(observerEcf, positionEcf, velocityEcf);

// Multiply the satellite's transmit frequency by the factor
// to get the observed frequency.
const transmitFrequencyMHz = 437.5;
const observedFrequencyMHz = transmitFrequencyMHz * factor;
```
