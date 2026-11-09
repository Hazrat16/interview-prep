import type { Metadata } from 'next';
import { catalog } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { Review } from '@/components/practice/Review';

export const metadata: Metadata = { title: 'Review' };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Review" description="Spaced repetition: questions you found hard come back just before you'd forget them." />
      <Review catalog={catalog()} />
    </div>
  );
}
