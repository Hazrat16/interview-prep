'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { QuestionSummary } from '@/lib/content/site-types';
import { loadSummaries } from '@/lib/client/data';
import { useFavorites } from '@/lib/client/storage';
import { QuestionList } from './QuestionList';
import { Icon } from './Icons';

export function FavoritesView({ categoryLabels }: { categoryLabels: Record<string, string> }) {
  const { favs, setFavs } = useFavorites();
  const [all, setAll] = useState<QuestionSummary[] | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSummaries().then(setAll).catch(() => setAll([]));
  }, []);

  const items = useMemo(() => {
    if (!all) return [];
    const byId = new Map(all.map((s) => [s.id, s]));
    return favs.map((id) => byId.get(id)).filter(Boolean) as QuestionSummary[];
  }, [all, favs]);
  const missing = all ? favs.length - items.length : 0;

  const exportFavs = () => {
    const blob = new Blob([JSON.stringify({ favorites: favs, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'interview-prep-favorites.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFavs = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const ids: unknown = Array.isArray(data) ? data : data.favorites;
      if (!Array.isArray(ids) || !ids.every((x) => typeof x === 'string')) throw new Error();
      setFavs((prev) => [...new Set([...prev, ...(ids as string[])])]);
      setMsg(`Imported ${ids.length} favorites.`);
    } catch {
      setMsg('That file is not a favorites export.');
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={exportFavs} disabled={!favs.length} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm disabled:opacity-50">
          <Icon name="download" size={16} /> Export
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm">
          <Icon name="upload" size={16} /> Import
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && importFavs(e.target.files[0])} />
        {favs.length > 0 && (
          <Link href="/revision/?saved=1" className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-white">
            <Icon name="bolt" size={16} /> Revise saved
          </Link>
        )}
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>
      <p className="mb-4 text-sm text-muted">
        Favorites are stored in this browser only. Use Export / Import to move them between devices.
        {missing > 0 && ` ${missing} saved item(s) no longer exist in the content and are hidden.`}
      </p>
      {!all ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <Icon name="heart" size={28} className="mx-auto text-muted" />
          <p className="mt-2 text-muted">Nothing saved yet. Tap ♥ on any question to save it here.</p>
          <Link href="/faq/" className="mt-4 inline-block text-accent">Browse frequently asked questions →</Link>
        </div>
      ) : (
        <QuestionList items={items} categoryLabels={categoryLabels} syncUrl={false} />
      )}
    </div>
  );
}
