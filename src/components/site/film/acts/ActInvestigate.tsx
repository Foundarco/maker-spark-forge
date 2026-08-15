import { Act } from "../Act";
import { act } from "@/config/acts";
import pov from "@/assets/act-pov.jpg";

const copy = act("investigate");

/** Format: payload point of view. Letterbox closes in, the frame becomes a camera. */
export function ActInvestigate() {
  return (
    <Act id="act-investigate" label={copy.title} vh={220} stageClassName="bg-black">
      <img
        src={pov}
        alt="Aerial view of a smoke column rising from a forested canyon"
        className="act-media act-pov-media"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <span className="act-bar act-bar-top" aria-hidden />
      <span className="act-bar act-bar-bottom" aria-hidden />
      <div className="act-lens" aria-hidden />

      <div className="act-pov-hud" aria-hidden>
        <span>CAM · RGB</span>
        <span>PAYLOAD VIEW · CONCEPT</span>
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
