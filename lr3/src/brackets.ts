const PAIRS = { ')': '(', ']': '[', '}': '{', '>': '<' } as const;

type Closer = keyof typeof PAIRS;
type Opener = (typeof PAIRS)[Closer];

const CLOSER_OF = Object.fromEntries(
  Object.entries(PAIRS).map(([close, open]) => [open, close]),
) as Record<Opener, Closer>;

const isCloser = (ch: string): ch is Closer => Object.hasOwn(PAIRS, ch);
const isOpener = (ch: string): ch is Opener => Object.hasOwn(CLOSER_OF, ch);

export type BracketError =
  | { kind: 'unexpected'; index: number; found: Closer }
  | { kind: 'mismatch'; index: number; found: Closer; expected: Closer; openedAt: number }
  | { kind: 'unclosed'; index: number; expected: Closer };

export type BracketResult = { ok: true } | { ok: false; error: BracketError };

export function checkBrackets(input: string): BracketResult {
  const stack: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (isOpener(ch)) {
      stack.push(i);
    } else if (isCloser(ch)) {
      const openedAt = stack.pop();
      if (openedAt === undefined) {
        return {ok: false, error: {kind: 'unexpected', index: i, found: ch}};
      }
      const opener = input[openedAt] as Opener;
      if (opener !== PAIRS[ch]) {
        return { ok: false, error: { kind: 'mismatch', index: i, found: ch, expected: CLOSER_OF[opener], openedAt } };
      }
    }
  }

  const last = stack.at(-1);
  return last === undefined
    ? { ok: true }
    : { ok: false, error: { kind: 'unclosed', index: last, expected: CLOSER_OF[input[last] as Opener] } };
}

export const isBalanced = (input: string): boolean => checkBrackets(input).ok;
