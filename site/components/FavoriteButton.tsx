'use client';
import { useFavorites } from '@/lib/client/storage';
import { Icon } from './Icons';

export function FavoriteButton({ id, compact }: { id: string; compact?: boolean }) {
  const { has, toggle } = useFavorites();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={on}
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
      className={
        compact
          ? `grid size-9 shrink-0 place-items-center rounded-full ${on ? 'text-hard' : 'text-muted hover:text-ink'}`
          : `inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium ${
              on ? 'border-hard/40 bg-hard/10 text-hard' : 'border-line text-muted hover:text-ink'
            }`
      }
    >
      <Icon name="heart" size={compact ? 19 : 17} filled={on} />
      {!compact && (on ? 'Saved' : 'Save')}
    </button>
  );
}
