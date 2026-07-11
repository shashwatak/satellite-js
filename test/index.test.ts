import { describe, it, expect } from 'vitest';
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
} from '../src/constants.js';

import { jday, invjday } from '../src/ext.js';
import { twoline2satrec, json2satrec } from '../src/io.js';
import { propagate, sgp4, gstime } from '../src/propagation.js';

import { dopplerFactor } from '../src/dopplerFactor.js';
import { sunPos } from '../src/sun.js';
import { shadowFraction } from '../src/shadow.js';

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
} from '../src/transforms.js';

import * as es from '../src/index.js';

function checkConstants(constants: typeof es.constants) {
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

describe('Library export', () => {
  it('constants', () => checkConstants(es.constants));
  it('twoline2satrec', () => expect(es.twoline2satrec).toEqual(twoline2satrec));
  it('json2satrec', () => expect(es.json2satrec).toEqual(json2satrec));
  it('propagate', () => expect(es.propagate).toEqual(propagate));
  it('sgp4', () => expect(es.sgp4).toEqual(sgp4));
  it('gstime', () => expect(es.gstime).toEqual(gstime));
  it('jday', () => expect(es.jday).toEqual(jday));
  it('invjday', () => expect(es.invjday).toEqual(invjday));
  it('dopplerFactor', () => expect(es.dopplerFactor).toEqual(dopplerFactor));
  it('sunPos', () => expect(es.sunPos).toEqual(sunPos));
  it('shadowFraction', () => expect(es.shadowFraction).toEqual(shadowFraction));
  it('transforms', () => {
    expect(es.radiansToDegrees).toEqual(radiansToDegrees);
    expect(es.degreesToRadians).toEqual(degreesToRadians);
    expect(es.degreesLat).toEqual(degreesLat);
    expect(es.degreesLong).toEqual(degreesLong);
    expect(es.radiansLat).toEqual(radiansLat);
    expect(es.radiansLong).toEqual(radiansLong);
    expect(es.geodeticToEcf).toEqual(geodeticToEcf);
    expect(es.eciToGeodetic).toEqual(eciToGeodetic);
    expect(es.eciToEcf).toEqual(eciToEcf);
    expect(es.ecfToEci).toEqual(ecfToEci);
    expect(es.ecfToLookAngles).toEqual(ecfToLookAngles);
  });
});
