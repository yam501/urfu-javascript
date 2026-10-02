import { naturalOrder, type Comparator } from './compare';

export function lowerBound<T>(sorted: readonly T[], target: T, compare: Comparator<T> = naturalOrder): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compare(sorted[mid]!, target) < 0) {
      lo = mid + 1;
    }
    else {
      hi = mid;
    }
  }
  return lo;
}

export function binarySearch<T>(sorted: readonly T[], target: T, compare: Comparator<T> = naturalOrder): number {
  const i = lowerBound(sorted, target, compare);
  return i < sorted.length && compare(sorted[i]!, target) === 0 ? i : -1;
}
