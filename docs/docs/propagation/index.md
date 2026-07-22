---
title: Propagation
slug: /propagation
description: Propagate a satellite orbit using sgp4 or propagate, and handle errors
---

# Propagation

There are two propagation functions, differing by how you supply time:
- the original `sgp4()` which takes time in minutes since satellite epoch;
- the wrapper `propagate()`, which takes a `Date` and calls the `sgp4()` appropriately.

Both `propagate()` and `sgp4()` functions return position and velocity, as well as mean elements.

```ts
import { sgp4, propagate } from 'satellite.js';

// Usually it's easier to propagate using a Date
const state = propagate(satrec, new Date());

// But the original propagation using minutes since elements epoch is available too
const minutesSinceElementsEpoch = 60;
const state = sgp4(satrec, minutesSinceElementsEpoch);
```

## Return value

Depending on the success of propagation, the state is of type:

```ts
null | {
  position: EciVec3<Kilometer>;
  velocity: EciVec3<KilometerPerSecond>;
  meanElements: MeanElements;
}
```

Position is in **km**, velocity is in **km/s**, both in the ECI coordinate frame. Mean elements are satellite orbit elements as they evolved at the propagation date (or, more precisely, Singly Averaged Mean Elements):

| Field | Description |
|---|---|
| `am` | Semi-major axis, Earth radii |
| `em` | Eccentricity |
| `im` | Inclination, radians |
| `Om` | Right ascension of ascending node, radians |
| `om` | Argument of perigee, radians |
| `mm` | Mean anomaly, radians |
| `nm` | Mean motion, radians per minute |

If the result is `null`, it means that the propagation failed; consult `satrec.error` property for a specific reason (see [`SatRecError`](#satrecerror) below).

```json Example of successful propagation result
{
  "position": {
    "x": 7502.8247382780455,
    "y": -3261.6017969435115,
    "z": 0.0018869169812070286
  },
  "velocity": {
    "x": 3.4844533417194734,
    "y": 4.8318881749181575,
    "z": 3.9668858658984503
  },
  "meanElements": {
    "am": 1.3517607787713088,
    "em": 0.1848132,
    "im": 0.598009142927825,
    "Om": 5.873113218106511,
    "om": 4.807818347895983,
    "mm": -5.167949585752494,
    "nm": 0.04731839556792867
  }
}
```

## `SatRecError`

The `SatRecError` enum lists all possible error codes in the `SatRec.error` property:

| Value | Description |
|---|---|
| `None` | No error, propagation for the last supplied date is successful |
| `MeanEccentricityOutOfRange` | Mean eccentricity is out of range 0 ≤ e < 1 |
| `MeanMotionBelowZero` | Mean motion has fallen below 0 |
| `PerturbedEccentricityOutOfRange` | Perturbed eccentricity is out of range 0 ≤ e < 1 |
| `SemiLatusRectumBelowZero` | Length of the orbit's semi-latus rectum has fallen below 0 |
| `Decayed` | Orbit has decayed: the computed position is underground |

The `error` property of a `SatRec` instance is updated every time it is passed to `propagate` or `sgp4`. It may error at one moment of time but propagate successfully for another.

### Error handling example

```ts
import { propagate, SatRecError } from 'satellite.js';

const state = propagate(satrec, new Date());

if (state === null) {
  switch (satrec.error) {
    case SatRecError.Decayed:
      console.log('The satellite has decayed');
      break;
    // handle other cases...
  }
}
```

For a full catalog propagation run at a given date, **there will always be some errored satellites**, so you need to handle that case. In practice, if you're propagating many satellites, for example to visualise the sky, you can simply filter out errored states by `!state` condition.

:::note
SGP4 sometimes propagates satellites that decayed long ago to meaningless positions rather than reporting them as decayed. An opt-in [community decay check](community-decay-check.md) can catch these cases - at the cost of departing from strictly standard SGP4 output.
:::
