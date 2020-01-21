import {
  pi,
  twoPi,
  deg2rad,
  rad2deg,
  minutesPerDay,
  mu,
  earthRadius,
  xke,
  vkmpersec,
  tumin,
  j2,
  j3,
  j4,
  j3oj2,
  x2o3,
} from '../src/constants';

import { jday, invjday } from '../src/ext';
import twoline2satrec from '../src/io';
import { propagate, sgp4, gstime } from '../src/propagation';

import dopplerFactor from '../src/dopplerFactor';

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
} from '../src/transforms';

import * as es from '../src/index';
import umd from '../src/indexUmd';

function checkConstants(constants) {
  expect(constants.pi).toEqual(pi);
  expect(constants.twoPi).toEqual(twoPi);
  expect(constants.deg2rad).toEqual(deg2rad);
  expect(constants.rad2deg).toEqual(rad2deg);
  expect(constants.minutesPerDay).toEqual(minutesPerDay);
  expect(constants.mu).toEqual(mu);
  expect(constants.earthRadius).toEqual(earthRadius);
  expect(constants.xke).toEqual(xke);
  expect(constants.vkmpersec).toEqual(vkmpersec);
  expect(constants.tumin).toEqual(tumin);
  expect(constants.j2).toEqual(j2);
  expect(constants.j3).toEqual(j3);
  expect(constants.j4).toEqual(j4);
  expect(constants.j3oj2).toEqual(j3oj2);
  expect(constants.x2o3).toEqual(x2o3);
}

function checkTransforms(transforms) {
  expect(transforms.radiansToDegrees).toEqual(radiansToDegrees);
  expect(transforms.degreesToRadians).toEqual(degreesToRadians);
  expect(transforms.degreesLat).toEqual(degreesLat);
  expect(transforms.degreesLong).toEqual(degreesLong);
  expect(transforms.radiansLat).toEqual(radiansLat);
  expect(transforms.radiansLong).toEqual(radiansLong);
  expect(transforms.geodeticToEcf).toEqual(geodeticToEcf);
  expect(transforms.eciToGeodetic).toEqual(eciToGeodetic);
  expect(transforms.eciToEcf).toEqual(eciToEcf);
  expect(transforms.ecfToEci).toEqual(ecfToEci);
  expect(transforms.ecfToLookAngles).toEqual(ecfToLookAngles);
}

function checkExports(namespace) {
  it('constants', () => checkConstants(namespace.constants));
  it('twoline2satrec', () => expect(namespace.twoline2satrec).toEqual(twoline2satrec));
  it('propagate', () => expect(namespace.propagate).toEqual(propagate));
  it('sgp4', () => expect(namespace.sgp4).toEqual(sgp4));
  it('gstime', () => expect(namespace.gstime).toEqual(gstime));
  it('jday', () => expect(namespace.jday).toEqual(jday));
  it('invjday', () => expect(namespace.invjday).toEqual(invjday));
  it('dopplerFactor', () => expect(namespace.dopplerFactor).toEqual(dopplerFactor));
  it('transforms', () => checkTransforms(es));
}

describe('Library export', () => {
  describe('es', () => checkExports(es));
  describe('umd', () => checkExports(umd));
});
