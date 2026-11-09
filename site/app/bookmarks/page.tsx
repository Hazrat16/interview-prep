import type { Metadata } from 'next';
import { catalog } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { Bookmarks } from '@/components/practice/Bookmarks';

export const metadata: Metadata = { title: 'Bookmarks' };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Bookmarks" description="Questions you saved for later." />
      <Bookmarks catalog={catalog()} />
    </div>
  );
}
