import topocentric from './topocentric';
import topocentricToLookAngles from './topocentricToLookAngles';

export default function ecfToLookAngles(observerCoordsEcf, satelliteCoordsEcf) {
  const topocentricCoords = topocentric(observerCoordsEcf, satelliteCoordsEcf);
  return topocentricToLookAngles(topocentricCoords);
}
