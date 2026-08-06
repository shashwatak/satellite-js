---
sidebar_position: 10
title: Contributing
description: Guide for contributors
---

This repo follows [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). Before starting a work on new [pull request](https://github.com/shashwatak/satellite-js/compare), please, checkout your feature or bugfix branch from `develop` branch:

```bash
git checkout develop
git checkout -b my-feature
```

Make sure that your changes don't break the existing code by running

```bash
npm test
```

If you have made changes to SGP4 algorithm, also check the full catalog run:

```bash
npm run test:catalog
```

In order to get test code coverage run the following:

```bash
npm run test:coverage
```

Make sure that your code follows the Biome lint config

```bash
npm run lint
npm run lint:fix
```

When implementing new functions or features, provide tests to cover them and mention your works in Changelog.

When releasing, update `package.json` with a new version, update Changelog with that version, and merge to `master`.

## Prerequisites

- [Node.js](https://nodejs.org/) (with npm)
- [Emscripten SDK](https://github.com/emscripten-core/emsdk) - only needed if working on WASM code. Verify by running `em++ -v`.

## Building

The source code is written in [TypeScript](https://www.typescriptlang.org/) and uses a strict tsconfig.

In order to build the library follow these steps:

- install [Node.js](https://nodejs.org/) and [Node Package Manager](https://www.npmjs.com/).

- install Emscripten using [Emscripten SDK](https://emscripten.org/docs/tools_reference/emsdk.html). Note that this won't necessarily be the *latest* version, because even patch versions of Emscripten have breaking changes; consult `src-cpp/README.md` to see the version of Emscripten which was used to successfully build and test the latest build.

- install all required packages with NPM by running the following command from repository's root directory:

    ```bash
    npm install
    ```

- run the following NPM script to build everything:

    ```bash
    npm run build
    ```

  This removes previous `dist` and `wasm-build` directories, compiles the C++ code to WASM (release builds), and then compiles the TypeScript source with `tsc`.

- run the following NPM script to run tests with [Vitest](https://vitest.dev/):

    ```bash
    npm test
    ```

These is a full list of all available NPM scripts:

| Script | Description |
|---|---|
| `build` | Builds everything (WASM release + TypeScript) |
| `copy` | Copies built library from `dist` to the SGP4 verification application's directory |
| `lint` | Lints source code in `src`, `docs`, `test` with Biome without editing |
| `lint:fix` | Lints and fixes the code in the same directories |
| `test` | Runs main test projects: `js`, `wasm_release`, `wasm_debug` |
| `test:catalog` | Runs the full SGP4 satellite catalog verification test |
| `test:watch` | Runs tests in watch mode |
| `test:coverage` | Runs tests with V8 coverage summary |
| `wasm:build` | Builds all four WASM compilations (base + pthreads, debug + release) |
| `wasm:build:release` | Builds only the two release WASM compilations |
| `wasm:test` | Runs only WASM test projects (`wasm_release` and `wasm_debug`) |
| `wasm:bench` | Runs WASM benchmarks |

## Project Structure

```
satellite-js/
├── src/               TypeScript source code of the library
│   ├── propagation/   SGP4/SDP4 propagation model
│   └── wasm/          WASM bulk propagation layer
├── src-cpp/           C++ source compiled to WASM via Emscripten
├── test/              Vitest tests
│   ├── propagation/   SGP4 catalog verification tests
│   └── wasm/          WASM bulk propagator tests
├── dist/              Compiled JS output (generated)
├── wasm-build/        Compiled WASM modules (generated)
│   ├── base-debug/
│   ├── base-release/
│   ├── pthreads-debug/
│   └── pthreads-release/
└── docs/              Docusaurus documentation site
```

### TypeScript Source (`src/`)

The library exposes its public API from `src/index.ts`. The main modules are:

| Module | Purpose |
|---|---|
| `io.ts` | Parsing TLE (`twoline2satrec`) and OMM JSON (`json2satrec`) into `SatRec` |
| `propagation.ts` | Re-exports `propagate`, `sgp4`, `gstime` from `propagation/` |
| `propagation/sgp4.ts` | Core SGP4 propagation algorithm |
| `propagation/sgp4init.ts` | Initializes `SatRec` with orbital elements |
| `propagation/SatRec.ts` | `SatRec` interface and `SatRecError` enum |
| `transforms.ts` | Coordinate conversions (ECI ↔ ECF ↔ geodetic ↔ look angles) |
| `dopplerFactor.ts` | Doppler factor calculation |
| `sun.ts` | Sun position from Julian date |
| `shadow.ts` | Earth shadow (umbra/penumbra) fraction |
| `ext.ts` | Julian date helpers (`jday`, `invjday`) |
| `constants.ts` | Physical and mathematical constants |
| `common-types.ts` | Shared type aliases (`Kilometer`, `Radians`, `EciVec3`, etc.) |

### WASM Source (`src-cpp/` and `src/wasm/`)

The WASM layer provides a high-performance bulk propagation API that runs SGP4 in compiled C++. It consists of:

- **`src-cpp/`** - C++ source files compiled to WASM via Emscripten. See `src-cpp/README.md` for details.
- **`src/wasm/`** - TypeScript orchestration layer that wraps the WASM modules.
  - `bulk-propagator.ts` - Main `BulkPropagator` class for propagating many satellites at many dates at once.
  - `calculators/` - Pluggable calculator classes (ECI, ECF, geodetic, look angles, doppler, sun, shadow).
  - `runtimes/` - Single-thread and multi-thread WASM runtimes.

The WASM code is compiled into four variants:

| Variant | Files compiled | Use |
|---|---|---|
| `base-debug` | `common.cpp` + `base.cpp` + `debug.cpp` | Debug tests, with AddressSanitizer and LeakSanitizer |
| `base-release` | `common.cpp` + `base.cpp` | Production single-thread |
| `pthreads-debug` | `common.cpp` + `pthreads.cpp` + `debug.cpp` | Debug tests, multi-threaded |
| `pthreads-release` | `common.cpp` + `pthreads.cpp` | Production multi-thread |

`debug.cpp` is only included in debug builds; it exports additional functions needed by tests but not by users.

## TypeScript Conventions

The project uses the strictest TypeScript configuration. It uses `strict: true` with many additional strict flags enabled (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` etc.)

### Type System

The library uses type aliases to document units - for example `Kilometer`, `Radians`, `KilometerPerSecond`, `AU`, `EarthRadii`. These are `number` at runtime but communicate intent:

```ts
export type Kilometer = number;
export type Radians = number;
```

Coordinate frames use generic interfaces:

```ts
export interface EciVec3<T> { x: T; y: T; z: T; }
export interface EcfVec3<T> { x: T; y: T; z: T; }
```

## Linting

Linter is [Biome](https://biomejs.dev/) and uses mostly default configuration in `biome.jsonc` for `src`, `test`, `docs` directories. Generated code in `wasm-build` is not included in the lint.

On VSCode you can install recommended Biome extension to immediately see warnings and errors; and/or you can use `npm run lint` for read-only style check and `npm run lint:fix` to try to fix style issues automatically.

## Testing

Tests use [Vitest](https://vitest.dev/) and are organized into several test projects (see `vitest.config.ts`):

| Project | Includes | Description |
|---|---|---|
| `js` | `test/*.test.ts` | Core JS/TS unit tests |
| `wasm_release` | `test/wasm/**/*.user.test.ts` | WASM tests against release builds |
| `wasm_debug` | `test/wasm/**/*.user.test.ts`, `*.struct.test.ts`, `*.leaks.test.ts` | WASM tests against debug builds (includes struct and leak tests) |
| `catalog` | `test/propagation/sgp4Catalog.test.ts` | Full satellite catalog verification (run separately via `npm run test:catalog`) |

Running `npm test` runs the `js`, `wasm_release`, and `wasm_debug` projects.

### Writing Tests

- Place test files in `test/` for TS tests or `test/wasm/` for WASM tests.
- Name test files with `.test.ts` extension.
- Test data lives alongside tests as JSON files (e.g. `io.json`, `io-edge.json`, `transforms.json`).

## IDE Setup (VS Code)

The repository includes VS Code configuration in `.vscode/`:

- **`extensions.json`** - Recommends `ms-vscode.wasm-dwarf-debugging` (for stepping into C++ in WASM), `ms-vscode.cpptools`, and Biome extension to highlight linting issues.
- **`launch.json`** - A `tsx` launch configuration for running/debugging individual TypeScript files.
- **`settings.example.json`** and **`c_cpp_properties.example.json`** - Templates for C++ IntelliSense with Emscripten. Copy and rename them (remove `.example`), then replace `path_to_emsdk` with your Emscripten SDK path.

## Working on WASM Code

If your contribution involves the WASM layer:

1. **Install Emscripten SDK** - follow https://github.com/emscripten-core/emsdk. Confirm with `em++ -v`.
2. **Set up VS Code C++ IntelliSense** - copy the example settings as described in IDE Setup above.
3. **Learn more about the state of WASM build**: refer to `src-cpp/README.md` and keep it updated.
4. **Build WASM** - `npm run wasm:build` compiles all four variants. For faster iteration during development, build only what you need:
   - `npm run wasm:base:build:debug` - single-thread debug
   - `npm run wasm:base:build:release` - single-thread release
   - `npm run wasm:pthreads:build:debug` - multi-thread debug
   - `npm run wasm:pthreads:build:release` - multi-thread release
5. **Test WASM** - `npm run wasm:test` runs only the WASM test projects.
6. **Benchmark** - `npm run wasm:bench` runs WASM benchmarks.

Debug builds enable AddressSanitizer and LeakSanitizer to catch memory bugs.

## Pull Request Checklist

Before submitting a pull request, make sure:

- Branch is based on `develop` (not `master`)
- `npm run lint` passes with no errors
- `npm test` passes (all three test projects)
  - If you have made changes to sgp4 algorithm, `npm test:catalog` also passes
- New features or bug fixes include corresponding tests
- Changes are mentioned in `CHANGELOG.md`
