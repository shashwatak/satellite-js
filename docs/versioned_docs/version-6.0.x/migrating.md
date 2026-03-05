---
sidebar_position: 5
title: Migrating
description: Migrations from v4 to current
---

## v5 to v6

### Breaking changes

- The return type of the `sgp4` and `propagate` functions is changed from:
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
  This should simplify your TypeScript code a bit.

- There were overloads of `gstime` and return types of `sgp4` and `propagate` that were not documented
  by TypeScript definitions as of v5, but could happen in runtime. If your code doesn't rely on those,
  or if you use TypeScript and your code compiles with v5, this doesn't impact you.

## v4 to v5

This release aligns the Satellite.js output to official USSF output by fixing errors in calculations
and using WGS72 instead of WGS84. There are no other changes.
