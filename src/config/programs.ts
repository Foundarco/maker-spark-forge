import opsImg from "@/assets/cr-ops.jpg";
import deliverImg from "@/assets/cr-deliver.jpg";
import logisticsImg from "@/assets/cr-logistics.jpg";
import rebuildImg from "@/assets/cr-rebuild.jpg";
import impactImg from "@/assets/cr-impact.jpg";

export type Program = {
  slug: string;
  n: string;
  name: string;
  short: string;
  discipline: string;
  summary: string;
  detail: string;
  capabilities: string[];
  image: string;
  imageAlt: string;
  accent: string;
  stats: { label: string; value: string }[];
};

/** The four operating programs, shown on the home narrative and /response. */
export const programs: Program[] = [
  {
    slug: "detect",
    n: "01",
    name: "Detect",
    short: "Detect",
    discipline: "Forecasting & early warning",
    summary:
      "We watch storm tracks, seismic feeds, flood gauges, and wildfire perimeters continuously, and pre-stage before impact.",
    detail:
      "Our operations center fuses public meteorological and geological feeds with on-the-ground reporting from partner networks. When a threat crosses our activation thresholds, staging orders go out before landfall — not after.",
    capabilities: [
      "24/7 monitoring of storm, seismic, flood, and fire feeds",
      "Activation thresholds tied to population exposure",
      "Pre-impact staging orders to regional caches",
      "Shared situational picture with local agencies",
    ],
    image: opsImg,
    imageAlt: "Responders monitoring storm tracking screens in a darkened operations center",
    accent: "#38bdf8",
    stats: [
      { label: "Feeds monitored", value: "40+" },
      { label: "Median activation", value: "18 min" },
    ],
  },
  {
    slug: "deploy",
    n: "02",
    name: "Deploy",
    short: "Deploy",
    discipline: "Air, ground & marine movement",
    summary:
      "Crews, aircraft, and vehicles move on standing load plans, so the first convoy leaves while the map is still changing.",
    detail:
      "Response teams are rostered on rotation with pre-cleared credentials and equipment. Standing load plans mean an aircraft or convoy is packed for the hazard type — flood, wind, seismic, fire — without waiting on a bespoke manifest.",
    capabilities: [
      "Rostered response teams on 6-hour recall",
      "Fixed-wing, rotary, and overland transport partners",
      "Hazard-specific standing load plans",
      "Route planning around damaged infrastructure",
    ],
    image: logisticsImg,
    imageAlt: "Pallets of emergency supplies staged at a logistics warehouse at night",
    accent: "#f59e0b",
    stats: [
      { label: "Regional caches", value: "12" },
      { label: "Recall window", value: "6 hrs" },
    ],
  },
  {
    slug: "deliver",
    n: "03",
    name: "Deliver",
    short: "Deliver",
    discipline: "Water, medical, shelter & power",
    summary:
      "Clean water, medical supplies, shelter kits, and portable power reach households that road networks can no longer serve.",
    detail:
      "Distribution is run with local partners and tracked to the household level, so duplication is visible and gaps are closed. Every delivery is logged against a case file that follows the family through recovery.",
    capabilities: [
      "Water treatment and distribution",
      "Field medical resupply and mobile clinics",
      "Shelter kits and emergency housing",
      "Portable power and communications restoration",
    ],
    image: deliverImg,
    imageAlt: "Aid volunteers carrying supply crates through a flooded village road at sunset",
    accent: "#22d3ee",
    stats: [
      { label: "People reached", value: "1.24M" },
      { label: "Tonnes delivered", value: "9,400" },
    ],
  },
  {
    slug: "rebuild",
    n: "04",
    name: "Rebuild",
    short: "Rebuild",
    discipline: "Recovery & resilience",
    summary:
      "We stay through reconstruction — repairing homes, restoring services, and training the next local response team.",
    detail:
      "Recovery programs run for months after the cameras leave: structural repair, cash assistance, livelihood restoration, and readiness training that leaves a community less exposed to the next event.",
    capabilities: [
      "Structural repair and rebuild crews",
      "Cash assistance and livelihood restoration",
      "Community readiness and first-responder training",
      "Resilience retrofits ahead of the next season",
    ],
    image: rebuildImg,
    imageAlt: "Volunteers repairing a storm-damaged roof at sunrise",
    accent: "#4ade80",
    stats: [
      { label: "Homes repaired", value: "2,860" },
      { label: "Responders trained", value: "5,100" },
    ],
  },
];

