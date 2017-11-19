import * as constants from './constants';

import {
  jday,
  invjday,
} from './ext';
import twoline2satrec from './io';
import {
  propagate,
  sgp4,
  gstime,
} from './propagation';

import dopplerFactor from './dopplerFactor';

import {
  degreesLat,
  degreesLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
} from './transforms';

export default {
  version: '1.4.0',
  constants,

  // Propagation
  propagate,
  sgp4,
  twoline2satrec,

  gstime,
  gstimeFromJday: gstime, // TODO: deprecate
  gstimeFromDate: gstime, // TODO: deprecate
  jday,
  invjday,

  dopplerFactor,

  // Coordinate transforms
  degreesLat,
  degreesLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
};
