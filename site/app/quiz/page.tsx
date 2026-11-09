import type { Metadata } from 'next';
import { catalog } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { Quiz } from '@/components/practice/Quiz';

export const metadata: Metadata = { title: 'Quiz' };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Quiz" description="Flip cards from any guide. Answer out loud, reveal, then grade yourself — hard ones come back in Review." />
      <Quiz catalog={catalog()} />
    </div>
  );
}
