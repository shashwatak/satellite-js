import chai from 'chai';

/* eslint-disable */
import {
  degreesLat,
  degreesLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles
} from '../src/transforms';
/* eslint-enable */

import extData from './ext.json';

chai.should();

const epsilon = 1e-6;

describe('Latitude & longitude conversions', () => {
  const {
    validLatitudes,
    validLongitudes,
    invalidLatitudes,
    invalidLongitudes,
  } = extData;

  validLatitudes.forEach((item) => {
    it(`convert valid latitude value (${item.radians} radians) to degrees`, () => {
      (degreesLat(item.radians)).should.be.closeTo(item.degrees, epsilon);
    });
  });

  validLongitudes.forEach((item) => {
    it(`convert valid longitude value (${item.radians} radians) to degrees`, () => {
      (degreesLong(item.radians)).should.be.closeTo(item.degrees, epsilon);
    });
  });

  invalidLatitudes.forEach((item) => {
    it(`convert invalid latitude value (${item.radians} radians) to degrees`, () => {
      (() => degreesLat(item.radians)).should.throw(RangeError);
    });
  });

  invalidLongitudes.forEach((item) => {
    it(`convert invalid longitude value (${item.radians} radians) to degrees`, () => {
      (() => degreesLong(item.radians)).should.throw(RangeError);
    });
  });
});
