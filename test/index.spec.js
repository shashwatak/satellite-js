import chai from 'chai';

import {
  pi,
  twoPi,
  deg2rad,
  rad2deg,
  minutesPerDay,
  mu,
  earthRadius,
  xke,
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

import {
  constants as constantsEs,
  twoline2satrec as twoline2satrecEs,
  propagate as propagateEs,
  sgp4 as sgp4Es,
  gstime as gstimeEs,
  jday as jdayEs,
  invjday as invjdayEs,
  dopplerFactor as dopplerFactorEs,
  radiansToDegrees as radiansToDegreesEs,
  degreesToRadians as degreesToRadiansEs,
  degreesLat as degreesLatEs,
  degreesLong as degreesLongEs,
  radiansLat as radiansLatEs,
  radiansLong as radiansLongEs,
  geodeticToEcf as geodeticToEcfEs,
  eciToGeodetic as eciToGeodeticEs,
  eciToEcf as eciToEcfEs,
  ecfToEci as ecfToEciEs,
  ecfToLookAngles as ecfToLookAnglesEs,
} from '../src/index';

import umd from '../src/indexUmd';

chai.should();

describe('Library export', () => {
  describe('es', () => {
    it('constants', () => {
      constantsEs.pi.should.equal(pi);
      constantsEs.twoPi.should.equal(twoPi);
      constantsEs.deg2rad.should.equal(deg2rad);
      constantsEs.rad2deg.should.equal(rad2deg);
      constantsEs.minutesPerDay.should.equal(minutesPerDay);
      constantsEs.mu.should.equal(mu);
      constantsEs.earthRadius.should.equal(earthRadius);
      constantsEs.xke.should.equal(xke);
      constantsEs.tumin.should.equal(tumin);
      constantsEs.j2.should.equal(j2);
      constantsEs.j3.should.equal(j3);
      constantsEs.j4.should.equal(j4);
      constantsEs.j3oj2.should.equal(j3oj2);
      constantsEs.x2o3.should.equal(x2o3);
    });

    it('twoline2satrec', () => twoline2satrecEs.should.equal(twoline2satrec));
    it('propagate', () => propagateEs.should.equal(propagate));
    it('sgp4', () => sgp4Es.should.equal(sgp4));
    it('gstime', () => gstimeEs.should.equal(gstime));
    it('jday', () => jdayEs.should.equal(jday));
    it('invjday', () => invjdayEs.should.equal(invjday));
    it('dopplerFactor', () => dopplerFactorEs.should.equal(dopplerFactor));

    it('transforms', () => {
      radiansToDegreesEs.should.equal(radiansToDegrees);
      degreesToRadiansEs.should.equal(degreesToRadians);
      degreesLatEs.should.equal(degreesLat);
      degreesLongEs.should.equal(degreesLong);
      radiansLatEs.should.equal(radiansLat);
      radiansLongEs.should.equal(radiansLong);
      geodeticToEcfEs.should.equal(geodeticToEcf);
      eciToGeodeticEs.should.equal(eciToGeodetic);
      eciToEcfEs.should.equal(eciToEcf);
      ecfToEciEs.should.equal(ecfToEci);
      ecfToLookAnglesEs.should.equal(ecfToLookAngles);
    });
  });

  describe('umd', () => {
    it('constants', () => {
      const { constants } = umd;
      constants.pi.should.equal(pi);
      constants.twoPi.should.equal(twoPi);
      constants.deg2rad.should.equal(deg2rad);
      constants.rad2deg.should.equal(rad2deg);
      constants.minutesPerDay.should.equal(minutesPerDay);
      constants.mu.should.equal(mu);
      constants.earthRadius.should.equal(earthRadius);
      constants.xke.should.equal(xke);
      constants.tumin.should.equal(tumin);
      constants.j2.should.equal(j2);
      constants.j3.should.equal(j3);
      constants.j4.should.equal(j4);
      constants.j3oj2.should.equal(j3oj2);
      constants.x2o3.should.equal(x2o3);
    });

    it('twoline2satrec', () => umd.twoline2satrec.should.equal(twoline2satrec));
    it('propagate', () => umd.propagate.should.equal(propagate));
    it('sgp4', () => umd.sgp4.should.equal(sgp4));
    it('gstime', () => umd.gstime.should.equal(gstime));
    it('jday', () => umd.jday.should.equal(jday));
    it('invjday', () => umd.invjday.should.equal(invjday));
    it('dopplerFactor', () => umd.dopplerFactor.should.equal(dopplerFactor));

    it('transforms', () => {
      umd.radiansToDegrees.should.equal(radiansToDegrees);
      umd.degreesToRadians.should.equal(degreesToRadians);
      umd.degreesLat.should.equal(degreesLat);
      umd.degreesLong.should.equal(degreesLong);
      umd.radiansLat.should.equal(radiansLat);
      umd.radiansLong.should.equal(radiansLong);
      umd.geodeticToEcf.should.equal(geodeticToEcf);
      umd.eciToGeodetic.should.equal(eciToGeodetic);
      umd.eciToEcf.should.equal(eciToEcf);
      umd.ecfToEci.should.equal(ecfToEci);
      umd.ecfToLookAngles.should.equal(ecfToLookAngles);
    });
  });
});
