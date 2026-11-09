import { defineGuide } from '../../../lib/content/schema';

export default defineGuide({
  title: 'Browser, Web & CSS',
  description: 'What happens when you type a URL, CORS, storage, layout, Flexbox/Grid and accessibility.',
  questions: [
    {
      id: 'event-bubbling-vs-capturing',
      question: 'What is the difference between event bubbling and capturing?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `A DOM event travels in three phases: **capturing**, from \`window\` down to the target; the **target** phase; then **bubbling**, from the target back up to \`window\`. Listeners run in the bubbling phase by default (\`{ capture: true }\` for the capturing phase).

- \`stopPropagation()\` stops the event travelling further, so parents don't receive it.
- \`preventDefault()\` cancels the browser's **default action** (following a link, submitting a form). It doesn't stop propagation.

Bubbling is what makes **event delegation** possible.`,
      variants: [
        { label: 'Short version', answer: `Events go down from \`window\` to the target (capturing), then back up (bubbling). Handlers run in the bubbling phase by default. \`stopPropagation()\` stops it moving further. \`preventDefault()\` cancels the browser action (e.g. form submit).` },
      ],
      analogy: `A letter delivered to an apartment: it goes down through the building, floor, flat (capturing), reaches the person, and then news of it travels back up to the building manager (bubbling).`,
      quickRevision: [
        'Capture (down) → target → bubble (up)',
        'Default listeners run on bubble',
        'stopPropagation: stop travelling',
        'preventDefault: cancel browser action',
      ],
      followUps: [
        'When would you use the capture phase?',
        'Do all events bubble? (focus, scroll)',
      ],
    },
    {
      id: 'event-delegation',
      question: 'What is event delegation, and why is it useful?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `Instead of attaching a listener to every child, I attach **one listener to a common parent** and use \`event.target\` (often \`target.closest('li')\`) to find which child was clicked. It works because events **bubble**.

Benefits: **fewer listeners** (less memory), and it automatically works for **elements added later**. React itself uses delegation: it attaches listeners at the root container rather than on every element.`,
      variants: [
        { label: 'Short version', answer: `Put one listener on a parent and use \`event.target\` to see which child was clicked. Fewer listeners, and it works for elements added later. React itself delegates to the root.` },
      ],
      analogy: `One receptionist answering calls for every room in the hotel instead of putting a separate receptionist in each room, including rooms built next year.`,
      quickRevision: [
        'One listener on the parent',
        'Find the child via event.target / closest',
        'Works for dynamically added elements',
        'React delegates at the root',
      ],
      followUps: [
        'Implement delegation for a list of buttons.',
        'Which events don\'t bubble?',
      ],
    },
    {
      id: 'localstorage-vs-sessionstorage-vs-cookies',
      question: '`localStorage` vs `sessionStorage` vs cookies?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'very-high',
      tags: ['css-browser'],
      answer: `- **localStorage**: about 5MB per origin, **persists** until cleared, readable by JavaScript, never sent to the server. Good for preferences and drafts.
- **sessionStorage**: same API, but **scoped to the tab** and cleared when it closes. Good for per-tab temporary state.
- **Cookies**: small (about 4KB), **sent with every request** to their domain, with an expiry. They can be **httpOnly** (hidden from JS), **Secure** and **SameSite**, which makes them the right place for **session or refresh tokens**.

Never put secrets in local or session storage, because any XSS can read them.`,
      variants: [
        { label: 'Short version', answer: `localStorage: ~5MB, persists, JS-readable. sessionStorage: same but cleared when the tab closes. Cookies: small (~4KB), sent with every request, can be \`httpOnly\` (JS can't read it, safer for auth tokens), \`Secure\` and \`SameSite\`.` },
      ],
      analogy: `localStorage is a locker that stays yours; sessionStorage is a locker emptied when you leave the gym; cookies are a membership card shown at the door on every visit.`,
      quickRevision: [
        'localStorage: persists, ~5MB, JS-readable',
        'sessionStorage: per tab, cleared on close',
        'Cookies: ~4KB, sent with requests, httpOnly/Secure/SameSite',
        'Auth tokens → httpOnly cookie, not storage',
      ],
      followUps: [
        'Can localStorage be shared across tabs?',
        'What does SameSite=Lax do?',
      ],
    },
    {
      id: 'what-is-cors',
      question: 'What is CORS?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['auth-security', 'css-browser'],
      answer: `CORS (Cross-Origin Resource Sharing) is a **browser** rule. JavaScript on origin A **can't read responses** from origin B unless B allows it with headers like \`Access-Control-Allow-Origin\`. For "non-simple" requests (JSON bodies, custom headers like \`Authorization\`, PUT or DELETE), the browser first sends a **preflight \`OPTIONS\`** request.

Key points:

- It's enforced **by the browser**, not the server. Postman or curl ignore it.
- It **doesn't protect the server**: it protects users' data from being read by other sites.
- With cookies you need \`Access-Control-Allow-Credentials: true\` and an **explicit origin**, not \`*\`.
- Fix it on the server with an **allow-list**, or avoid it with a same-origin proxy.`,
      variants: [
        { label: 'Short version', answer: `The browser blocks JS from reading responses from another origin unless the server allows it with \`Access-Control-Allow-Origin\`. For non-simple requests (custom headers, PUT/DELETE, JSON), the browser first sends a **preflight** \`OPTIONS\` request. CORS is enforced by the browser, not the server.` },
      ],
      analogy: `A building's visitor policy enforced by the visitor's own security guard (the browser): the guard won't let you carry documents out of another company's office unless that company has put your name on its guest list.`,
      quickRevision: [
        'Browser blocks reading cross-origin responses',
        'Server opts in with Access-Control-* headers',
        'Preflight OPTIONS for non-simple requests',
        'Credentials → explicit origin, not *',
        'Doesn\'t protect the server',
      ],
      followUps: [
        'Why does Postman work but the browser fails?',
        'CORS vs CSRF?',
      ],
    },
    {
      id: 'critical-rendering-path',
      question: 'What is the critical rendering path?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['css-browser'],
      answer: `The steps from bytes to pixels:

1. Parse **HTML → DOM**.
2. Parse **CSS → CSSOM**.
3. Combine them into the **render tree** (visible nodes with styles).
4. **Layout**: compute sizes and positions.
5. **Paint**: draw the pixels.
6. **Composite** the layers.

**CSS is render-blocking**, and **synchronous scripts block HTML parsing**. To speed up the first render: inline or minimise critical CSS, use \`defer\` for scripts, preload key resources and reduce the critical bytes.`,
      variants: [
        { label: 'Short version', answer: `HTML → DOM, CSS → CSSOM, combined into the render tree → layout (sizes and positions) → paint → composite. CSS blocks rendering and sync JS blocks parsing, so use \`defer\` / \`async\` for scripts.` },
      ],
      analogy: `Printing a newspaper: write the articles (DOM), decide the styles (CSSOM), lay out the page, print, then stack the pages. A late style decision holds up the whole print run.`,
      quickRevision: [
        'HTML→DOM, CSS→CSSOM → render tree',
        'Layout → paint → composite',
        'CSS blocks render; sync JS blocks parsing',
        'defer scripts, critical CSS, preload',
      ],
      followUps: [
        'Why is CSS render-blocking?',
        'What does `preload` do?',
      ],
    },
    {
      id: 'reflow-vs-repaint',
      question: 'What is the difference between reflow and repaint?',
      perspective: 'trade-off',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['css-browser'],
      answer: `- **Reflow (layout)**: the browser recalculates **positions and sizes**, triggered by changing width, height, fonts or content, or by adding and removing elements. It's expensive and can cascade through the page.
- **Repaint**: redrawing pixels without layout changes (colour, background). It's cheaper.
- **Composite-only** changes (\`transform\`, \`opacity\`) skip both, running on the GPU, which is why animations should use them.

Also avoid **layout thrashing**: reading layout values (\`offsetHeight\`) between writes in a loop forces repeated reflows. Batch reads, then writes, or use \`requestAnimationFrame\`.`,
      variants: [
        { label: 'Short version', answer: `Reflow (layout) recalculates positions and is expensive, triggered by changing size or position. Repaint redraws pixels (e.g. colour). Animating \`transform\` and \`opacity\` skips both on the GPU compositor, so it's smooth.` },
      ],
      analogy: `Rearranging furniture (reflow) vs repainting a wall (repaint) vs sliding a picture along its hook (transform): only the first forces you to move everything else.`,
      quickRevision: [
        'Reflow = layout recalculation (expensive)',
        'Repaint = redraw pixels',
        'Animate transform/opacity (compositor)',
        'Avoid read/write interleaving (thrashing)',
      ],
      followUps: [
        'What is layout thrashing?',
        'What does `will-change` do?',
      ],
    },
    {
      id: 'defer-vs-async-scripts',
      question: 'What is the difference between `defer` and `async` on script tags?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['javascript', 'css-browser'],
      answer: `Both download the script **in parallel** without blocking HTML parsing. The difference is **when they run**:

- \`async\`: runs **as soon as it downloads**, pausing parsing, **in any order**. Good for independent scripts like analytics.
- \`defer\`: runs **after HTML parsing finishes**, **in document order**, before \`DOMContentLoaded\`. Good for app scripts that depend on the DOM or on each other.

A plain \`<script>\` blocks parsing while it downloads and runs. ES module scripts are deferred by default.`,
      variants: [
        { label: 'Short version', answer: `Both download in parallel. \`async\` runs as soon as it's downloaded, in any order. \`defer\` runs after HTML parsing, in order.` },
      ],
      analogy: `async is a courier who barges in the moment they arrive; defer is a courier who waits politely until the meeting ends and then delivers parcels in order.`,
      quickRevision: [
        'Both download in parallel',
        'async: run ASAP, any order',
        'defer: after parsing, in order',
        'type="module" defers by default',
      ],
      followUps: [
        'Where should analytics scripts go?',
        'What happens with inline scripts?',
      ],
    },
    {
      id: 'flexbox-vs-grid',
      question: 'Flexbox vs Grid: when do you use each?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `- **Flexbox** is **one-dimensional**: it lays items out in a **row or a column**, letting content size drive the layout. Great for components: navbars, toolbars, aligning a button group, centring.
- **Grid** is **two-dimensional**: **rows and columns at once**, with the layout defined by the container. Great for page layouts, card galleries and dashboards.

They work well together: Grid for the page skeleton, Flexbox inside each cell.`,
      variants: [
        { label: 'Short version', answer: `Flexbox is one-dimensional (a row **or** a column) and good for components like navbars. Grid is two-dimensional (rows **and** columns) and good for page layouts.` },
      ],
      analogy: `Flexbox is arranging books on a single shelf; Grid is designing the whole bookcase with shelves and columns.`,
      quickRevision: [
        'Flex: 1D, content-driven',
        'Grid: 2D, layout-driven',
        'Flex for components, Grid for layouts',
        'Combine them',
      ],
      followUps: [
        'How would you build a responsive card grid without media queries?',
        'What does `fr` mean?',
      ],
    },
    {
      id: 'box-model',
      question: 'Explain the CSS box model and `box-sizing`.',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `Every element is a box made of **content → padding → border → margin**. By default (\`content-box\`), \`width\` covers only the **content**, so padding and border are added on top, which makes sizes hard to reason about.

With \`box-sizing: border-box\`, \`width\` **includes padding and border**, so a 200px box stays 200px. That's why most resets apply \`*, *::before, *::after { box-sizing: border-box; }\`. Also remember **vertical margins collapse** between blocks.`,
      variants: [
        { label: 'Short version', answer: `content + padding + border + margin. \`box-sizing: border-box\` makes \`width\` include padding and border, so it's easier to reason about.` },
      ],
      analogy: `A framed picture: the photo (content), the matting (padding), the frame (border), and the gap between it and the next picture on the wall (margin).`,
      quickRevision: [
        'content + padding + border + margin',
        'content-box: width excludes padding/border',
        'border-box: width includes them',
        'Vertical margins collapse',
      ],
      followUps: [
        'What is margin collapsing?',
        'Why is border-box the common default?',
      ],
    },
    {
      id: 'position-values',
      question: 'What are the CSS `position` values and how do they differ?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `- \`static\`: the default, normal flow.
- \`relative\`: stays in flow but can be offset from **its own** position. It also becomes the **anchor** for absolutely positioned children.
- \`absolute\`: removed from flow, positioned relative to the **nearest positioned ancestor**.
- \`fixed\`: positioned relative to the **viewport** (it stays on screen while scrolling). Careful: a \`transform\` on an ancestor changes this.
- \`sticky\`: behaves like relative until a scroll threshold (\`top: 0\`), then sticks within its parent.`,
      variants: [
        { label: 'Short version', answer: `\`static\` (default), \`relative\` (offset from itself, becomes the anchor for absolute children), \`absolute\` (relative to the nearest positioned ancestor), \`fixed\` (relative to the viewport), \`sticky\` (normal until a scroll threshold, then sticks).` },
      ],
      analogy: `Seating at a theatre: static is your assigned seat; relative is leaning a bit from it; absolute is standing at a spot relative to your row; fixed is the exit sign on the wall; sticky is the usher who walks with you until the aisle ends.`,
      quickRevision: [
        'static: normal flow',
        'relative: offset self, anchor for children',
        'absolute: nearest positioned ancestor',
        'fixed: viewport',
        'sticky: relative until threshold',
      ],
      followUps: [
        'Why isn\'t my sticky header sticking?',
        'How does z-index stacking context work?',
      ],
    },
    {
      id: 'css-specificity',
      question: 'How does CSS specificity work?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `When rules conflict, the browser picks the **most specific selector**: **inline styles > IDs > classes, attributes and pseudo-classes > elements and pseudo-elements**. You can think of it as a score like (1,0,0) vs (0,2,1). With **equal specificity, the later rule wins**. \`!important\` overrides normal rules, so avoid it except for utilities.

To keep CSS manageable: use low, flat specificity (single classes, BEM or utility CSS like Tailwind), avoid IDs for styling, and use cascade layers (\`@layer\`) to order libraries and app styles.`,
      variants: [
        { label: 'Short version', answer: `inline > id > class / attribute / pseudo-class > element. \`!important\` overrides everything (avoid it). With equal specificity, the later rule wins.` },
      ],
      analogy: `A chain of command: a direct order from the CEO (inline) beats a department rule (ID), which beats a team rule (class), which beats general office etiquette (element).`,
      quickRevision: [
        'inline > id > class/attr/pseudo-class > element',
        'Equal specificity → later wins',
        'Avoid !important and ID selectors',
        'Keep specificity flat; @layer helps',
      ],
      followUps: [
        'What is the specificity of `.nav li a:hover`?',
        'What does `:where()` do to specificity?',
      ],
    },
    {
      id: 'how-do-you-centre-a-div',
      question: 'How do you centre a div?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['css-browser'],
      answer: `The modern answers:

- \`display: grid; place-items: center;\` on the parent (shortest);
- \`display: flex; justify-content: center; align-items: center;\` on the parent;
- for horizontal centring of a block with a width: \`margin-inline: auto\`;
- for an overlay: \`position: absolute; inset: 0; margin: auto;\` with a set size, or \`top: 50%; left: 50%; transform: translate(-50%, -50%)\`.

The parent needs a height for vertical centring to be visible.`,
      variants: [
        { label: 'Short version', answer: `\`display: flex; justify-content: center; align-items: center;\` or \`display: grid; place-items: center;\`.` },
      ],
      analogy: `Hanging a picture in the middle of a wall: tell the wall (parent) to centre whatever is hung on it, rather than measuring each picture by hand.`,
      quickRevision: [
        'Grid: place-items: center',
        'Flex: justify-content + align-items',
        'margin-inline: auto for horizontal',
        'Parent needs a height',
      ],
      followUps: [
        'Centre text vs centre a box?',
        'Why does `align-items` do nothing sometimes?',
      ],
    },
    {
      id: 'display-none-vs-visibility-hidden-vs-opacity-0',
      question: '`display: none` vs `visibility: hidden` vs `opacity: 0`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['css-browser'],
      answer: `- \`display: none\`: the element is **removed from layout**. It takes no space, isn't clickable, and is hidden from screen readers.
- \`visibility: hidden\`: **keeps its space** but is invisible, not clickable, and hidden from screen readers.
- \`opacity: 0\`: **keeps its space and is still interactive** (clickable, focusable, read by screen readers). It's useful for fade animations, but dangerous for hiding things.

For content that should be hidden visually but **available to screen readers**, use a \`.sr-only\` class.`,
      variants: [
        { label: 'Short version', answer: `none: removed from layout. hidden: keeps its space, invisible, not clickable. opacity 0: keeps its space, still clickable.` },
      ],
      analogy: `display:none is removing the chair from the room; visibility:hidden is covering it with an invisibility cloak (still taking space); opacity:0 is a glass chair you can still trip over.`,
      quickRevision: [
        'none: no space, not interactive',
        'visibility hidden: keeps space, not interactive',
        'opacity 0: keeps space, still interactive',
        '.sr-only for screen-reader-only text',
      ],
      followUps: [
        'Which can be animated?',
        'How do you hide something only visually?',
      ],
    },
    {
      id: 'responsive-design',
      question: 'How do you build a responsive layout?',
      perspective: 'concept',
      difficulty: 'easy',
      frequency: 'high',
      tags: ['css-browser'],
      answer: `I build **mobile-first**: base styles for small screens, then \`min-width\` media queries (or Tailwind breakpoints) to enhance for larger ones. Plus:

- **fluid layouts** with flex and grid, \`%\`, \`fr\`, \`minmax()\` and \`clamp()\` for type;
- **relative units** (\`rem\`) so user font settings are respected;
- **responsive images** (\`srcset\`, \`next/image\`);
- **container queries** when a component should adapt to its container, not the viewport;
- **touch-friendly** targets (about 44px).

And I test on real devices, not just DevTools. At SmartCrowd I improved responsive layouts across desktop, tablet and mobile.`,
      variants: [
        { label: 'Short version', answer: `Mobile-first CSS, media queries, flexible units (\`%\`, \`rem\`, \`fr\`), responsive images, and testing on real devices.` },
      ],
      analogy: `Water taking the shape of whatever glass it's poured into, instead of designing a separate drink for every glass size.`,
      quickRevision: [
        'Mobile-first + min-width queries',
        'Flex/grid, fr, minmax, clamp',
        'rem units; responsive images',
        'Container queries; 44px touch targets',
        'Test on real devices',
      ],
      followUps: [
        'Media queries vs container queries?',
        'How do you handle tables on mobile?',
      ],
    },
    {
      id: 'rem-vs-em-vs-px',
      question: 'What is the difference between `rem`, `em` and `px`?',
      perspective: 'trade-off',
      difficulty: 'easy',
      frequency: 'medium',
      tags: ['css-browser'],
      answer: `- \`px\`: a fixed size. It doesn't scale with the user's font settings.
- \`em\`: relative to the **parent's font size**, so it **compounds** when nested (1.2em inside 1.2em = 1.44×). Useful for padding that should scale with a component's own text.
- \`rem\`: relative to the **root (html) font size**, so it's predictable and **respects the user's browser font setting**. Accessibility-friendly.

My default: \`rem\` for font sizes and spacing, \`em\` for component-internal spacing, \`px\` for borders and hairlines.`,
      variants: [
        { label: 'Short version', answer: `\`px\` is fixed. \`em\` is relative to the parent font size (it compounds). \`rem\` is relative to the root font size, so it's predictable and respects user settings.` },
      ],
      analogy: `px is a fixed ruler; em is "a bit bigger than whatever my parent is" (so it snowballs); rem is "a bit bigger than the house standard", always the same reference.`,
      quickRevision: [
        'px: fixed',
        'em: parent-relative, compounds',
        'rem: root-relative, respects user settings',
        'rem for type/spacing, px for borders',
      ],
      followUps: [
        'Why does em compound?',
        'What are viewport units (vw, dvh)?',
      ],
    },
    {
      id: 'xss-and-how-react-protects-against-it',
      question: 'What is XSS, and how does React protect against it?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['react', 'auth-security', 'css-browser'],
      answer: `**XSS (cross-site scripting)** is an attacker getting **their script to run in my page**, for example through a comment containing \`<script>\`, so it can steal data or act as the user.

React **escapes values in JSX by default**: \`{userInput}\` is rendered as text, not HTML. The risky spots are:

- \`dangerouslySetInnerHTML\`: **sanitise with DOMPurify** first;
- \`href\`/\`src\` built from user input (\`javascript:\` URLs), so validate protocols;
- third-party scripts and direct DOM manipulation.

Defence in depth: a **Content Security Policy** header, **httpOnly cookies** so tokens can't be stolen by scripts, and server-side output encoding.`,
      variants: [
        { label: 'Short version', answer: `XSS is injected script running in your page. React escapes values in JSX automatically. The danger is \`dangerouslySetInnerHTML\` (sanitize with DOMPurify), \`href="javascript:..."\` and third-party scripts. A CSP header adds protection.` },
      ],
      analogy: `React reads every guest message aloud as plain text instead of following any instructions written in it; \`dangerouslySetInnerHTML\` is choosing to follow the instructions, so check them first.`,
      quickRevision: [
        'XSS = attacker script running in your page',
        'React escapes JSX text by default',
        'Risks: dangerouslySetInnerHTML, javascript: URLs, 3rd-party scripts',
        'Sanitise (DOMPurify), CSP, httpOnly cookies',
      ],
      followUps: [
        'Stored vs reflected vs DOM XSS?',
        'How does a CSP help?',
      ],
    },
    {
      id: 'csrf',
      question: 'What is CSRF, and how do you prevent it?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'high',
      tags: ['auth-security', 'css-browser'],
      answer: `**CSRF (cross-site request forgery)**: a malicious site makes the user's browser send a request to **my** site, and the browser **automatically attaches the user's cookies**, so the request looks legitimate (for example "transfer money").

Protections:

- **SameSite cookies** (\`Lax\` or \`Strict\`), so cookies aren't sent on cross-site requests. This is the main modern defence.
- **CSRF tokens**: a secret value the server checks on state-changing requests.
- Sending auth in a **custom header** (\`Authorization: Bearer\`) instead of relying on cookies alone.
- Never change state on **GET**.

CORS doesn't stop CSRF: the request is still sent, the attacker just can't read the response.`,
      variants: [
        { label: 'Short version', answer: `Another site makes the user's browser send a request with their cookies. Protect with \`SameSite\` cookies, CSRF tokens, or tokens sent in headers instead of cookies.` },
      ],
      analogy: `Someone tricks you into signing a cheque by sliding it into a stack of papers; your signature (cookie) is genuine, but you never meant to sign that one.`,
      quickRevision: [
        'Browser auto-sends cookies on forged requests',
        'SameSite=Lax/Strict is the main defence',
        'CSRF tokens; custom auth header',
        'No state changes on GET',
        'CORS ≠ CSRF protection',
      ],
      followUps: [
        'Why doesn\'t CORS prevent CSRF?',
        'Lax vs Strict vs None?',
      ],
    },
    {
      id: 'what-happens-when-you-type-a-url',
      question: 'What happens when you type a URL?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'very-high',
      tags: ['css-browser'],
      answer: `1. **URL parsing**, and checking the browser cache or HSTS.
2. **DNS lookup**: browser, OS, then resolver caches, then recursive DNS → IP address.
3. **TCP connection** (or QUIC for HTTP/3), then the **TLS handshake** for HTTPS (certificate check, keys agreed).
4. **HTTP request** with headers and cookies → through CDN, load balancer and reverse proxy (Nginx) → **application server** → database or cache → **response** (status, headers, HTML).
5. The browser **parses HTML** into the DOM, fetches CSS, JS and images (often in parallel over HTTP/2), builds the **CSSOM and render tree**, then runs **layout → paint → composite**, and executes JS, which may fetch more data.

I adjust the depth to the interviewer: network-heavy for backend roles, rendering-heavy for frontend.`,
      variants: [
        { label: 'Short version', answer: `DNS lookup → TCP connection → TLS handshake → HTTP request → server response → browser parses HTML, fetches CSS and JS → render.` },
      ],
      analogy: `Visiting a friend: look up their address (DNS), drive there and show ID at the gate (TCP + TLS), ask for the parcel (HTTP), then unpack and arrange the furniture (parsing and rendering).`,
      quickRevision: [
        'Cache/HSTS → DNS → TCP → TLS',
        'HTTP request → CDN/LB/proxy → app → DB',
        'Response → HTML parse → DOM/CSSOM',
        'Layout → paint → composite → JS',
      ],
      followUps: [
        'What happens in a TLS handshake?',
        'How does a CDN speed this up?',
        'HTTP/2 vs HTTP/3?',
      ],
    },
    {
      id: 'service-workers-pwa',
      question: 'What are service workers, and what makes an app a PWA?',
      perspective: 'concept',
      difficulty: 'medium',
      frequency: 'medium',
      tags: ['css-browser'],
      answer: `A **service worker** is a script that runs **between the page and the network**, in the background and separate from the page. It can **intercept requests** and answer from a cache, which enables **offline support**, faster repeat visits, **background sync** and **push notifications**. It only works over HTTPS.

A **PWA** is a web app that uses a service worker plus a **web app manifest** (name, icons, theme) to be **installable** and app-like. The tricky part is **cache invalidation**: users can get stuck on old versions, so you need a clear update strategy (versioned caches, prompting to reload).`,
      variants: [
        { label: 'Short version', answer: `A script that runs between the page and the network. Enables offline caching, background sync and push notifications.` },
      ],
      analogy: `A personal assistant at your door who keeps copies of your usual deliveries: if the courier (network) is late or missing, they hand you the copy, and they can receive parcels while you're out.`,
      quickRevision: [
        'Proxy between page and network',
        'Offline cache, background sync, push',
        'HTTPS only; separate from the page',
        'PWA = service worker + manifest (installable)',
        'Watch out for stale cache versions',
      ],
      followUps: [
        'Cache-first vs network-first strategies?',
        'How do you ship an update to a PWA safely?',
      ],
    },
  ],
});
