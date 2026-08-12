import { useEffect, useRef, useState } from "react";
import { stages } from "@/config/system";

/**
 * The signature architecture visual: sensor node → detection → alert →
 * operations center → UAV dispatch → autonomous flight → investigation →
 * intelligence → responder. A signal pulse travels the chain; each stage can
 * be selected to reveal detail.
 */
export function SystemArchitecture() {
  const [active, setActive] = useState(0);
  const [pulse, setPulse] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      if (!paused.current) setPulse((p) => (p + 1) % stages.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  const s = stages[active]!;

  return (
    <div
      className="blueprint-grid border border-border bg-[var(--night)] text-foreground"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {/* Chain */}
      <ol className="grid grid-cols-3 gap-px bg-border sm:grid-cols-5 lg:grid-cols-9">
        {stages.map((st, i) => {
          const isActive = i === active;
          const isPulse = i === pulse;
          return (
            <li key={st.slug}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={`group relative flex h-full w-full flex-col items-start gap-2 px-3 py-5 text-left transition-colors ${
                  isActive ? "bg-surface" : "bg-[var(--night)] hover:bg-surface/60"
                }`}
              >
                <span
                  className="absolute left-0 top-0 h-[2px] w-full transition-opacity duration-500"
                  style={{
                    background: st.accent,
                    opacity: isActive ? 1 : isPulse ? 0.7 : 0.14,
                  }}
                  aria-hidden
                />
                <span
                  className="font-mono text-[0.65rem] tabular-nums tracking-[0.2em]"
                  style={{ color: st.accent }}
                >
                  {st.n}
                </span>
                <span
                  className={`text-[0.72rem] font-semibold uppercase leading-tight tracking-[0.1em] ${
                    isActive ? "text-ink" : "text-foreground/70 group-hover:text-ink"
                  }`}
                >
                  {st.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Detail */}
      <div className="grid gap-8 border-t border-border p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]" style={{ color: s.accent }}>
            Stage {s.n} · {s.kicker}
          </p>
          <h3 className="display-cond mt-4 text-[clamp(2rem,4.4vw,3.4rem)] text-ink">{s.title}</h3>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">{s.body}</p>
        </div>
        <ul className="grid gap-px self-start bg-border">
          {s.detail.map((d) => (
            <li key={d} className="flex gap-3 bg-[var(--night)] px-5 py-4 text-sm text-foreground/80">
              <span
                className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: s.accent }}
                aria-hidden
              />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
