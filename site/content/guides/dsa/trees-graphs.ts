import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Trees & Graphs',
  description: 'BFS vs DFS, BSTs and topological sort.',
  questions: [
    {
      id: 'dsa-bfs-vs-dfs',
      question: 'BFS vs DFS — when do you use each?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['dsa', 'javascript'],
      answer: `- **BFS (breadth-first)** explores **level by level** using a **queue**. It finds the **shortest path in an unweighted** graph or grid (fewest steps), and suits level-order traversal and "minimum moves" problems. Memory is proportional to the widest level.
- **DFS (depth-first)** goes **as deep as possible**, then backtracks, using **recursion or a stack**. Use it for exploring everything: connected components, number of islands, cycle detection, topological sort, path existence, and backtracking problems. Memory is proportional to depth (beware of recursion limits on huge inputs).

Both are **O(V + E)**, and both need a **visited set** in graphs with cycles.

In JavaScript, avoid \`queue.shift()\` in BFS (it's O(n)). Use an index pointer instead.`,
      analogy: `BFS is ripples spreading out from a stone in a pond: you reach the closest places first. DFS is exploring a maze by following one corridor to the end before trying the next.`,
      quickRevision: [
        'BFS: queue, levels, shortest path (unweighted)',
        'DFS: stack/recursion, explore all, cycles, topo sort',
        'Both O(V + E); visited set',
        'Weighted shortest path → Dijkstra',
        'Avoid shift(); use an index pointer',
      ],
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
      followUps: [
        'Shortest path in a weighted graph?',
        'Number of islands with BFS vs DFS?',
        'Why can DFS overflow the stack?',
      ],
    },
    {
      id: 'dsa-lca-bst',
      question: 'Lowest Common Ancestor of two nodes in a binary search tree.',
      perspective: 'coding',
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
      quickRevision: [
        'Both smaller → left; both larger → right',
        'Otherwise current node is the LCA',
        'O(h) time, O(1) space',
        'General tree: recursive, O(n)',
      ],
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
      followUps: [
        'Solve it for a general binary tree.',
        'What if one node might not exist?',
      ],
    },
    {
      id: 'dsa-course-schedule-topological-sort',
      question: 'Course Schedule: can all courses be finished? (Cycle detection / topological sort)',
      perspective: 'coding',
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
      quickRevision: [
        'Directed graph; possible iff no cycle',
        'Kahn\'s: in-degrees + queue of 0s',
        'Processed count === n → OK',
        'Pop order = valid ordering',
        'O(V + E); DFS 3-colour alternative',
      ],
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
      followUps: [
        'Return the order of courses.',
        'Detect the cycle with DFS instead.',
        'How would you parallelise independent tasks?',
      ],
    },
  ],
});
