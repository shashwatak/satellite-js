import { expect } from 'vitest';

export default function compareVectors(
  vector1: { x: number; y: number; z: number },
  vector2: { x: number; y: number; z: number },
  numDigits?: number,
) {
  if (!numDigits) {
    expect(vector1.x).toEqual(vector2.x);
    expect(vector1.y).toEqual(vector2.y);
    expect(vector1.z).toEqual(vector2.z);
  } else {
    expect(vector1.x).toBeCloseTo(vector2.x, numDigits);
    expect(vector1.y).toBeCloseTo(vector2.y, numDigits);
    expect(vector1.z).toBeCloseTo(vector2.z, numDigits);
  }
}
