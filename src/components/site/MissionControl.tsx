import { SensorNetwork } from "./SensorNetwork";

const feed = [
  { t: "T+00:00", s: "Node 07 reports temperature anomaly", tone: "sig" },
  { t: "T+00:00", s: "Detection candidate raised · cross-checking neighbours", tone: "sig" },
  { t: "T+00:01", s: "Alert routed to Operations Center", tone: "sig" },
  { t: "T+00:03", s: "Operator review · incident opened", tone: "" },
  { t: "T+00:06", s: "UAV mission assigned to incident", tone: "cyan" },
  { t: "T+00:09", s: "Aircraft airborne · navigating to coordinates", tone: "cyan" },
  { t: "T+00:21", s: "Thermal + RGB on station", tone: "cyan" },
  { t: "T+00:23", s: "Intelligence package prepared for responders", tone: "ok" },
];

const toneColor: Record<string, string> = {
  sig: "var(--signal)",
  cyan: "#22d3ee",
  ok: "#4ade80",
  "": "currentColor",
};

/** Concept mission-control interface. All values are illustrative. */
export function MissionControl() {
  return (
    <div className="border border-border bg-[var(--night)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-foreground/75">
            Mission control · concept interface
          </span>
        </div>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
          Illustrative data — not live operations
        </span>
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-[1.45fr_1fr]">
        <div className="blueprint-grid relative bg-[var(--night)] p-5 text-foreground/50">
          <div className="aspect-[16/11] w-full">
            <SensorNetwork />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {[
              { k: "Network", v: "Nodes reporting" },
              { k: "Alerts", v: "1 under review" },
              { k: "Aircraft", v: "1 assigned" },
              { k: "Weather", v: "Gusting, low RH" },
            ].map((c) => (
              <div key={c.k} className="bg-[var(--night)] px-4 py-3">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{c.k}</p>
                <p className="mt-1.5 text-sm text-ink">{c.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--night)] p-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            Incident timeline
          </p>
          <ol className="mt-4 space-y-3">
            {feed.map((f) => (
              <li key={f.s} className="flex gap-3 text-sm">
                <span className="font-mono text-[0.68rem] tabular-nums text-muted-foreground">{f.t}</span>
                <span className="flex items-start gap-2 text-foreground/80">
                  <span
                    className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: toneColor[f.tone] }}
                    aria-hidden
                  />
                  {f.s}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            The internal HQ carries the operational version of this interface: live alerts, incident queue,
            sensor network, UAV fleet, communications, and the incident record.
          </p>
        </div>
      </div>
    </div>
  );
}
