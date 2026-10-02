import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { checkBrackets, isBalanced } from '../src/brackets';

const balanced: fc.Arbitrary<string> = fc.letrec<{ seq: string }>((tie) => ({
  seq: fc.oneof(
    { depthSize: 'small' },
    fc.constant(''),
    fc
      .tuple(fc.constantFrom('()', '[]', '{}', '<>'), tie('seq'), tie('seq'))
      .map(([[open, close], inner, rest]) => `${open}${inner}${close}${rest}`),
  ),
})).seq;

describe('checkBrackets', () => {
  it.each(['', '()', '({})', '<{[()]}>', '()[]{}<>', 'f(a[i]) { return <T>x; }'])('accepts %j', (s) => {
    expect(isBalanced(s)).toBe(true);
  });

  it.each(['(', ')', '({)}', '(]', '())', '<<>', '}{'])('rejects %j', (s) => {
    expect(isBalanced(s)).toBe(false);
  });

  it('reports precise errors', () => {
    expect(checkBrackets('({)}')).toEqual({
      ok: false,
      error: { kind: 'mismatch', index: 2, found: ')', expected: '}', openedAt: 1 },
    });
    expect(checkBrackets('())')).toEqual({ ok: false, error: { kind: 'unexpected', index: 2, found: ')' } });
    expect(checkBrackets('[<>]{')).toEqual({ ok: false, error: { kind: 'unclosed', index: 4, expected: '}' } });
  });

  it('accepts every generated balanced string', () => {
    fc.assert(fc.property(balanced, (s) => {
      expect(isBalanced(s)).toBe(true);
    }));
  });

  it('rejects a balanced string with one bracket removed', () => {
    fc.assert(
      fc.property(balanced.filter((s) => s.length > 0), fc.nat(), (s, n) => {
        const i = n % s.length;
        expect(isBalanced(s.slice(0, i) + s.slice(i + 1))).toBe(false);
      }),
    );
  });
});
