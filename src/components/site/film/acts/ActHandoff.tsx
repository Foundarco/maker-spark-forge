import { Act } from "../Act";
import { acts } from "@/config/acts";
import responders from "@/assets/act-responders.jpg";

const copy = acts[10]!;

const delivered = [
  ["Location", "Coordinates, access roads and the nearest approach."],
  ["Imagery", "What the camera and the thermal sensor actually saw."],
  ["Change", "What moved between the first alert and the last pass."],
];

/** Page form: the human moment, written like a page in a report. */
export function ActHandoff() {
  return (
    <Act id="act-handoff" label={copy.title} pinned={false} stageClassName="pg-sec">
      <div className="pg-in">
        <div className="pg-grid pg-grid-wide">
          <div className="pg-rise">
            <p className="act-kicker text-[var(--signal)]">
              <span>{copy.code}</span>
              <span className="act-rule" />
              {copy.kicker}
            </p>
            <h2 className="pg-title">{copy.title}</h2>
            <p className="pg-line">{copy.line}</p>
            <ul className="pg-list pg-stagger">
              {delivered.map(([h, p], i) => (
                <li key={h} style={{ ["--i" as string]: i }}>
                  <span>{h}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="pg-figure pg-rise" style={{ aspectRatio: "4 / 3" }}>
            <img
              src={responders}
              alt="Two wildland firefighters walking a fire road at golden hour"
              width={1600}
              height={1200}
              loading="lazy"
            />
            <figcaption>Handoff · the people already moving</figcaption>
          </figure>
        </div>
      </div>
    </Act>
  );
}
