This folder contains the most recent available SGP4 source code (`SGP4.cpp`), along with an adaptation for JS
(`SGP4-for-js.cpp`). Functions which are exported from this C++ are used in `/src/wasm` Typescript code.

A few things to note:
* `elsetrec` struct, while unlikely, might have different offsets on different compilations, and different `sizeof` as well.
* `char` type is signed on current compilation, and so is written with `DataView#setInt8()`

The Calculators written in Typescript call the corresponding C++ functions. Most of the functions are able to be vectorized
automatically by Emscripten on high optimization levels, except for the `sgp4` function and that's an area for a possible
improvement.

Areas to experiment:
- structure of arrays vs array of structures
- branch hinting (isn't supported by emscripten as of 4.0 but should land at some point)
- sgp4 can't be vectorized automatically because it contains multiple uncountable cycles, so either:
  - try to vectorize by hand
  - move uncountable loops away from the main function body, calculate separately, and let the rest be vectorized automatically
- batching calculations (calculate a small portion of satellites across multiple calculators thus never leave CPU cache for them)
