'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from './Icons';

export function Teaser({ question, answer, href }: { question: React.ReactNode; answer: React.ReactNode; href: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="ink-card overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="px-4 py-4 sm:px-5">{question}</div>
      <div className="border-t border-dashed border-rule px-4 py-3 sm:px-5">
        {shown ? (
          <div className="anim-reveal">
            {answer}
            <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
              More output-prediction questions <Icon name="right" size={14} />
            </Link>
          </div>
        ) : (
          <button type="button" onClick={() => setShown(true)} className="inline-flex items-center gap-2 text-sm font-medium text-accent">
            <Icon name="eye" size={16} /> Show the answer
          </button>
        )}
      </div>
    </div>
  );
}
