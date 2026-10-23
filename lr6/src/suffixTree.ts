import { buildSuffixArray, buildLcpArray } from './suffixArray';

const DEFAULT_SENTINEL = '';

export interface SuffixTreeNode {
  readonly id: number;
  parent: number;
  depth: number; // tree depth: edge count from root (for LCA binary lifting)
  readonly stringDepth: number; // length of the path-label from root to this node
  readonly suffixStart: number; // start of *some* suffix passing through this node
  readonly children: Map<string, number>; // first char of edge label -> child id
  readonly leafPos: number; // suffix start position for leaves, -1 for internal nodes
  leafCount: number; // number of leaves in the subtree, filled after construction
}

export function buildSuffixTreeNodes(text: string): { nodes: SuffixTreeNode[]; root: number; leafOf: Map<number, number> } {
  const n = text.length;
  const sa = buildSuffixArray(text);
  const lcp = buildLcpArray(text, sa);

  const nodes: SuffixTreeNode[] = [];
  const leafOf = new Map<number, number>();

  const newNode = (parent: number, depth: number, stringDepth: number, suffixStart: number, leafPos: number): number => {
    const id = nodes.length;
    nodes.push({ id, parent, depth, stringDepth, suffixStart, children: new Map(), leafPos, leafCount: 0 });
    return id;
  };

  // `depth` (tree edge-count from root) is NOT maintained during this loop:
  // a node that gets re-parented by a later split can already have its own
  // subtree (built while it sat on the stack collecting siblings), and that
  // whole subtree's depth would need bumping too. Simplest correct fix:
  // leave depth unset here and compute it once, for everyone, in one BFS
  // after the tree is fully built (below).
  const root = newNode(-1, 0, 0, 0, -1);
  const stack: number[] = [root];
  const charAt = (node: SuffixTreeNode, atStringDepth: number): string => text[node.suffixStart + atStringDepth]!;

  for (let i = 0; i < n; i++) {
    const d = i === 0 ? 0 : lcp[i]!;

    let lastPopped = -1;
    while (nodes[stack[stack.length - 1]!]!.stringDepth > d) lastPopped = stack.pop()!;
    let parent = stack[stack.length - 1]!;

    if (nodes[parent]!.stringDepth < d) {
      // The edge parent -> lastPopped passes through depth d: split it.
      const child = nodes[lastPopped]!;
      const mid = newNode(parent, 0, d, child.suffixStart, -1);
      nodes[parent]!.children.set(charAt(child, nodes[parent]!.stringDepth), mid);

      child.parent = mid;
      nodes[mid]!.children.set(charAt(child, d), child.id);

      stack.push(mid);
      parent = mid;
    }

    const suffixStart = sa[i]!;
    const leaf = newNode(parent, 0, n - suffixStart, suffixStart, suffixStart);
    nodes[parent]!.children.set(charAt(nodes[leaf]!, d), leaf);
    leafOf.set(suffixStart, leaf);
    stack.push(leaf);
  }

  // One BFS from the root: correct `depth` for every node, in topological
  // (parent-before-child) order, which the leaf-count accumulation below
  // then consumes in reverse.
  const bfsOrder: number[] = [root];
  for (let qi = 0; qi < bfsOrder.length; qi++) {
    const id = bfsOrder[qi]!;
    for (const childId of nodes[id]!.children.values()) {
      nodes[childId]!.depth = nodes[id]!.depth + 1;
      bfsOrder.push(childId);
    }
  }

  for (const node of nodes) if (node.leafPos >= 0) node.leafCount = 1;
  for (let qi = bfsOrder.length - 1; qi >= 0; qi--) {
    const node = nodes[bfsOrder[qi]!]!;
    if (node.parent >= 0) nodes[node.parent]!.leafCount += node.leafCount;
  }

  return { nodes, root, leafOf };
}

function buildLcaIndex(nodes: readonly SuffixTreeNode[]) {
  const n = nodes.length;
  const log = Math.max(1, Math.ceil(Math.log2(n + 1)));
  const up: Int32Array[] = Array.from({ length: log }, () => new Int32Array(n).fill(-1));

  for (const node of nodes) up[0]![node.id] = node.parent;
  for (let k = 1; k < log; k++) {
    for (let v = 0; v < n; v++) {
      const mid = up[k - 1]![v]!;
      up[k]![v] = mid === -1 ? -1 : up[k - 1]![mid]!;
    }
  }

  const ancestorAtDepth = (start: number, targetDepth: number): number => {
    let v = start;
    let diff = nodes[v]!.depth - targetDepth;
    for (let k = 0; diff > 0; k++, diff >>= 1) {
      if (diff & 1) v = up[k]![v]!;
    }
    return v;
  };

  return function lca(aId: number, bId: number): number {
    let a = aId;
    let b = bId;
    if (nodes[a]!.depth < nodes[b]!.depth) [a, b] = [b, a];
    a = ancestorAtDepth(a, nodes[b]!.depth);
    if (a === b) return a;
    for (let k = log - 1; k >= 0; k--) {
      const na = up[k]![a]!;
      const nb = up[k]![b]!;
      if (na !== -1 && na !== nb) {
        a = na;
        b = nb;
      }
    }
    return nodes[a]!.parent;
  };
}

export class SuffixTree {
  readonly text: string;
  private readonly originalLength: number;
  private readonly nodes: SuffixTreeNode[];
  private readonly root: number;
  private readonly leafOf: Map<number, number>;
  private readonly lca: (a: number, b: number) => number;

  constructor(text: string, options: { appendSentinel?: boolean } = {}) {
    const appendSentinel = options.appendSentinel ?? true;
    if (appendSentinel && text.includes(DEFAULT_SENTINEL)) {
      throw new RangeError('text already contains the reserved sentinel character U+E000');
    }
    this.originalLength = text.length;
    this.text = appendSentinel ? text + DEFAULT_SENTINEL : text;

    const built = buildSuffixTreeNodes(this.text);
    this.nodes = built.nodes;
    this.root = built.root;
    this.leafOf = built.leafOf;
    this.lca = buildLcaIndex(this.nodes);
  }

  contains(pattern: string): boolean {
    return this.walk(pattern) !== null;
  }

  countOccurrences(pattern: string): number {
    const hit = this.walk(pattern);
    return hit === null ? 0 : this.nodes[hit]!.leafCount;
  }

  longestRepeatedSubstring(): string {
    let best = this.root;
    for (const node of this.nodes) {
      if (node.leafPos < 0 && node.stringDepth > this.nodes[best]!.stringDepth) best = node.id;
    }
    const node = this.nodes[best]!;
    return this.text.slice(node.suffixStart, node.suffixStart + node.stringDepth);
  }

  lce(posA: number, posB: number): number {
    const a = this.leafOf.get(posA);
    const b = this.leafOf.get(posB);
    if (a === undefined || b === undefined) throw new RangeError('lce: position is not a valid suffix start');
    return this.nodes[this.lca(a, b)]!.stringDepth;
  }

  private walk(pattern: string): number | null {
    let node = this.root;
    let i = 0;
    while (i < pattern.length) {
      const child = this.nodes[node]!.children.get(pattern[i]!);
      if (child === undefined) return null;
      const childNode = this.nodes[child]!;
      const edgeLen = childNode.stringDepth - this.nodes[node]!.stringDepth;
      const edgeStart = childNode.suffixStart + this.nodes[node]!.stringDepth;
      for (let k = 0; k < edgeLen && i < pattern.length; k++, i++) {
        if (this.text[edgeStart + k] !== pattern[i]) return null;
      }
      node = child;
    }
    return node;
  }
}
