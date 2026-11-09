import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'DSA Foundations',
  description: 'Big-O, recognising patterns and sorting.',
  questions: [
    {
      id: 'dsa-big-o',
      question: 'How do you analyse time and space complexity (Big-O)?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['dsa', 'javascript'],
      answer: `Big-O describes how **time or memory grows as the input size n grows**, ignoring constants and smaller terms. It's usually the worst case.

How I work it out:

- **Loops**: a loop over n is O(n); **nested** loops over n are O(n²); a loop that **halves** each time is O(log n).
- **Sequential steps add, then keep the biggest**: O(n) + O(n log n) = O(n log n).
- **Recursion**: (calls per level)^(depth). Two calls with depth n gives O(2ⁿ); halving the input with linear work per level gives O(n log n), like merge sort.
- **Built-ins count**: \`array.includes\`, \`indexOf\`, \`shift\` and \`splice\` are O(n). \`Map\`/\`Set\` get, set and has are O(1) on average. \`sort\` is O(n log n).
- **Space**: extra memory, such as new arrays, maps, the recursion stack (O(depth)) and output size if relevant.

Common ladder: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!).

In interviews I state the brute force with its complexity first, then improve it, often **trading space for time** with a hash map.`,
      analogy: `Like estimating travel time by distance, not by exact traffic: whether you walk 1km or 10km matters (n), the colour of your shoes doesn't (constants).`,
      quickRevision: [
        'Loop O(n), nested O(n²), halving O(log n)',
        'Add sequential steps, keep the dominant term',
        'Map/Set ops O(1) avg; includes/shift/splice O(n); sort O(n log n)',
        'Recursion: branches^depth; stack space = depth',
        'Brute force first, then trade space for time',
      ],
      followUps: [
        'What is the complexity of `arr.shift()` in a loop?',
        'Amortised O(1): what does that mean for `push`?',
        'Best vs average vs worst case: example?',
      ],
    },
    {
      id: 'dsa-pattern-recognition',
      question: 'How do you choose an approach for a coding problem? (Common patterns)',
      perspective: 'practical',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['dsa', 'javascript'],
      answer: `I look for **signals in the problem** that point to a known pattern:

| Signal | Pattern |
|---|---|
| "Have I seen this before?", pairs summing to X, counting | **Hash map / set** |
| Sorted array, pair/triplet, palindrome, in-place | **Two pointers** |
| Longest/shortest **contiguous** subarray or substring | **Sliding window** |
| Sorted input, or "minimum value that works" | **Binary search** (on the answer too) |
| Next greater/smaller element, matching brackets | **(Monotonic) stack** |
| Top k, k-th largest, merge k sorted | **Heap** |
| Shortest path in an unweighted graph or grid, levels | **BFS** |
| All paths, connected components, islands | **DFS** |
| Dependencies, ordering, cycle detection | **Topological sort** |
| All combinations / subsets / permutations | **Backtracking** |
| Overlapping subproblems, "count ways", "min cost" | **Dynamic programming** |
| Intervals overlapping | **Sort by start + merge** |

My process out loud: **clarify** (input size, duplicates, negatives, empty input) → **examples** → **brute force + complexity** → spot the pattern → **code** → **test edge cases** → state the final complexity.`,
      analogy: `Like a doctor matching symptoms to likely conditions: "fever + rash" suggests something specific; "contiguous + longest" suggests a sliding window, before you start any tests.`,
      quickRevision: [
        'Seen-before/count → hash map',
        'Sorted + pairs → two pointers; contiguous → sliding window',
        'Sorted / monotonic answer → binary search',
        'Top-k → heap; next greater → monotonic stack',
        'Graph: BFS shortest, DFS explore, topo sort for deps; choices → backtracking; overlap → DP',
      ],
      followUps: [
        'How do you recognise a DP problem?',
        'When is binary search "on the answer" useful?',
        'What do you do if you are stuck in an interview?',
      ],
    },
    {
      id: 'dsa-sorting',
      question: 'Merge sort vs quick sort — and what\'s the JavaScript sort() pitfall?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa', 'javascript'],
      answer: `- **Merge sort**: split in half, sort each half recursively, **merge**. Always **O(n log n)**, **stable** (equal items keep their order), needs **O(n) extra space**. Good for linked lists and external sorting.
- **Quick sort**: pick a **pivot**, partition smaller/larger, recurse. **O(n log n) on average**, **O(n²) worst case** (bad pivots on sorted data, avoided with random or median pivots). **In-place** (O(log n) stack), not stable, very fast in practice.
- JavaScript's \`Array.prototype.sort\` (V8) uses **TimSort**: a hybrid of merge and insertion sort, **stable** since ES2019, and O(n log n).

**The pitfall**: with no comparator, \`sort()\` converts items to **strings**, so \`[10, 9, 1].sort()\` gives \`[1, 10, 9]\`. Always pass \`(a, b) => a - b\` for numbers. And it **mutates** the array; use \`toSorted()\` (ES2023) or \`[...arr].sort()\` for a copy.`,
      analogy: `Merge sort is sorting two half-piles of exam papers and then zipping them together; quick sort is picking a middle mark and throwing papers into "below" and "above" piles, which is fast unless you always pick the worst middle.`,
      quickRevision: [
        'Merge: O(n log n) always, stable, O(n) space',
        'Quick: avg O(n log n), worst O(n²), in-place, not stable',
        'JS sort = TimSort, stable',
        'No comparator → string sort! Use (a, b) => a - b',
        'sort() mutates; toSorted() returns a copy',
      ],
      deepDive: `\`\`\`js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) out.push(left[i] <= right[j] ? left[i++] : right[j++]);
  return out.concat(left.slice(i), right.slice(j));
}

[10, 9, 1].sort();                // [1, 10, 9]  ← compared as strings
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]
\`\`\``,
      followUps: [
        'Why is stability important when sorting objects?',
        'How do you sort objects by two keys?',
        'Implement quick sort.',
      ],
    },
  ],
});
