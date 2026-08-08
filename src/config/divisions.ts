import constructionAsset from "@/assets/mg2-hero.jpg.asset.json";
import concreteAsset from "@/assets/mg2-concrete.jpg.asset.json";
import excavationAsset from "@/assets/mg2-excavation.jpg.asset.json";
import landscapeAsset from "@/assets/mg2-landscape.jpg.asset.json";
import developmentAsset from "@/assets/mg2-development.jpg.asset.json";

export type DivisionStatus = "Current" | "Coming Soon" | "Future" | "Long-Term";

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
};

export const divisions: Division[] = [
  {
    slug: "construction",
    n: "01",
    name: "McGuire Construction",
    short: "Construction",
    status: "Current",
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
    n: "02",
    name: "McGuire Concrete",
    short: "Concrete",
    status: "Coming Soon",
    tagline: "Flatwork, foundations, and formed structure.",
    mission:
      "Bringing concrete in-house so foundations, flatwork, and structural pours run on our schedule and to our tolerances.",
    intro:
      "Concrete is the first vertical step. Controlling the pour means controlling the start of every build — no waiting on a sub, no inherited mistakes buried under a slab.",
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
    n: "03",
    name: "McGuire Excavation",
    short: "Excavation",
    status: "Future",
    tagline: "Everything below the first line.",
    mission:
      "Site work, grading, utilities, and earthmoving — the groundwork that determines whether the rest of the build goes smoothly.",
    intro:
      "Most schedule slips start in the dirt. Owning excavation means the site is ready when the crew arrives, and drainage is solved before it becomes a warranty call.",
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
    n: "04",
    name: "McGuire Landscape",
    short: "Landscape",
    status: "Future",
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
    n: "05",
    name: "McGuire Development",
    short: "Development",
    status: "Long-Term",
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
  Current: "border-ink/70 bg-ink text-white",
  "Coming Soon": "border-ink/30 text-ink",
  Future: "border-ink/20 text-muted-foreground",
  "Long-Term": "border-ink/20 text-muted-foreground",
};
