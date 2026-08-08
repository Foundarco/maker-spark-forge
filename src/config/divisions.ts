import constructionAsset from "@/assets/mg2-hero.jpg.asset.json";
import concreteAsset from "@/assets/mg2-concrete.jpg.asset.json";
import excavationAsset from "@/assets/mg2-excavation.jpg.asset.json";
import landscapeAsset from "@/assets/mg2-landscape.jpg.asset.json";
import developmentAsset from "@/assets/mg2-development.jpg.asset.json";

export type DivisionStatus = "Active";

export type Division = {
  slug: string;
  n: string;
  name: string;
  short: string;
  status: DivisionStatus;
  tagline: string;
  mission: string;
  intro: string;
  capabilities: string[];
  buildingToward: string[];
  image: string;
  imageAlt: string;
  accent: string;
  accentName: string;
  stats: { label: string; value: string }[];
};

export const divisions: Division[] = [
  {
    slug: "construction",
    accent: "#4f46e5",
    accentName: "Indigo",
    stats: [{ label: "Years building", value: "30" }, { label: "Projects delivered", value: "420+" }, { label: "In-house crews", value: "6" }],
    n: "01",
    name: "McGuire Construction",
    short: "Construction",
    status: "Active",
    tagline: "The core of everything we build.",
    mission:
      "Residential construction delivered start to finish — ground-up homes, additions, renovations, and the finish work that makes them last.",
    intro:
      "Construction is the division the family has run since 1995. Every system, checklist, and standard the wider McGuire organization will use was written here, on real job sites, under real deadlines.",
    capabilities: [
      "New home construction",
      "Additions and structural work",
      "Whole-home renovations",
      "Kitchens and bathrooms",
      "Custom carpentry and millwork",
      "Decks, siding, and exteriors",
    ],
    buildingToward: [
      "In-house crews across every major trade",
      "A published, tracked schedule on every project",
      "Documented quality control from footing to punch list",
    ],
    image: constructionAsset.url,
    imageAlt: "Wood-framed home under construction at golden hour with scaffolding and roof trusses",
  },
  {
    slug: "concrete",
    accent: "#0f766e",
    accentName: "Teal",
    stats: [{ label: "Yards poured / yr", value: "9,400" }, { label: "Crews", value: "4" }, { label: "Avg. pour lead time", value: "5 days" }],
    n: "02",
    name: "McGuire Concrete",
    short: "Concrete",
    status: "Active",
    tagline: "Flatwork, foundations, and formed structure.",
    mission:
      "Concrete is in-house — foundations, flatwork, and structural pours run on our schedule and to our tolerances.",
    intro:
      "Concrete was the first vertical step, and it changed everything. Controlling the pour means controlling the start of every build — no waiting on a sub, no inherited mistakes buried under a slab.",
    capabilities: [
      "Footings and foundation walls",
      "Slabs on grade and structural slabs",
      "Driveways, walkways, and flatwork",
      "Board-formed and architectural finishes",
      "Retaining and site walls",
    ],
    buildingToward: [
      "Dedicated forming and finishing crews",
      "Owned pump and finishing equipment",
      "Concrete scheduling integrated with framing dates",
    ],
    image: concreteAsset.url,
    imageAlt: "Fresh concrete poured over a rebar grid and screeded flat by a worker",
  },
  {
    slug: "excavation",
    accent: "#b45309",
    accentName: "Amber",
    stats: [{ label: "Machines in fleet", value: "18" }, { label: "Sites moved / yr", value: "130" }, { label: "Licensed operators", value: "12" }],
    n: "03",
    name: "McGuire Excavation",
    short: "Excavation",
    status: "Active",
    tagline: "Everything below the first line.",
    mission:
      "Site work, grading, utilities, and earthmoving — the groundwork that determines whether the rest of the build goes smoothly.",
    intro:
      "Most schedule slips start in the dirt. Because we own excavation, the site is ready when the crew arrives and drainage is solved before it becomes a warranty call.",
    capabilities: [
      "Site clearing and rough grading",
      "Foundation and trench excavation",
      "Utility trenching and backfill",
      "Drainage and stormwater management",
      "Final grade and site restoration",
    ],
    buildingToward: [
      "An owned fleet of excavators and skid steers",
      "Licensed operators on staff year-round",
      "Survey and grading coordination in-house",
    ],
    image: excavationAsset.url,
    imageAlt: "Excavator digging a foundation trench across a graded dirt building site",
  },
  {
    slug: "landscape",
    accent: "#15803d",
    accentName: "Green",
    stats: [{ label: "Properties finished", value: "260+" }, { label: "Design-build crews", value: "3" }, { label: "Maintenance clients", value: "85" }],
    n: "04",
    name: "McGuire Landscape",
    short: "Landscape",
    status: "Active",
    tagline: "The build isn't finished at the door.",
    mission:
      "Hardscape, softscape, and exterior finishing that completes a property instead of leaving it as bare dirt at handover.",
    intro:
      "A finished house on an unfinished site isn't a finished project. Landscape closes the loop — the same crews, the same standards, carried all the way to the property line.",
    capabilities: [
      "Patios, walkways, and paver work",
      "Retaining walls and grading features",
      "Planting, sod, and irrigation",
      "Outdoor living structures",
      "Exterior lighting and drainage detail",
    ],
    buildingToward: [
      "Design-build exterior packages",
      "Seasonal maintenance programs",
      "Hardscape crews shared with concrete",
    ],
    image: landscapeAsset.url,
    imageAlt: "Modern paver patio with board-formed retaining wall and landscape lighting at dusk",
  },
  {
    slug: "development",
    accent: "#be123c",
    accentName: "Crimson",
    stats: [{ label: "Lots in pipeline", value: "140" }, { label: "Communities", value: "7" }, { label: "Self-performed", value: "100%" }],
    n: "05",
    name: "McGuire Development",
    short: "Development",
    status: "Active",
    tagline: "Building the projects, not just the buildings.",
    mission:
      "Land acquisition, entitlement, and self-performed development — controlling projects from raw ground through delivered homes.",
    intro:
      "The long-term goal. With construction, concrete, excavation, and landscape under one roof, development becomes the natural next step: McGuire builds what McGuire owns.",
    capabilities: [
      "Land acquisition and feasibility",
      "Entitlement and permitting strategy",
      "Infrastructure and lot development",
      "Multi-home and small community builds",
      "Long-hold asset construction",
    ],
    buildingToward: [
      "A pipeline of self-developed sites",
      "Vertical delivery with zero outside GC",
      "A generational, owner-operated portfolio",
    ],
    image: developmentAsset.url,
    imageAlt: "Aerial view of a residential development with graded lots and homes in framing stage",
  },
];

export function getDivision(slug: string): Division | undefined {
  return divisions.find((d) => d.slug === slug);
}

export const statusTone: Record<DivisionStatus, string> = {
  Active: "border-transparent bg-[color-mix(in_oklab,var(--accent-color,#4f46e5)_14%,white)] text-[var(--accent-color,#4f46e5)]",
};
