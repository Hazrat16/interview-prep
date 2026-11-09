---
title: Big-O Notation
description: Complexity classes, data-structure operations and sorting at a glance.
icon: target
order: 3
---

## Complexity classes (fastest → slowest)

| Big-O | Name | Example |
|---|---|---|
| `O(1)` | Constant | Array index, hash map get |
| `O(log n)` | Logarithmic | Binary search, balanced BST lookup |
| `O(n)` | Linear | Loop over an array |
| `O(n log n)` | Linearithmic | Merge sort, efficient sorting |
| `O(n²)` | Quadratic | Nested loops over the same input |
| `O(2ⁿ)` | Exponential | All subsets, naive recursion (fib) |
| `O(n!)` | Factorial | All permutations |

Rough limits for ~1 second: n ≤ 10⁸ for O(n), 10⁶ for O(n log n), 10⁴ for O(n²), ~20 for O(2ⁿ).

## Data structures

| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | `O(1)` | `O(n)` | `O(n)` (`O(1)` push at end) | `O(n)` |
| Linked list | `O(n)` | `O(n)` | `O(1)` at a known node | `O(1)` at a known node |
| Hash map / Set | — | `O(1)` avg | `O(1)` avg | `O(1)` avg |
| Stack / Queue | — | `O(n)` | `O(1)` | `O(1)` |
| Binary heap | `O(1)` peek | `O(n)` | `O(log n)` | `O(log n)` pop |
| Balanced BST | `O(log n)` | `O(log n)` | `O(log n)` | `O(log n)` |

JavaScript note: `array.shift()` / `unshift()` are `O(n)`; for a real queue use an index pointer or a linked list.

## Sorting

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Merge sort | `n log n` | `n log n` | `n log n` | `O(n)` | Yes |
| Quick sort | `n log n` | `n log n` | `n²` | `O(log n)` | No |
| Heap sort | `n log n` | `n log n` | `n log n` | `O(1)` | No |
| Insertion sort | `n` | `n²` | `n²` | `O(1)` | Yes |
| Counting sort | `n + k` | `n + k` | `n + k` | `O(k)` | Yes |

`Array.prototype.sort` in V8 is TimSort: `O(n log n)` and stable.

## Graphs & trees

| Algorithm | Time | Space |
|---|---|---|
| BFS / DFS | `O(V + E)` | `O(V)` |
| Dijkstra (binary heap) | `O((V + E) log V)` | `O(V)` |
| Topological sort | `O(V + E)` | `O(V)` |
| Tree traversal | `O(n)` | `O(h)` (height) |

## Rules of thumb

- Drop constants and lower terms: `O(2n + 5)` → `O(n)`.
- Different inputs get different letters: two loops over `a` and `b` → `O(a + b)`; nested → `O(a · b)`.
- Recursion space = max call-stack depth.
- Hash map trades `O(n)` space for `O(1)` lookups — the most common optimisation in interviews.
