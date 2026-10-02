import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeSort } from '../src/sort';

describe('mergeSort', () => {
  it('handles edge cases', () => {
    expect(mergeSort([])).toEqual([]);
    expect(mergeSort([1])).toEqual([1]);
    expect(mergeSort([3, 1, 2])).toEqual([1, 2, 3]);
    expect(mergeSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate input', () => {
    const input = [3, 1, 2];
    mergeSort(input);
    expect(input).toEqual([3, 1, 2]);
  });

  it('supports custom comparator', () => {
    expect(mergeSort(['bb', 'a', 'ccc'], (a, b) => b.length - a.length)).toEqual(['ccc', 'bb', 'a']);
  });

  it('matches Array.prototype.sort on any input', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        expect(mergeSort(arr)).toEqual([...arr].sort((a, b) => a - b));
      }),
    );
  });

  it('is stable', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 5 })), (keys) => {
        const items = keys.map((key, id) => ({ key, id }));
        const sorted = mergeSort(items, (a, b) => a.key - b.key);
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i - 1]!.key === sorted[i]!.key) {
            expect(sorted[i - 1]!.id).toBeLessThan(sorted[i]!.id);
          }
        }
      }),
    );
  });
});
