---
sidebar_position: 8
title: Calculator Reference
description: Complete reference of all BulkPropagator calculators
---

# Calculator Reference

This page documents every **Calculator** class available for the [Bulk Propagation API](index.md).

Each calculator represents an output that can be computed in WASM. You pick only the calculators you need: less work means faster runs. Calculators have **dependencies** - if a calculator requires another one, both must be present in the `calculators` array passed to `BulkPropagator`.

:::tip
Outputs are packed in [`TypedArray`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) buffers, and indices are always sorted **satellite-first, date-second**: index = `satelliteIndex * datesCount + dateIndex`.
:::

---

## `EciBaseCalculator` {#eci}

Runs SGP4 propagation and produces ECI position and velocity vectors. This is the WASM equivalent of the pure JS `propagate()`. As the base of calculations, it must be always present.

| Property | Value |
|---|---|
| **Key in the output** | `eci` |
| **Dependencies** | *none* |
| **Run parameters** | *none* |
| **Formatted output** | `{ position: EciVec3<Kilometer>, velocity: EciVec3<KilometerPerSecond>, error: SatRecError }` |
| **Raw output** | `{ position: Float64Array, velocity: Float64Array, error: Int8Array }` |

**Raw data layout:**
- `position` - `[x₀, y₀, z₀, x₁, y₁, z₁, …]` for each satellite/date pair
- `velocity` - `[vx₀, vy₀, vz₀, vx₁, vy₁, vz₁, …]` for each satellite/date pair
- `error` - `[err₀, err₁, …]` - `SatRecError` value for each pair

---

## `GmstCalculator` {#gmst}

Calculates Greenwich Mean Sidereal Time, needed by coordinate-transform calculators. WASM equivalent of `gstime()`.

| Property | Value |
|---|---|
| **Key in the output** | `gmst` |
| **Dependencies** | *none* |
| **Run parameters** | *none* |
| **Formatted output** | `GMSTime` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[gmst₀, gmst₁, …]` - one value per **date (not duplicated per satellite)**.

---

## `EcfPositionCalculator` {#ecfPosition}

ECF (Earth-Centered Fixed) position. WASM equivalent of `eciToEcf()` applied to position.

| Property | Value |
|---|---|
| **Key in the output** | `ecfPosition` |
| **Dependencies** | [`eci`](#eci), [`gmst`](#gmst) |
| **Run parameters** | *none* |
| **Formatted output** | `EcfVec3<Kilometer>` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[x₀, y₀, z₀, x₁, y₁, z₁, …]` for each satellite/date pair.

---

## `EcfVelocityCalculator` {#ecfVelocity}

ECF velocity. WASM equivalent of `eciToEcf()` applied to velocity.

| Property | Value |
|---|---|
| **Key in the output** | `ecfVelocity` |
| **Dependencies** | [`eci`](#eci), [`gmst`](#gmst) |
| **Run parameters** | *none* |
| **Formatted output** | `EcfVec3<KilometerPerSecond>` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[vx₀, vy₀, vz₀, vx₁, vy₁, vz₁, …]` for each satellite/date pair.

---

## `GeodeticPositionCalculator` {#geodeticPosition}

Geodetic position (latitude, longitude, height). WASM equivalent of `eciToGeodetic()`.

| Property | Value |
|---|---|
| **Key in the output** | `geodeticPosition` |
| **Dependencies** | [`eci`](#eci), [`gmst`](#gmst) |
| **Run parameters** | *none* |
| **Formatted output** | `GeodeticLocation` object: `{ latitude, longitude, height }` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[lat₀, lon₀, h₀, lat₁, lon₁, h₁, …]` for each satellite/date pair.

---

## `LookAnglesCalculator` {#lookAngles}

Look Angles (azimuth, elevation, range). WASM equivalent of `ecfToLookAngles()`.

Requires observer geodetic coordinates at run time.

| Property | Value |
|---|---|
| **Key in the output** | `lookAngles` |
| **Dependencies** | [`ecfPosition`](#ecfPosition) |
| **Run parameters** | `{ observer: GeodeticLocation }` - `{ latitude, longitude, height }` in radians and km |
| **Formatted output** | `LookAngles` object: `{ azimuth, elevation, rangeSat }` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[az₀, el₀, range₀, az₁, el₁, range₁, …]` for each satellite/date pair.

**Run-time usage:**
```ts
bulkPropagator.run({
  dates,
  lookAngles: {
    observer: {
      latitude: degreesToRadians(41),
      longitude: degreesToRadians(-71),
      height: 0.1,
    },
  },
});
```

---

## `DopplerFactorCalculator` {#dopplerFactor}

Doppler factor. WASM equivalent of `dopplerFactor()`.

Requires observer ECF coordinates at run time.

| Property | Value |
|---|---|
| **Key in the output** | `dopplerFactor` |
| **Dependencies** | [`ecfPosition`](#ecfPosition), [`ecfVelocity`](#ecfVelocity) |
| **Run parameters** | `{ observer: EcfVec3<Kilometer> }` - `{ x, y, z }` in km |
| **Formatted output** | `number` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[df₀, df₁, …]` for each satellite/date pair.

**Run-time usage:**
```ts
const observerGeodetic = {
  latitude: degreesToRadians(41),
  longitude: degreesToRadians(-71),
  height: 0.1,
};

bulkPropagator.run({
  dates,
  dopplerFactor: {
    observer: geodeticToEcf(observerGeodetic),
  },
});
```

---

## `SunPositionCalculator` {#sunPosition}

Sun position in the equatorial ECI frame, in AU. WASM equivalent of `sunPos()`.

| Property | Value |
|---|---|
| **Key in the output** | `sunPosition` |
| **Dependencies** | *none* |
| **Run parameters** | *none* |
| **Formatted output** | `EciVec3<AU>` |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[x₀, y₀, z₀, x₁, y₁, z₁, …]` - one vector per **date** (not duplicated per satellite).

---

## `ShadowFractionCalculator` {#shadowFraction}

Fraction of the Sun's disc obscured by the Earth. WASM equivalent of `shadowFraction()`.

| Property | Value |
|---|---|
| **Key in the output** | `shadowFraction` |
| **Dependencies** | [`eci`](#eci), [`sunPosition`](#sunPosition) |
| **Run parameters** | *none* |
| **Formatted output** | `number` - 0 = fully lit, 1 = umbra, 0–1 = penumbra |
| **Raw output** | `Float64Array` |

**Raw data layout:** `[sf₀, sf₁, …]` for each satellite/date pair.
