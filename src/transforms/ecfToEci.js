export default function ecfToEci(ecfCoords, gmst) {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  const X = (ecfCoords.x * Math.cos(gmst)) - (ecfCoords.y * Math.sin(gmst));
  const Y = (ecfCoords.x * (Math.sin(gmst))) + (ecfCoords.y * Math.cos(gmst));
  const Z = ecfCoords.z;
  return { x: X, y: Y, z: Z };
}
