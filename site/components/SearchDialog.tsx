'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MiniSearch from 'minisearch';
import { SEARCH_OPTIONS } from '@/lib/search-options';
import { loadSearchIndexText } from '@/lib/client/data';
import { Icon } from './Icons';
import { questionHref } from '@/lib/paths';

type Hit = { id: string; t: string; k: 'question' | 'guide' | 'sheet'; c: string };

let indexPromise: Promise<MiniSearch> | null = null;
function getIndex() {
  indexPromise ??= loadSearchIndexText().then((txt) => MiniSearch.loadJSON(txt, SEARCH_OPTIONS));
  return indexPromise;
}

export function openSearch() {
  window.dispatchEvent(new Event('ph:search'));
}

export function SearchButton({ className = '', label = true }: { className?: string; label?: boolean }) {
  return (
    <button
      type="button"
      onClick={openSearch}
      onPointerEnter={() => getIndex()}
      aria-label="Search"
      className={className}
    >
      <Icon name="search" size={18} />
      {label && (
        <>
          <span className="flex-1 text-left">Search…</span>
          <kbd className="hidden rounded border border-line px-1.5 text-[10px] text-muted sm:inline">Ctrl K</kbd>
        </>
      )}
    </button>
  );
}

const hrefFor = (h: Hit) => (h.k === 'guide' ? `/${h.id.slice(6)}/` : h.k === 'sheet' ? `/cheatsheets/${h.id.slice(6)}/` : questionHref(h.id));

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setHits([]);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('ph:search', onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('ph:search', onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());
    getIndex().then(() => setReady(true));
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const term = q.trim();
    if (!term) {
      setHits([]);
      return;
    }
    getIndex().then((ms) => {
      if (cancelled) return;
      let res = ms.search(term);
      if (!res.length) res = ms.search(term, { combineWith: 'OR' });
      setHits(res.slice(0, 40) as unknown as Hit[]);
      setActive(0);
    });
    return () => {
      cancelled = true;
    };
  }, [q, ready]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const go = (h: Hit) => {
    close();
    router.push(hrefFor(h));
  };

  const counts = useMemo(() => {
    const c = { question: 0, guide: 0, sheet: 0 };
    for (const h of hits) c[h.k]++;
    return c;
  }, [hits]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:p-6 sm:pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="anim-fade absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={close} />
      <div className="anim-scale relative flex h-dvh w-full flex-col overflow-hidden bg-surface shadow-2xl sm:h-auto sm:max-h-[75vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-line">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <Icon name="search" className="ml-1 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, hits.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter' && hits[active]) go(hits[active]);
            }}
            placeholder="Search guides, questions, cheat sheets…"
            className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-controls="search-results"
          />
          <button type="button" onClick={close} className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-surface-2">
            <span className="sm:hidden">Cancel</span>
            <kbd className="hidden text-xs sm:inline">Esc</kbd>
          </button>
        </div>

        {q.trim() && (
          <div className="flex gap-3 border-b border-line px-4 py-2 text-xs text-muted">
            <span>{hits.length} results</span>
            {counts.guide > 0 && <span>{counts.guide} guides</span>}
            {counts.question > 0 && <span>{counts.question} questions</span>}
            {counts.sheet > 0 && <span>{counts.sheet} cheat sheets</span>}
          </div>
        )}

        <ul id="search-results" ref={listRef} className="flex-1 overflow-y-auto overscroll-contain p-2" role="listbox">
          {!q.trim() && (
            <li className="px-3 py-8 text-center text-sm text-muted">
              Try <em>event loop</em>, <em>index</em>, <em>jwt</em>, <em>useEffect</em> or <em>docker</em>.
              <div className="mt-2 hidden text-xs sm:block">↑ ↓ to move · Enter to open · Esc to close</div>
            </li>
          )}
          {q.trim() && !hits.length && (
            <li className="px-3 py-8 text-center text-sm text-muted">{ready ? 'No matches.' : 'Loading index…'}</li>
          )}
          {hits.map((h, i) => (
            <li key={h.id} data-idx={i} role="option" aria-selected={i === active}>
              <button
                type="button"
                onClick={() => go(h)}
                onMouseMove={() => setActive(i)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? 'bg-surface-2' : ''}`}
              >
                <Icon name={h.k === 'guide' ? 'book' : h.k === 'sheet' ? 'sheet' : 'chat'} size={16} className="mt-0.5 shrink-0 text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] leading-snug">{h.t}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {h.k === 'guide' ? `Guide · ${h.c}` : h.c}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
