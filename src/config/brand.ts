// Single source of truth for brand identity across the public website.
// McGuire Construction — a family-run general contractor, established 1974.

export const brand = {
  name: "McGuire Construction",
  shortName: "McGuire",
  established: 1974,
  tagline: "Built right. Built to last.",
  shortMission:
    "McGuire Construction is a family-run general contractor building homes, additions, and renovations with disciplined craftsmanship, clear communication, and schedules that hold. Serving homeowners since 1974.",
  phone: "(555) 018-4429",
  serviceArea: "Greater metro area and surrounding counties",
  hours: "Monday–Friday, 7:00am – 5:00pm",
  contact: {
    general: "hello@clovrlab.com",
    estimates: "estimates@clovrlab.com",
    support: "support@clovrlab.com",
    careers: "careers@clovrlab.com",
  },
  socials: {
    instagram: "#",
    facebook: "#",
    linkedin: "#",
    youtube: "#",
  },
  values: [
    {
      title: "Craftsmanship",
      body: "Work is measured, squared, and finished properly the first time. If it isn't right, it gets redone.",
    },
    {
      title: "Reliability",
      body: "Crews show up when we say. Schedules are published, tracked, and honored.",
    },
    {
      title: "Transparency",
      body: "Line-item estimates, documented change orders, and no surprise invoices at the end.",
    },
    {
      title: "Systems",
      body: "Five decades of checklists, inspections, and process — so quality doesn't depend on who shows up.",
    },
    {
      title: "Long-term thinking",
      body: "We build for the next fifty years, not the next walkthrough. Most of our work comes from past clients.",
    },
  ],
} as const;
