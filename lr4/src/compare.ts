export type Comparator<T> = (a: T, b: T) => number;

/**
 * NaN violates trichotomy: `NaN < x`, `NaN > x` and `NaN === x` are all false,
 * so a naive `a < b ? -1 : a > b ? 1 : 0` silently treats NaN as "equal" to
 * everything, which corrupts a heap's invariant without ever throwing. We'd
 * rather fail loudly than sort incorrectly.
 */
export const numberOrder: Comparator<number> = (a, b) => {
  if (Number.isNaN(a) || Number.isNaN(b)) {
    throw new TypeError(`numberOrder: NaN has no order (compare(${a}, ${b}))`);
  }
  return a < b ? -1 : a > b ? 1 : 0;
};

export const reverse = <T>(compare: Comparator<T>): Comparator<T> => (a, b) => compare(b, a);
