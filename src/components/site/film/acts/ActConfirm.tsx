import { Act } from "../Act";
import { act } from "@/config/acts";
import fire from "@/assets/act-fire.jpg";

const copy = act("confirm");

/** Format: one frame, two sensors. A hard edge travels across — a switch, not a fade. */
export function ActConfirm() {
  return (
    <Act id="act-confirm" label={copy.title} vh={250} stageClassName="bg-black">
      <img
        src={fire}
        alt="A fire front and smoke column seen from the air"
        className="act-media"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="act-thermal" aria-hidden>
        <img src={fire} alt="" className="act-media" width={1920} height={1080} loading="lazy" />
      </div>
      <span className="act-wipe-edge" aria-hidden />

      <div className="act-confirm-stamp" aria-hidden>
        Fire confirmed
      </div>

      <div className="act-copy act-copy-left act-copy-low">
        <p className="act-kicker text-[var(--signal)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line">{copy.line}</p>
        <p className="act-detail">{copy.detail}</p>
      </div>
    </Act>
  );
}
