import type { Metadata } from 'next';
import { catalog } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { LastMinute } from '@/components/practice/LastMinute';

export const metadata: Metadata = { title: 'Last-Minute Cards' };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Last-Minute Cards" description="The must-know questions as quick flip cards with memory hooks. Good for the hour before an interview." />
      <LastMinute catalog={catalog()} />
    </div>
  );
}
