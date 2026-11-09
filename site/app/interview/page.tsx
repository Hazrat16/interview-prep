import type { Metadata } from 'next';
import { catalog } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { Interview } from '@/components/practice/Interview';

export const metadata: Metadata = { title: 'Interview Simulator' };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Interview Simulator" description="A timed mock interview with random questions. Answer before the clock runs out, then compare with the written answer." />
      <Interview catalog={catalog()} />
    </div>
  );
}
