import { describe, it, expect } from 'vitest';
import { dsinit } from '../../src/propagation/dsinit.js';
import dsOptionSets from './dsinit.json' with { type: 'json' };

describe('Initialize Resonance Terms', () => {
  it('Geopotential Resonance for 12 Hour Orbits', () => {
    dsOptionSets.forEach((testSet) => {
      const results = dsinit(testSet.options);
      expect(results).toEqual(testSet.results);
    });
  });
});
