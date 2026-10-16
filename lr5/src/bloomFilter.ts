/**
 * FNV-1a, seeded. Non-cryptographic but well-distributed and cheap — exactly
 * what a Bloom filter needs. Two different seeds give us two independent-enough
 * hashes; see `doubleHash`.
 */
function fnv1a(str: string, seed: number): number {
  let hash = (seed ^ 0x811c9dc5) >>> 0; // offset basis mixed with the seed
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0;
}

/** Two base hashes, mixed à la Kirsch–Mitzenmacher to simulate any number of hash functions. */
function doubleHash(word: string): readonly [number, number] {
  return [fnv1a(word, 0), fnv1a(word, 0x9e3779b9)];
}

/** Optimal bit-array size for n elements and target false-positive rate p (0 < p < 1). */
export function optimalBitCount(n: number, p: number): number {
  return Math.ceil((-n * Math.log(p)) / Math.LN2 ** 2);
}

/** Optimal number of hash probes for a bit array of size m holding n elements. */
export function optimalHashCount(m: number, n: number): number {
  return Math.max(1, Math.round((m / n) * Math.LN2));
}

export interface BloomFilterOptions {
  readonly expectedCount: number;
  readonly falsePositiveRate: number;
}

/**
 * Probabilistic set membership: `has` never false-negatives an inserted
 * element, but may false-positive on one that was never inserted. In
 * exchange, memory is a fixed `m` bits chosen from `expectedCount` and
 * `falsePositiveRate` alone — it does not grow with how long the elements
 * are, unlike storing them outright. See REPORT.md for the full argument.
 */
export class BloomFilter {
  private readonly bits: Uint32Array;
  private readonly m: number;
  private readonly k: number;
  private count = 0;

  constructor({ expectedCount, falsePositiveRate }: BloomFilterOptions) {
    if (!(expectedCount > 0)) throw new RangeError('expectedCount must be positive');
    if (!(falsePositiveRate > 0 && falsePositiveRate < 1)) {
      throw new RangeError('falsePositiveRate must be in (0, 1)');
    }
    this.m = optimalBitCount(expectedCount, falsePositiveRate);
    this.k = optimalHashCount(this.m, expectedCount);
    this.bits = new Uint32Array(Math.ceil(this.m / 32));
  }

  static from(words: Iterable<string>, falsePositiveRate = 0.01): BloomFilter {
    const list = [...words];
    const filter = new BloomFilter({ expectedCount: Math.max(list.length, 1), falsePositiveRate });
    filter.addAll(list);
    return filter;
  }

  add(word: string): void {
    const [h1, h2] = doubleHash(word);
    for (let i = 0; i < this.k; i++) {
      const index = (h1 + i * h2) >>> 0;
      this.setBit(index % this.m);
    }
    this.count++;
  }

  addAll(words: Iterable<string>): void {
    for (const word of words) this.add(word);
  }

  has(word: string): boolean {
    const [h1, h2] = doubleHash(word);
    for (let i = 0; i < this.k; i++) {
      const index = (h1 + i * h2) >>> 0;
      if (!this.getBit(index % this.m)) return false;
    }
    return true;
  }

  private setBit(index: number): void {
    this.bits[index >>> 5] |= 1 << (index & 31);
  }

  private getBit(index: number): boolean {
    return (this.bits[index >>> 5]! & (1 << (index & 31))) !== 0;
  }

  get bitCount(): number {
    return this.m;
  }

  get hashCount(): number {
    return this.k;
  }

  get insertedCount(): number {
    return this.count;
  }

  get byteLength(): number {
    return this.bits.byteLength;
  }

  /** Actual false-positive probability given how many elements were really inserted. */
  get currentFalsePositiveRate(): number {
    return (1 - Math.exp((-this.k * this.count) / this.m)) ** this.k;
  }
}
