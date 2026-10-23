import { SuffixTree } from './suffixTree';

// Two private-use-area sentinels, distinct from each other and from the
// SuffixTree's own default one, so S's suffixes and reverse(S)'s suffixes
// never spuriously "match through" the join when computing LCE.
const SEP_S = String.fromCodePoint(0xe001);
const SEP_R = String.fromCodePoint(0xe002);

export interface PalindromeResult {
  readonly start: number;
  readonly end: number; // exclusive
  readonly text: string;
}

/**
 * Longest palindromic substring via the suffix-tree + LCA technique:
 *
 * S[c-t] == S[c+t] for every center c and radius t  <=>  S[c+1 .. c+t]
 * equals reverse(S[c-t .. c-1]), i.e. equals R[n-c .. n-c+t-1] where
 * R = reverse(S). So the largest radius at center c is exactly the longest
 * common extension (LCE) between suffix S(c+1) and suffix R(n-c) — and LCE
 * between two suffixes is the string-depth of their LCA in a shared suffix
 * tree. Checking every center this way, odd and even, finds the longest
 * palindrome in O(n log n) LCA queries after one O(n log² n) build — see
 * REPORT.md for why that beats brute force, and where it loses to Manacher.
 */
export function longestPalindromicSubstring(s: string): PalindromeResult {
  const n = s.length;
  if (n === 0) return { start: 0, end: 0, text: '' };
  if (s.includes(SEP_S) || s.includes(SEP_R)) {
    throw new RangeError('input contains a reserved sentinel character (U+E001 / U+E002)');
  }

  const reversed = [...s].reverse().join('');
  const combined = s + SEP_S + reversed + SEP_R;
  const tree = new SuffixTree(combined, { appendSentinel: false });

  // Position of R's suffix starting at index j, within `combined`.
  const rPos = (j: number): number => n + 1 + j;

  // lce(p, q) but treating out-of-range positions (empty suffix) as 0 —
  // the natural boundary case at the very start/end of the string.
  const lce = (pInS: number, jInR: number): number => {
    if (pInS >= n || jInR >= n) return 0;
    return tree.lce(pInS, rPos(jInR));
  };

  let bestStart = 0;
  let bestLen = n > 0 ? 1 : 0;

  for (let c = 0; c < n; c++) {
    // Odd length, centered on c: extend using S(c+1) vs R(n-c).
    const rOdd = lce(c + 1, n - c);
    if (2 * rOdd + 1 > bestLen) {
      bestLen = 2 * rOdd + 1;
      bestStart = c - rOdd;
    }
    // Even length, centered in the gap before c: extend using S(c) vs R(n-c).
    const rEven = lce(c, n - c);
    if (2 * rEven > bestLen) {
      bestLen = 2 * rEven;
      bestStart = c - rEven;
    }
  }

  return { start: bestStart, end: bestStart + bestLen, text: s.slice(bestStart, bestStart + bestLen) };
}
