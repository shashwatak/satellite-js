## Changelog

### 2.0.0

- Library became ES and Common.js compatible.
- Source code is reorganized to match [original Python library](https://pypi.python.org/pypi/sgp4/).
- `degreesLat` and `degreesLong` don't adjust input radians value and throw `RangeError` if it's out of bounds
(breaking change).
- `invjday` function is added.
- [Julian day calculations take account of milliseconds](https://github.com/shashwatak/satellite-js/issues/31)
([#38](https://github.com/shashwatak/satellite-js/pull/38)).
- [Incorrect position and velocity bug](https://github.com/shashwatak/satellite-js/issues/26) for times not close to
TLE epoch is fixed ([#37](https://github.com/shashwatak/satellite-js/pull/37)).
- Continuous integration and test coverage are provided.
- [Bower support is dropped](https://github.com/shashwatak/satellite-js/issues/40).
