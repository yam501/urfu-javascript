import { performance } from 'node:perf_hooks';
import { node, chain, randomTree } from './tree';
import type { TreeLike } from './tree';
import { bfs, dfsPreorder, dfsPostorder, dfsInorder } from './traversals';

const fmt = (x: number, d = 2) => Number(x.toFixed(d));
const time = (fn: () => void, runs = 3): number => {
  fn();
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    best = Math.min(best, performance.now() - start);
  }
  return best;
};

// Рекурсивные эталоны для сверки. Рекурсия здесь — только в проверке:
// это независимая реализация; в traversals.ts её нет.
function recBfs<T>(level: readonly TreeLike<T>[]): T[] {
  if (level.length === 0) return [];
  return [...level.map((n) => n.value), ...recBfs(level.flatMap((n) => n.children))];
}
function recPreorder<T>(n: TreeLike<T>): T[] {
  return [n.value, ...n.children.flatMap(recPreorder)];
}
function recPostorder<T>(n: TreeLike<T>): T[] {
  return [...n.children.flatMap(recPostorder), n.value];
}
function recInorder<T>(n: TreeLike<T>): T[] {
  const mid = Math.floor(n.children.length / 2);
  return [
    ...n.children.slice(0, mid).flatMap(recInorder),
    n.value,
    ...n.children.slice(mid).flatMap(recInorder),
  ];
}

function printTree(root: TreeLike<unknown>): void {
  interface Row {
    n: TreeLike<unknown>;
    prefix: string;
    isLast: boolean;
  }
  console.log(String(root.value));
  const stack: Row[] = [];
  for (let i = root.children.length - 1; i >= 0; i--) {
    stack.push({ n: root.children[i]!, prefix: '', isLast: i === root.children.length - 1 });
  }
  while (stack.length > 0) {
    const { n, prefix, isLast } = stack.pop()!;
    console.log(`${prefix}${isLast ? '└─ ' : '├─ '}${String(n.value)}`);
    const childPrefix = `${prefix}${isLast ? '   ' : '│  '}`;
    for (let i = n.children.length - 1; i >= 0; i--) {
      stack.push({ n: n.children[i]!, prefix: childPrefix, isLast: i === n.children.length - 1 });
    }
  }
}

console.log('\nA sample tree and all four traversals of it');
{
  const demo = node('A', [
    node('B', [node('E'), node('F', [node('I')])]),
    node('C'),
    node('D', [node('G'), node('H')]),
  ]);
  printTree(demo);
  console.log(`  BFS:          ${bfs(demo).join(' ')}`);
  console.log(`  DFS preorder: ${dfsPreorder(demo).join(' ')}`);
  console.log(`  DFS inorder:  ${dfsInorder(demo).join(' ')}`);
  console.log(`  DFS postorder:${dfsPostorder(demo).join(' ')}`);
}

console.log('\ninorder on a full binary search tree == sorted order');
{
  // У каждого внутреннего узла ровно 2 потомка, так что обобщённый inorder
  // совпадает с классическим left-node-right.
  const bst = node(8, [
    node(4, [node(2, [node(1), node(3)]), node(6, [node(5), node(7)])]),
    node(12, [node(10, [node(9), node(11)]), node(14, [node(13), node(15)])]),
  ]);
  const got = dfsInorder(bst);
  const want = Array.from({ length: 15 }, (_, i) => i + 1);
  const sorted = got.length === want.length && got.every((v, i) => v === want[i]);
  console.log(`  ${got.join(', ')} — ${sorted ? 'matches 1..15' : 'NOT SORTED (bug)'}`);
}

console.log('\nCorrectness vs recursive reference: 300 random trees (1..300 nodes each)');
{
  let failures = 0;
  for (let trial = 0; trial < 300; trial++) {
    const root = randomTree(1 + Math.floor(Math.random() * 300), trial * 7919 + 1);
    const checks: [string, number[], number[]][] = [
      ['bfs', bfs(root), recBfs([root])],
      ['preorder', dfsPreorder(root), recPreorder(root)],
      ['inorder', dfsInorder(root), recInorder(root)],
      ['postorder', dfsPostorder(root), recPostorder(root)],
    ];
    for (const [name, got, want] of checks) {
      if (got.length !== want.length || got.some((v, i) => v !== want[i])) {
        console.log(`  MISMATCH trial=${trial} traversal=${name}`);
        failures++;
      }
    }
  }
  const emptyRootsOk = [null, undefined].every(
    (empty) =>
      bfs(empty).length === 0 &&
      dfsPreorder(empty).length === 0 &&
      dfsInorder(empty).length === 0 &&
      dfsPostorder(empty).length === 0,
  );
  if (!emptyRootsOk) {
    console.log('  MISMATCH: empty root must give []');
    failures++;
  }
  console.log(failures === 0 ? '  OK — 300/300 trees, all four traversals match' : `  ${failures} mismatches`);
}

console.log('\nCall-stack limit: recursive reference on node chains');
{
  for (const depth of [1_000, 10_000, 100_000]) {
    let survived = true;
    try {
      recPreorder(chain(depth));
    } catch {
      survived = false;
    }
    console.log(
      `  depth ${String(depth).padStart(7)}: recursive preorder ${survived ? 'survives' : '→ RangeError (call stack exhausted)'}`,
    );
  }
}

console.log('\n1 000 000 nodes: explicit queue/stack instead of the call stack, best of 3');
{
  const trees: [string, TreeLike<number>][] = [
    ['random 1M', randomTree(1_000_000, 42)],
    ['chain 1M', chain(1_000_000)],
  ];
  const traversals: [string, <T>(root: TreeLike<T>) => T[]][] = [
    ['bfs', bfs],
    ['dfs preorder', dfsPreorder],
    ['dfs inorder', dfsInorder],
    ['dfs postorder', dfsPostorder],
  ];
  const rows = trees.flatMap(([treeName, tree]) =>
    traversals.map(([travName, trav]) => {
      const visited = trav(tree);
      if (visited.length !== 1_000_000) throw new Error(`${treeName}/${travName}: visited ${visited.length}`);
      const ms = time(() => {
        trav(tree);
      });
      return { tree: treeName, traversal: travName, 'ms': fmt(ms) };
    }),
  );
  console.table(rows);
}
