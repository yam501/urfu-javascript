import { performance } from 'node:perf_hooks';
import { Heap } from './heap';
import { heapSort } from './heapSort';
import { topKLargest } from './topK';
import { numberOrder } from './compare';

const counting = () => {
  let count = 0;
  const cmp = (a: number, b: number) => (count++, numberOrder(a, b));
  return { cmp, get count() { return count; } };
};

const time = (fn: () => void, runs = 5): number => {
  fn(); // JIT warm-up
  const samples = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  });
  return heapSort(samples)[runs >> 1]!;
};

const random = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * n));
const fmt = (x: number, d = 2) => Number(x.toFixed(d));
const SIZES = [1e3, 1e4, 1e5, 1e6];

console.log('\nHeap construction: bulk heapify O(n) vs n sequential pushes O(n log n)');
console.log('(descending input: every push is a new minimum, the worst case for sifting up)');
console.table(
  SIZES.map((n) => {
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const bulk = counting();
    new Heap<number>(bulk.cmp, arr);
    const pushed = counting();
    const h = new Heap<number>(pushed.cmp);
    for (const x of arr) h.push(x);
    return {
      n,
      'comparisons (heapify)': bulk.count,
      'ratio to n': fmt(bulk.count / n, 2),
      'comparisons (n pushes)': pushed.count,
      'ratio to n·log2 n': fmt(pushed.count / (n * Math.log2(n)), 2),
    };
  }),
);

console.log('\nheapSort: comparisons / (n·log2 n) should stay ~constant');
console.table(
  SIZES.map((n) => {
    const arr = random(n);
    const c = counting();
    heapSort(arr, c.cmp);
    const ms = time(() => heapSort(arr, (a, b) => a - b));
    return {
      n,
      comparisons: c.count,
      'ratio to n·log2 n': fmt(c.count / (n * Math.log2(n)), 3),
      'ms': fmt(ms),
    };
  }),
);

console.log('\ntopKLargest(n, k=10): heap-of-k vs full sort+slice');
console.table(
  [...SIZES, 1e7].map((n) => {
    const arr = random(n);
    const k = 10;
    const msTopK = time(() => topKLargest(arr, k));
    const msFullSort = time(() => [...arr].sort((a, b) => b - a).slice(0, k));
    return {
      n,
      k,
      'ms topK (heap)': fmt(msTopK),
      'ms full sort': fmt(msFullSort),
      speedup: fmt(msFullSort / msTopK),
    };
  }),
);
