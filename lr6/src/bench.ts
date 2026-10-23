import { performance } from 'node:perf_hooks';
import { SuffixTree } from './suffixTree';
import { longestPalindromicSubstring } from './palindrome';

const fmt = (x: number, d = 2) => Number(x.toFixed(d));
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

const ALPHABET = 'abc';
const randomString = (len: number): string =>
  Array.from({ length: len }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

function bruteLongestPalindrome(s: string): string {
  let best = s.length > 0 ? s[0]! : '';
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const sub = s.slice(i, j);
      if (sub === [...sub].reverse().join('') && sub.length > best.length) best = sub;
    }
  }
  return best;
}

console.log('\nCorrectness spot-check against brute force (200 random strings, length <= 50)');
{
  let failures = 0;
  for (let trial = 0; trial < 200; trial++) {
    const s = randomString(Math.floor(Math.random() * 50));
    const got = longestPalindromicSubstring(s);
    const want = bruteLongestPalindrome(s);
    const isPal = got.text === [...got.text].reverse().join('');
    if (!isPal || got.text.length !== want.length || s.slice(got.start, got.end) !== got.text) {
      console.log(`  MISMATCH s=${JSON.stringify(s)} got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
      failures++;
    }
  }
  console.log(failures === 0 ? '  OK — 200/200 match brute force' : `  ${failures}/200 MISMATCHES`);
}

console.log('\nSuffixTree construction time vs the n·log²n it was built for');
console.table(
  [1_000, 10_000, 100_000, 1_000_000].map((n) => {
    const s = randomString(n);
    const ms = time(() => new SuffixTree(s), 3);
    const predictedShape = n * Math.log2(n) ** 2;
    return {
      n,
      'ms (build)': fmt(ms),
      'ms / (n·log²n), ×1e6': fmt((ms / predictedShape) * 1e6, 3),
    };
  }),
);

console.log('\nlongestPalindromicSubstring: suffix-tree approach vs brute force, by n');
console.table(
  [100, 500, 2_000].map((n) => {
    const s = randomString(n);
    const msTree = time(() => longestPalindromicSubstring(s), 3);
    const msBrute = time(() => bruteLongestPalindrome(s), 1);
    return {
      n,
      'ms (suffix tree)': fmt(msTree, 3),
      'ms (brute force O(n³))': fmt(msBrute, 2),
      'speedup': fmt(msBrute / msTree, 1),
    };
  }),
);

console.log('\nlongestPalindromicSubstring at sizes brute force cannot touch');
console.table(
  [10_000, 100_000, 1_000_000].map((n) => {
    const s = randomString(n);
    const ms = time(() => longestPalindromicSubstring(s), 3);
    return { n, 'ms (suffix tree)': fmt(ms) };
  }),
);
