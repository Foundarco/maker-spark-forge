export const autonomous = ["Detect", "Navigate", "Investigate", "Reassess"] as const;
export const oversight = ["Review", "Authorize", "Monitor", "Coordinate"] as const;

/**
 * The recurring "autonomous system, human oversight" motif.
 * `compact` renders the single-line chip used inside other acts.
 */
export function OversightLockup({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 border border-white/15 bg-black/35 px-3 py-2 font-mono text-[0.55rem] uppercase tracking-[0.16em] backdrop-blur-sm">
        <span className="text-[var(--signal)]">Autonomous</span>
        <span className="h-3 w-px bg-white/25" />
        <span className="text-[var(--aid)]">Human oversight</span>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <Track title="The system does this on its own" tone="var(--signal)" items={autonomous} />
      <Track title="A person decides this" tone="var(--aid)" items={oversight} />
    </div>
  );
}

function Track({
  title,
  tone,
  items,
}: {
  title: string;
  tone: string;
  items: readonly string[];
}) {
  return (
    <div className="border border-white/12 bg-white/[0.03] p-5 backdrop-blur-sm">
      <p
        className="font-mono text-[0.58rem] uppercase tracking-[0.22em]"
        style={{ color: tone }}
      >
        {title}
      </p>
      <ol className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-3 text-ink">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: tone, opacity: 0.5 + i * 0.15 }}
            />
            <span className="text-lg leading-tight">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
