import { Act } from "../Act";
import { acts } from "@/config/acts";
import steam from "@/assets/act-steam.jpg";

const copy = acts[9]!;

/** Page form: the quiet check afterwards. */
export function ActReassess() {
  return (
    <Act id="act-reassess" label={copy.title} pinned={false} stageClassName="pg-sec">
      <div className="pg-in">
        <div className="pg-grid">
          <figure className="pg-figure pg-rise" style={{ aspectRatio: "16 / 11" }}>
            <img
              src={steam}
              alt="Steam rising from blackened ground after water was applied"
              width={1600}
              height={1100}
              loading="lazy"
            />
            <figcaption>Second pass · thermal + RGB</figcaption>
          </figure>

          <div className="pg-rise">
            <p className="act-kicker text-[var(--aid)]">
              <span>{copy.code}</span>
              <span className="act-rule" />
              {copy.kicker}
            </p>
            <h2 className="pg-title">{copy.title}</h2>
            <p className="pg-line">{copy.line}</p>
            <p className="pg-sub">
              Ground that looks dead can still be holding heat. The aircraft flies the area again and the
              result goes back to the same people who authorized the run.
            </p>
          </div>
        </div>
      </div>
    </Act>
  );
}
