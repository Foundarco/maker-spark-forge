import { Act } from "../Act";
import { uav } from "../uav";
import { win } from "../useFilmScroll";
import { acts } from "@/config/acts";
import ridge from "@/assets/j-ridge.jpg";

const copy = acts[1]!;

/** Real landscape, with the aircraft crossing it. */
export function ActLandscape() {
  return (
    <Act
      id="act-landscape"
      label={copy.title}
      vh={240}
      frame={(p) => {
        uav.t = 0.02 + p * 0.42;
        uav.weight = win(p, 0.04, 0.2, 0.72, 0.94);
        uav.bank = 0;
      }}
      stageClassName="bg-[#0b1016]"
    >
      <img
        src={ridge}
        alt="Dry ridgelines and canyons in California high country"
        className="act-media act-push"
        width={1920}
        height={1080}
        loading="lazy"
      />
      <div className="act-grade-warm" aria-hidden />

      <div className="act-copy act-copy-left">
        <p className="act-kicker text-[var(--signal)]">
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
