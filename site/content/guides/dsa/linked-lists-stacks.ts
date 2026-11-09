import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Linked Lists & Stacks',
  description: 'Fast/slow pointers, monotonic stacks and classic list problems.',
  questions: [
    {
      id: 'dsa-remove-nth-from-end',
      question: 'Remove the Nth node from the end of a linked list (one pass).',
      perspective: 'coding',
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
      quickRevision: [
        'Dummy node before head',
        'fast moves n+1 ahead',
        'Move together until fast is null',
        'slow.next = slow.next.next',
        'O(n), O(1)',
      ],
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
      followUps: [
        'Find the middle node in one pass.',
        'Why does the dummy node help?',
      ],
    },
    {
      id: 'dsa-min-stack',
      question: 'Design a Min Stack (push, pop, top, getMin all in O(1)).',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['dsa', 'javascript'],
      answer: `The trick is to **store the minimum alongside each element**. When pushing x, store \`{ x, min: Math.min(x, currentMin) }\`. Then \`getMin()\` is just the top entry's \`min\`, and popping automatically **restores the previous minimum**, because each entry remembers the minimum at the time it was pushed.

All operations are **O(1)**, with O(n) space. An alternative is a second stack that only pushes when a new value is ≤ the current min.`,
      analogy: `Each plate in a stack has a sticky note saying "the lightest plate at or below me". You never need to search; you read the note on the top plate.`,
      quickRevision: [
        'Store min with each entry',
        'getMin = top.min',
        'Pop restores previous min automatically',
        'All O(1); alt: auxiliary min stack',
      ],
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
      followUps: [
        'Design a max stack that also supports popMax.',
        'Implement a queue using two stacks.',
      ],
    },
    {
      id: 'dsa-daily-temperatures',
      question: 'Daily Temperatures: how many days until a warmer day? (Monotonic stack)',
      perspective: 'coding',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['dsa', 'javascript'],
      answer: `Brute force looks ahead from every day: **O(n²)**.

A **monotonic stack** of **indexes** whose temperatures are **decreasing** solves it in one pass. For each day i: while today is warmer than the day on top of the stack, pop that index j and set \`answer[j] = i - j\` (today is its next warmer day). Then push i. Days left on the stack never get a warmer day, so they stay 0.

Each index is pushed and popped at most once, so it's **O(n)**. This is the template for every "**next greater / smaller element**" problem.`,
      analogy: `People in a queue waiting for someone taller to arrive: when a tall person walks in, everyone shorter at the back of the waiting line gets their answer and leaves.`,
      quickRevision: [
        'Stack of indexes, temperatures decreasing',
        'Warmer day pops and answers earlier days',
        'Each index pushed/popped once → O(n)',
        'Template for "next greater element"',
      ],
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
      followUps: [
        'Next greater element in a circular array?',
        'Largest rectangle in a histogram?',
      ],
    },
  ],
});
