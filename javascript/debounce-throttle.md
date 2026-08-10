# Debounce & Throttle

## Concept

Both limit how often a function runs during frequent events (scroll, resize, input, API typing).

| | Debounce | Throttle |
|-|----------|----------|
| Idea | Wait until activity **stops** | Run at most once per **interval** |
| Good for | Search input, autosave | Scroll handler, resize, mouse move |
| Behavior | Resets timer on every call | Guarantees periodic execution |

---

## Debounce mental model

> “Run this only after the user pauses.”

```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const onSearch = debounce((q) => {
  // API call
}, 300);
```

Typing `"react"` quickly should ideally trigger **one** search after the last keystroke.

---

## Throttle mental model

> “Run this at most every X ms while activity continues.”

```js
function throttle(fn, limit) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener("scroll", throttle(handleScroll, 200));
```

---

## Interview Q&A

### Q1: Debounce vs throttle?

**Answer:**

> Debounce delays execution until events stop for a given time — useful for search boxes. Throttle ensures a function runs at regular intervals during continuous events — useful for scroll or resize handlers.

---

### Q2: Where would you use each in a React app?

**Answer:**

> Debounce an API search-as-you-type input so we don’t hit the backend on every keystroke. Throttle a scroll listener that updates a sticky header or infinite-scroll check.

---

### Q3: Implement debounce (talk through it).

**Answer:**

> Keep a timer variable in a closure. On each call, clear the previous timer and start a new one. When the delay elapses without new calls, invoke the original function with the latest arguments and correct `this`.

---

## Key takeaways

- Debounce = after pause
- Throttle = every interval
- Both rely on closures + timers
- Extremely common frontend interview pair
