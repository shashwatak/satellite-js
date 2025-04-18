import * as constants from './constants';

import { jday, invjday } from './ext';
import { twoline2satrec, json2satrec} from './io';
import { propagate, sgp4, gstime } from './propagation';
import { SatRecError } from './propagation/SatRec.js';
import * as types from './common-types.js';

import dopplerFactor from './dopplerFactor';

import {
  radiansToDegrees,
  degreesToRadians,
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
} from './transforms';

import { sunPos } from './sun';

export default {
  constants,

  // Propagation
  propagate,
  sgp4,
  twoline2satrec,
  json2satrec,

  gstime,
  jday,
  invjday,

  dopplerFactor,

  // Coordinate transforms
  radiansToDegrees,
  degreesToRadians,
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,

  // Sun Position
  sunPos,

  // Types
  ...types,

  SatRecError,
};
