/**
 * The scroll-driven mission journey. Scroll position is the mission timeline:
 * each beat owns a slice of progress (0 → 1) and drives both the 3D scene and
 * the overlay copy. Text is deliberately short — the visuals carry the story.
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
    id: "hero",
    code: "00",
    label: "Mission 01 · Wildfire",
    title: "See the fire sooner.",
    line: "An autonomous wildfire detection and aerial response system, in development.",
    tone: "signal",
  },
  {
    id: "terrain",
    code: "01",
    label: "Environment",
    title: "Wildfire doesn't wait.",
    line: "Remote terrain. Minutes pass before anyone knows what is actually happening.",
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
    id: "detect",
    code: "03",
    label: "Detection",
    title: "A node sees something change.",
    line: "One anomalous reading is noise. A pattern across neighbours is a signal.",
    tone: "signal",
  },
  {
    id: "alert",
    code: "04",
    label: "Alert",
    title: "The signal leaves the ridge.",
    line: "Event and location propagate through the network to the Operations Center.",
    tone: "signal",
  },
  {
    id: "ops",
    code: "05",
    label: "Operations Center",
    title: "Someone is watching.",
    line: "24/7/365 monitoring. A person reviews the detection and opens an incident.",
    tone: "data",
  },
  {
    id: "dispatch",
    code: "06",
    label: "Dispatch",
    title: "A mission is created.",
    line: "An aircraft is assigned to the coordinates and cleared to investigate.",
    tone: "data",
  },
  {
    id: "flight",
    code: "07",
    label: "Autonomous flight",
    title: "Then we send eyes.",
    line: "The UAV navigates toward the event while the Operations Center tracks it.",
    detail:
      "Autonomous or assisted navigation with an operator in the loop. Not deployed — design intent under active development.",
    tone: "data",
  },
  {
    id: "thermal",
    code: "08",
    label: "Thermal + RGB",
    title: "Two ways of seeing the same ridge.",
    line: "Optical reads terrain and access. Thermal is designed to find heat that hides.",
    tone: "signal",
  },
  {
    id: "intel",
    code: "09",
    label: "Intelligence",
    title: "Coordinates lock. Data flows back.",
    line: "Imagery, position and thermal information assemble into one incident record.",
    tone: "data",
  },
  {
    id: "responder",
    code: "10",
    label: "Responder",
    title: "A clearer picture, sooner.",
    line: "Useful information reaches the people who are already running toward it.",
    tone: "neutral",
  },
  {
    id: "system",
    code: "11",
    label: "The system",
    title: "A drone alone isn't the system.",
    line: "Sensors, Operations Center, aircraft and software — designed as one pipeline.",
    tone: "data",
  },
];

/** Slice of scroll progress owned by beat i. */
export const beatAt = (p: number) =>
  Math.min(beats.length - 1, Math.max(0, Math.floor(p * beats.length)));
