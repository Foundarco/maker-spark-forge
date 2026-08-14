import { Act } from "../Act";
import { acts } from "@/config/acts";
import responders from "@/assets/act-responders.jpg";

const copy = acts[10]!;

const delivered = ["Where it is", "What it looks like", "What changed since the alert"];

/** Format: the human moment. Warm, wide, almost no technical furniture. */
export function ActHandoff() {
  return (
    <Act id="act-handoff" label={copy.title} vh={210} stageClassName="bg-[#100b07]">
      <img
        src={responders}
        alt="Two wildland firefighters walking a fire road at golden hour"
        className="act-media act-push"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="act-grade-golden" aria-hidden />

      <div className="act-copy act-copy-left act-copy-low">
        <p className="act-kicker text-[var(--signal)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line">{copy.line}</p>
        <ul className="act-handoff-list">
          {delivered.map((d, i) => (
            <li key={d} style={{ ["--delay" as string]: (0.3 + i * 0.08).toFixed(2) }}>
              {d}
            </li>
          ))}
        </ul>
      </div>
    </Act>
  );
}
