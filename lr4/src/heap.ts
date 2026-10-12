import { numberOrder, reverse, type Comparator } from './compare';

/** Restores the heap invariant by moving `data[start]` down. Exported so heapSort can reuse it in-place. */
export function siftDown<T>(data: T[], start: number, size: number, compare: Comparator<T>): void {
  let i = start;
  for (;;) {
    const left = 2 * i + 1;
    const right = left + 1;
    let smallest = i;
    if (left < size && compare(data[left]!, data[smallest]!) < 0) smallest = left;
    if (right < size && compare(data[right]!, data[smallest]!) < 0) smallest = right;
    if (smallest === i) return;
    [data[i], data[smallest]] = [data[smallest]!, data[i]!];
    i = smallest;
  }
}

function siftUp<T>(data: T[], start: number, compare: Comparator<T>): void {
  let i = start;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (compare(data[i]!, data[parent]!) >= 0) return;
    [data[i], data[parent]] = [data[parent]!, data[i]!];
    i = parent;
  }
}

/**
 * Binary heap backed by a plain array: `data[0]` is always the element
 * `compare` ranks smallest. Pass a reversed comparator to get a max-heap —
 * see `minHeap` / `maxHeap` below.
 */
export class Heap<T> {
  private readonly data: T[];

  /** Building from `initial` is O(n) (bottom-up heapify), not O(n log n) — see REPORT.md. */
  constructor(private readonly compare: Comparator<T>, initial: readonly T[] = []) {
    this.data = initial.slice();
    for (let i = (this.data.length >> 1) - 1; i >= 0; i--) {
      siftDown(this.data, i, this.data.length, compare);
    }
  }

  get size(): number {
    return this.data.length;
  }

  get isEmpty(): boolean {
    return this.data.length === 0;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  push(value: T): void {
    this.data.push(value);
    siftUp(this.data, this.data.length - 1, this.compare);
  }

  pop(): T | undefined {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      siftDown(this.data, 0, this.data.length, this.compare);
    }
    return top;
  }
}

// Overloads encode the lab's two tracks in the type system: for T = number the
// comparator is optional (defaults to numberOrder); for any other T, `>`/`<`
// aren't guaranteed to mean anything, so the compiler forces you to supply one.

export function minHeap<T extends number = number>(compare?: Comparator<T>, initial?: readonly T[]): Heap<T>;
export function minHeap<T>(compare: Comparator<T>, initial?: readonly T[]): Heap<T>;
export function minHeap<T>(compare: Comparator<T> = numberOrder as Comparator<T>, initial: readonly T[] = []): Heap<T> {
  return new Heap<T>(compare, initial);
}

export function maxHeap<T extends number = number>(compare?: Comparator<T>, initial?: readonly T[]): Heap<T>;
export function maxHeap<T>(compare: Comparator<T>, initial?: readonly T[]): Heap<T>;
export function maxHeap<T>(compare: Comparator<T> = numberOrder as Comparator<T>, initial: readonly T[] = []): Heap<T> {
  return new Heap<T>(reverse(compare), initial);
}
