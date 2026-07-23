---
sidebar_position: 5
title: Sun & Shadow
description: Calculate sun position and shadow fraction for eclipse/umbra detection
---

# Sun Position & Shadow Fraction

These functions let you determine whether a satellite is in sunlight, penumbra, or umbra (Earth's shadow).

## Sun position

`sunPos` returns the Sun's geocentric equatorial position vector in **AU** (Astronomical Units), plus its right ascension and declination.

This is a fast but low precision function: it has accuracy of apparent coordinates is 0.01 degrees for years between 1950 and 2050.

```ts
import { sunPos, jday } from 'satellite.js';

const jd = jday(new Date());
const { rsun, rtasc, decl } = sunPos(jd);
// rsun: EciVec3<AU> - { x, y, z } in AU
// rtasc: number - right ascension in radians
// decl: number - declination in radians
```

## Shadow fraction

`shadowFraction` computes what fraction of the Sun's disc is obscured by the Earth as seen from the satellite.

This function considers Earth a sphere with radius of 6378.135 km.

```ts
import { shadowFraction } from 'satellite.js';

const fraction = shadowFraction(rsun, positionEci);
// 0   = fully lit (satellite is in sunlight)
// 0–1 = penumbra (partially obscured)
// 1   = umbra (fully in Earth's shadow)
```

| Parameter | Type | Description |
|---|---|---|
| `sunEciAU` | `EciVec3<AU>` | Sun position from `sunPos().rsun` or your favorite astronomy library |
| `satelliteEciKm` | `EciVec3<Kilometer>` | Satellite ECI position from `propagate()` |

:::tip
While `shadowFraction` works smoothly with `sunPos`, it doesn't *have* to. You can provide sun position calculated by another library, such as [`astronomy-engine`](https://github.com/cosinekitty/astronomy/tree/master/source/js) for example.
:::

## Full example

```ts
import {
  propagate, sunPos, shadowFraction, jday,
  json2satrec,
} from 'satellite.js';

const satrec = json2satrec(omm);
const date = new Date();

const state = propagate(satrec, date);
if (!state) throw new Error('Propagation failed');

const { rsun } = sunPos(jday(date));
const fraction = shadowFraction(rsun, state.position);

if (fraction === 0) {
  console.log('Satellite is in sunlight');
} else if (fraction === 1) {
  console.log('Satellite is in umbra');
} else {
  console.log(`Satellite is in penumbra (${(fraction * 100)}% of the Sun obscured)`);
}
```
