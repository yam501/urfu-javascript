import { checkBrackets, type BracketError } from './brackets';

const describe = (e: BracketError): string => {
  switch (e.kind) {
    case 'unexpected':
      return `unexpected '${e.found}': nothing to close`;
    case 'mismatch':
      return `expected '${e.expected}' (opened at ${e.openedAt}), found '${e.found}'`;
    case 'unclosed':
      return `unclosed bracket, expected '${e.expected}' before end of input`;
  }
};

const inputs = process.argv.slice(2);
if (inputs.length === 0) inputs.push('({})', '({)}', '[<>]{', '())', '<{[()]}>');

const RED = '\x1b[31m', GREEN = '\x1b[32m', DIM = '\x1b[2m', RESET = '\x1b[0m';

for (const input of inputs) {
  const result = checkBrackets(input);
  if (result.ok) {
    console.log(`${GREEN}✓${RESET} ${input}`);
    continue;
  }
  const { error } = result;
  const marks = [...' '.repeat(input.length)];
  marks[error.index] = '^';
  if (error.kind === 'mismatch') {
    marks[error.openedAt] = '~';
  }
  console.log(`${RED}✗${RESET} ${input}`);
  console.log(`  ${RED}${marks.join('').trimEnd()}${RESET} ${DIM}${describe(error)}${RESET}`);
}
