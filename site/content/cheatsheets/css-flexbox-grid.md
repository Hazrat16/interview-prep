---
title: CSS Flexbox & Grid
description: Layout properties, centering, responsive patterns and the box model.
icon: grid
order: 9
---

## Flexbox (one dimension)

```css
.row {
  display: flex;
  flex-direction: row;        /* row | column */
  justify-content: space-between; /* main axis: flex-start | center | space-between | space-around | space-evenly */
  align-items: center;        /* cross axis: stretch | flex-start | center | baseline */
  flex-wrap: wrap;
  gap: 1rem;
}
.item { flex: 1 1 200px; }    /* grow shrink basis */
```

| Property | On | Does |
|---|---|---|
| `flex-grow` | item | Share of leftover space |
| `flex-shrink` | item | How much it shrinks when space is short (`0` = never) |
| `flex-basis` | item | Starting size before grow/shrink |
| `align-self` | item | Override `align-items` for one item |
| `order` | item | Visual order (doesn't change tab order) |
| `min-width: 0` | item | Lets text truncate inside a flex item |

## Grid (two dimensions)

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* responsive, no media queries */
  gap: 1rem;
}
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas: "side main";
}
.hero { grid-column: 1 / -1; }  /* span all columns */
```

`auto-fill` keeps empty tracks; `auto-fit` collapses them so items stretch.

## Centering

```css
.center { display: grid; place-items: center; }
.center-flex { display: flex; justify-content: center; align-items: center; }
.center-abs { position: absolute; inset: 0; margin: auto; width: fit-content; height: fit-content; }
```

## Flex or Grid?

- **Flex**: a row or column of items whose size comes from their content (navbars, button groups, toolbars).
- **Grid**: rows *and* columns that line up (page layouts, card grids, forms).
- They combine: grid for the page, flex inside the cards.

## Box model

- `box-sizing: border-box` makes `width` include padding and border (set it globally).
- Vertical margins between blocks **collapse** (the larger wins); not inside flex/grid.
- `margin: auto` in a flex container pushes an item away (e.g. `margin-left: auto`).

## Positioning

| Value | Positioned relative to |
|---|---|
| `relative` | Its normal spot (still takes space) |
| `absolute` | Nearest positioned ancestor |
| `fixed` | The viewport |
| `sticky` | Normal flow until it hits its `top` offset in the scroll container |

`z-index` only works on positioned elements and inside the same **stacking context** (created by `transform`, `opacity < 1`, `position` + `z-index`, etc.).

## Responsive

```css
@media (min-width: 768px) { … }          /* mobile-first */
@container (min-width: 400px) { … }      /* container queries */
font-size: clamp(1rem, 2.5vw, 1.5rem);   /* fluid type */
```
