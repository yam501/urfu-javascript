import { performance } from 'node:perf_hooks';
import { Dictionary } from './dictionary';
import { BloomFilter } from './bloomFilter';

const gc = (globalThis as { gc?: () => void }).gc;
if (!gc) {
  console.error('Run with: node --expose-gc -r tsx/cjs src/bench.ts (see `npm run bench`)');
  process.exit(1);
}

const randomWord = (minLen: number, maxLen: number): string => {
  const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
  let s = '';
  for (let i = 0; i < len; i++) s += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return s;
};

const words = (n: number, minLen = 3, maxLen = 12): string[] =>
  Array.from({ length: n }, () => randomWord(minLen, maxLen));

const fmt = (x: number, d = 2) => Number(x.toFixed(d));
const heapUsedMb = (): number => {
  gc!();
  gc!();
  return process.memoryUsage().heapUsed / 2 ** 20;
};

const time = (fn: () => void, runs = 3): number => {
  fn();
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    best = Math.min(best, performance.now() - start);
  }
  return best;
};

console.log('\nMemory: naive Set<string> vs Dictionary (Bloom filter), by word count');
console.log('(heapUsed deltas are approximate — V8/GC noise — vs the Bloom filter byte size, which is exact)');
console.table(
  [1_000, 10_000, 100_000, 1_000_000].map((n) => {
    const list = words(n);
    const totalChars = list.reduce((sum, w) => sum + w.length, 0);
    const avgLen = fmt(totalChars / n, 1);

    const before1 = heapUsedMb();
    const set = new Set(list);
    const afterSet = heapUsedMb();
    const setMb = fmt(afterSet - before1);
    void set;

    const before2 = heapUsedMb();
    const dict = Dictionary.fromWordList(list, 0.01);
    const afterDict = heapUsedMb();
    const dictHeapMb = fmt(afterDict - before2);

    return {
      n,
      'avg word len': avgLen,
      'Set heapUsed, MB': setMb,
      'Set bytes/word': fmt((setMb * 2 ** 20) / n, 1),
      'Bloom exact bytes': dict.sizeInBytes,
      'Bloom bytes/word': fmt(dict.sizeInBytes / n, 2),
      'Bloom heapUsed, MB': dictHeapMb,
      'ratio (Set/Bloom)': fmt((setMb * 2 ** 20) / dict.sizeInBytes, 1),
    };
  }),
);

console.log('\nBit budget per element for a given target false-positive rate (independent of n and word length)');
console.table(
  [0.1, 0.01, 0.001, 0.0001].map((p) => {
    const filter = new BloomFilter({ expectedCount: 100_000, falsePositiveRate: p });
    return {
      'false-positive rate': p,
      'bits/element': fmt(filter.bitCount / 100_000, 2),
      'bytes/element': fmt(filter.bitCount / 100_000 / 8, 2),
      'hash probes (k)': filter.hashCount,
    };
  }),
);

console.log('\nTime: add() and has(), Set vs Dictionary (ms, best of 3)');
console.table(
  [1_000, 10_000, 100_000, 1_000_000].map((n) => {
    const list = words(n);
    const present = list.slice(0, Math.min(1000, n));

    const msSetAdd = time(() => new Set(list));
    const dict = Dictionary.fromWordList(list, 0.01);
    const msDictAdd = time(() => Dictionary.fromWordList(list, 0.01));

    const set = new Set(list);
    const msSetHas = time(() => present.forEach((w) => set.has(w)));
    const msDictHas = time(() => present.forEach((w) => dict.has(w)));

    return {
      n,
      'ms build Set': fmt(msSetAdd),
      'ms build Dictionary': fmt(msDictAdd),
      'ms 1000x Set.has': fmt(msSetHas, 3),
      'ms 1000x Dictionary.has': fmt(msDictHas, 3),
    };
  }),
);
