# ЛР №3 — Знакомство с JS/TS

Сортировка, бинарный поиск и проверка баланса скобок на TypeScript. Анализ сложности — в [REPORT.md](REPORT.md).

```bash
npm install
npm test                         # unit + property-based тесты
npm run typecheck                # tsc --noEmit (strict)
npm run bench                    # эмпирическая проверка O-оценок
npm run brackets -- "({)}" "<[]>"  # проверка скобок с диагностикой
```

| Файл | Что внутри |
|---|---|
| `src/sort.ts` | `mergeSort` — стабильная сортировка слиянием, generic + компаратор |
| `src/binarySearch.ts` | `binarySearch`, `lowerBound` |
| `src/brackets.ts` | `checkBrackets` / `isBalanced` — `()[]{}<>` |
| `src/cli.ts` | CLI с подсветкой места ошибки |
| `src/bench.ts` | бенчмарк: подсчёт сравнений и время |
| `test/` | vitest + fast-check |
