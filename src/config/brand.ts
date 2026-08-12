// Single source of truth for brand identity across the public website.
// Clovr Relief — a mission-driven natural-disaster response nonprofit.

export const brand = {
  name: "Clovr Relief",
  shortName: "Clovr",
  legalName: "Clovr Relief Foundation",
  established: 2015,
  tagline: "First light in the worst hours.",
  mission:
    "Clovr Relief moves emergency supplies, medical capacity, and skilled responders into disaster zones within hours — then stays through recovery.",
  shortMission:
    "A disaster-response nonprofit that reaches cut-off communities in hours, not weeks — and stays until they're rebuilt.",
  phone: "(555) 018-4429",
  serviceArea: "Operating across North America, the Caribbean, and the Pacific",
  hours: "Operations center staffed 24/7, 365 days a year",
  contact: {
    general: "hello@clovrlab.com",
    press: "press@clovrlab.com",
    partners: "partners@clovrlab.com",
    careers: "careers@clovrlab.com",
    emergency: "response@clovrlab.com",
  },
  socials: {
    instagram: "#",
    facebook: "#",
    linkedin: "#",
    youtube: "#",
  },
  /** Headline operating numbers shown across the site. */
  stats: [
    { label: "Hours to first delivery", value: "6" },
    { label: "People reached", value: "1,240,000" },
    { label: "Responses launched", value: "318" },
    { label: "Of every dollar to programs", value: "91%" },
  ],
  values: [
    {
      title: "Speed is survival",
      body: "The first 72 hours decide outcomes. Everything we build — staging, logistics, dispatch — is engineered to compress that window.",
    },
    {
      title: "Local first",
      body: "We deploy alongside local responders and hire locally wherever we work. Communities lead their own recovery; we supply the capacity.",
    },
    {
      title: "Engineered, not improvised",
      body: "Pre-positioned caches, standardized load plans, and live routing mean a response starts already rehearsed.",
    },
    {
      title: "Accountable to the dollar",
      body: "Every response publishes what was delivered, where, and what it cost. Impact reporting is a product, not a press release.",
    },
    {
      title: "We stay",
      body: "Relief without recovery is a headline. We remain through rebuilding, resilience work, and readiness training.",
    },
  ],
} as const;
