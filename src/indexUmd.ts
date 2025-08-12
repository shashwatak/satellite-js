import * as constants from './constants.js';

import { jday, invjday } from './ext.js';
import { twoline2satrec, json2satrec} from './io.js';
import { propagate, sgp4, gstime } from './propagation.js';
import { SatRecError } from './propagation/SatRec.js';
import * as types from './common-types.js';

import { dopplerFactor } from './dopplerFactor.js';

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
} from './transforms.js';

import { sunPos } from './sun.js';

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
