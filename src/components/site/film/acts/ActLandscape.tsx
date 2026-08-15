import { Act } from "../Act";
import { uav } from "../uav";
import { act } from "@/config/acts";
import ridge from "@/assets/j-ridge.jpg";

const copy = act("landscape");

const facts = [
  { h: "Remote ground", p: "Most ignitions start where there is no camera, no lookout and no crew within reach." },
  { h: "The first hour", p: "A fire is small, slow and survivable long before anyone sees the smoke column." },
  { h: "Wind decides", p: "Once the wind takes it, the window to act has already closed." },
];

/** Page form: the country we are watching, told as an editorial spread. */
export function ActLandscape() {
  return (
    <Act
      id="act-landscape"
      label={copy.title}
      pinned={false}
      frame={() => {
        uav.weight = 0;
      }}
      stageClassName="pg-sec"
    >
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
            <p className="pg-sub">
              A ridge, a canyon, a dry slope with nobody on it. By the time it is worth reporting, it is
              already worth running from.
            </p>
          </div>

          <figure className="pg-figure pg-rise">
            <img
              src={ridge}
              alt="Dry ridgelines and canyons in California high country"
              width={1600}
              height={1200}
              loading="lazy"
            />
            <figcaption>California high country · dry fuel, no coverage</figcaption>
          </figure>
        </div>

        <div className="pg-cards pg-cards-3 pg-stagger">
          {facts.map((f, i) => (
            <div key={f.h} className="pg-card" style={{ ["--i" as string]: i }}>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </div>
          ))}
        </div>
      </div>
    </Act>
  );
}
