import { useEffect, useLayoutEffect, useState } from "react";

type Step = { selector: string; title: string; body: string; placement?: "right" | "bottom" };

const STEPS: Step[] = [
  { selector: '[data-tour="sidebar"]', title: "Navigation", body: "Every division lives here — Mission Ops, Engineering, Fleet, People and Funding. Groups collapse so you only see what you use.", placement: "right" },
  { selector: '[data-tour="search"]', title: "Search everything", body: "Find people, incidents, files and messages from one box. ⌘K works anywhere in HQ.", placement: "right" },
  { selector: '[aria-label="Apps"]', title: "Apps launcher", body: "Jump straight to Email, Channels, Phone, Calendar or Drive from any page.", placement: "bottom" },
  { selector: '[aria-label="Notifications"]', title: "Notifications", body: "Mentions, task assignments and approvals land here. Click one to open the record it came from.", placement: "bottom" },
  { selector: '[aria-label="Phone"]', title: "Calling", body: "Call teammates in-app. Calls are transcribed and saved to meeting notes automatically.", placement: "bottom" },
];

const KEY = "hq.tour.pending";

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(KEY) === "1") setActive(true); } catch { /* ignore */ }
  }, []);

  useLayoutEffect(() => {
    if (!active) return;
    const measure = () => {
      const el = document.querySelector(STEPS[i]?.selector ?? "");
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setInterval(measure, 400);
    return () => { window.removeEventListener("resize", measure); clearInterval(t); };
  }, [active, i]);

  if (!active) return null;

  const finish = () => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setActive(false);
  };
  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : finish());

  const pad = 8;
  const box = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  const step = STEPS[i];
  const tip = box
    ? step.placement === "bottom"
      ? { top: box.top + box.height + 12, left: Math.max(12, Math.min(box.left + box.width / 2 - 160, window.innerWidth - 332)) }
      : { top: Math.max(12, Math.min(box.top, window.innerHeight - 200)), left: box.left + box.width + 12 }
    : { top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160 };

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/55" onClick={finish} />
      {box && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-primary transition-all duration-300"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height, boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }}
        />
      )}
      <div className="absolute w-80 rounded-xl border border-border bg-card p-4 shadow-2xl transition-all duration-300" style={tip}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Step {i + 1} of {STEPS.length}</p>
        <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={finish} className="text-xs text-muted-foreground hover:text-foreground">Skip tour</button>
          <div className="flex gap-2">
            {i > 0 && <button onClick={() => setI(i - 1)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Back</button>}
            <button onClick={next} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              {i < STEPS.length - 1 ? "Next" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
