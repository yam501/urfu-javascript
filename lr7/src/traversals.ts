import type { TreeLike } from './tree';

// Четыре обхода одного и того же дерева; каждый возвращает значения узлов
// в порядке обхода. Рекурсия не используется нигде: вместо стека вызовов —
// явная очередь (BFS) и явные стеки (все три DFS).

type Root<T> = TreeLike<T> | null | undefined;

// Обход в ширину: очередь, узлы снимаются «уровень за уровнем, внутри уровня
// слева направо». Очередь — массив с указателем головы: shift() не
// используется, он перекладывает весь хвост массива и суммарно даёт O(n²).
export function bfs<T>(root: Root<T>): T[] {
  if (!root) return [];
  const out: T[] = [];
  const queue: TreeLike<T>[] = [root];
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]!;
    out.push(current.value);
    for (const child of current.children) queue.push(child);
  }
  return out;
}

// Прямой порядок (preorder): узел раньше своих потомков. Снял узел с вершины
// стека — сразу выдал, потомков положил. Потомки кладутся в обратном порядке,
// тогда с вершины стека они снимаются слева направо.
export function dfsPreorder<T>(root: Root<T>): T[] {
  if (!root) return [];
  const out: T[] = [];
  const stack: TreeLike<T>[] = [root];
  while (stack.length > 0) {
    const current = stack.pop()!;
    out.push(current.value);
    for (let i = current.children.length - 1; i >= 0; i--) stack.push(current.children[i]!);
  }
  return out;
}

// Обратный порядок (postorder): узел позже своих потомков. Схема «два стека»:
// первый стек выдаёт узлы в порядке «узел, затем его потомки слева направо»,
// результат копится во второй массив. В этом массиве родитель всегда стоит
// раньше своих потомков и раньше младших братьев — после разворота оба
// отношения переворачиваются, и получается ровно postorder.
export function dfsPostorder<T>(root: Root<T>): T[] {
  if (!root) return [];
  const out: T[] = [];
  const stack: TreeLike<T>[] = [root];
  while (stack.length > 0) {
    const current = stack.pop()!;
    out.push(current.value);
    for (const child of current.children) stack.push(child);
  }
  out.reverse();
  return out;
}

// Симметричный порядок (inorder). Для бинарного дерева это «левое поддерево,
// узел, правое поддерево». Структура допускает любое число потомков k,
// поэтому inorder обобщён: узел выдаётся после первых floor(k / 2) потомков.
// При k = 2 это в точности классическое определение, у листа (k = 0) —
// просто выдача узла.
//
// Одного стека узлов здесь мало: значение узла нужно выдать МЕЖДУ потомками,
// и стек должен помнить, на каком потомке узел остановился. Поэтому стек
// хранит кадры — тот же механизм, что стек вызовов рекурсивной версии,
// только явный и живущий в куче.
interface Frame<T> {
  readonly node: TreeLike<T>;
  next: number; // индекс потомка, в чьё поддерево спускаемся следующим
  readonly mid: number; // значение узла выдаётся перед спуском в потомка mid
  emitted: boolean; // выдано ли уже значение узла
}

const frameOf = <T,>(node: TreeLike<T>): Frame<T> => ({
  node,
  next: 0,
  mid: Math.floor(node.children.length / 2),
  emitted: false,
});

export function dfsInorder<T>(root: Root<T>): T[] {
  if (!root) return [];
  const out: T[] = [];
  const stack: Frame<T>[] = [frameOf(root)];
  while (stack.length > 0) {
    const frame = stack[stack.length - 1]!;
    if (!frame.emitted && frame.next === frame.mid) {
      // Все потомки до середины пройдены — наступила очередь самого узла.
      out.push(frame.node.value);
      frame.emitted = true;
    } else if (frame.next < frame.node.children.length) {
      const child = frame.node.children[frame.next]!;
      frame.next++;
      stack.push(frameOf(child));
    } else {
      stack.pop();
    }
  }
  return out;
}
