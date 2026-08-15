/**
 * The film's chapters.
 *
 * This is the single source of story copy: the cinematic acts and the
 * reduced-motion fallback both read it, so they can never drift apart.
 * Language is deliberately plain, and nothing here states a measured value,
 * a deployed count, or an operational result.
 */

export type ActCopy = {
  id: string;
  code: string;
  kicker: string;
  title: string;
  line: string;
  /** small technical layer, shown after the sentence */
  detail?: string;
  /** development status label */
  note?: string;
};

export const acts: ActCopy[] = [
  {
    id: "opening",
    code: "01",
    kicker: "Wildfire response",
    title: "See the fire sooner.",
    line: "Most wildfires start where nobody is looking. We are building a system that watches that ground.",
    note: "",
  },
  {
    id: "rain",
    code: "02",
    kicker: "Then the rain came",
    title: "Too late to matter.",
    line: "Rain always arrives eventually. The question is whether anything is left when it does.",
    detail: "What if the ground could tell us first",
  },
  {
    id: "landscape",
    code: "02",
    kicker: "The country",
    title: "Nobody is out there.",
    line: "Half of this state burns in places with no camera, no lookout and no crew inside an hour.",
  },
  {
    id: "sense",
    code: "03",
    kicker: "Sense",
    title: "Put eyes on the ground.",
    line: "Low-cost nodes sit in the terrain, read what is happening around them, and cross-check each other.",
    detail: "Sensor network",
  },
  {
    id: "ops",
    code: "04",
    kicker: "Detect · Alert · Review",
    title: "A person picks up the alert.",
    line: "When the readings stop looking normal, the alert lands in our Operations Center — and a human decides what happens next.",
    detail: "Operations Center · 24/7/365",
  },
  {
    id: "clouds",
    code: "07",
    kicker: "Above the deck",
    title: "Get above it.",
    line: "Above the smoke and the cloud layer, the sky is clear and the ground is readable.",
  },
  {
    id: "reveal",
    code: "08",
    kicker: "The aircraft",
    title: "Built to go and look.",
    line: "A vertical-takeoff aircraft carrying a camera, a thermal sensor and a water payload — small enough to launch from a truck.",
    detail: "VTOL · fixed-wing cruise",
  },
  {
    id: "oversight",
    code: "05",
    kicker: "How it is controlled",
    title: "Autonomous, not unsupervised.",
    line: "The aircraft flies and looks on its own. People decide whether a mission happens, and when it stops.",
    detail: "Mission rules, geofencing and safety limits apply to every flight",
  },
  {
    id: "navigate",
    code: "06",
    kicker: "Dispatch · Navigate",
    title: "The aircraft goes to look.",
    line: "Once the mission is authorized, the aircraft flies the route by itself while an operator watches it.",
  },
  {
    id: "investigate",
    code: "07",
    kicker: "Investigate",
    title: "Look with the eye.",
    line: "The camera reads the ground: the fuel, the roads in, and how the smoke is moving.",
    detail: "Payload · RGB",
  },
  {
    id: "confirm",
    code: "08",
    kicker: "Confirm",
    title: "Now look through the smoke.",
    line: "Thermal is designed to find heat that canopy, haze and darkness hide. When both agree, the fire is confirmed.",
    detail: "Payload · RGB + thermal",
  },
  {
    id: "suppress",
    code: "09",
    kicker: "Suppression attempt",
    title: "Try to slow it down.",
    line: "With the fire confirmed and the mission authorized, the aircraft is intended to release a water payload on a controlled pass.",
    note: "Release is designed to require authorization and to respect mission rules, geofencing and payload limits.",
  },
  {
    id: "reassess",
    code: "10",
    kicker: "Reassess",
    title: "Do not assume it is out.",
    line: "The aircraft comes back around and reads the same ground a second time.",
  },
  {
    id: "handoff",
    code: "11",
    kicker: "Handoff",
    title: "Hand it to the crews.",
    line: "Location, imagery and a record of everything that changed — in the hands of the people already moving.",
  },
  {
    id: "system",
    code: "12",
    kicker: "Wildfire response",
    title: "One system.",
    line: "Sensors, Operations Center, aircraft, payload and software — built to work as one.",
  },
];

/** copy lookup by id — order in the array is story order, not an index contract */
export const act = (id: string): ActCopy => acts.find((a) => a.id === id)!;

export const chain = [
  "Sense",
  "Detect",
  "Alert",
  "Review",
  "Authorize",
  "Navigate",
  "Investigate",
  "Confirm",
  "Suppression attempt",
  "Reassess",
  "Handoff",
] as const;

export const futureMissions = [
  "Search and rescue",
  "Disaster mapping",
  "Flood",
  "Storm damage",
  "Hazardous environments",
] as const;
