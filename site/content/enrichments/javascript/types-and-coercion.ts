import { defineEnrichments } from '../../../lib/content/enrich-schema';

export default defineEnrichments('javascript/types-and-coercion.md', {
  'primitive-vs-reference-types': {
    difficulty: 'easy',
    frequency: 'high',
    analogy: 'Primitives are like writing a number on a sticky note and handing over a copy; objects are like sharing a Google Doc link, so everyone with the link edits the same document.',
    quickRevision: [
      'Primitives: string, number, bigint, boolean, undefined, null, symbol',
      'Primitives are immutable and copied by value',
      'Objects/arrays/functions are shared by reference',
      'Comparing objects compares references, not contents',
    ],
    followUps: ['Why is `{} === {}` false?', 'How do you compare two objects by value?'],
  },
  'difference-between--and-': {
    difficulty: 'easy',
    frequency: 'very-high',
    analogy: '`===` checks the item and its label; `==` first tries to translate both into the same language, sometimes with surprising translations.',
    quickRevision: [
      '`===` no type conversion; `==` converts first',
      '`null == undefined` is true; nothing else equals them loosely',
      '`0 == ""` and `[1] == "1"` are true',
      'Always use `===`, except `x == null` as a shortcut',
    ],
    followUps: ['What is `NaN === NaN`?', 'What does `Object.is` do differently?'],
  },
  'why-is-typeof-null-object': {
    difficulty: 'easy',
    analogy: 'A mislabelled box from the very first shipment that can\'t be relabelled now without breaking every warehouse that relies on it.',
    quickRevision: [
      'A bug from the first JS implementation (type tag 0)',
      'Kept for backward compatibility',
      'Check null with `value === null`',
    ],
    followUps: ['What is `typeof NaN`?', 'How do you reliably check for an array?'],
  },
  'shallow-copy-vs-deep-copy': {
    difficulty: 'medium',
    frequency: 'very-high',
    analogy: 'A shallow copy photocopies the folder\'s cover page but the inner documents are still the originals; a deep copy photocopies every page inside too.',
    quickRevision: [
      'Shallow: `{...obj}`, `[...arr]`, `Object.assign`',
      'Nested objects are still shared in a shallow copy',
      'Deep: `structuredClone(obj)` (handles Dates, Maps, cycles)',
      '`JSON.parse(JSON.stringify())` loses Dates, undefined, functions',
    ],
    followUps: ['Implement a deep clone.', 'Why does React state need new references?'],
  },
  'pass-by-value-vs-pass-by-reference-in-js': {
    difficulty: 'medium',
    frequency: 'high',
    analogy: 'JS hands you a copy of the address card, not the house: you can repaint the house (mutate), but writing a new address on your card doesn\'t move the caller\'s house.',
    quickRevision: [
      'JS is always pass-by-value',
      'For objects, the value is a reference',
      'Mutating the object is visible to the caller',
      'Reassigning the parameter is not',
    ],
    followUps: ['Predict the output of a function that mutates then reassigns its argument.', 'How do you avoid accidental mutation?'],
  },
});
