// Single source of truth for brand identity across the whole site.
// Swap these values (and optionally add a logo file) to rebrand everything.

export const brand = {
  name: "[Brand Name]",
  tagline: "Community-first 3D printers, built to teach.",
  shortMission:
    "We build approachable, repairable 3D printers so more people — especially young people — can learn how things are made.",
  // Set logoUrl to a path (e.g. "/logo.svg") once you have one. Until then,
  // the site renders a typographic wordmark using `name`.
  logoUrl: null as string | null,
  contact: {
    general: "hello@[placeholder-domain].com",
    support: "support@[placeholder-domain].com",
    press: "press@[placeholder-domain].com",
    partnerships: "partnerships@[placeholder-domain].com",
  },
  socials: {
    discord: "#",
    youtube: "#",
    instagram: "#",
    github: "#",
  },
  // 5 brand pillars — final wording TBD.
  pillars: [
    {
      title: "Community-first",
      body: "Owners help owners. Documentation, guides, and design decisions live in the open where the community can improve them.",
    },
    {
      title: "Built to teach",
      body: "Every printer is a working example of how it works — visible mechanism, labeled parts, and lessons that grow with the student.",
    },
    {
      title: "Repairable by design",
      body: "If it breaks, you can fix it. Standard fasteners, printable spares, and step-by-step guides for every common failure.",
    },
    {
      title: "Honest engineering",
      body: "We tell you what the machine is good at, and what it isn't. Trade-offs are documented, not hidden behind marketing copy.",
    },
    {
      title: "Made to last",
      body: "Long-lived components over disposable ones. Upgrades ship as parts, not as new machines.",
    },
  ],
} as const;
