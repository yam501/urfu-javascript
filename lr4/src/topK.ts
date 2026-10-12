import { Heap } from './heap';
import { numberOrder, reverse, type Comparator } from './compare';

/**
 * Keeps a size-k heap of the best candidates seen so far; everything else is
 * discarded in O(1) after a single comparison. O(n log k) time, O(k) space —
 * cheaper than sorting everything (O(n log n), O(n)) whenever k << n, and
 * "online": it never needs the full array in memory at once.
 */
function selectK<T>(arr: readonly T[], k: number, compare: Comparator<T>): T[] {
  if (k <= 0) return [];
  const heap = new Heap<T>(compare); // root = current weakest of the kept candidates
  for (const value of arr) {
    if (heap.size < k) {
      heap.push(value);
    } else if (compare(value, heap.peek()!) > 0) {
      heap.pop();
      heap.push(value);
    }
  }
  const result: T[] = [];
  while (!heap.isEmpty) result.push(heap.pop()!);
  return result.reverse();
}

/** The k largest elements, largest first. */
export function topKLargest<T extends number>(arr: readonly T[], k: number, compare?: Comparator<T>): T[];
export function topKLargest<T>(arr: readonly T[], k: number, compare: Comparator<T>): T[];
export function topKLargest<T>(arr: readonly T[], k: number, compare: Comparator<T> = numberOrder as Comparator<T>): T[] {
  return selectK(arr, k, compare);
}

/** The k smallest elements, smallest first. */
export function topKSmallest<T extends number>(arr: readonly T[], k: number, compare?: Comparator<T>): T[];
export function topKSmallest<T>(arr: readonly T[], k: number, compare: Comparator<T>): T[];
export function topKSmallest<T>(arr: readonly T[], k: number, compare: Comparator<T> = numberOrder as Comparator<T>): T[] {
  return selectK(arr, k, reverse(compare));
}
