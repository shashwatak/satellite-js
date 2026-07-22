---
sidebar_position: 2
title: Community Decay Check
description: Opt-in check for long-decayed satellites that SGP4 would otherwise propagate to meaningless positions
---

# Community Decay Check

:::warning[Not standard SGP4]
This check **does not exist in the official SGP4 algorithm**. While it's very likely that this is the behavior you actually want, it will NOT be strictly compliant to the reference SGP4 output for the cases of satellites decayed long ago.
:::

## The problem

For some satellites - typically objects that decayed a long time ago - SGP4 does not report a "Decayed" state and instead returns a position and velocity *which is actually meaningless*. In other words, propagation "succeeds", but the values don't make any sense and the satellite has, in reality, re-entered.

The community decay check detects this situation so you can correctly identify this situation as decay, rather than plotting garbage coordinates.

## `propagate` function argument

You can opt in via the `communityDecayCheckEnabled` option on `propagate()`. When it is `true`, `propagate()` will filter out garbage results, and, as usual, return `null`, and set `satrec.error` to `SatRecError.Decayed`:

```ts
import { propagate, SatRecError } from 'satellite.js';

const state = propagate(satrec, new Date(), {
  communityDecayCheckEnabled: true,
});

if (state === null && satrec.error === SatRecError.Decayed) {
  // Caught either by the standard SGP4 decay error,
  // or by the community decay check.
}
```

The option is **`false` by default**, so standard SGP4 behavior is preserved unless you explicitly turn it on.

## `checkForDecay`

There is no similar flag for `sgp4` function to keep it compliant with the original implementation. Instead, you can use a predicate function: `checkForDecay`.

Call it after a successful `sgp4()` (or `propagate()` without `communityDecayCheckEnabled` flag) to test whether the satellite is actually decayed:

```ts
import { sgp4, checkForDecay } from 'satellite.js';

const state = sgp4(satrec, minutesSinceEpoch);
if (state && checkForDecay(satrec)) {
  // SGP4 reported success, but the satellite has actually decayed.
}
```

Internally it inspects a term computed during propagation (`SatRec.tempa`); when that term is non-positive, the returned state is not trustworthy.

### Bulk Propagation API

The same check is available in the [Bulk Propagation API](bulk-propagation/index.md). Pass `communityDecayCheckEnabled` in the run parameters for the `EciBaseCalculator`:

```ts
bulkPropagator.run({
  eci: { communityDecayCheckEnabled: true },
});
```

Satellites caught by the check will as usual report `SatRecError.Decayed` in the calculator's `error` output.

## Credit

The check was authored by [Theodore Kruczek](https://github.com/thkruz) for his library [OOTK](https://github.com/thkruz/ootk) and is used in this library with his explicit permission.
