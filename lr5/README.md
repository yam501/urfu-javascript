# ЛР №5 — Словарь языка (Bloom filter)

Полный разбор требования «память строго меньше O(N)» и расчёт ведущих множителей — в [REPORT.md](REPORT.md).

```bash
npm install
npm run typecheck # tsc --noEmit (strict)
npm run bench     # реальная память (--expose-gc) и время, Set<string> vs Dictionary
```

| Файл | Что внутри |
|---|---|
| `src/bloomFilter.ts` | `BloomFilter` — битовый массив (`Uint32Array`), double hashing (FNV-1a ×2, схема Kirsch–Mitzenmacher), `optimalBitCount`/`optimalHashCount` |
| `src/dictionary.ts` | `Dictionary` — обёртка под формулировку задания: `addWord`, `addWords`, `has` |
| `src/bench.ts` | бенчмарк: байты на слово (точно) и `heapUsed` (приблизительно) против наивного `Set<string>` |

## Коротко про задачу

Точное хранение n слов требует памяти, растущей с суммарной длиной слов (Θ(N), N — суммарное число символов). Bloom filter — вероятностная структура: `has(word)` никогда не ошибается на добавленных словах (false negative невозможен), но может изредка соврать на не добавленных (false positive с управляемой вероятностью p). В обмен память — это фиксированное число бит на элемент, **не зависящее от длины слов**:

```
Dictionary.fromWordList(words, 0.01).sizeInBytes // ≈ 1.2 байта на слово, при любой длине слов
```
