import { Act } from "../Act";
import { uav } from "../uav";
import { ramp, win } from "../useFilmScroll";
import { acts } from "@/config/acts";
import suppression from "@/assets/f-suppression.jpg";

const copy = acts[8]!;

const stages = [
  { at: 0.08, label: "Heading change", state: "Aircraft repositioning" },
  { at: 0.26, label: "Payload", state: "Ready" },
  { at: 0.42, label: "Authorization", state: "Granted by operator" },
  { at: 0.58, label: "Pass", state: "Controlled run" },
  { at: 0.74, label: "Release", state: "Water payload" },
];

/** Format: the mission itself — the one act driven frame by frame. */
export function ActSuppress() {
  return (
    <Act
      id="act-suppress"
      label={copy.title}
      vh={300}
      frame={(p, { t }) => {
        uav.t = 0.6 + p * 0.3;
        uav.weight = win(p, 0.02, 0.14, 0.86, 0.98);
        uav.bank = Math.sin(p * Math.PI * 1.4) * 0.22 + Math.sin(t * 0.7) * 0.02;
        uav.release = win(p, 0.7, 0.76, 0.84, 0.9);
      }}
      stageClassName="bg-[#0a0705]"
    >
      <img
        src={suppression}
        alt="Smoke and flame on a forested slope during a suppression pass"
        className="act-media act-push"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="act-grade-ember" aria-hidden />

      {/* released mass: falls, disperses, then blooms on impact */}
      <div className="act-drop" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="act-impact" aria-hidden />

      <div className="act-copy act-copy-left">
        <p className="act-kicker text-[var(--signal)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line">{copy.line}</p>

        <ul className="act-stages" aria-hidden>
          {stages.map((s) => (
            <li key={s.label} style={{ ["--delay" as string]: s.at.toFixed(2) }}>
              <span>{s.label}</span>
              <span className="act-panel-state">{s.state}</span>
            </li>
          ))}
        </ul>

        <p className="act-note">{copy.note}</p>
      </div>

      <span className="act-status" aria-hidden>
        Planned capability · in development
      </span>
      {/* keeps the ramp helper honest for future tuning */}
      <span hidden>{ramp(0, 0, 1)}</span>
    </Act>
  );
}
