This folder contains the most recent available original SGP4 source code (`SGP4.cpp`), along with an adaptation with changes/optimizations for JS.
Functions which are exported from this C++ are used in `/src/wasm` Typescript code.

There are multiple compilations available depending on user's capabilities:
- base (single thread, SIMD-enabled)
- pthreads (multi thread, SIMD-enabled)

The code is split into the following files:
- `common.cpp` contains code common for all compilations
- `base.cpp` contains code specific to base compilation
- `pthreads.cpp` contains code for pthreads compilation
- `SGP4.cpp` and `SGP4.h` are reference code of SGP4 algorithm by David Vallado. Since Satellite.js can use SGP4 with changes and optimizations,
the original is there to compare against.

There is also a separate `debug.cpp` file. It is compiled only for debug build, since it's needed for tests but NOT
for user-facing code.

Hence, compilations consist of the following files:
- `base-debug`:       `common.cpp` + `base.cpp`     + `debug.cpp`
- `pthreads-debug`:   `common.cpp` + `pthreads.cpp` + `debug.cpp`
- `base-release`:     `common.cpp` + `base.cpp`
- `pthreads-release`: `common.cpp` + `pthreads.cpp`

To set up VSCode for C++ with syntax highlight, Emscripten autocompletions, and debugger being able to step in C++ code:
1. Install Emscripten SDK, see https://github.com/emscripten-core/emsdk. Check by running `em++ -v` in console.
2. In `.vscode` folder, rename `settings.example.json` to `settings.json`, and `c_cpp_properties.example.json` to
`c_cpp_properties.json`. In both files, replace `path_to_emsdk` with the folder where you installed Emscripten SDK. Check that
files linked by the settings exist, by following that path and sub-folders.
3. Install the recommended extensions (DWARF) for debugger to step into C++ code while running WASM.
4. Now your VSCode should highlight any errors in C++ code; check by making any syntax error like removing a semicolon.
   It should also be able to break in C++ code; check by adding a breakpoint in `sgp4forJs` function and running via
   "Launch current in Node" debugger option any BulkPropagator that uses a *debug* build of WASM module.

A few things to note:
* the code was written to run on exactly Emscripten 6.0.3. There might be breaking changes even on patch versions so take care bumping the EMSDK version (study changelog).
* `elsetrec` struct, while unlikely, might have different offsets on different compilations, and different `sizeof` as well.
* `char` type is signed on current compilation, and so is written with `DataView#setInt8()`

While most of the functions are able to be vectorized automatically by Emscripten on high optimization levels, the `sgp4` function
is not, and that's an area for a possible improvement.

Areas to experiment:
- structure of arrays vs array of structures
- sgp4 can't be vectorized automatically because it contains multiple uncountable cycles, so either:
  - try to vectorize by hand
  - move uncountable loops away from the main function body, calculate separately, and let the rest be vectorized automatically

Tested but appeared to have no benefit:
- batching calculations (calculate a small portion of satellites across multiple calculators thus never leave CPU cache for them): tested using batches ranging from 4 to 2048 items, benchmarks appear to be identical

Watch for Emscripten side developments on:
- [branch hinting](https://github.com/emscripten-core/emscripten/issues/25059) (isn't supported by emscripten as of 6.0.3 but should land at some point)
- [nested loop vectorization](https://github.com/emscripten-core/emscripten/issues/26322) (very limited support by LLVM and currently not very useful)

Also watch for WebAssembly state in general to see what can be used for the WASM build.
