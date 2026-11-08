import type { Metadata } from 'next';
import { categoryLabels } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { RevisionDeck } from '@/components/RevisionDeck';

export const metadata: Metadata = { title: 'Quick Revision' };

export default function Revision() {
  return (
    <>
      <PageHeader title="Quick Revision" description="Answer out loud, reveal, then mark it. Progress is saved in this browser." />
      <RevisionDeck categoryLabels={categoryLabels()} />
    </>
  );
}
