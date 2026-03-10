---
sidebar_position: 7
title: Migrating
description: Migrations from v4 to current
---

## v6 to v7

### Breaking changes

- Dropped support for Node.js of versions not listed here:
  - 20.19 and above
  - 22.13 and above
  - Major version 24 and newer
- Dropped support for non-evergreen browsers.
- Dropped AMD, CJS and minified builds. The library is now ESM only. **If you're on Node.js higher than listed above and use CJS, this doesn't affect you, because all current LTS Node.js support `require(ESM)` and this library works with that**.
- `sunPos()` now returns `EciVec3<AU>` as its `rsun` output, instead of `number[]`:
  ```ts
  // before
  const {
    rsun: [x, y, z], rtasc, decl
  } = sunPos(jday);
  // after
  const {
    rsun: { x, y, z }, rtasc, decl
  } = sunPos(jday);
  ```
- The units of `ndot` and `nddot` fields on the `SatRec` object have changed:

  | Field | v6 | v7 |
  |---|---|---|
  | `ndot` | rev/day² | rad/min² |
  | `nddot` | rev/day³ | rad/min³ |

  If you read these fields directly, you will need to adjust for the new units.

  <details>
    <summary>Adjusting for new `ndot` and `nddot`</summary>

    ```ts
      import { constants } from 'satellite.js';

      const ndotRevPerDay2 = satrec.ndot * (constants.xpdotp * 1440);
      const nddotRevPerDay3 = satrec.nddot * (constants.xpdotp * 1440 * 1440);
    ```
  </details>

### Features

- Function **`shadowFraction(sunEciAU, satelliteEciKm)`** - calculates the fraction of the Sun's disc that is obscured by the Earth as seen from a satellite (0 = fully lit, 1 = umbra, anything in between = penumbra). See [Sun & Shadow](sun-and-shadow.md).
- **Bulk Propagation API** - a C++ compiled to WASM alternative to pure JS functions, designed for propagating large numbers of satellites and dates. See [Bulk Propagation API](bulk-propagation/index.md).

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
  Where, if propagation failed, `null` is returned instead of individual keys set to `false`. This should simplify your TypeScript code a bit.

- There were overloads of `gstime` and return types of `sgp4` and `propagate` that were not documented by TypeScript definitions as of v5, but could happen in runtime. If your code doesn't rely on those, or if you use TypeScript and your code compiles with v5, this doesn't impact you.

## v4 to v5

This release aligns the Satellite.js output to official USSF output by fixing errors in calculations and using WGS72 instead of WGS84. There are no other changes.
