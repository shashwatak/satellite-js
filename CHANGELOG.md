## Changelog

### 1.4.0

- Library became CommonJS compatible.
- Source code is reorganized to match [original Python library](https://pypi.python.org/pypi/sgp4/).
- `degreesLat` and `degreesLong` don't adjust input radians value and throw `RangeError` if it's out of bounds
(breaking change).
- `invjday` function is added.
- Incorrect position and velocity bug for times not close to TLE epoch is fixed (#26).
