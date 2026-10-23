export function buildSuffixArray(s: string): number[] {
  const n = s.length;
  let sa = Array.from({ length: n }, (_, i) => i);
  let rank = Array.from({ length: n }, (_, i) => s.charCodeAt(i));

  for (let len = 1; len < n; len *= 2) {
    const keyOf = (i: number): readonly [number, number] => [rank[i]!, i + len < n ? rank[i + len]! : -1];

    sa = sa.slice().sort((a, b) => {
      const [a0, a1] = keyOf(a);
      const [b0, b1] = keyOf(b);
      return a0 !== b0 ? a0 - b0 : a1 - b1;
    });

    const newRank = new Array<number>(n);
    newRank[sa[0]!] = 0;
    for (let i = 1; i < n; i++) {
      const same = rank[sa[i]!] === rank[sa[i - 1]!] && keyOf(sa[i]!)[1] === keyOf(sa[i - 1]!)[1];
      newRank[sa[i]!] = newRank[sa[i - 1]!]! + (same ? 0 : 1);
    }
    rank = newRank;

    if (rank[sa[n - 1]!] === n - 1) break;
  }

  return sa;
}

export function buildLcpArray(s: string, sa: readonly number[]): number[] {
  const n = s.length;
  const rank = new Array<number>(n);
  for (let i = 0; i < n; i++) rank[sa[i]!] = i;

  const lcp = new Array<number>(n).fill(0);
  let h = 0;
  for (let i = 0; i < n; i++) {
    const r = rank[i]!;
    if (r > 0) {
      const j = sa[r - 1]!;
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
      lcp[r] = h;
      if (h > 0) h--;
    } else {
      h = 0;
    }
  }
  return lcp;
}
