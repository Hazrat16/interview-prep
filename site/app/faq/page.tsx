import type { Metadata } from 'next';
import { summaries, categoryLabels } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { QuestionList } from '@/components/QuestionList';

export const metadata: Metadata = { title: 'Frequently Asked Questions' };

export default function Faq() {
  const items = summaries((q) => q.origin === 'curated');
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        description="Curated questions for a full-stack role (React, Next.js, Node.js, databases, DevOps). Each has an interview-ready answer, an analogy, quick revision points and likely follow-ups."
      />
      <QuestionList items={items} categoryLabels={categoryLabels()} showOriginFilter={false} showPerspective />
    </>
  );
}
