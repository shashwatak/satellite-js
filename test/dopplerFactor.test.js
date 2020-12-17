import dopplerFactor from '../src/dopplerFactor'; // eslint-disable-line

const earthRadius = 6378.137;

describe('Doppler factor', () => {
  it('without doppler factor', () => {
    // North Pole
    const observerEcf = {
      x: 0,
      y: 0,
      z: earthRadius
    };
    const positionEcf = {
      x: 0,
      y: 0,
      z: earthRadius + 500
    };
    //Escape velocity
    const velocityEcf = {
      x: 7.91,
      y: 0,
      z: 0
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toEqual(1)
  });
  
  it("special case", () => {
    const observerEcf = {
      x: earthRadius,
      y: 0,
      z: 0
    };
    const positionEcf = {
      x: (earthRadius + 500) * Math.sqrt(2) / 2, // z*sin(45)
      y: (earthRadius + 500) * Math.sqrt(2) / 2, // z*cos(45)
      z: 0
    };
    const velocityEcf = {
      x: 7.91 * Math.sqrt(2) / 2,
      y: 7.91 * Math.sqrt(2) / 2,
      z: 0
    };
    const dopFactor = dopplerFactor(observerEcf, positionEcf, velocityEcf);
    expect(dopFactor).toEqual(1.0000107847789212)
  });
});
