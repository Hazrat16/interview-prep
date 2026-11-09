import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Arrays & Hashing',
  description: 'Two pointers, sliding window, prefix sums, hash maps and heaps.',
  questions: [
    {
      id: 'dsa-best-time-buy-sell-stock',
      question: 'Best Time to Buy and Sell Stock: find the maximum profit from one buy and one sell.',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['dsa', 'javascript'],
      answer: `Brute force checks every buy/sell pair: **O(n²)**.

Better, in **one pass**: walk through the prices, keeping the **lowest price seen so far**. At each day, the best profit if I sell today is \`price - minSoFar\`. Track the maximum of that. If prices only fall, the answer is 0 (don't trade).

**O(n) time, O(1) space.** It's essentially a greedy approach, or Kadane's algorithm on the daily differences.`,
      analogy: `Walking through a market week with a notebook: you note the cheapest price you've seen so far, and each day ask "if I sold today, how much would I make?", remembering only the best answer.`,
      quickRevision: [
        'Track minimum price so far',
        'Profit today = price - min',
        'Keep the max profit',
        'O(n) time, O(1) space; 0 if prices only fall',
      ],
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
      followUps: [
        'What if you can make unlimited transactions?',
        'What if there is a transaction fee or cooldown?',
      ],
    },
    {
      id: 'dsa-product-except-self',
      question: 'Product of Array Except Self (without division).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa', 'javascript'],
      answer: `For each index, the answer is (**product of everything to its left**) × (**product of everything to its right**).

1. First pass, left to right: \`out[i]\` = running product of the elements before i.
2. Second pass, right to left: multiply \`out[i]\` by a running product of the elements after i.

No division is needed, so **zeros are handled naturally**. **O(n) time**, and **O(1) extra space** if the output array doesn't count.`,
      analogy: `To know everyone's share except their own, you ask the people to your left for their combined total, then the people to your right, and multiply the two.`,
      quickRevision: [
        'answer[i] = prefix product × suffix product',
        'Pass 1: prefix into output',
        'Pass 2: multiply by running suffix',
        'No division; O(n) time, O(1) extra',
      ],
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
      followUps: [
        'Why not just divide the total product by nums[i]?',
        'How do zeros affect the division approach?',
      ],
    },
    {
      id: 'dsa-three-sum',
      question: '3Sum: find all unique triplets that sum to zero.',
      perspective: 'coding',
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
      quickRevision: [
        'Sort first',
        'Fix i, two pointers on the rest',
        'Too small → l++, too big → r--',
        'Skip duplicates at i, l, r',
        'O(n²)',
      ],
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
      followUps: [
        'Generalise to 4Sum / kSum.',
        'How would you do 3Sum closest to a target?',
      ],
    },
    {
      id: 'dsa-top-k-frequent',
      question: 'Top K Frequent Elements: return the k most frequent numbers.',
      perspective: 'coding',
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
      quickRevision: [
        'Count with a Map',
        'Sort O(n log n) / heap O(n log k) / buckets O(n)',
        'Buckets: index = frequency',
        'Walk buckets from high to low',
      ],
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
      followUps: [
        'What if the data is a stream?',
        'Top k frequent words with alphabetical tie-break?',
      ],
    },
    {
      id: 'dsa-kth-largest-heap',
      question: 'Find the Kth largest element — and how does a heap work?',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa', 'javascript'],
      answer: `A **heap** is a complete binary tree stored in an array, where every parent is smaller (min-heap) or larger (max-heap) than its children. So the **min or max is always at index 0**. Children of index i are at \`2i+1\` and \`2i+2\`, and the parent is at \`(i-1) >> 1\`. **Push and pop are O(log n)** (sift up or down), and **peek is O(1)**.

**Kth largest**: keep a **min-heap of size k**. Push each number; if the size exceeds k, pop the smallest. At the end the top of the heap is the k-th largest. **O(n log k)** time, O(k) space.

Alternatives: sort, O(n log n); or **Quickselect**, O(n) on average.

JavaScript has no built-in heap, so in an interview I either write a small one (below) or say I'd use a library.`,
      analogy: `A "top-k" leaderboard with exactly k seats: a newcomer only gets in by beating the weakest person currently seated, who is always sitting by the door (the heap root).`,
      quickRevision: [
        'Heap: array-based tree, min/max at index 0',
        'children 2i+1, 2i+2; parent (i-1)>>1',
        'push/pop O(log n), peek O(1)',
        'Kth largest: min-heap of size k → O(n log k)',
        'Quickselect O(n) avg',
      ],
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
      followUps: [
        'Find the median of a data stream (two heaps).',
        'Merge k sorted lists.',
        'Explain Quickselect.',
      ],
    },
  ],
});
