import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { binarySearch, lowerBound } from '../src/binarySearch';

const sortedArray = fc.array(fc.integer({ min: -50, max: 50 })).map((a) => a.sort((x, y) => x - y));

describe('binarySearch', () => {
  it('handles edge cases', () => {
    expect(binarySearch([], 1)).toBe(-1);
    expect(binarySearch([1], 1)).toBe(0);
    expect(binarySearch([1, 3, 5], 4)).toBe(-1);
    expect(binarySearch([1, 2, 2, 2, 3], 2)).toBe(1);
  });

  it('agrees with indexOf on any sorted array', () => {
    fc.assert(
      fc.property(sortedArray, fc.integer({ min: -60, max: 60 }), (arr, x) => {
        expect(binarySearch(arr, x)).toBe(arr.indexOf(x));
      }),
    );
  });

  it('lowerBound returns a valid insertion point', () => {
    fc.assert(
      fc.property(sortedArray, fc.integer({ min: -60, max: 60 }), (arr, x) => {
        const i = lowerBound(arr, x);
        expect(arr.slice(0, i).every((v) => v < x)).toBe(true);
        expect(arr.slice(i).every((v) => v >= x)).toBe(true);
      }),
    );
  });
});