export type Region = {
  name: string;
  hazard: string;
  status: "Active response" | "Recovery" | "Standby";
  note: string;
};

export const regions: Region[] = [
  { name: "Gulf Coast, United States", hazard: "Hurricane & storm surge", status: "Standby", note: "Three caches pre-positioned ahead of season." },
  { name: "Eastern Caribbean", hazard: "Hurricane", status: "Recovery", note: "Housing repair program running with local partners." },
  { name: "Pacific Northwest", hazard: "Wildfire & smoke", status: "Standby", note: "Air-quality shelters and respiratory supply caches." },
  { name: "Central Appalachia", hazard: "Flash flooding", status: "Active response", note: "Water treatment and household resupply underway." },
  { name: "Southern Pacific islands", hazard: "Cyclone", status: "Standby", note: "Marine transport partners on rotation." },
  { name: "Northern Plains", hazard: "Tornado & severe wind", status: "Recovery", note: "Shelter rebuild crews deployed through spring." },
];

export type Story = {
  slug: string;
  title: string;
  place: string;
  year: string;
  image: string;
  imageAlt: string;
  summary: string;
  body: string[];
  metrics: { label: string; value: string }[];
};

export const stories: Story[] = [
  {
    slug: "the-night-the-road-closed",
    title: "The night the road closed",
    place: "Central Appalachia",
    year: "2025",
    image: impactImg,
    imageAlt: "Aerial view of a flooded coastal town at blue hour",
    summary:
      "Flash flooding cut the only highway into three valley towns. First water treatment units arrived by air before dawn.",
    body: [
      "Rainfall totals crossed our activation threshold four hours before the river did. Caches were already moving when the highway washed out.",
      "By first light, two water treatment units and a field medical resupply were on the ground, run alongside the county's volunteer fire service.",
      "Household-level tracking meant that within 48 hours we could tell partners exactly which hollows had been reached and which had not.",
    ],
    metrics: [
      { label: "Households reached", value: "1,180" },
      { label: "Hours to first delivery", value: "9" },
      { label: "Litres of clean water", value: "310,000" },
    ],
  },
  {
    slug: "rebuilding-after-the-wind",
    title: "Rebuilding after the wind",
    place: "Eastern Caribbean",
    year: "2024",
    image: rebuildImg,
    imageAlt: "Volunteers repairing a storm-damaged roof at sunrise",
    summary:
      "A category-four storm took roofs off an entire parish. Eleven months later, local crews we trained are still building.",
    body: [
      "Relief phase lasted three weeks. Recovery lasted a year — and it is the part that decides whether a place recovers at all.",
      "We hired and trained local building crews rather than importing them, so wages and skills stayed in the parish.",
      "Every rebuilt roof was fitted with hurricane strapping, a retrofit that costs little now and saves everything next season.",
    ],
    metrics: [
      { label: "Homes repaired", value: "640" },
      { label: "Local crew members hired", value: "78" },
      { label: "Months on the ground", value: "11" },
    ],
  },
  {
    slug: "sixty-minutes-of-warning",
    title: "Sixty minutes of warning",
    place: "Northern Plains",
    year: "2025",
    image: deliverImg,
    imageAlt: "Aid volunteers carrying supplies at sunset",
    summary:
      "A tornado outbreak gave one hour of lead time. Pre-staged shelter kits meant nobody spent the night without cover.",
    body: [
      "Severe-weather outlooks let us move shelter kits into the region the previous afternoon.",
      "When the outbreak hit, distribution began in under two hours because the supplies were already inside the warning polygon.",
      "Nobody in the affected townships spent the first night unsheltered.",
    ],
    metrics: [
      { label: "Shelter kits issued", value: "420" },
      { label: "Hours to distribution", value: "2" },
      { label: "Townships covered", value: "6" },
    ],
  },
];

export type GiveTier = {
  amount: string;
  label: string;
  effect: string;
};

export const giveTiers: GiveTier[] = [
  { amount: "$35", label: "Clean water", effect: "Treats and delivers 1,000 litres of drinking water for a cut-off household." },
  { amount: "$120", label: "Shelter kit", effect: "Tarpaulin, fixings, bedding, and lighting for one family for the first month." },
  { amount: "$500", label: "Medical resupply", effect: "Restocks a mobile clinic for a full day of consultations in the field." },
  { amount: "$2,500", label: "Cache slot", effect: "Holds a pre-positioned pallet of supplies in a regional cache for a full season." },
];
