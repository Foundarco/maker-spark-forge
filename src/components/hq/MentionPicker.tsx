import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MentionCandidate = { id: string; full_name: string | null; email: string | null };

/**
 * Floating picker for @-mentions. Anchored to a caret position; parent
 * controls open/close and provides the search query.
 */
export function MentionPicker({
  query,
  anchor,
  onPick,
  onClose,
}: {
  query: string;
  anchor: { x: number; y: number } | null;
  onPick: (u: MentionCandidate) => void;
  onClose: () => void;
}) {
  const [results, setResults] = useState<MentionCandidate[]>([]);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = query.trim();
      let req = supabase.from("profiles").select("id, full_name, email").limit(8);
      if (q) req = req.ilike("full_name", `%${q}%`);
      const { data } = await req;
      if (!cancelled) {
        setResults((data ?? []) as MentionCandidate[]);
        setActive(0);
      }
    })();
    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter" || e.key === "Tab") {
        if (results[active]) { e.preventDefault(); onPick(results[active]); }
      } else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [results, active, onPick, onClose]);

  if (!anchor || results.length === 0) return null;

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: anchor.x, top: anchor.y, width: 260 }}
      className="z-[70] overflow-hidden rounded-lg border border-border bg-popover shadow-2xl"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="border-b border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        People
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {results.map((u, i) => (
          <li key={u.id}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => onPick(u)}
              className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm ${i === active ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate">{u.full_name || u.email}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
