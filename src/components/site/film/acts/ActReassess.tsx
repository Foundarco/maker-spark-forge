import { Act } from "../Act";
import { acts } from "@/config/acts";
import steam from "@/assets/act-steam.jpg";

const copy = acts[9]!;

/** Format: quiet. One sweep, one line, then out. */
export function ActReassess() {
  return (
    <Act id="act-reassess" label={copy.title} vh={170} stageClassName="bg-[#070b10]">
      <img
        src={steam}
        alt="Steam rising from blackened ground after water was applied"
        className="act-media act-push"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="act-sweep" aria-hidden />
      <div className="act-grade-cool" aria-hidden />

      <div className="act-copy act-copy-center">
        <p className="act-kicker text-[var(--aid)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line">{copy.line}</p>
      </div>
    </Act>
  );
}
