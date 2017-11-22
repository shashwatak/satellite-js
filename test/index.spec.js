import chai from 'chai';

import lib from '../src/index';

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

import {
  jday,
  invjday,
} from '../src/ext';
import twoline2satrec from '../src/io';
import {
  propagate,
  sgp4,
  gstime,
} from '../src/propagation';

import dopplerFactor from '../src/dopplerFactor';

import {
  degreesLat,
  degreesLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
} from '../src/transforms';

chai.should();

describe('Library export', () => {
  it('constants', () => {
    const { constants } = lib;
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

  it('twoline2satrec', () => lib.twoline2satrec.should.equal(twoline2satrec));
  it('propagate', () => lib.propagate.should.equal(propagate));
  it('sgp4', () => lib.sgp4.should.equal(sgp4));
  it('gstime', () => lib.gstime.should.equal(gstime));
  it('jday', () => lib.jday.should.equal(jday));
  it('invjday', () => lib.invjday.should.equal(invjday));
  it('dopplerFactor', () => lib.dopplerFactor.should.equal(dopplerFactor));

  it('transforms', () => {
    lib.degreesLat.should.equal(degreesLat);
    lib.degreesLong.should.equal(degreesLong);
    lib.geodeticToEcf.should.equal(geodeticToEcf);
    lib.eciToGeodetic.should.equal(eciToGeodetic);
    lib.eciToEcf.should.equal(eciToEcf);
    lib.ecfToEci.should.equal(ecfToEci);
    lib.ecfToLookAngles.should.equal(ecfToLookAngles);
  });

  it('gstime produces the same output as gstimeFromJday', () => {
    const now = new Date();
    const jd = lib.jday(now);
    lib.gstime(jd).should.equal(lib.gstimeFromJday(jd));
  });

  it('gstime produces the same output as gstimeFromDate', () => {
    const now = new Date();
    lib.gstime(now).should.equal(lib.gstimeFromDate(now));
  });
});
