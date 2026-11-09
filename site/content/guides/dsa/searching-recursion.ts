import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Searching & Recursion',
  description: 'Binary search variants, backtracking and dynamic programming.',
  questions: [
    {
      id: 'dsa-search-rotated-array',
      question: 'Search in a Rotated Sorted Array in O(log n).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa', 'javascript'],
      answer: `It's still **binary search**. The key insight: after splitting at \`mid\`, **at least one half is always sorted**.

- If \`nums[lo] <= nums[mid]\`, the **left half is sorted**. If the target lies within \`[nums[lo], nums[mid])\`, search left; otherwise search right.
- Otherwise the **right half is sorted**. If the target is within \`(nums[mid], nums[hi]]\`, search right; otherwise search left.

**O(log n) time, O(1) space.** Edge cases: a single element, no rotation, the target at the boundaries. With duplicates the worst case becomes O(n).`,
      analogy: `A sorted bookshelf that someone cut and swapped the two halves of: whichever half you look at, one side is still in perfect order, so you can tell whether your book could be there.`,
      quickRevision: [
        'Binary search; one half always sorted',
        'Left sorted if nums[lo] <= nums[mid]',
        'Check if target in the sorted half',
        'O(log n); duplicates → worst O(n)',
      ],
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
      followUps: [
        'Find the minimum in a rotated sorted array.',
        'What changes with duplicates?',
      ],
    },
    {
      id: 'dsa-subsets-permutations-backtracking',
      question: 'Generate all subsets and permutations (backtracking).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa', 'javascript'],
      answer: `**Backtracking** = build a solution step by step: **choose → explore (recurse) → un-choose**. One shared \`path\` array is modified and restored.

- **Subsets**: at each call, **record a copy of the current path**, then try adding each remaining element **from \`start\` onwards** (so each combination appears once). That gives **2ⁿ** subsets, O(n · 2ⁿ) time including copies.
- **Permutations**: each position can be any **unused** element. Track a \`used\` array, and record a copy when the path length equals n. That gives **n!** permutations.

With duplicate inputs, sort first and skip an element equal to the previous one at the same level. Add pruning (e.g. for combination sum) to cut branches early.`,
      analogy: `Trying on outfits: pick a shirt, then try every pair of trousers with it, then take the shirt off and try the next one. Undoing the last choice before trying another is the "backtrack".`,
      quickRevision: [
        'Choose → recurse → un-choose',
        'Subsets: record every path; loop from start → 2ⁿ',
        'Permutations: used[]; record at length n → n!',
        'Copy the path when recording',
        'Duplicates: sort + skip same value at same level',
      ],
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
      followUps: [
        'Combination Sum: choose numbers that add to a target.',
        'Generate valid parentheses.',
        'N-Queens: how does pruning help?',
      ],
    },
    {
      id: 'dsa-longest-common-subsequence',
      question: 'Longest Common Subsequence (2D dynamic programming).',
      perspective: 'coding',
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
      quickRevision: [
        'dp[i][j] = LCS of prefixes',
        'Match → diagonal + 1',
        'No match → max(up, left)',
        'O(m·n); 2-row space optimisation',
        'Basis of diff / edit distance',
      ],
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
      followUps: [
        'Edit distance (Levenshtein)?',
        'Return the subsequence itself.',
        'Longest increasing subsequence?',
      ],
    },
  ],
});
