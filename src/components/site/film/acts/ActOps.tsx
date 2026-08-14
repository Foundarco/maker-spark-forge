import { Act } from "../Act";
import { OversightLockup } from "../OversightLockup";
import { acts } from "@/config/acts";
import operator from "@/assets/act-operator.jpg";

const copy = acts[3]!;

const rows = [
  { label: "Anomaly", state: "Observed" },
  { label: "Alert", state: "Raised" },
  { label: "Incident", state: "Open" },
  { label: "Operator review", state: "In progress" },
];

/** Format: a real room, with a restrained operational layer docked beside it. */
export function ActOps() {
  return (
    <Act id="act-ops" label={copy.title} vh={230} stageClassName="bg-[#05080e]">
      <img
        src={operator}
        alt="An operator reviewing incident maps at a monitoring console"
        className="act-media act-slide-left"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="act-grade-cool" aria-hidden />

      <aside className="act-panel" aria-hidden>
        <p className="act-panel-head">Incident · under review</p>
        <ul className="act-panel-rows">
          {rows.map((r, i) => (
            <li key={r.label} style={{ ["--delay" as string]: (0.24 + i * 0.09).toFixed(2) }}>
              <span>{r.label}</span>
              <span className="act-panel-state">{r.state}</span>
            </li>
          ))}
        </ul>
        <div className="act-panel-map">
          <svg viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden>
            <path className="act-panel-route" d="M18 96 C 70 88, 104 52, 158 34" fill="none" vectorEffect="non-scaling-stroke" />
            <circle cx="158" cy="34" r="4" />
          </svg>
        </div>
      </aside>

      <div className="act-copy act-copy-left">
        <p className="act-kicker text-[var(--aid)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line">{copy.line}</p>
        <p className="act-detail">{copy.detail}</p>
        <div className="mt-6">
          <OversightLockup compact />
        </div>
      </div>
    </Act>
  );
}
