export function PageHeader({ title, description, eyebrow, children }: { title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-8 border-b border-line pb-6">
      {eyebrow && <p className="eyebrow mb-3 text-accent">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold leading-[1.05] text-balance sm:text-5xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-[15px] text-muted sm:text-base">{description}</p>}
      {children}
    </header>
  );
}

export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-line pb-2">
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
