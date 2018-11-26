import chai from 'chai';

/* eslint-disable */
import {
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles
} from '../src/transforms';
/* eslint-enable */

import transformData from './transforms.json';

chai.should();

const epsilon = 1e-6;

describe('Latitude & longitude conversions', () => {
  const {
    validLatitudes,
    validLongitudes,
    invalidLatitudes,
    invalidLongitudes,
  } = transformData;

  validLatitudes.forEach((item) => {
    it(`convert valid latitude value (${item.radians} radians) to degrees`, () => {
      (degreesLat(item.radians)).should.be.closeTo(item.degrees, epsilon);
    });
    it(`convert valid latitude value (${item.degrees} degrees) to radians`, () => {
      (radiansLat(item.degrees)).should.be.closeTo(item.radians, epsilon);
    });
  });

  validLongitudes.forEach((item) => {
    it(`convert valid longitude value (${item.radians} radians) to degrees`, () => {
      (degreesLong(item.radians)).should.be.closeTo(item.degrees, epsilon);
    });
    it(`convert valid longitude value (${item.degrees} degrees) to radians`, () => {
      (radiansLong(item.degrees)).should.be.closeTo(item.radians, epsilon);
    });
  });

  invalidLatitudes.forEach((item) => {
    it(`convert invalid latitude value (${item.radians} radians) to degrees`, () => {
      (() => degreesLat(item.radians)).should.throw(RangeError);
    });
    it(`convert invalid latitude value (${item.degrees} degrees) to radians`, () => {
      (() => radiansLat(item.degrees)).should.throw(RangeError);
    });
  });

  invalidLongitudes.forEach((item) => {
    it(`convert invalid longitude value (${item.radians} radians) to degrees`, () => {
      (() => degreesLong(item.radians)).should.throw(RangeError);
    });
    it(`convert invalid longitude value (${item.degrees} degrees) to radians`, () => {
      (() => radiansLong(item.degrees)).should.throw(RangeError);
    });
  });
});
