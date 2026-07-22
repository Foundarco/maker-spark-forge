// Single source of truth for brand identity across the whole site.
// Nimbus Forge — a hardware product studio: design, prototype, manufacture, ship.

export const brand = {
  name: "Nimbus Forge",
  tagline: "From idea to shelf. One team, one cloud.",
  shortMission:
    "Nimbus Forge is a hardware product studio. We take your idea from a sketch to a working prototype to a manufactured product on the shelf — under one roof, without the handoffs.",
  // Set logoUrl to a path once available. Until then, a typographic cloud
  // wordmark is rendered via BrandLogo.
  logoUrl: null as string | null,
  contact: {
    general: "hello@clovrlab.com",
    support: "support@clovrlab.com",
    press: "press@clovrlab.com",
    partnerships: "partnerships@clovrlab.com",
  },
  socials: {
    discord: "#",
    youtube: "#",
    instagram: "#",
    github: "#",
    linkedin: "#",
  },
  pillars: [
    {
      title: "One team, end to end",
      body: "Designers, engineers, and manufacturing sit in one room. No lost translation between concept and factory floor.",
    },
    {
      title: "Prototype in days",
      body: "In-house 3D printing, CNC, and electronics prototyping means a working v1 in a week — not a quarter.",
    },
    {
      title: "Manufacturing that scales",
      body: "From a batch of 50 to a run of 50,000. We own the supply chain, tooling, and QA so you don't have to.",
    },
    {
      title: "Transparent by default",
      body: "Real-time dashboards on every build, every unit cost, every timeline. You see what we see.",
    },
    {
      title: "Cloud-native operations",
      body: "Every file, drawing, BOM, and inspection lives in one place — accessible to you and your team from anywhere.",
    },
  ],
} as const;
