import { Act } from "../Act";
import { acts } from "@/config/acts";
import topo from "@/assets/act-topo.jpg";

const copy = acts[2]!;

const nodes = [
  { x: 18, y: 62 },
  { x: 29, y: 38 },
  { x: 41, y: 71 },
  { x: 52, y: 30 },
  { x: 58, y: 58 },
  { x: 67, y: 44 },
  { x: 74, y: 68 },
  { x: 84, y: 36 },
  { x: 88, y: 60 },
];

const rows = [
  ["01", "Nodes read heat, humidity, smoke and wind where they sit."],
  ["02", "Each node compares its reading against its neighbours."],
  ["03", "One odd reading is noise. Several together is a signal."],
];

/** Page form: a written explanation beside a live terrain map card. */
export function ActSense() {
  return (
    <Act id="act-sense" label={copy.title} pinned={false} stageClassName="pg-sec">
      <div className="pg-in">
        <div className="pg-grid">
          <div className="pg-rise">
            <p className="act-kicker text-[var(--aid)]">
              <span>{copy.code}</span>
              <span className="act-rule" />
              {copy.kicker}
            </p>
            <h2 className="pg-title">{copy.title}</h2>
            <p className="pg-line">{copy.line}</p>
            <ul className="pg-list pg-stagger">
              {rows.map(([n, text], i) => (
                <li key={n} style={{ ["--i" as string]: i }}>
                  <span>{n}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pg-map pg-rise">
            <img src={topo} alt="" aria-hidden width={1200} height={960} loading="lazy" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="act-mesh" aria-hidden>
              {nodes.slice(0, -1).map((n, i) => {
                const m = nodes[i + 1]!;
                return (
                  <line key={i} x1={n.x} y1={n.y} x2={m.x} y2={m.y} vectorEffect="non-scaling-stroke" />
                );
              })}
            </svg>
            {nodes.map((n, i) => (
              <span
                key={i}
                className={`act-node ${i === 4 ? "is-alert" : ""}`}
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  ["--delay" as string]: (0.12 + i * 0.055).toFixed(3),
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
    </Act>
  );
}
