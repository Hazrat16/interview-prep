import type { Metadata } from 'next';
import { summaries, categoryLabels } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { QuestionList } from '@/components/QuestionList';

export const metadata: Metadata = { title: 'All Questions' };

export default function AllQuestions() {
  const items = summaries();
  return (
    <>
      <PageHeader
        title="All Questions"
        description="Everything in one place: questions extracted from my Markdown notes and the curated FAQ. Duplicates are merged in the list; every answer is kept on the question page."
      />
      <QuestionList items={items} categoryLabels={categoryLabels()} />
    </>
  );
}
