import { Act } from "../Act";
import { acts, chain } from "@/config/acts";
import topo from "@/assets/act-topo.jpg";
import responders from "@/assets/act-responders.jpg";

const copy = act("system");

const nodes = [
  { id: "responder", label: "Responder", x: 16, y: 78 },
  { id: "incident", label: "Incident", x: 34, y: 58 },
  { id: "ops", label: "Operations Center", x: 52, y: 36 },
  { id: "uav", label: "Aircraft", x: 72, y: 55 },
  { id: "sensors", label: "Sensor network", x: 86, y: 79 },
];

/** Format: the pull-back. Start on the responder, end on the whole system. */
export function ActSystem() {
  return (
    <Act id="act-system" label={copy.title} vh={280} stageClassName="bg-[#04070c]">
      <img src={responders} alt="" aria-hidden className="act-media act-pullback-photo" width={1920} height={1080} loading="lazy" />
      <img src={topo} alt="" aria-hidden className="act-media act-pullback-map" width={1920} height={1080} loading="lazy" />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="act-graph" aria-hidden>
        {nodes.slice(0, -1).map((n, i) => {
          const m = nodes[i + 1]!;
          return (
            <line
              key={n.id}
              x1={n.x}
              y1={n.y}
              x2={m.x}
              y2={m.y}
              pathLength={100}
              vectorEffect="non-scaling-stroke"
              style={{ ["--delay" as string]: (0.22 + i * 0.11).toFixed(2) }}
            />
          );
        })}
      </svg>

      {nodes.map((n, i) => (
        <span
          key={n.id}
          className="act-graph-node"
          style={{ left: `${n.x}%`, top: `${n.y}%`, ["--delay" as string]: (0.2 + i * 0.11).toFixed(2) }}
          aria-hidden
        >
          {n.label}
        </span>
      ))}

      <div className="act-reveal-copy">
        <p className="act-kicker text-[var(--signal)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line mx-auto">{copy.line}</p>
        <div className="act-chain" aria-hidden>
          {chain.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <p className="act-final">This is only the beginning.</p>
      </div>
    </Act>
  );
}
