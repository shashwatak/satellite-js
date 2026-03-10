---
sidebar_position: 3
title: Sun Position
description: Calculate the Sun's geocentric equatorial position
---

## Sun position

`sunPos` returns the Sun's geocentric equatorial position vector in **AU** (Astronomical Units), plus its right ascension and declination.

```ts
import { sunPos, jday } from 'satellite.js';

const jd = jday(new Date());
const { rsun, rtasc, decl } = sunPos(jd);
// rsun: number[] - [x, y, z] in AU
// rtasc: number - right ascension in radians
// decl: number - declination in radians
```
