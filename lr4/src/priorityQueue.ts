import { Heap } from './heap';
import { numberOrder, reverse, type Comparator } from './compare';

/**
 * Priority Queue is an ADT; a binary heap is just its textbook
 * implementation. This class adds nothing algorithmic over `Heap<T>` — it's
 * a thin, friendlier-named wrapper (enqueue/dequeue instead of push/pop).
 */
export class PriorityQueue<T> {
  private readonly heap: Heap<T>;

  /** `compare`-smallest item is dequeued first, same convention as `Heap`. */
  constructor(compare: Comparator<T>) {
    this.heap = new Heap<T>(compare);
  }

  /** Convenience factory for the common "item + numeric priority" shape. */
  static byPriority<T>(
    priorityOf: (item: T) => number,
    order: 'highest-first' | 'lowest-first' = 'highest-first',
  ): PriorityQueue<T> {
    const ascending: Comparator<T> = (a, b) => numberOrder(priorityOf(a), priorityOf(b));
    return new PriorityQueue<T>(order === 'highest-first' ? reverse(ascending) : ascending);
  }

  enqueue(item: T): void {
    this.heap.push(item);
  }

  dequeue(): T | undefined {
    return this.heap.pop();
  }

  peek(): T | undefined {
    return this.heap.peek();
  }

  get size(): number {
    return this.heap.size;
  }

  get isEmpty(): boolean {
    return this.heap.isEmpty;
  }
}
