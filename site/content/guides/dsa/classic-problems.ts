import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Classic Problems in JS',
  description: 'Common coding-round problems with JavaScript solutions and complexity.',
  questions: [
    {
      id: 'two-sum-hash-map-on',
      question: 'Two Sum: find two numbers that add up to a target in O(n).',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['dsa'],
      answer: `Brute force is O(n²) with two loops. Better: one pass with a **Map from value to index**. For each number, compute \`need = target - num\`. If \`need\` is already in the map, return both indexes; otherwise store the current number. That's **O(n) time, O(n) space**. Check the number **before** inserting it so the same element isn't used twice.`,
      analogy: `Looking for a dance partner whose height fits: instead of comparing everyone with everyone, each person writes their height on a board, and you just check the board for the height you need.`,
      quickRevision: [
        'Map value → index',
        'Check `target - num` before inserting',
        'O(n) time, O(n) space',
        'Brute force O(n²) to mention first',
      ],
      deepDive: `\`\`\`js
function twoSum(nums, target) {
  const seen = new Map(); // value → index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
\`\`\``,
      followUps: [
        'What if the array is sorted? (two pointers, O(1) space)',
        'Return all pairs instead of one?',
      ],
    },
    {
      id: 'contains-duplicate-first-unique-character',
      question: 'Contains Duplicate, and First Unique Character in a string.',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['dsa'],
      answer: `**Contains duplicate**: add items to a \`Set\`, and if one is already there, return true. O(n). (Or compare \`new Set(arr).size !== arr.length\`.)

**First unique character**: first pass, count frequencies in a Map; second pass, return the first index whose count is 1. O(n) time, O(k) space for the alphabet.`,
      analogy: `A guest list at the door: if a name is already ticked, it's a duplicate. To find the first person who came alone, count everyone first, then walk the queue again.`,
      quickRevision: [
        'Set for "seen before"',
        'Frequency Map + second pass for first unique',
        'O(n) time',
      ],
      deepDive: `\`\`\`js
const containsDuplicate = (nums) => new Set(nums).size !== nums.length;

function firstUniqChar(s) {
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  for (let i = 0; i < s.length; i++) if (count[s[i]] === 1) return i;
  return -1;
}
\`\`\``,
      followUps: [
        'Solve without extra space?',
        'What changes for a stream of characters?',
      ],
    },
    {
      id: 'group-anagrams-on-k-log-k',
      question: 'Group Anagrams: group words that are anagrams of each other.',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa'],
      answer: `Anagrams share the same letters, so I give each word a **canonical key**: its sorted letters (\`'eat' → 'aet'\`). Group words in a \`Map<key, string[]>\` and return the values. Time is O(n · k log k) for sorting each word. An O(n · k) alternative uses a 26-letter count array joined into the key.`,
      analogy: `Sorting Scrabble tiles of each word alphabetically: words made of the same tiles end up with the identical tile row and land in the same pile.`,
      quickRevision: [
        'Key = sorted letters (or 26-count signature)',
        'Map key → list',
        'O(n·k log k) or O(n·k)',
      ],
      deepDive: `\`\`\`js
function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}
\`\`\``,
      followUps: [
        'Why is the count-array key faster?',
        'Handle Unicode or uppercase?',
      ],
    },
    {
      id: 'valid-anagram-valid-palindrome-two-pointers',
      question: 'Valid Anagram and Valid Palindrome (two pointers).',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['dsa'],
      answer: `**Valid anagram**: if the lengths differ, return false. Otherwise count characters up for the first string and down for the second, and every count must end at 0. O(n).

**Valid palindrome**: **two pointers** from both ends. Skip non-alphanumeric characters, compare lowercase characters, move inward, and return false on any mismatch. O(n) time, O(1) space.`,
      analogy: `Palindrome check is two people reading a word from opposite ends toward the middle, shouting if their letters ever differ.`,
      quickRevision: [
        'Anagram: length check + char counts',
        'Palindrome: two pointers inward',
        'Skip non-alphanumerics, lowercase',
        'O(n) time, O(1) space for palindrome',
      ],
      deepDive: `\`\`\`js
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  for (const ch of t) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0, r = clean.length - 1;
  while (l < r) if (clean[l++] !== clean[r--]) return false;
  return true;
}
\`\`\``,
      followUps: [
        'Valid palindrome if you can delete one character?',
        'Why not reverse the string?',
      ],
    },
    {
      id: 'container-with-most-water-two-pointers-on',
      question: 'Container With Most Water: find the max area in O(n).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['dsa'],
      answer: `Two pointers at both ends. Area = \`min(h[l], h[r]) * (r - l)\`; track the maximum. Then **move the shorter side** inward, because moving the taller one can never increase the area (the width shrinks and the height is still limited by the shorter line). O(n) time, O(1) space.`,
      analogy: `Two walls of a fish tank: the water level is set by the shorter wall, so the only hope of more water is replacing the shorter wall, not the taller one.`,
      quickRevision: [
        'Pointers at both ends',
        'Area = min height × width',
        'Move the shorter side',
        'O(n), O(1)',
      ],
      deepDive: `\`\`\`js
function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
    if (height[l] < height[r]) l++; else r--; // move the shorter side
  }
  return best;
}
\`\`\``,
      followUps: [
        'Prove why moving the shorter side is safe.',
        'Trapping Rain Water: how is it different?',
      ],
    },
    {
      id: 'longest-substring-without-repeating-characters-sliding-window-on',
      question: 'Longest Substring Without Repeating Characters (sliding window).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['dsa'],
      answer: `**Sliding window** with a Map of each character's last index. Move \`right\` across the string. If the character was seen **inside the current window**, jump \`left\` to \`lastIndex + 1\`. Update the last index and the best length \`right - left + 1\`. Each character is processed once, so it's O(n).`,
      analogy: `A train window sliding along the track: as soon as you see a repeat inside the window, you slide the back of the window forward past the old copy.`,
      quickRevision: [
        'Window [left, right]',
        'Map char → last index',
        'On repeat inside window: left = last + 1',
        'O(n) time',
      ],
      deepDive: `\`\`\`js
function lengthOfLongestSubstring(s) {
  const lastSeen = new Map();
  let start = 0, best = 0;
  for (let end = 0; end < s.length; end++) {
    const ch = s[end];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= start) start = lastSeen.get(ch) + 1;
    lastSeen.set(ch, end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}
\`\`\``,
      followUps: [
        'Why `Math.max(left, last + 1)`?',
        'Return the substring itself, not just the length?',
      ],
    },
    {
      id: 'max-sum-subarray-kadane-on',
      question: 'Maximum Subarray: find the largest sum of a contiguous subarray (Kadane).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa'],
      answer: `**Kadane's algorithm**: keep \`current\`, the best sum ending at this index, as \`max(num, current + num)\`. In other words, drop the running sum as soon as it would hurt. Track \`best = max(best, current)\`. Start both at the first element so all-negative arrays work. O(n), O(1).`,
      analogy: `Walking with a running bank balance: if your balance goes below the next deposit alone, you start fresh from that deposit.`,
      quickRevision: [
        'current = max(num, current + num)',
        'best = max(best, current)',
        'Init with first element (all negatives)',
        'O(n), O(1)',
      ],
      deepDive: `\`\`\`js
function maxSubArray(nums) {
  let current = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend or restart
    best = Math.max(best, current);
  }
  return best;
}
\`\`\``,
      followUps: [
        'Return the start and end indexes too.',
        'Max product subarray: what changes?',
      ],
    },
    {
      id: 'valid-parentheses-stack-on',
      question: 'Valid Parentheses: check that brackets are balanced.',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['dsa'],
      answer: `Use a **stack**. Push opening brackets. For a closing bracket, the top of the stack must be its matching opener (look it up in a map); otherwise return false. At the end the stack must be **empty**. O(n) time and space.`,
      analogy: `Russian dolls: every doll you open must be closed in reverse order, and the last doll opened is the first one closed.`,
      quickRevision: [
        'Push openers',
        'Closer must match the top',
        'Stack empty at the end',
        'O(n) time and space',
      ],
      deepDive: `\`\`\`js
function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    } else stack.push(ch);
  }
  return stack.length === 0;
}
\`\`\``,
      followUps: [
        'Minimum insertions to make it valid?',
        'Longest valid parentheses substring?',
      ],
    },
    {
      id: 'binary-search-olog-n',
      question: 'Implement binary search, and explain the off-by-one pitfalls.',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['dsa'],
      answer: `On a **sorted** array: \`lo = 0, hi = n - 1\`. While \`lo <= hi\`, take \`mid\`. If it equals the target, return it. If it's smaller, \`lo = mid + 1\`; otherwise \`hi = mid - 1\`. Return -1 if not found. O(log n). Watch for off-by-one errors and use \`lo + Math.floor((hi - lo) / 2)\` for mid. The same template finds the first or last occurrence and insert positions.`,
      analogy: `Finding a word in a dictionary: open in the middle, decide which half it's in, and throw the other half away.`,
      quickRevision: [
        'Requires sorted input',
        'lo <= hi; move lo/hi past mid',
        'O(log n)',
        'Variants: first/last occurrence, lower bound',
      ],
      deepDive: `\`\`\`js
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}
\`\`\``,
      followUps: [
        'Search in a rotated sorted array.',
        'Find the first position ≥ target.',
      ],
    },
    {
      id: 'reverse-linked-list-detect-cycle-merge-two-sorted-lists',
      question: 'Linked lists: reverse a list, detect a cycle, merge two sorted lists.',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa'],
      answer: `- **Reverse**: three pointers (\`prev\`, \`curr\`, \`next\`). Point \`curr.next\` back to \`prev\` and step forward. O(n), O(1).
- **Detect cycle**: Floyd's **slow/fast** pointers. If fast ever meets slow, there's a cycle; if fast reaches null, there isn't. O(1) space.
- **Merge two sorted lists**: a **dummy head** and a tail pointer. Attach the smaller node each time, then attach the rest. O(n + m).`,
      analogy: `Cycle detection is a runner and a walker on a track: on a loop, the runner eventually laps the walker; on a straight road, the runner just reaches the end.`,
      quickRevision: [
        'Reverse: prev/curr/next',
        'Cycle: slow 1 step, fast 2 steps',
        'Merge: dummy head + tail',
        'All O(1) extra space',
      ],
      deepDive: `\`\`\`js
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

function hasCycle(head) {           // Floyd's fast & slow pointers
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function mergeTwoLists(a, b) {
  const dummy = { next: null };
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}
\`\`\``,
      followUps: [
        'Find where the cycle starts.',
        'Reverse a list recursively.',
      ],
    },
    {
      id: 'trees-max-depth-invert-level-order-validate-bst',
      question: 'Trees: max depth, invert, level-order traversal, validate a BST.',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa'],
      answer: `- **Max depth**: recursion, \`1 + max(depth(left), depth(right))\`.
- **Invert**: swap left and right at every node (recursively, or with BFS).
- **Level order**: **BFS with a queue**, processing \`queue.length\` nodes per level.
- **Validate BST**: pass down a valid **(min, max) range**, not just compare with the parent. Each node must satisfy \`min < val < max\`.

All are O(n). The recursion depth is the tree height.`,
      analogy: `Validating a BST is like checking seat numbers in a theatre section: each seat must fit inside the whole section's range, not just be bigger than the seat next to it.`,
      quickRevision: [
        'Depth: 1 + max(left, right)',
        'Invert: swap children',
        'Level order: queue, size per level',
        'BST: carry (min, max) bounds',
      ],
      deepDive: `\`\`\`js
const maxDepth = (root) => (root ? 1 + Math.max(maxDepth(root.left), maxDepth(root.right)) : 0);

function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}

function levelOrder(root) {          // BFS
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const size = queue.length, level = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

function isValidBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true;
  if (node.val <= min || node.val >= max) return false;
  return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
}
\`\`\``,
      followUps: [
        'Why does comparing only with the parent fail for BST validation?',
        'Iterative inorder traversal?',
      ],
    },
    {
      id: 'number-of-islands-grid-dfs-orows-cols',
      question: 'Number of Islands: count connected land cells in a grid.',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa'],
      answer: `Scan every cell. When I find land ('1'), increment the count and **flood-fill** (DFS or BFS) to mark the whole island as visited, either by setting cells to '0' or with a visited set, exploring four directions with bounds checks. Every cell is visited a constant number of times, so it's O(rows × cols). Use BFS or an explicit stack for very large grids to avoid recursion limits.`,
      analogy: `Colouring a map: each time you find uncoloured land, you count a new island and paint all the land connected to it so you never count it twice.`,
      quickRevision: [
        'Scan cells; on land → count++ and flood fill',
        'Mark visited (mutate or Set)',
        '4 directions + bounds',
        'O(rows·cols)',
      ],
      deepDive: `\`\`\`js
function numIslands(grid) {
  let count = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') { count++; sink(r, c); }
    }
  }
  return count;
}
\`\`\``,
      followUps: [
        'Max area of an island?',
        'Do it without mutating the grid.',
      ],
    },
    {
      id: 'merge-intervals-on-log-n',
      question: 'Merge Intervals: merge all overlapping intervals.',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa'],
      answer: `**Sort by start time**. Walk through the intervals: if the current one starts **at or before** the end of the last merged interval, extend that end to \`max(lastEnd, currentEnd)\`; otherwise push a new interval. Sorting dominates, so O(n log n).`,
      analogy: `Merging meeting bookings in a calendar: sort them by start time, and any meeting that starts before the previous one ends is folded into the same block.`,
      quickRevision: [
        'Sort by start',
        'Overlap if start <= lastEnd',
        'Extend end with max',
        'O(n log n)',
      ],
      deepDive: `\`\`\`js
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (const [start, end] of intervals.slice(1)) {
    const last = result[result.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else result.push([start, end]);
  }
  return result;
}
\`\`\``,
      followUps: [
        'Insert a new interval into a sorted list.',
        'Minimum meeting rooms needed?',
      ],
    },
    {
      id: 'dynamic-programming-climbing-stairs-house-robber-coin-change',
      question: 'Dynamic programming: Climbing Stairs, House Robber and Coin Change.',
      perspective: 'coding',
      difficulty: 'hard',
      frequency: 'high',
      tags: ['dsa'],
      answer: `Same recipe each time: define the **state**, write the **recurrence**, set the **base cases**, then optimise memory.

- **Climbing stairs**: \`ways(n) = ways(n-1) + ways(n-2)\` (Fibonacci). Keep two variables, O(1) space.
- **House robber**: \`best(i) = max(best(i-1), best(i-2) + nums[i])\`, so at each house you either skip it or rob it.
- **Coin change** (minimum coins): \`dp[amount] = min(dp[amount - coin] + 1)\` over the coins, with \`dp[0] = 0\` and unreachable as Infinity → return -1.`,
      analogy: `Building a staircase of answers: each step's answer is made only from the answers of the steps just below it, so you never recompute anything.`,
      quickRevision: [
        'State → recurrence → base case → optimise',
        'Stairs: f(n-1) + f(n-2)',
        'Robber: max(skip, rob + i-2)',
        'Coins: dp[a] = min(dp[a-c] + 1)',
      ],
      deepDive: `\`\`\`js
function climbStairs(n) {           // ways(n) = ways(n-1) + ways(n-2)
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

function rob(nums) {                // best = max(skip this house, rob it + best two back)
  let prev = 0, curr = 0;
  for (const n of nums) [prev, curr] = [curr, Math.max(curr, prev + n)];
  return curr;
}

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
\`\`\``,
      followUps: [
        'Top-down memoisation vs bottom-up?',
        'Number of ways to make change (not minimum coins)?',
      ],
    },
    {
      id: 'strings-reverse-words-compression',
      question: 'Strings: reverse the words in a sentence, and compress repeated characters.',
      perspective: 'coding',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['dsa'],
      answer: `**Reverse words**: \`trim\`, split on runs of whitespace (\`/\\s+/\`), reverse, join with a single space. O(n).

**Compression** (\`'aaabbbbcc' → 'a3b4c2'\`): walk the string with a counter, append \`char + count\` when the character changes, and return the original string if the result isn't shorter. Build the result in an array and \`join\`, which is efficient.`,
      analogy: `Compression is like writing "3 apples, 4 bananas" on a shopping list instead of writing each fruit separately.`,
      quickRevision: [
        'Reverse words: trim + split(/\\s+/) + reverse + join',
        'Compression: count runs; return original if not shorter',
        'Use an array buffer, then join',
      ],
      deepDive: `\`\`\`js
const reverseWords = (s) => s.trim().split(/\\s+/).reverse().join(' ');

function compress(s) {              // "aaabbbbcc" → "a3b4c2" (returns s if not shorter)
  let out = '';
  for (let i = 0, count = 1; i < s.length; i++, count++) {
    if (s[i] !== s[i + 1]) { out += s[i] + count; count = 0; }
  }
  return out.length < s.length ? out : s;
}
\`\`\``,
      followUps: [
        'Reverse words in place (character array)?',
        'Decompress the string back?',
      ],
    },
    {
      id: 'sql-answers',
      question: 'Which SQL patterns solve the classic SQL-round questions?',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['sql'],
      answer: `The classic SQL-round questions map to a handful of patterns. Name them out loud:

- **Second / Nth highest**: \`MAX\` with a subquery, or \`DENSE_RANK()\` to handle ties.
- **Employee vs manager**: a **self join** on \`manager_id\`.
- **Groups with more than N**: \`GROUP BY … HAVING COUNT(*) > N\`.
- **Top N per group**: a window function (\`ROW_NUMBER() OVER (PARTITION BY …)\`).
- **Customers with no orders**: \`LEFT JOIN … WHERE o.id IS NULL\` (or \`NOT EXISTS\`).
- **Duplicates**: \`GROUP BY email HAVING COUNT(*) > 1\`.
- **Running totals**: \`SUM() OVER (ORDER BY …)\`.

Always clarify ties, NULLs and whether the result should include zero rows.`,
      analogy: `SQL questions are a small set of recipes (self join, GROUP BY + HAVING, window functions, anti-join); once you recognise which recipe a question needs, the query almost writes itself.`,
      quickRevision: [
        'Ties → DENSE_RANK',
        'Filter groups → HAVING',
        'Top N per group → ROW_NUMBER OVER PARTITION',
        'Missing rows → LEFT JOIN … IS NULL / NOT EXISTS',
        'Running total → SUM() OVER',
      ],
      deepDive: `Assume tables \`employees(id, name, salary, department_id, manager_id)\`, \`departments(id, name)\`, \`customers(id, name, email)\`, \`orders(id, customer_id, amount, created_at)\`.

\`\`\`sql
-- Second highest salary
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Nth highest (N = 3) with a window function (handles ties)
SELECT DISTINCT salary
FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees) t
WHERE rnk = 3;

-- Employees earning more than their manager (self join)
SELECT e.name
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;

-- Departments with more than 5 employees
SELECT d.name, COUNT(*) AS employee_count
FROM employees e
JOIN departments d ON d.id = e.department_id
GROUP BY d.name
HAVING COUNT(*) > 5;

-- Highest paid employee in each department (top N per group)
SELECT department_id, name, salary
FROM (
  SELECT e.*, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn
  FROM employees e
) t
WHERE rn = 1;

-- Customers with no orders
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- Duplicate emails
SELECT email, COUNT(*)
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;

-- Total order amount per customer per month
SELECT customer_id, DATE_TRUNC('month', created_at) AS month, SUM(amount) AS total
FROM orders
GROUP BY customer_id, month
ORDER BY month, total DESC;

-- Running total of orders (window)
SELECT id, created_at, amount,
       SUM(amount) OVER (ORDER BY created_at) AS running_total
FROM orders;
\`\`\`

Know the difference: \`WHERE\` filters rows **before** grouping, \`HAVING\` filters groups **after**. \`ROW_NUMBER\` is unique per row, \`RANK\` leaves gaps after ties, \`DENSE_RANK\` doesn't.

**MongoDB equivalent** (they may ask, since it's on your CV): total per customer, top 5

\`\`\`js
db.orders.aggregate([
  { $group: { _id: '$customer_id', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $limit: 5 },
  { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
  { $unwind: '$customer' },
  { $project: { _id: 0, name: '$customer.name', total: 1 } },
]);
\`\`\``,
      followUps: [
        'WHERE vs HAVING?',
        'RANK vs DENSE_RANK vs ROW_NUMBER?',
        'How would you index for these queries?',
      ],
    },
  ],
});
