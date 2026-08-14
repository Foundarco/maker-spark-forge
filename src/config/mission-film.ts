/**
 * Mission 01 — the cinematic film timeline.
 *
 * One normalized 0 → 1 master timeline. Each entry is a camera SHOT, not a
 * page section: shots overlap, share plates and hand off continuously.
 *
 * Telemetry strings are deliberately conceptual. Nothing here states a
 * measured value, a deployed count, or an operational result.
 */

export type Tone = "signal" | "data" | "neutral" | "calm";

export type Shot = {
  id: string;
  code: string;
  /** small kicker above the headline */
  kicker: string;
  /** one strong line */
  title: string;
  /** one sentence, maximum */
  line?: string;
  tone: Tone;
  /** normalized position on the master timeline */
  at: number;
  /** conceptual status readouts — never measured values */
  telemetry?: readonly string[];
  /** development / planned capability tag */
  note?: string;
  align?: "left" | "right";
};

export const shots: Shot[] = [
  {
    id: "california",
    code: "01",
    kicker: "Mission 01 · Wildfire",
    title: "See the fire sooner.",
    line: "An autonomous wildfire detection and aerial response system, in development.",
    tone: "signal",
    at: 0,
    telemetry: ["CALIFORNIA", "SYSTEM · IN DEVELOPMENT"],
  },
  {
    id: "flight",
    code: "02",
    kicker: "Flight",
    title: "Terrain nobody is watching.",
    line: "Ridgelines, canyons and dry fuel, far from the nearest camera or crew.",
    tone: "neutral",
    at: 0.07,
    align: "right",
    telemetry: ["UAV · TEST PLATFORM", "TRANSIT"],
  },
  {
    id: "network",
    code: "03",
    kicker: "Sensing",
    title: "The ground is listening.",
    line: "Distributed nodes watch local conditions and corroborate each other.",
    tone: "data",
    at: 0.145,
    telemetry: ["SENSOR NETWORK · DEVELOPMENT", "LINK · CONCEPT"],
  },
  {
    id: "anomaly",
    code: "04",
    kicker: "Anomaly",
    title: "Something changes.",
    line: "One reading is noise. A pattern across neighbours is a signal.",
    tone: "signal",
    at: 0.215,
    align: "right",
    telemetry: ["ANOMALY · OBSERVED"],
  },
  {
    id: "alert",
    code: "05",
    kicker: "Detection",
    title: "A signal becomes an alert.",
    tone: "signal",
    at: 0.28,
    telemetry: ["ALERT · DETECTED"],
  },
  {
    id: "ops",
    code: "06",
    kicker: "Operations",
    title: "Someone is watching. 24/7/365.",
    line: "A person reviews the detection and opens an incident.",
    tone: "data",
    at: 0.35,
    align: "right",
    telemetry: ["OPERATIONS CENTER · 24/7/365", "INCIDENT · OPEN"],
  },
  {
    id: "dispatch",
    code: "07",
    kicker: "Dispatch",
    title: "Then we send eyes.",
    line: "A route is assigned and the aircraft flies it under operator oversight.",
    tone: "data",
    at: 0.42,
    telemetry: ["ROUTE · ASSIGNED", "OVERSIGHT · OPERATOR"],
  },
  {
    id: "smoke",
    code: "08",
    kicker: "Approach",
    title: "Smoke first.",
    line: "A column on the horizon, long before anything looks like a wall of flame.",
    tone: "neutral",
    at: 0.49,
    align: "right",
    telemetry: ["TARGET AREA · APPROACH"],
  },
  {
    id: "rgb",
    code: "09",
    kicker: "Investigation",
    title: "Look with the eye.",
    line: "Optical reads terrain, access and how the column behaves.",
    tone: "signal",
    at: 0.56,
    telemetry: ["PAYLOAD · RGB"],
  },
  {
    id: "thermal",
    code: "10",
    kicker: "Thermal",
    title: "Then look through the smoke.",
    line: "Thermal is designed to find heat that canopy, haze and darkness hide.",
    tone: "signal",
    at: 0.63,
    align: "right",
    telemetry: ["PAYLOAD · RGB + THERMAL"],
  },
  {
    id: "confirmed",
    code: "11",
    kicker: "Confirmation",
    title: "Fire confirmed.",
    line: "Thermal and visual agree on the event and where it is.",
    tone: "signal",
    at: 0.70,
    telemetry: ["FIRE STATUS · CONFIRMED"],
  },
  {
    id: "suppression",
    code: "12",
    kicker: "Suppression",
    title: "A first attempt to slow it.",
    line: "Once a fire is confirmed and the mission is authorized, the aircraft is intended to release a water payload.",
    note: "Planned capability · in development. Release is designed to be subject to mission rules, geofencing, aircraft safety and payload limits.",
    tone: "signal",
    at: 0.77,
    align: "right",
    telemetry: ["SUPPRESSION · IN DEVELOPMENT", "AUTHORIZATION · REQUIRED"],
  },
  {
    id: "reassess",
    code: "13",
    kicker: "Reassessment",
    title: "Check the fire again.",
    line: "The aircraft re-observes the area; conditions stay monitored, nothing is assumed.",
    tone: "data",
    at: 0.84,
    telemetry: ["REASSESSMENT · ACTIVE", "CONDITIONS · MONITORED"],
  },
  {
    id: "responder",
    code: "14",
    kicker: "Handoff",
    title: "Give the picture to the responders.",
    line: "Coordinates, imagery and mission record, assembled for the people already moving.",
    tone: "calm",
    at: 0.905,
    align: "right",
    telemetry: ["HANDOFF · PREPARING"],
  },
  {
    id: "system",
    code: "15",
    kicker: "Mission 01 · Wildfire",
    title: "This is only the beginning.",
    line: "Sensors, Operations Center, aircraft, suppression and software — one system.",
    tone: "neutral",
    at: 0.965,
    telemetry: [
      "SENSE → DETECT → OPERATIONS → INVESTIGATE → CONFIRM → SUPPRESS → REASSESS → HANDOFF",
    ],
  },
];

/** Architecture chips revealed in the final pull-back. */
export const systemChain = [
  "Sensors",
  "Detection",
  "Operations Center",
  "UAV",
  "Investigation",
  "Suppression attempt",
  "Reassessment",
  "Responder",
] as const;
