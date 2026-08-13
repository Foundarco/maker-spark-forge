/**
 * The scroll-driven mission journey. Scroll position is the mission timeline:
 * each beat owns an equal slice of progress (0 → 1) and drives both the 3D
 * camera and the overlay copy. Text is deliberately short — the visuals carry
 * the story.
 */
export type Beat = {
  id: string;
  /** technical stage label shown in the HUD */
  code: string;
  label: string;
  title: string;
  line: string;
  /** optional expandable technical detail */
  detail?: string;
  /** amber = fire/alert, cyan = data/technical */
  tone: "signal" | "data" | "neutral";
};

export const beats: Beat[] = [
  {
    id: "california",
    code: "00",
    label: "Mission 01 · Wildfire",
    title: "See the fire sooner.",
    line: "An autonomous wildfire detection and aerial response system, in development.",
    tone: "signal",
  },
  {
    id: "flight",
    code: "01",
    label: "In flight",
    title: "Wildfire doesn't wait.",
    line: "Remote terrain, dry fuel, wind. Minutes pass before anyone knows what is happening.",
    tone: "neutral",
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
  },
  {
    id: "coverage",
    code: "03",
    label: "Coverage",
    title: "Coverage where nobody is watching.",
    line: "Nodes cover ridgelines and canyons that cameras and crews rarely reach.",
    tone: "data",
  },
  {
    id: "detect",
    code: "04",
    label: "Detection",
    title: "A node sees something change.",
    line: "One anomalous reading is noise. A pattern across neighbours is a signal.",
    tone: "signal",
  },
  {
    id: "alert",
    code: "05",
    label: "Alert",
    title: "Alert received.",
    line: "Event and location propagate through the network to the Operations Center.",
    tone: "signal",
  },
  {
    id: "ops",
    code: "06",
    label: "Operations Center",
    title: "24/7/365 Operations Center.",
    line: "Someone is always watching. A person reviews the detection and opens an incident.",
    tone: "data",
  },
  {
    id: "dispatch",
    code: "07",
    label: "Dispatch",
    title: "Mission assigned.",
    line: "An aircraft is assigned to the coordinates and cleared to investigate.",
    tone: "data",
  },
  {
    id: "transit",
    code: "08",
    label: "Autonomous flight",
    title: "Then we send eyes.",
    line: "The UAV navigates toward the event while the Operations Center tracks it.",
    detail:
      "Autonomous or assisted navigation with an operator in the loop. Not deployed — design intent under active development.",
    tone: "data",
  },
  {
    id: "rgb",
    code: "09",
    label: "Optical",
    title: "Eyes on the fire.",
    line: "Optical reads terrain, access routes and how the smoke column is behaving.",
    tone: "signal",
  },
  {
    id: "thermal",
    code: "10",
    label: "Thermal",
    title: "Thermal + visual intelligence.",
    line: "Thermal is designed to find the heat that smoke, canopy and darkness hide.",
    tone: "signal",
  },
  {
    id: "intel",
    code: "11",
    label: "Intelligence",
    title: "Coordinates lock. Data flows back.",
    line: "Imagery, position and thermal information assemble into one incident record.",
    tone: "data",
  },
  {
    id: "responder",
    code: "12",
    label: "Responder",
    title: "Information for responders.",
    line: "A clearer picture reaches the people who are already running toward it.",
    tone: "neutral",
  },
  {
    id: "system",
    code: "13",
    label: "The system",
    title: "A drone alone isn't the system.",
    line: "Sensors, Operations Center, aircraft and software — designed as one pipeline.",
    tone: "data",
  },
  {
    id: "future",
    code: "14",
    label: "What's next",
    title: "Wildfire is only the beginning.",
    line: "Mission 01 has our full attention. The same foundation could serve other emergencies.",
    tone: "neutral",
  },
];

/** Slice of scroll progress owned by beat i. */
export const beatAt = (p: number) =>
  Math.min(beats.length - 1, Math.max(0, Math.floor(p * beats.length)));
