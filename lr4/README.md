# ЛР №4 — Heap, пирамидальная сортировка, top-k, Priority Queue

Анализ сложности и обоснование решений — в [REPORT.md](REPORT.md).

```bash
npm install
npm run typecheck # tsc --noEmit (strict)
npm run bench     # эмпирическая проверка O-оценок
```

| Файл | Что внутри |
|---|---|
| `src/compare.ts` | `Comparator<T>`, `numberOrder` (с защитой от NaN), `reverse` |
| `src/heap.ts` | `Heap<T>` — бинарная куча на массиве; `minHeap` / `maxHeap` |
| `src/heapSort.ts` | `heapSort` — сортировка в массиве, без отдельной кучи |
| `src/topK.ts` | `topKLargest`, `topKSmallest` — O(n log k) через кучу размера k |
| `src/priorityQueue.ts` | `PriorityQueue<T>` — тонкая обёртка над `Heap<T>` |
| `src/bench.ts` | бенчмарк: подсчёт сравнений и время |

## Про Number / Any из задания

`minHeap`, `maxHeap`, `heapSort`, `topKLargest`, `topKSmallest` — generic-функции с двумя перегрузками:

```ts
minHeap<number>();                 // ок: компаратор необязателен, по умолчанию numberOrder
minHeap<User>();                   // ошибка компиляции: нет компаратора для произвольного типа
minHeap<User>((a, b) => a.age - b.age); // ок: компаратор передан явно
```

Для `T extends number` компаратор необязателен. Для любого другого `T` (Any) компилятор требует явный компаратор — это ровно то разделение на два варианта задания, но проверяемое TypeScript, а не на словах.
