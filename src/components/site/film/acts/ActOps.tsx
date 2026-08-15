import { Act } from "../Act";
import { OversightLockup } from "../OversightLockup";
import { act } from "@/config/acts";
import operator from "@/assets/act-operator.jpg";

const copy = act("ops");

const rows = [
  { label: "Anomaly", state: "Observed" },
  { label: "Alert", state: "Raised" },
  { label: "Incident", state: "Open" },
  { label: "Operator review", state: "In progress" },
];

/** Page form: the room, the queue, and who is accountable for the call. */
export function ActOps() {
  return (
    <Act id="act-ops" label={copy.title} pinned={false} stageClassName="pg-sec">
      <div className="pg-in">
        <div className="pg-grid">
          <div className="pg-rise">
            <p className="act-kicker text-[var(--aid)]">
              <span>{copy.code}</span>
              <span className="act-rule" />
              {copy.kicker}
            </p>
            <h2 className="pg-title">{copy.title}</h2>
            <p className="pg-line">{copy.line}</p>
            <p className="pg-sub">{copy.detail}</p>
            <div className="mt-7">
              <OversightLockup compact />
            </div>
          </div>

          <div className="grid gap-4">
            <figure className="pg-figure pg-rise" style={{ aspectRatio: "16 / 10" }}>
              <img
                src={operator}
                alt="An operator reviewing incident maps at a monitoring console"
                width={1600}
                height={1000}
                loading="lazy"
              />
              <figcaption>Operations Center · incident review</figcaption>
            </figure>

            <div className="pg-card pg-rise">
              <h3>Incident · under review</h3>
              <ul className="mt-3 grid gap-2 pg-stagger">
                {rows.map((r, i) => (
                  <li
                    key={r.label}
                    style={{ ["--i" as string]: i }}
                    className="flex items-center justify-between border-b border-white/8 pb-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink/60"
                  >
                    <span>{r.label}</span>
                    <span className="text-[var(--signal)]">{r.state}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Act>
  );
}
