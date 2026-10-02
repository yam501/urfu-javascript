export type Comparator<T> = (a: T, b: T) => number;

export const naturalOrder = <T>(a: T, b: T): number => (a < b ? -1 : a > b ? 1 : 0);
