import {naturalOrder, type Comparator} from './compare';

export function mergeSort<T>(input: readonly T[], compare: Comparator<T> = naturalOrder): T[] {
    const a = input.slice();
    const buf = new Array<T>(a.length);
    sortRange(a, buf, 0, a.length, compare);
    return a;
}

function sortRange<T>(a: T[], buf: T[], lo: number, hi: number, cmp: Comparator<T>): void {
    if (hi - lo < 2) {
        return;
    }
    const mid = (lo + hi) >>> 1;
    sortRange(a, buf, lo, mid, cmp);
    sortRange(a, buf, mid, hi, cmp);
    if (cmp(a[mid - 1]!, a[mid]!) <= 0) {
        return;
    }
    merge(a, buf, lo, mid, hi, cmp);
}

function merge<T>(a: T[], buf: T[], lo: number, mid: number, hi: number, cmp: Comparator<T>): void {
    for (let k = lo; k < hi; k++) buf[k] = a[k]!;
    let i = lo;
    let j = mid;
    for (let k = lo; k < hi; k++) {
        if (i >= mid) {
            a[k] = buf[j++]!;
        }
        else if (j >= hi) {
            a[k] = buf[i++]!;
        }
        else if (cmp(buf[j]!, buf[i]!) < 0) {
            a[k] = buf[j++]!;
        }
        else {
            a[k] = buf[i++]!;
        }
    }
}
