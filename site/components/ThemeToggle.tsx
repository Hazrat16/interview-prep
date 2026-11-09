'use client';
import { useEffect, useState } from 'react';
import { Icon } from './Icons';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className={`press grid size-10 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink ${className}`}
      onClick={() => {
        const next = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', next);
        try {
          localStorage.setItem('ip:theme', next ? 'dark' : 'light');
        } catch {}
        setDark(next);
      }}
    >
      <Icon key={String(dark)} name={dark ? 'sun' : 'moon'} className="anim-pop" />
    </button>
  );
}

/** Runs before paint to avoid a flash of the wrong theme. */
export const themeScript = `(function(){try{var t=localStorage.getItem('ip:theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;
