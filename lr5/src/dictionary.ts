import { BloomFilter } from './bloomFilter';

/**
 * A dictionary of a language. Thin, task-shaped wrapper around a
 * `BloomFilter` — same relationship as `PriorityQueue` to `Heap` in lr4: all
 * the algorithmic work lives in the generic structure, this just names the
 * operations the way the assignment does.
 */
export class Dictionary {
  private readonly filter: BloomFilter;

  constructor(expectedWordCount: number, falsePositiveRate = 0.01) {
    this.filter = new BloomFilter({ expectedCount: expectedWordCount, falsePositiveRate });
  }

  /** Size the filter exactly to a known word list — the common "load a wordlist" case. */
  static fromWordList(words: readonly string[], falsePositiveRate = 0.01): Dictionary {
    const dictionary = new Dictionary(Math.max(words.length, 1), falsePositiveRate);
    dictionary.addWords(words);
    return dictionary;
  }

  addWord(word: string): void {
    this.filter.add(word);
  }

  addWords(words: Iterable<string>): void {
    this.filter.addAll(words);
  }

  has(word: string): boolean {
    return this.filter.has(word);
  }

  get sizeInBytes(): number {
    return this.filter.byteLength;
  }

  /** Degrades gracefully, but keep an eye on this if you add far more words than planned. */
  get estimatedFalsePositiveRate(): number {
    return this.filter.currentFalsePositiveRate;
  }
}
