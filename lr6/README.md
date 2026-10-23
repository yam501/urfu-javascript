# ЛР №6 — Суффиксное дерево, наибольший палиндром

Построение и вывод формул — в [REPORT.md](REPORT.md).

```bash
npm install
npm run typecheck # tsc --noEmit (strict)
npm run bench     # корректность против брутфорса + эмпирическая проверка O-оценок
```

| Файл | Что внутри |
|---|---|
| `src/suffixArray.ts` | `buildSuffixArray` (prefix doubling, O(n log²n)), `buildLcpArray` (алгоритм Касаи, O(n)) |
| `src/suffixTree.ts` | `SuffixTree` — построение дерева из суффиксного массива за O(n), LCA (binary lifting), `contains`/`countOccurrences`/`longestRepeatedSubstring`/`lce` |
| `src/palindrome.ts` | `longestPalindromicSubstring` — через LCE-запросы к суффиксному дереву строки `S + sep + reverse(S)` |
| `src/bench.ts` | корректность на брутфорсе + реальное время по сравнению с теоретическими оценками |