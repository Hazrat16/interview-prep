'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useStored } from '@/lib/client/storage';
import { Icon } from './Icons';
import { FavoriteButton } from './FavoriteButton';

const PRACTICE_KEY = 'ip:practice';

/** Sticky chip bar that jumps between sections and highlights the one on screen. */
export function SectionNav({ items }: { items: { id: string; label: string; dot: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  // Keep the active chip visible by scrolling ONLY the chip strip sideways, and
  // only once page scrolling has settled. (scrollIntoView would also scroll the
  // page and cancels touch momentum on phones, so the page "stops" mid-swipe.)
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    let timer: ReturnType<typeof setTimeout>;
    const center = () => {
      const chip = strip.querySelector<HTMLElement>(`[data-chip="${active}"]`);
      if (!chip) return;
      const left = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(center, 180);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', schedule);
    };
  }, [active]);
  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className="sticky top-14 z-20 -mx-4 mb-5 border-b border-line bg-bg/90 px-4 py-2 backdrop-blur lg:top-0 lg:mx-0 lg:rounded-b-2xl lg:border-x lg:px-3">
      <div ref={stripRef} className="no-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            data-chip={i.id}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors ${
              active === i.id ? 'bg-ink font-medium text-bg' : 'text-muted hover:bg-surface-2 hover:text-ink'
            }`}
          >
            <span className={`size-1.5 rounded-full ${i.dot}`} />
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function PracticeToggle({ compact }: { compact?: boolean }) {
  const [on, setOn] = useStored<boolean>(PRACTICE_KEY, false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn(!on)}
      title="Practice mode hides answers until you tap them"
      className={
        compact
          ? `grid size-11 place-items-center rounded-full ${on ? 'bg-accent text-white' : 'text-muted'}`
          : `inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
              on ? 'border-accent bg-accent text-white' : 'border-line text-muted hover:text-ink'
            }`
      }
    >
      <Icon name="mic" size={compact ? 20 : 16} />
      {!compact && (on ? 'Practising' : 'Practice')}
    </button>
  );
}

/** Hides its content behind a tap target while practice mode is on. */
export function Reveal({ children, label = 'Say your answer out loud, then tap to reveal' }: { children: React.ReactNode; label?: string }) {
  const [practice] = useStored<boolean>(PRACTICE_KEY, false);
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(false), [practice]);
  const hidden = practice && !shown;
  return (
    <div className="relative">
      <div className={hidden ? 'pointer-events-none max-h-40 select-none overflow-hidden opacity-60 blur-[6px]' : ''} aria-hidden={hidden}>
        {children}
      </div>
      {hidden && (
        <button
          type="button"
          onClick={() => setShown(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl text-sm font-medium text-ink"
        >
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

/** Floating prev / save / practice / next pill on phones. */
export function MobileQuestionBar({ id, prev, next }: { id: string; prev?: string; next?: string }) {
  const btn = 'grid size-11 place-items-center rounded-full text-muted active:bg-surface-2';
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 flex justify-center lg:hidden">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface/95 p-1 shadow-lg backdrop-blur">
        {prev ? (
          <Link href={prev} aria-label="Previous question" className={btn}><Icon name="left" /></Link>
        ) : (
          <span className={`${btn} opacity-30`}><Icon name="left" /></span>
        )}
        <span className="grid size-11 place-items-center"><FavoriteButton id={id} compact /></span>
        <PracticeToggle compact />
        {next ? (
          <Link href={next} aria-label="Next question" className={btn}><Icon name="right" /></Link>
        ) : (
          <span className={`${btn} opacity-30`}><Icon name="right" /></span>
        )}
      </div>
    </div>
  );
}
