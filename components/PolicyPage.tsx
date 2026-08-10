export function PolicyPage({
  title,
  updated = "August 2026",
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-xs text-muted">Last updated: {updated}</p>
      <div className="mt-8 space-y-3 text-sm leading-relaxed text-muted [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:mt-1 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-storm [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
