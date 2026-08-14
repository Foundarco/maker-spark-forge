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
    id: "landscape",
    code: "02",
    kicker: "The country",
    title: "It starts small.",
    line: "A ridge, a canyon, dry fuel — hours from the nearest camera or crew.",
  },
  {
    id: "sense",
    code: "03",
    kicker: "Sense",
    title: "Sensors watch the ground.",
    line: "Small nodes across the terrain track local conditions and check each other's readings.",
    detail: "Sensor network",
  },
  {
    id: "ops",
    code: "04",
    kicker: "Detect · Alert · Review",
    title: "Someone is watching.",
    line: "When the readings stop looking normal, the alert goes to our Operations Center, where a person reviews it.",
    detail: "Operations Center · 24/7/365",
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
    line: "The camera reads the terrain, the access roads and how the smoke is behaving.",
    detail: "Payload · RGB",
  },
  {
    id: "confirm",
    code: "08",
    kicker: "Confirm",
    title: "Then look through the smoke.",
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
    title: "Check it again.",
    line: "The aircraft looks a second time. Nothing is assumed to be out.",
  },
  {
    id: "handoff",
    code: "11",
    kicker: "Handoff",
    title: "Give them the picture.",
    line: "Location, imagery and a record of what happened, handed to the people already moving.",
  },
  {
    id: "system",
    code: "12",
    kicker: "Wildfire response",
    title: "One system.",
    line: "Sensors, Operations Center, aircraft, payload and software — built to work as one.",
  },
];

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
