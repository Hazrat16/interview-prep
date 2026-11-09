'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useBookmarks, useCheckpoints, useHydrated, useKnown, useStored, KEYS } from '@/lib/client/storage';
import { useSrs } from '@/lib/client/srs';
import { Icon } from './Icons';

// ---- practice mode (hide answers until tapped) -------------------------------------

export function PracticeToggle() {
  const [on, setOn] = useStored<boolean>(KEYS.practice, false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn(!on)}
      title="Practice mode hides answers until you tap them"
      className={`press inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
        on ? 'border-accent bg-accent text-white' : 'border-line text-muted hover:text-ink'
      }`}
    >
      <Icon name="mic" size={16} />
      {on ? 'Practising' : 'Practice mode'}
    </button>
  );
}

/** Hides its content behind a tap target while practice mode is on. */
export function Reveal({ children, label = 'Say your answer out loud, then tap to reveal' }: { children: React.ReactNode; label?: string }) {
  const [practice] = useStored<boolean>(KEYS.practice, false);
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(false), [practice]);
  const hidden = practice && !shown;
  return (
    <div className="relative">
      <div className={hidden ? 'pointer-events-none max-h-40 select-none overflow-hidden opacity-60 blur-[6px]' : ''} aria-hidden={hidden}>
        {children}
      </div>
      {hidden && (
        <button type="button" onClick={() => setShown(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl text-sm font-medium text-ink">
          <span className="grid size-10 place-items-center rounded-full bg-accent text-white shadow-lg">
            <Icon name="eye" size={20} />
          </span>
          <span className="rounded-full bg-surface/90 px-3 py-1 shadow-sm">{label}</span>
        </button>
      )}
    </div>
  );
}

export function VariantTabs({ variants }: { variants: { label: string; html: string }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div role="tablist" className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
        {variants.map((v, idx) => (
          <button
            key={v.label}
            role="tab"
            type="button"
            aria-selected={i === idx}
            onClick={() => setI(idx)}
            className={`h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors ${
              i === idx ? 'border-variant bg-variant text-white dark:text-black' : 'border-line text-muted hover:text-ink'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <Reveal>
        <div role="tabpanel" className="md prose max-w-none" dangerouslySetInnerHTML={{ __html: variants[i].html }} />
      </Reveal>
    </div>
  );
}

// ---- per-question controls --------------------------------------------------------

export function BookmarkButton({ id, compact }: { id: string; compact?: boolean }) {
  const { has, toggle } = useBookmarks();
  const ready = useHydrated();
  const on = ready && has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={on}
      aria-label={on ? 'Remove bookmark' : 'Bookmark this question'}
      title={on ? 'Remove bookmark' : 'Bookmark'}
      className={
        compact
          ? `press grid size-9 shrink-0 place-items-center rounded-full ${on ? 'text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'}`
          : `press inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
              on ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line text-muted hover:text-ink'
            }`
      }
    >
      <Icon name="bookmark" size={compact ? 18 : 16} filled={on} className={on ? 'anim-pop' : ''} />
      {!compact && (on ? 'Bookmarked' : 'Bookmark')}
    </button>
  );
}

export function KnownButton({ id }: { id: string }) {
  const { has, set } = useKnown();
  const ready = useHydrated();
  const on = ready && has(id);
  return (
    <button
      type="button"
      onClick={() => set(id, !on)}
      aria-pressed={on}
      className={`press inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
        on ? 'border-easy/40 bg-easy/10 text-easy' : 'border-line text-muted hover:text-ink'
      }`}
    >
      <Icon name="check" size={16} strokeWidth={2.4} className={on ? 'anim-pop' : ''} />
      {on ? 'I know this' : 'Mark as known'}
    </button>
  );
}

export function ReviewButton({ id }: { id: string }) {
  const { srs, add, remove } = useSrs();
  const ready = useHydrated();
  const on = ready && !!srs[id];
  return (
    <button
      type="button"
      onClick={() => (on ? remove(id) : add(id))}
      aria-pressed={on}
      title={on ? 'Remove from your review queue' : 'Add to your spaced-repetition review queue'}
      className={`press inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
        on ? 'border-follow/40 bg-follow-soft text-follow' : 'border-line text-muted hover:text-ink'
      }`}
    >
      <Icon name="again" size={16} />
      {on ? 'In review' : 'Add to review'}
    </button>
  );
}

// ---- guide page: collapsible questions, expand all, checkpoints ---------------------

const ExpandCtx = createContext<{ version: number; open: boolean }>({ version: 0, open: false });

/** Wraps a guide: tracks the question on screen as a checkpoint and drives expand/collapse all. */
export function GuideShell({ guideKey, children }: { guideKey: string; children: React.ReactNode }) {
  const [state, setState] = useState({ version: 0, open: false });
  const [, setCheckpoints] = useCheckpoints();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!top) return;
        const el = top.target as HTMLElement;
        clearTimeout(timer);
        timer = setTimeout(() => {
          setCheckpoints((c) => ({ ...c, [guideKey]: { q: el.id, title: el.dataset.title ?? '', t: Date.now() } }));
        }, 1200);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    root.querySelectorAll('[data-question]').forEach((el) => io.observe(el));
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [guideKey, setCheckpoints]);

  return (
    <ExpandCtx.Provider value={state}>
      <div ref={ref}>
        <div className="mb-3 flex justify-end gap-2 text-sm">
          <button type="button" className="press rounded-full px-3 py-1 text-muted hover:bg-surface-2 hover:text-ink" onClick={() => setState((s) => ({ version: s.version + 1, open: true }))}>
            Expand all
          </button>
          <button type="button" className="press rounded-full px-3 py-1 text-muted hover:bg-surface-2 hover:text-ink" onClick={() => setState((s) => ({ version: s.version + 1, open: false }))}>
            Collapse all
          </button>
        </div>
        {children}
      </div>
    </ExpandCtx.Provider>
  );
}

/** One collapsible question. Opens itself when the URL hash points at it. */
export function QuestionShell({
  id,
  title,
  defaultOpen,
  header,
  children,
}: {
  id: string;
  title: string;
  defaultOpen?: boolean;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const ctx = useContext(ExpandCtx);
  const [open, setOpen] = useState(!!defaultOpen);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ctx.version) setOpen(ctx.open);
  }, [ctx]);

  const fromHash = useCallback(() => {
    if (decodeURIComponent(window.location.hash.slice(1)) === id) {
      setOpen(true);
      requestAnimationFrame(() => ref.current?.scrollIntoView({ block: 'start' }));
    }
  }, [id]);
  useEffect(() => {
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [fromHash]);

  return (
    <article ref={ref} id={id} data-question data-title={title} className="scroll-mt-20 rounded-2xl border border-line bg-surface">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left sm:px-5"
      >
        <span className="min-w-0 flex-1">{header}</span>
        <Icon name="down" size={18} className={`mt-1 shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="expander" data-open={open} inert={!open}>
        <div>
          <div className="border-t border-line px-3 pb-4 pt-4 sm:px-5">{children}</div>
        </div>
      </div>
    </article>
  );
}

/** Small ✓ dot next to a question title when it's known. */
export function KnownDot({ id }: { id: string }) {
  const { has } = useKnown();
  const ready = useHydrated();
  if (!ready || !has(id)) return null;
  return (
    <span className="anim-pop ml-1.5 inline-grid size-5 place-items-center rounded-full bg-easy/15 align-[-3px] text-easy" title="You know this">
      <Icon name="check" size={12} strokeWidth={3} />
    </span>
  );
}

/** "n / total known" bar for a guide. */
export function GuideProgress({ keys }: { keys: string[] }) {
  const { known } = useKnown();
  const ready = useHydrated();
  const n = ready ? keys.filter((k) => known[k]).length : 0;
  const pct = Math.round((n / (keys.length || 1)) * 100);
  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-easy transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums">
        {n}/{keys.length} known
      </span>
    </div>
  );
}
