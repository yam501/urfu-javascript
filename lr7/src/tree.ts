// Абстрактная структура данных для задач на обходы: всё, что известно о ней
// обходам, — у узла есть значение и упорядоченный список потомков. Никакой
// предметной логики (поиска, балансировки, бинарности) здесь нет: бинарное
// дерево — частный случай с k <= 2 потомков.

export interface TreeLike<T> {
  readonly value: T;
  readonly children: readonly TreeLike<T>[];
}

export class TreeNode<T> implements TreeLike<T> {
  readonly value: T;
  readonly children: TreeNode<T>[];

  constructor(value: T, children: readonly TreeNode<T>[] = []) {
    this.value = value;
    this.children = [...children];
  }
}

// Литерал дерева: node('a', [node('b'), node('c', [node('d')])]).
export function node<T>(value: T, children: readonly TreeNode<T>[] = []): TreeNode<T> {
  return new TreeNode(value, children);
}

// Цепочка из depth узлов: максимальная высота при данном числе узлов —
// худший случай и для явного DFS-стека, и для лимита стека вызовов.
export function chain(depth: number): TreeNode<number> {
  const root = new TreeNode(0);
  let current = root;
  for (let i = 1; i < depth; i++) {
    const child = new TreeNode(i);
    current.children.push(child);
    current = child;
  }
  return root;
}

// Случайное дерево: каждый новый узел цепляется к случайному уже созданному.
// Псевдослучайность — детерминированный LCG, чтобы прогоны повторялись.
export function randomTree(n: number, seed = 1): TreeNode<number> {
  if (n <= 0) throw new Error('n must be positive');
  let state = seed >>> 0;
  const rand = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);

  const root = new TreeNode(0);
  const nodes = [root];
  for (let i = 1; i < n; i++) {
    const parent = nodes[Math.floor(rand() * nodes.length)]!;
    const child = new TreeNode(i);
    parent.children.push(child);
    nodes.push(child);
  }
  return root;
}
