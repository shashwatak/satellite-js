import * as constants from './constants';

import { jday } from './ext';
import twoline2satrec from './io';
import { propagate, sgp4, gstime } from './propagation';

import dopplerFactor from './dopplerFactor';

import {
  degreesLat,
  degreesLong,
  eciToEcf,
  ecfToEci,
  eciToGeodetic,
  ecfToLookAngles,
  geodeticToEcf,
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

  dopplerFactor,

  // Coordinate transforms
  degreesLat,
  degreesLong,
  eciToEcf,
  ecfToEci,
  eciToGeodetic,
  ecfToLookAngles,
  geodeticToEcf,
};
