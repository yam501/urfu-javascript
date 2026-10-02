import { performance } from 'node:perf_hooks';
import { mergeSort } from './sort';
import { binarySearch } from './binarySearch';
import { isBalanced } from './brackets';

const counting = () => {
  let count = 0;
  const cmp = (a: number, b: number) => (count++, a - b);
  return { cmp, get count() { return count; } };
};

const time = (fn: () => void, runs = 5): number => {
  fn(); // JIT warm-up
  const samples = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  });
  return mergeSort(samples)[runs >> 1]!;
};

const random = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * n));
const fmt = (x: number, d = 2) => Number(x.toFixed(d));
const SIZES = [1e3, 1e4, 1e5, 1e6];

console.log('\nmergeSort: comparisons / (n·log2 n) should stay ~constant');
console.table(
  SIZES.map((n) => {
    const arr = random(n);
    const c = counting();
    mergeSort(arr, c.cmp);
    const ms = time(() => mergeSort(arr, (a, b) => a - b));
    const sorted = counting();
    mergeSort(mergeSort(arr), sorted.cmp);
    return {
      n,
      'comparisons (random)': c.count,
      'ratio to n·log2 n': fmt(c.count / (n * Math.log2(n)), 3),
      'comparisons (sorted)': sorted.count,
      'ms (random)': fmt(ms),
    };
  }),
);

console.log('\nbinarySearch: max comparisons over 10k queries vs ceil(log2(n+1)) + 1');
console.table(
  [...SIZES, 1e7].map((n) => {
    const arr = Array.from({ length: n }, (_, i) => i * 2);
    let maxSteps = 0;
    for (let q = 0; q < 10_000; q++) {
      const c = counting();
      binarySearch(arr, Math.floor(Math.random() * 2 * n), c.cmp);
      maxSteps = Math.max(maxSteps, c.count);
    }
    return { n, 'max comparisons': maxSteps, 'ceil(log2(n+1)) + 1': Math.ceil(Math.log2(n + 1)) + 1 };
  }),
);

console.log('\nisBalanced: ns per char should stay ~constant');
console.table(
  [...SIZES, 1e7].map((n) => {
    const s = '([{<'.repeat(n / 8) + '>}])'.repeat(n / 8);
    const ms = time(() => isBalanced(s));
    return { n, ms: fmt(ms), 'ns / char': fmt((ms * 1e6) / n) };
  }),
);
