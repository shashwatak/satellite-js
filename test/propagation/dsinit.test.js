import dsinit from "../../src/propagation/dsinit"; // eslint-disable-line
import dsOptionSets from './dsinit.json';

describe('Initialize Resonance Terms', () => {
  it('Geopotential Resonance for 12 Hour Orbits', () => {
    dsOptionSets.forEach((testSet) => {
      const results = dsinit(testSet.options);
      expect(results).toEqual(testSet.results);
    });
  });
});
