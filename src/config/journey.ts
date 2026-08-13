import ridge from "@/assets/j-ridge.jpg";
import uav from "@/assets/j-uav.jpg";
import node from "@/assets/j-node.jpg";
import canyon from "@/assets/j-canyon.jpg";
import ignition from "@/assets/j-ignition.jpg";
import ops from "@/assets/j-ops.jpg";
import transit from "@/assets/j-transit.jpg";
import fire from "@/assets/j-fire.jpg";
import foothills from "@/assets/j-foothills.jpg";
import responders from "@/assets/j-responders.jpg";
import system from "@/assets/j-system.jpg";

/**
 * The scroll-driven mission journey.
 *
 * One normalized timeline (0 → 1) drives every shot. Each beat owns one
 * photographic plate, a colour grade and a single short line of copy — the
 * imagery carries the story, the words only name the moment.
 */
export type Beat = {
  id: string;
  /** technical stage label */
  code: string;
  label: string;
  title: string;
  line: string;
  /** optional expandable technical detail */
  detail?: string;
  /** amber = fire/alert, cyan = data/technical */
  tone: "signal" | "data" | "neutral";
  /** photographic plate for this beat */
  img: string;
  /** colour grade layered over the plate — carries the emotional progression */
  grade: string;
  /** optional CSS filter applied to the plate (thermal pass) */
  filter?: string;
  /** focal origin for the slow push, e.g. "50% 60%" */
  focus?: string;
};

const g = {
  dawn: "linear-gradient(180deg, rgba(8,18,34,0.34) 0%, rgba(8,18,34,0.05) 42%, rgba(6,12,22,0.72) 100%)",
  sky: "linear-gradient(180deg, rgba(6,26,52,0.30) 0%, rgba(6,20,40,0.04) 45%, rgba(5,12,24,0.74) 100%)",
  cool: "linear-gradient(180deg, rgba(4,28,50,0.42) 0%, rgba(8,34,58,0.10) 45%, rgba(3,10,20,0.80) 100%)",
  amber:
    "linear-gradient(180deg, rgba(30,16,4,0.30) 0%, rgba(120,62,10,0.10) 40%, rgba(12,8,6,0.80) 100%), radial-gradient(60% 50% at 50% 62%, rgba(255,168,60,0.20), transparent 70%)",
  ember:
    "linear-gradient(180deg, rgba(28,10,2,0.24) 0%, rgba(150,64,10,0.14) 45%, rgba(14,6,4,0.82) 100%), radial-gradient(55% 45% at 52% 60%, rgba(255,122,26,0.26), transparent 72%)",
  thermal:
    "linear-gradient(180deg, rgba(6,0,30,0.30) 0%, rgba(80,0,60,0.16) 45%, rgba(4,0,16,0.80) 100%)",
  cyan: "linear-gradient(180deg, rgba(2,26,44,0.42) 0%, rgba(4,52,80,0.14) 45%, rgba(2,10,20,0.82) 100%), radial-gradient(70% 60% at 50% 55%, rgba(56,189,248,0.14), transparent 70%)",
  dusk: "linear-gradient(180deg, rgba(8,14,34,0.34) 0%, rgba(40,20,10,0.10) 46%, rgba(6,8,18,0.78) 100%)",
};

export const beats: Beat[] = [
  {
    id: "california",
    code: "00",
    label: "Mission 01 · Wildfire",
    title: "See the fire sooner.",
    line: "An autonomous wildfire detection and aerial response system, in development.",
    tone: "signal",
    img: ridge,
    grade: g.dawn,
    focus: "50% 55%",
  },
  {
    id: "flight",
    code: "01",
    label: "In flight",
    title: "Wildfire doesn't wait.",
    line: "Remote terrain. Dry fuel. Wind. Minutes pass before anyone knows.",
    tone: "neutral",
    img: uav,
    grade: g.sky,
    focus: "45% 50%",
  },
  {
    id: "network",
    code: "02",
    label: "Detection network",
    title: "Detection starts on the ground.",
    line: "Distributed sensor nodes watch local conditions and corroborate each other.",
    detail:
      "Temperature, humidity, particulate indicators and atmospheric conditions over low-power wireless links. Sensing set in development.",
    tone: "data",
    img: node,
    grade: g.cool,
    focus: "62% 50%",
  },
  {
    id: "coverage",
    code: "03",
    label: "Coverage",
    title: "Where nobody is watching.",
    line: "Ridgelines and canyons that cameras and crews rarely reach.",
    tone: "data",
    img: canyon,
    grade: g.cool,
    focus: "50% 45%",
  },
  {
    id: "detect",
    code: "04",
    label: "Detection",
    title: "A node sees something change.",
    line: "One anomalous reading is noise. A pattern across neighbours is a signal.",
    tone: "signal",
    img: ignition,
    grade: g.amber,
    focus: "45% 50%",
  },
  {
    id: "ops",
    code: "05",
    label: "Operations Center",
    title: "Alert received.",
    line: "24/7/365. A person reviews the detection and opens an incident.",
    tone: "data",
    img: ops,
    grade: g.cyan,
    focus: "50% 50%",
  },
  {
    id: "dispatch",
    code: "06",
    label: "Dispatch",
    title: "Mission assigned.",
    line: "An aircraft is cleared to the coordinates and flies the route autonomously.",
    detail:
      "Autonomous or assisted navigation with an operator in the loop. Not deployed — design intent under active development.",
    tone: "data",
    img: transit,
    grade: g.sky,
    focus: "55% 55%",
  },
  {
    id: "rgb",
    code: "07",
    label: "Optical",
    title: "Eyes on the fire.",
    line: "Optical reads terrain, access routes and how the smoke column behaves.",
    tone: "signal",
    img: fire,
    grade: g.ember,
    focus: "52% 52%",
  },
  {
    id: "thermal",
    code: "08",
    label: "Thermal",
    title: "Thermal + visual intelligence.",
    line: "Thermal is designed to find the heat that smoke, canopy and darkness hide.",
    tone: "signal",
    img: fire,
    grade: g.thermal,
    filter:
      "grayscale(1) contrast(1.5) brightness(1.05) sepia(1) hue-rotate(-35deg) saturate(4.2)",
    focus: "52% 52%",
  },
  {
    id: "intel",
    code: "09",
    label: "Intelligence",
    title: "Coordinates lock.",
    line: "Imagery, position and thermal information assemble into one incident record.",
    tone: "data",
    img: foothills,
    grade: g.cyan,
    focus: "50% 55%",
  },
  {
    id: "responder",
    code: "10",
    label: "Responder",
    title: "Information for responders.",
    line: "A clearer picture reaches the people already running toward it.",
    tone: "neutral",
    img: responders,
    grade: g.dusk,
    focus: "50% 45%",
  },
  {
    id: "system",
    code: "11",
    label: "The system",
    title: "Wildfire is only the beginning.",
    line: "Sensors, Operations Center, aircraft and software — designed as one pipeline.",
    tone: "neutral",
    img: system,
    grade: g.dawn,
    focus: "50% 50%",
  },
];

/** Slice of scroll progress owned by beat i. */
export const beatAt = (p: number) =>
  Math.min(beats.length - 1, Math.max(0, Math.floor(p * beats.length)));
