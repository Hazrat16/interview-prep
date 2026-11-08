import { defineQuestions } from '../../lib/content/curated-schema';

const dsa = { category: 'dsa', perspective: 'coding' as const };

export default defineQuestions([
  // ================================================================ Foundations
  {
    ...dsa,
    id: 'dsa-big-o',
    section: 'Foundations',
    perspective: 'concept',
    question: 'How do you analyse time and space complexity (Big-O)?',
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
    relatedCollected: ['javascript/coding-round-solutions/coding-round-solutions--big-o-cheat-sheet'],
  },
  {
    ...dsa,
    id: 'dsa-pattern-recognition',
    section: 'Foundations',
    perspective: 'practical',
    question: 'How do you choose an approach for a coding problem? (Common patterns)',
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
    ...dsa,
    id: 'dsa-sorting',
    section: 'Foundations',
    perspective: 'trade-off',
    question: "Merge sort vs quick sort — and what's the JavaScript sort() pitfall?",
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
    followUps: [
      'Why is stability important when sorting objects?',
      'How do you sort objects by two keys?',
      'Implement quick sort.',
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
  },

  // ================================================================ Arrays & hashing
  {
    ...dsa,
    id: 'dsa-best-time-buy-sell-stock',
    section: 'Arrays & hashing',
    question: 'Best Time to Buy and Sell Stock: find the maximum profit from one buy and one sell.',
    difficulty: 'easy',
    frequency: 'very-high',
    tags: ['dsa', 'javascript'],
    answer: `Brute force checks every buy/sell pair: **O(n²)**.

Better, in **one pass**: walk through the prices, keeping the **lowest price seen so far**. At each day, the best profit if I sell today is \`price - minSoFar\`. Track the maximum of that. If prices only fall, the answer is 0 (don't trade).

**O(n) time, O(1) space.** It's essentially a greedy approach, or Kadane's algorithm on the daily differences.`,
    analogy: `Walking through a market week with a notebook: you note the cheapest price you've seen so far, and each day ask "if I sold today, how much would I make?", remembering only the best answer.`,
    quickRevision: ['Track minimum price so far', 'Profit today = price - min', 'Keep the max profit', 'O(n) time, O(1) space; 0 if prices only fall'],
    followUps: ['What if you can make unlimited transactions?', 'What if there is a transaction fee or cooldown?'],
    deepDive: `\`\`\`js
function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    best = Math.max(best, p - minPrice);
  }
  return best;
}
maxProfit([7, 1, 5, 3, 6, 4]); // 5 (buy 1, sell 6)
\`\`\``,
  },
  {
    ...dsa,
    id: 'dsa-product-except-self',
    section: 'Arrays & hashing',
    question: 'Product of Array Except Self (without division).',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `For each index, the answer is (**product of everything to its left**) × (**product of everything to its right**).

1. First pass, left to right: \`out[i]\` = running product of the elements before i.
2. Second pass, right to left: multiply \`out[i]\` by a running product of the elements after i.

No division is needed, so **zeros are handled naturally**. **O(n) time**, and **O(1) extra space** if the output array doesn't count.`,
    analogy: `To know everyone's share except their own, you ask the people to your left for their combined total, then the people to your right, and multiply the two.`,
    quickRevision: ['answer[i] = prefix product × suffix product', 'Pass 1: prefix into output', 'Pass 2: multiply by running suffix', 'No division; O(n) time, O(1) extra'],
    followUps: ['Why not just divide the total product by nums[i]?', 'How do zeros affect the division approach?'],
    deepDive: `\`\`\`js
function productExceptSelf(nums) {
  const n = nums.length, out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
  return out;
}
productExceptSelf([1, 2, 3, 4]); // [24, 12, 8, 6]
\`\`\``,
  },
  {
    ...dsa,
    id: 'dsa-three-sum',
    section: 'Arrays & hashing',
    question: '3Sum: find all unique triplets that sum to zero.',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `Brute force is three loops: **O(n³)**.

Better: **sort**, then for each \`i\`, solve **Two Sum on the sorted remainder with two pointers**:

- \`l = i + 1\`, \`r = end\`. If the sum is too small, move \`l\` right; if too big, move \`r\` left; if zero, record it and move both.
- **Skip duplicates**: skip the same \`nums[i]\` as the previous one, and after a match skip equal values at \`l\` and \`r\`.
- Early exit: once \`nums[i] > 0\`, no more triplets are possible.

**O(n²) time**, O(1) extra space apart from sorting and the output.`,
    analogy: `Fix one person in a line sorted by height, then have two people walk inward from both ends looking for a pair that balances them out exactly.`,
    quickRevision: ['Sort first', 'Fix i, two pointers on the rest', 'Too small → l++, too big → r--', 'Skip duplicates at i, l, r', 'O(n²)'],
    followUps: ['Generalise to 4Sum / kSum.', 'How would you do 3Sum closest to a target?'],
    deepDive: `\`\`\`js
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const res = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const sum = nums[i] + nums[l] + nums[r];
      if (sum === 0) {
        res.push([nums[i], nums[l], nums[r]]);
        l++; r--;
        while (l < r && nums[l] === nums[l - 1]) l++;
        while (l < r && nums[r] === nums[r + 1]) r--;
      } else if (sum < 0) l++;
      else r--;
    }
  }
  return res;
}
\`\`\``,
    relatedCollected: ['javascript/coding-round-solutions/two-sum-hash-map--on'],
  },
  {
    ...dsa,
    id: 'dsa-top-k-frequent',
    section: 'Arrays & hashing',
    question: 'Top K Frequent Elements.',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `1. **Count** frequencies with a \`Map\`: O(n).
2. Pick the top k:
   - sort the entries by count: O(n log n). Simple.
   - a **min-heap of size k**: O(n log k).
   - **bucket sort**: an array where index = frequency, holding the numbers with that count. Walk from the highest frequency down until you have k: **O(n)**.

I'd mention all three and code the bucket version, since frequency can't exceed n.`,
    analogy: `Sorting votes into ballot boxes labelled by how many votes each candidate got, then reading from the fullest box down until you've picked k winners.`,
    quickRevision: ['Count with a Map', 'Sort O(n log n) / heap O(n log k) / buckets O(n)', 'Buckets: index = frequency', 'Walk buckets from high to low'],
    followUps: ['What if the data is a stream?', 'Top k frequent words with alphabetical tie-break?'],
    deepDive: `\`\`\`js
function topKFrequent(nums, k) {
  const count = new Map();
  for (const n of nums) count.set(n, (count.get(n) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [n, c] of count) buckets[c].push(n);
  const res = [];
  for (let c = buckets.length - 1; c > 0 && res.length < k; c--) res.push(...buckets[c]);
  return res.slice(0, k);
}
topKFrequent([1, 1, 1, 2, 2, 3], 2); // [1, 2]
\`\`\``,
  },
  {
    ...dsa,
    id: 'dsa-kth-largest-heap',
    section: 'Arrays & hashing',
    question: 'Find the Kth largest element — and how does a heap work?',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `A **heap** is a complete binary tree stored in an array, where every parent is smaller (min-heap) or larger (max-heap) than its children. So the **min or max is always at index 0**. Children of index i are at \`2i+1\` and \`2i+2\`, and the parent is at \`(i-1) >> 1\`. **Push and pop are O(log n)** (sift up or down), and **peek is O(1)**.

**Kth largest**: keep a **min-heap of size k**. Push each number; if the size exceeds k, pop the smallest. At the end the top of the heap is the k-th largest. **O(n log k)** time, O(k) space.

Alternatives: sort, O(n log n); or **Quickselect**, O(n) on average.

JavaScript has no built-in heap, so in an interview I either write a small one (below) or say I'd use a library.`,
    analogy: `A "top-k" leaderboard with exactly k seats: a newcomer only gets in by beating the weakest person currently seated, who is always sitting by the door (the heap root).`,
    quickRevision: ['Heap: array-based tree, min/max at index 0', 'children 2i+1, 2i+2; parent (i-1)>>1', 'push/pop O(log n), peek O(1)', 'Kth largest: min-heap of size k → O(n log k)', 'Quickselect O(n) avg'],
    followUps: ['Find the median of a data stream (two heaps).', 'Merge k sorted lists.', 'Explain Quickselect.'],
    deepDive: `\`\`\`js
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(v) {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

function findKthLargest(nums, k) {
  const heap = new MinHeap();
  for (const n of nums) {
    heap.push(n);
    if (heap.size > k) heap.pop();
  }
  return heap.peek();
}
findKthLargest([3, 2, 1, 5, 6, 4], 2); // 5
\`\`\``,
  },

  // ================================================================ Linked lists & stacks
  {
    ...dsa,
    id: 'dsa-remove-nth-from-end',
    section: 'Linked lists & stacks',
    question: 'Remove the Nth node from the end of a linked list (one pass).',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `Use **two pointers with a gap of n**:

1. Start both at a **dummy node** placed before the head. This handles removing the head itself.
2. Move \`fast\` **n + 1** steps ahead.
3. Move both together until \`fast\` is null. Now \`slow\` is right **before** the node to remove.
4. \`slow.next = slow.next.next\`, then return \`dummy.next\`.

**O(n) time, O(1) space**, in one pass.`,
    analogy: `Two people walking along a path holding a rope of fixed length: when the front person reaches the end, the back person is exactly that distance from the end.`,
    quickRevision: ['Dummy node before head', 'fast moves n+1 ahead', 'Move together until fast is null', 'slow.next = slow.next.next', 'O(n), O(1)'],
    followUps: ['Find the middle node in one pass.', 'Why does the dummy node help?'],
    deepDive: `\`\`\`js
function removeNthFromEnd(head, n) {
  const dummy = { next: head };
  let fast = dummy, slow = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}
\`\`\``,
    relatedCollected: ['javascript/coding-round-solutions/reverse-linked-list--detect-cycle--merge-two-sorted-lists'],
  },
  {
    ...dsa,
    id: 'dsa-min-stack',
    section: 'Linked lists & stacks',
    question: 'Design a Min Stack (push, pop, top, getMin all in O(1)).',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `The trick is to **store the minimum alongside each element**. When pushing x, store \`{ x, min: Math.min(x, currentMin) }\`. Then \`getMin()\` is just the top entry's \`min\`, and popping automatically **restores the previous minimum**, because each entry remembers the minimum at the time it was pushed.

All operations are **O(1)**, with O(n) space. An alternative is a second stack that only pushes when a new value is ≤ the current min.`,
    analogy: `Each plate in a stack has a sticky note saying "the lightest plate at or below me". You never need to search; you read the note on the top plate.`,
    quickRevision: ['Store min with each entry', 'getMin = top.min', 'Pop restores previous min automatically', 'All O(1); alt: auxiliary min stack'],
    followUps: ['Design a max stack that also supports popMax.', 'Implement a queue using two stacks.'],
    deepDive: `\`\`\`js
class MinStack {
  #items = [];
  push(x) {
    const min = this.#items.length ? Math.min(x, this.getMin()) : x;
    this.#items.push({ x, min });
  }
  pop() { return this.#items.pop()?.x; }
  top() { return this.#items.at(-1)?.x; }
  getMin() { return this.#items.at(-1)?.min; }
}
\`\`\``,
  },
  {
    ...dsa,
    id: 'dsa-daily-temperatures',
    section: 'Linked lists & stacks',
    question: 'Daily Temperatures: how many days until a warmer day? (Monotonic stack)',
    difficulty: 'medium',
    frequency: 'medium',
    tags: ['dsa', 'javascript'],
    answer: `Brute force looks ahead from every day: **O(n²)**.

A **monotonic stack** of **indexes** whose temperatures are **decreasing** solves it in one pass. For each day i: while today is warmer than the day on top of the stack, pop that index j and set \`answer[j] = i - j\` (today is its next warmer day). Then push i. Days left on the stack never get a warmer day, so they stay 0.

Each index is pushed and popped at most once, so it's **O(n)**. This is the template for every "**next greater / smaller element**" problem.`,
    analogy: `People in a queue waiting for someone taller to arrive: when a tall person walks in, everyone shorter at the back of the waiting line gets their answer and leaves.`,
    quickRevision: ['Stack of indexes, temperatures decreasing', 'Warmer day pops and answers earlier days', 'Each index pushed/popped once → O(n)', 'Template for "next greater element"'],
    followUps: ['Next greater element in a circular array?', 'Largest rectangle in a histogram?'],
    deepDive: `\`\`\`js
function dailyTemperatures(t) {
  const res = new Array(t.length).fill(0);
  const stack = []; // indexes, temperatures decreasing
  for (let i = 0; i < t.length; i++) {
    while (stack.length && t[i] > t[stack.at(-1)]) {
      const j = stack.pop();
      res[j] = i - j;
    }
    stack.push(i);
  }
  return res;
}
dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]); // [1, 1, 4, 2, 1, 1, 0, 0]
\`\`\``,
  },

  // ================================================================ Trees & graphs
  {
    ...dsa,
    id: 'dsa-bfs-vs-dfs',
    section: 'Trees & graphs',
    perspective: 'concept',
    question: 'BFS vs DFS — when do you use each?',
    difficulty: 'medium',
    frequency: 'very-high',
    tags: ['dsa', 'javascript'],
    answer: `- **BFS (breadth-first)** explores **level by level** using a **queue**. It finds the **shortest path in an unweighted** graph or grid (fewest steps), and suits level-order traversal and "minimum moves" problems. Memory is proportional to the widest level.
- **DFS (depth-first)** goes **as deep as possible**, then backtracks, using **recursion or a stack**. Use it for exploring everything: connected components, number of islands, cycle detection, topological sort, path existence, and backtracking problems. Memory is proportional to depth (beware of recursion limits on huge inputs).

Both are **O(V + E)**, and both need a **visited set** in graphs with cycles.

In JavaScript, avoid \`queue.shift()\` in BFS (it's O(n)). Use an index pointer instead.`,
    analogy: `BFS is ripples spreading out from a stone in a pond: you reach the closest places first. DFS is exploring a maze by following one corridor to the end before trying the next.`,
    quickRevision: ['BFS: queue, levels, shortest path (unweighted)', 'DFS: stack/recursion, explore all, cycles, topo sort', 'Both O(V + E); visited set', 'Weighted shortest path → Dijkstra', 'Avoid shift(); use an index pointer'],
    followUps: ['Shortest path in a weighted graph?', 'Number of islands with BFS vs DFS?', 'Why can DFS overflow the stack?'],
    deepDive: `\`\`\`js
// BFS: shortest number of steps in an unweighted graph
function shortestPath(graph, start, target) {
  const queue = [[start, 0]];
  const seen = new Set([start]);
  for (let i = 0; i < queue.length; i++) {   // index pointer instead of shift()
    const [node, dist] = queue[i];
    if (node === target) return dist;
    for (const next of graph[node] ?? []) {
      if (!seen.has(next)) { seen.add(next); queue.push([next, dist + 1]); }
    }
  }
  return -1;
}
\`\`\``,
    relatedCollected: ['javascript/coding-round-solutions/number-of-islands-grid-dfs--orows--cols'],
  },
  {
    ...dsa,
    id: 'dsa-lca-bst',
    section: 'Trees & graphs',
    question: 'Lowest Common Ancestor of two nodes in a binary search tree.',
    difficulty: 'medium',
    frequency: 'medium',
    tags: ['dsa', 'javascript'],
    answer: `Use the **BST ordering**. Start at the root:

- if **both** values are smaller than the node, the LCA is in the **left** subtree;
- if **both** are larger, go **right**;
- otherwise they **split** here (or one equals the node), so **this node is the LCA**.

That's **O(h)** time (h = height: log n if balanced, n if skewed) and O(1) space iteratively.

For a **general binary tree** (no ordering): recurse into both sides. If both return a node, the current node is the LCA; otherwise pass up the non-null result. That's O(n).`,
    analogy: `Two people's addresses in a sorted street directory: you walk down from the city to the district to the street, and the last point where their routes are still the same is their common ancestor.`,
    quickRevision: ['Both smaller → left; both larger → right', 'Otherwise current node is the LCA', 'O(h) time, O(1) space', 'General tree: recursive, O(n)'],
    followUps: ['Solve it for a general binary tree.', 'What if one node might not exist?'],
    deepDive: `\`\`\`js
function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node;
  }
  return null;
}
\`\`\``,
    relatedCollected: ['javascript/coding-round-solutions/trees-max-depth-invert-level-order-validate-bst'],
  },
  {
    ...dsa,
    id: 'dsa-course-schedule-topological-sort',
    section: 'Trees & graphs',
    question: 'Course Schedule: can all courses be finished? (Cycle detection / topological sort)',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `Model courses as a **directed graph** (prerequisite → course). All courses can be finished **only if there's no cycle**.

**Kahn's algorithm** (BFS topological sort):

1. Build adjacency lists and count each course's **in-degree** (number of prerequisites).
2. Queue every course with in-degree 0.
3. Pop a course, count it as done, and decrement its neighbours' in-degree; when one hits 0, queue it.
4. If done === numCourses, it's possible; otherwise there's a cycle.

**O(V + E)**. The order of popping is a valid study order (Course Schedule II). A DFS with three colours (unvisited / visiting / done) also detects cycles.

Real-world uses: build systems, task dependencies, migration ordering.`,
    analogy: `Getting dressed: socks before shoes, shirt before jacket. You keep putting on anything with no remaining "before" items; if you ever get stuck with items left, the rules contradict each other (a cycle).`,
    quickRevision: ['Directed graph; possible iff no cycle', "Kahn's: in-degrees + queue of 0s", 'Processed count === n → OK', 'Pop order = valid ordering', 'O(V + E); DFS 3-colour alternative'],
    followUps: ['Return the order of courses.', 'Detect the cycle with DFS instead.', 'How would you parallelise independent tasks?'],
    deepDive: `\`\`\`js
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) { graph[pre].push(course); indegree[course]++; }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i);
  let done = 0;
  for (let i = 0; i < queue.length; i++) {
    done++;
    for (const next of graph[queue[i]]) if (--indegree[next] === 0) queue.push(next);
  }
  return done === numCourses;
}
canFinish(2, [[1, 0]]);         // true
canFinish(2, [[1, 0], [0, 1]]); // false (cycle)
\`\`\``,
  },

  // ================================================================ Searching & recursion
  {
    ...dsa,
    id: 'dsa-search-rotated-array',
    section: 'Searching & recursion',
    question: 'Search in a Rotated Sorted Array in O(log n).',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `It's still **binary search**. The key insight: after splitting at \`mid\`, **at least one half is always sorted**.

- If \`nums[lo] <= nums[mid]\`, the **left half is sorted**. If the target lies within \`[nums[lo], nums[mid])\`, search left; otherwise search right.
- Otherwise the **right half is sorted**. If the target is within \`(nums[mid], nums[hi]]\`, search right; otherwise search left.

**O(log n) time, O(1) space.** Edge cases: a single element, no rotation, the target at the boundaries. With duplicates the worst case becomes O(n).`,
    analogy: `A sorted bookshelf that someone cut and swapped the two halves of: whichever half you look at, one side is still in perfect order, so you can tell whether your book could be there.`,
    quickRevision: ['Binary search; one half always sorted', 'Left sorted if nums[lo] <= nums[mid]', 'Check if target in the sorted half', 'O(log n); duplicates → worst O(n)'],
    followUps: ['Find the minimum in a rotated sorted array.', 'What changes with duplicates?'],
    deepDive: `\`\`\`js
function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {              // left half sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                  // right half sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
search([4, 5, 6, 7, 0, 1, 2], 0); // 4
\`\`\``,
    relatedCollected: ['javascript/coding-round-solutions/binary-search--olog-n'],
  },
  {
    ...dsa,
    id: 'dsa-subsets-permutations-backtracking',
    section: 'Searching & recursion',
    question: 'Generate all subsets and permutations (backtracking).',
    difficulty: 'medium',
    frequency: 'high',
    tags: ['dsa', 'javascript'],
    answer: `**Backtracking** = build a solution step by step: **choose → explore (recurse) → un-choose**. One shared \`path\` array is modified and restored.

- **Subsets**: at each call, **record a copy of the current path**, then try adding each remaining element **from \`start\` onwards** (so each combination appears once). That gives **2ⁿ** subsets, O(n · 2ⁿ) time including copies.
- **Permutations**: each position can be any **unused** element. Track a \`used\` array, and record a copy when the path length equals n. That gives **n!** permutations.

With duplicate inputs, sort first and skip an element equal to the previous one at the same level. Add pruning (e.g. for combination sum) to cut branches early.`,
    analogy: `Trying on outfits: pick a shirt, then try every pair of trousers with it, then take the shirt off and try the next one. Undoing the last choice before trying another is the "backtrack".`,
    quickRevision: ['Choose → recurse → un-choose', 'Subsets: record every path; loop from start → 2ⁿ', 'Permutations: used[]; record at length n → n!', 'Copy the path when recording', 'Duplicates: sort + skip same value at same level'],
    followUps: ['Combination Sum: choose numbers that add to a target.', 'Generate valid parentheses.', 'N-Queens: how does pruning help?'],
    deepDive: `\`\`\`js
function subsets(nums) {
  const res = [], path = [];
  (function backtrack(start) {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);
      path.pop();
    }
  })(0);
  return res;
}

function permutations(nums) {
  const res = [], path = [], used = new Array(nums.length).fill(false);
  (function backtrack() {
    if (path.length === nums.length) return void res.push([...path]);
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      backtrack();
      path.pop(); used[i] = false;
    }
  })();
  return res;
}
\`\`\``,
  },
  {
    ...dsa,
    id: 'dsa-longest-common-subsequence',
    section: 'Searching & recursion',
    question: 'Longest Common Subsequence (2D dynamic programming).',
    difficulty: 'hard',
    frequency: 'medium',
    tags: ['dsa', 'javascript'],
    answer: `**State**: \`dp[i][j]\` = the LCS length of the first i characters of \`a\` and the first j characters of \`b\`.

**Recurrence**:

- if \`a[i-1] === b[j-1]\`: \`dp[i][j] = dp[i-1][j-1] + 1\` (extend the match);
- otherwise: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\` (skip a character from one string).

**Base case**: row and column 0 are 0. The answer is \`dp[m][n]\`.

**O(m·n) time and space.** Space can be reduced to O(min(m, n)) with two rows. Backtrack through the table to recover the actual subsequence.

It's the classic 2D DP pattern behind **diff tools** (git diff), edit distance and DNA alignment.`,
    analogy: `Comparing two versions of an essay line by line in a grid: each cell answers "how much matches so far?" using the cells just above and to the left, which is exactly how diff tools find unchanged lines.`,
    quickRevision: ['dp[i][j] = LCS of prefixes', 'Match → diagonal + 1', 'No match → max(up, left)', 'O(m·n); 2-row space optimisation', 'Basis of diff / edit distance'],
    followUps: ['Edit distance (Levenshtein)?', 'Return the subsequence itself.', 'Longest increasing subsequence?'],
    deepDive: `\`\`\`js
function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}
lcs('abcde', 'ace'); // 3 ("ace")
\`\`\``,
    relatedCollected: ['javascript/coding-round-solutions/dynamic-programming-climbing-stairs-house-robber-coin-change'],
  },
]);
