import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">This guide or page doesn't exist (any more).</p>
      <Link href="/topics/" className="mt-6 inline-block text-accent">Browse all topics →</Link>
    </div>
  );
}
