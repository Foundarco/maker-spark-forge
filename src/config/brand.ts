// Single source of truth for brand identity across the public website.
// Clovr Labs — an early-stage nonprofit building autonomous wildfire
// detection and UAV investigation technology.

export const brand = {
  name: "Clovr Labs",
  shortName: "Clovr",
  legalName: "Clovr Labs",
  mission01: "Autonomous wildfire detection + UAV response",
  tagline: "See the fire sooner.",
  status: "Early-stage",
  mission:
    "We're developing an autonomous wildfire detection and aerial response system designed to identify potential fires, investigate them quickly, and give responders better information.",
  shortMission:
    "An early-stage nonprofit developing distributed wildfire sensing, autonomous UAV investigation, and the software that connects them.",
  opsCenter: "24/7/365 Operations Center",
  hours: "Operations Center staffed 24/7/365",
  contact: {
    general: "hello@clovrlab.com",
    press: "press@clovrlab.com",
    partners: "partners@clovrlab.com",
    join: "join@clovrlab.com",
    research: "research@clovrlab.com",
  },
  socials: {
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    github: "#",
  },
  /** Honest, non-numeric statements about where the organization actually is. */
  statusPoints: [
    { label: "Focus", value: "Wildfire detection + UAV response" },
    { label: "Stage", value: "Prototype in progress" },
    { label: "Operations Center", value: "24/7/365" },
    { label: "Structure", value: "Mission-driven nonprofit" },
  ],
  values: [
    {
      title: "Early information matters",
      body: "The gap between a fire starting and someone knowing exactly what is happening is where the system should do its work. Every design decision is measured against that gap.",
    },
    {
      title: "Build it, then claim it",
      body: "We describe what exists as built, what's on the bench as prototype, and what's ahead as intent. Nothing gets promoted before it is tested.",
    },
    {
      title: "One system, not one gadget",
      body: "Sensors, communications, the Operations Center, the aircraft, and the software are designed together. The architecture is the product.",
    },
    {
      title: "Responders decide",
      body: "We're building an information tool. Fire professionals make the calls; our job is to make the picture arrive earlier and clearer.",
    },
    {
      title: "Engineered for the field",
      body: "Heat, smoke, dust, wind, remote terrain, and thin connectivity are the design environment — not edge cases discovered later.",
    },
  ],
} as const;
