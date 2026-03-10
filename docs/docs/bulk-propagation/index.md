---
sidebar_position: 5
title: Bulk Propagation API
description: C++ to WASM compilation of SGP4 and transforms, for fastest performance
---

The **Bulk Propagation API** is a C++ compiled to WASM alternative to pure JS functions. It is designed for use cases like:
- propagate an entire satellite catalog for a point in time, as fast as possible (example: sky visualization)
- propagate a satellite for many points in time (example: trajectory/ephemeris)

:::note
While this API should in general be faster than pure JS alternative, it not necessarily will be for your use case. JS engines are incredibly good at optimization and your JS code, optimized by the engine, can still beat WASM. Please measure the performance difference for your case.
:::

:::danger
Classes of this API make use of unmanaged memory, hence you need to manually dispose them (see **[Disposal](#disposal)** below). If you don't, **your app will leak memory**.
:::

## Key concepts

### Runtime

A **Runtime** is an object that encompasses and manages a WASM instance, its creation, and disposal. There are currently two Runtimes:
- **SingleThreadRuntime**. In this runtime, all SGP4 calculations and transforms happen *in the main thread*, *synchronously*.
- **MultiThreadRuntime**. Here, the calculations happen *in a set of separate threads*, *asynchronously*. This runtime needs [`SharedArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) support by your environment (in the context of browsers, the page must be cross-origin isolated and in a secure context).

### BulkPropagator

**BulkPropagator** is a class that is your main interface to the API. You pass it a **Runtime**, estimated **counts of dates and satellites**, and an array of **Calculator** instances.

### Calculators

One of the vectors to achieve the best performance is to only calculate what's necessary and no more. The **Calculators** represent both SGP4 itself as well as individual transforms applied to its outputs.

## Usage

### 0. Decide if you need it

This API can outperform pure JS only when counting hundreds of satellite–time pairs at a time. It also has a smaller set of possible outputs compared to pure JS.

✅ Bulk Propagation API is best for:
- Real-time sky simulation, calculating positions of tens of thousands of satellites
- Trajectory / ephemeris / events such as rise/set times, culmination and passes calculation, with hundreds of time points for a number of satellites

❌ Pure JS functions and properties is best for:
- Calculation for a single satellite and date/time (for example, by clicking a satellite on a sky simulator and displaying its properties at the current moment)
- Calculation of extended properties of a satellite, such as singly averaged mean elements

### 1. Choose a Runtime

- **SingleThreadRuntime** is synchronous and does not create any threads. When you run a calculation, it blocks the thread where it was created. Good for workers, smaller batches of calculations, console applications, and environments where [`SharedArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) is not available. An instance of this runtime may support many **BulkPropagator** instances at the same time (but since calculations are blocking, only one calculation runs at a time).

- **MultiThreadRuntime** is asynchronous and uses a number of threads which you specify. It does most of the work in the worker threads and doesn't block the main thread. While you may create many **BulkPropagator** instances referencing a single **MultiThreadRuntime**, **you can run only one such instance at a time**. Running more than one on a single Runtime will throw.

<details>
  <summary>Why only one BulkPropagator per MultiThreadRuntime?</summary>

  In the C++ world, which lies in the WASM instance, a multithreaded run of the propagation is actually synchronous. After the work is spread across threads, there is a `while(true)` loop that checks for threads to finish and if any of them still didn't, it yields to the event loop of the "outside world". In a short while it iterates the loop again and so on.

  Hence, despite in the JS environment many separate things can happen, in the meantime only one C++ function call is in progress, albeit with interruptions. It is impossible to make another C++ function call before the previous completes.

  The [Stack Switching proposal for WASM](https://github.com/WebAssembly/stack-switching/tree/main), which would allow this by saving a "snapshot" of the stack of currently run function, and resume its execution later, has not yet been implemented. When it reaches wide implementation, and Emscripten makes it available for us, we'll try to get rid of that limitation.
</details>

Create a SingleThreadRuntime:
```ts
import { createSingleThreadRuntime } from 'satellite.js';

using runtime = await createSingleThreadRuntime();
```

Or a MultiThreadRuntime:
```ts
import { createMultiThreadRuntime } from 'satellite.js';

using runtime = await createMultiThreadRuntime({ threadsCount: 4 });
```

### 2. Choose Calculators (outputs)

The outputs correspond to **Calculators**. Some Calculators are **dependent on the others**. For example, you can't calculate Look Angles without calculating ECF positions first; dependencies must be present in the array of Calculators passed to BulkPropagator.

Some Calculators need input parameters. For example, to get Look Angles, you need to provide observer coordinates. As these inputs can vary, they are passed at run time, not at construction time.

Available Calculators:
- `EciBaseCalculator` calculates positions and velocities using SGP4. Also outputs SGP4 errors.
  This is like a pure JS `propagate()`.
- `GmstCalculator` calculates Greenwich Mean Sidereal Time, needed for further transforms. This is like `gstime()`.
- `EcfPositionCalculator` and `EcfVelocityCalculator` calculate, respectively, ECF position and velocity. This is like `eciToEcf()`.
- `GeodeticPositionCalculator` calculates geodetic position. This is like `eciToGeodetic()`.
- `LookAnglesCalculator` calculates Look Angles (azimuth, altitude, range). This is like `ecfToLookAngles()`.
- `DopplerFactorCalculator` calculates Doppler factor. This is like `dopplerFactor()`.
- `SunPositionCalculator` calculates the Sun's position in AU (ECI frame). This is like `sunPos()`.
- `ShadowFractionCalculator` calculates the fraction of the Sun's disc obscured by Earth. This is like `shadowFraction()`.

See [Calculator Reference](calculators.md) for detailed information about each calculator, including raw data layouts and dependency graph.

### 3. Construct a BulkPropagator

Here's an example with all available calculators. You can use a smaller combination of only the ones you need.

```ts
import {
  BulkPropagator,
  EciBaseCalculator,
  GmstCalculator,
  EcfPositionCalculator,
  EcfVelocityCalculator,
  DopplerFactorCalculator,
  GeodeticPositionCalculator,
  LookAnglesCalculator,
  SunPositionCalculator,
  ShadowFractionCalculator,
} from 'satellite.js';

const satRecs = [json2satrec(omm)];
const dates = [new Date()];

using bulkPropagator = new BulkPropagator({
  runtime,
  calculators: [
    new EciBaseCalculator(),
    new GmstCalculator(),
    new EcfPositionCalculator(),
    new EcfVelocityCalculator(),
    new DopplerFactorCalculator(),
    new GeodeticPositionCalculator(),
    new LookAnglesCalculator(),
    new SunPositionCalculator(),
    new ShadowFractionCalculator(),
  ],
  satRecsCount: satRecs.length,
  datesCount: dates.length,
});
```

:::tip
We recommend that you reuse the Runtime and the BulkPropagator instances as much as possible. We have moved as much of the heavy lifting as possible to construction time of these entities, so that the hot path, encompassed in `.run()`, is as light as possible.
:::

### 4. Set satellites, dates, and run propagation (`run()`)

At this point BulPropagator only knows counts of satellites and dates, so let's supply actual data (it may be changed before each propagation):

```ts
bulkPropagator.setSatRecs(satRecs);
bulkPropagator.setDates(dates);
```

Now call `.run()`.

This call is **synchronous** in case of `SingleThreadRuntime`, and **asynchronous** in case of `MultiThreadRuntime`.

```ts title="If runtime is SingleThreadRuntime"
const observerGeodetic = {
  latitude: degreesToRadians(41),
  longitude: degreesToRadians(-71),
  height: 0.1,
};
const observerEcf = geodeticToEcf(observerGeodetic);

// highlight-next-line
bulkPropagator.run({
  dopplerFactor: { observer: observerEcf },
  lookAngles: { observer: observerGeodetic },
});
```

```ts title="If runtime is MultiThreadRuntime"
// highlight-next-line
await bulkPropagator.run({
  dates,
  dopplerFactor: { observer: observerEcf },
  lookAngles: { observer: observerGeodetic },
});
```

### 5. Read results

Once the `run()` call completes, you can:

- Get the formatted result for a given satellite and date pair with `.getFormattedOutput(satelliteIndex: number, dateIndex: number)`. It returns results depending on what Calculators were passed at construction time, with full TypeScript support.
  ```ts
  const {
    eci: {
      error,
      position: { x: eciPositionX, y: eciPositionY, z: eciPositionZ },
      velocity: { x: eciVelocityX, y: eciVelocityY, z: eciVelocityZ },
    },
    ecfPosition: { x: ecfPositionX, y: ecfPositionY, z: ecfPositionZ },
    ecfVelocity: { x: ecfVelocityX, y: ecfVelocityY, z: ecfVelocityZ },
    gmst,
    dopplerFactor,
    geodeticPosition: { latitude, longitude, height },
    lookAngles: { azimuth, elevation, rangeSat },
    sunPosition: { x: sunX, y: sunY, z: sunZ },
    shadowFraction,
  } = bulkPropagator.getFormattedOutput(0, 0)!;
  ```

- Get raw results as [`TypedArray`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) views into WASM memory. This can be useful for further bulk processing or uploading to WebGL buffers. The docs on Calculators explain how the data is packed in those arrays for each specific calculator.
  ```ts
  const {
    eci: {
      position, // Float64Array
      velocity, // Float64Array
      error, // Int8Array
    },
    ecfPosition, // Float64Array
    ecfVelocity, // Float64Array
    gmst, // Float64Array
    dopplerFactor, // Float64Array
    lookAngles, // Float64Array
    sunPosition, // Float64Array
    shadowFraction, // Float64Array
  } = bulkPropagator.getRawOutput();
  ```

:::warning
Memory behind outputs is reused for every run. This means that `getRawOutput` and the data behind `TypedArray` is only valid before the start of the next `run()` call. 
:::

### 6. Disposal {#disposal}

Dispose the `BulkPropagator` and the `runtime`. **If you don't, your app will leak memory.**

You might have noticed the [`using`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/using) syntax above. This is a part of the Explicit Resource Management proposal, which is getting widely implemented. It allows cleanup of Runtime and BulkPropagator as soon as they exit the scope. This is the recommended approach. Node.js supports it; see [browser support](https://caniuse.com/wf-explicit-resource-management).

```ts title="Use the using syntax"
using runtime = await createSingleThreadRuntime();
using bulkPropagator = new BulkPropagator(options);

// disposal methods are automatically called at the end of the scope
```

If your environment doesn't support Explicit Resource Management and you don't use polyfills, you can clean up by calling `.dispose()`:
```ts title="Explicitly call dispose methods"
const runtime = await createSingleThreadRuntime();
const bulkPropagator = new BulkPropagator(options);

// ...

bulkPropagator.dispose();
runtime.dispose();
```
