import constants from './constants';

import degreesLat from './transforms/degreesLat';
import degreesLong from './transforms/degreesLong';
import eciToEcf from './transforms/eciToEcf';
import ecfToEci from './transforms/ecfToEci';
import eciToGeodetic from './transforms/eciToGeodetic';
import ecfToLookAngles from './transforms/ecfToLookAngles';
import geodeticToEcf from './transforms/geodeticToEcf';

import dopplerFactor from './dopplerFactor';

import gstime from './gstime/gstime';
import jday from './gstime/jday';

import propagate from './propagate/propagate';
import twoline2satrec from './propagate/twoline2satrec';
import sgp4 from './sgp4';

export default {
  version: '1.4.0',
  constants,

  // Coordinate transforms
  degreesLat,
  degreesLong,
  eciToEcf,
  ecfToEci,
  eciToGeodetic,
  ecfToLookAngles,
  geodeticToEcf,

  dopplerFactor,

  gstimeFromJday: gstime,
  gstimeFromDate: (...args) => gstime(jday(...args)),
  jday,

  propagate,
  twoline2satrec,
  sgp4,
};
