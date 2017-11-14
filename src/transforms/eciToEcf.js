export default function eciToEcf(eciCoords, gmst) {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  //
  // Inverse:
  // [X]     [C  S  0][X]
  // [Y]  =  [-S C  0][Y]
  // [Z]ecf  [0  0  1][Z]eci

  const x = (eciCoords.x * Math.cos(gmst)) + (eciCoords.y * Math.sin(gmst));
  const y = (eciCoords.x * (-Math.sin(gmst))) + (eciCoords.y * Math.cos(gmst));
  const { z } = eciCoords;

  return {
    x,
    y,
    z,
  };
}
