import type { Metadata } from 'next';
import { categoryLabels } from '@/lib/data';
import { PageHeader } from '@/components/Page';
import { FavoritesView } from '@/components/FavoritesView';

export const metadata: Metadata = { title: 'Favorites' };

export default function Favorites() {
  return (
    <>
      <PageHeader title="Favorites" description="Questions you saved with ♥." />
      <FavoritesView categoryLabels={categoryLabels()} />
    </>
  );
}
