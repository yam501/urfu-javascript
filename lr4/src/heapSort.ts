import { siftDown } from './heap';
import { numberOrder, reverse, type Comparator } from './compare';

/**
 * Heap sort: build a max-heap in place, then repeatedly swap the root (the
 * current maximum) to the end and shrink the heap. O(1) auxiliary space
 * besides the defensive copy of `input` — no second array, unlike draining a
 * `Heap<T>`. Not stable: sifting can reorder equal elements (see REPORT.md).
 */
export function heapSort<T extends number>(input: readonly T[], compare?: Comparator<T>): T[];
export function heapSort<T>(input: readonly T[], compare: Comparator<T>): T[];
export function heapSort<T>(input: readonly T[], compare: Comparator<T> = numberOrder as Comparator<T>): T[] {
  const data = input.slice();
  const n = data.length;
  const desc = reverse(compare); // "smallest per desc" = largest per compare -> max-heap

  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(data, i, n, desc);

  for (let end = n - 1; end > 0; end--) {
    [data[0], data[end]] = [data[end]!, data[0]!];
    siftDown(data, 0, end, desc);
  }
  return data;
}
