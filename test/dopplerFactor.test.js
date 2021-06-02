import dopplerFactor from '../src/dopplerFactor';

const numDigits = 8;

const earthRadius = 6378.137;
const sincos45deg = Math.sqrt(2) / 2;

describe('Doppler factor', () => {
  it('without observer movement', () => {
    // North Pole
    const observerEcf = {
      x: 0,
      y: 0,
      z: earthRadius,
    };
    const positionEcf = {
      x: 0,
      y: 0,
      z: earthRadius + 500,
    };
    // Escape velocity
    const velocityEcf = {
      x: 7.91,
      y: 0,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1, numDigits);
  });

  it('movement of observer is not affected', () => {
    const observerEcf = {
      x: earthRadius,
      y: 0,
      z: 0,
    };
    const positionEcf = {
      x: earthRadius + 500,
      y: 0,
      z: 0,
    };
    const velocityEcf = {
      x: 0,
      y: 7.91,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1, numDigits);
  });

  it('special case', () => {
    const observerEcf = {
      x: earthRadius,
      y: 0,
      z: 0,
    };
    const positionEcf = {
      x: (earthRadius + 500) * sincos45deg, // z*sin(45)
      y: (earthRadius + 500) * sincos45deg, // z*cos(45)
      z: 0,
    };
    const velocityEcf = {
      x: 7.91 * sincos45deg,
      y: 7.91 * sincos45deg,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1.0000107847789212, numDigits);
  });

  it('calculated from a negative range rate', () => {
    // North Pole
    const observerEcf = {
      x: -500,
      y: 0,
      z: earthRadius + 500,
    };
    const positionEcf = {
      x: 500,
      y: 0,
      z: earthRadius,
    };
    // Escape velocity
    const velocityEcf = {
      x: -7.91,
      y: -3.12,
      z: 0,
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toBeCloseTo(1.0000235993898179, numDigits);
  });
});
