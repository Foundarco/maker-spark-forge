import remodelAsset from "@/assets/mg-remodel.jpg.asset.json";
import kitchenAsset from "@/assets/mg-kitchen.jpg.asset.json";
import deckAsset from "@/assets/mg-deck.jpg.asset.json";
import additionAsset from "@/assets/mg-addition.jpg.asset.json";
import carpentryAsset from "@/assets/mg-carpentry.jpg.asset.json";
import heroAsset from "@/assets/mg-hero.jpg.asset.json";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  scope: string[];
  typical: string;
};

export const services: Service[] = [
  {
    slug: "new-construction",
    title: "New Home Construction",
    summary:
      "Ground-up residential builds managed from permitting through final walkthrough, with a single point of contact the whole way.",
    image: heroAsset.url,
    scope: [
      "Site prep, excavation, and foundations",
      "Framing, roofing, and weatherproofing",
      "Mechanical, electrical, and plumbing coordination",
      "Interior finishes and final inspections",
    ],
    typical: "6–14 months",
  },
  {
    slug: "additions",
    title: "Additions & Structural Work",
    summary:
      "Second stories, bump-outs, garage conversions, and load-bearing changes engineered to match the existing structure.",
    image: additionAsset.url,
    scope: [
      "Structural engineering coordination",
      "Foundation and framing tie-ins",
      "Roofline and siding matching",
      "Permit management and inspections",
    ],
    typical: "3–7 months",
  },
  {
    slug: "renovations",
    title: "Whole-Home Renovations",
    summary:
      "Full interior rebuilds that update layout, systems, and finishes without losing the character of the original house.",
    image: remodelAsset.url,
    scope: [
      "Demolition and abatement coordination",
      "Layout changes and structural openings",
      "Systems replacement and insulation",
      "Drywall, trim, paint, and flooring",
    ],
    typical: "4–9 months",
  },
  {
    slug: "kitchens-baths",
    title: "Kitchens & Bathrooms",
    summary:
      "High-traffic rooms rebuilt with tight tolerances, correct waterproofing, and cabinetry that lines up on every reveal.",
    image: kitchenAsset.url,
    scope: [
      "Cabinet and countertop templating",
      "Waterproofing and tile assemblies",
      "Plumbing and electrical rough-in",
      "Ventilation and lighting design",
    ],
    typical: "6–14 weeks",
  },
  {
    slug: "carpentry",
    title: "Custom Carpentry & Millwork",
    summary:
      "Built-ins, stairs, trim packages, and shop-built casework detailed for the room they live in.",
    image: carpentryAsset.url,
    scope: [
      "Shop drawings and material selection",
      "Built-in shelving and cabinetry",
      "Stairs, railings, and trim packages",
      "On-site fitting and finishing",
    ],
    typical: "2–8 weeks",
  },
  {
    slug: "exteriors",
    title: "Decks, Siding & Exteriors",
    summary:
      "Outdoor structures and envelope work built to shed water properly and hold up through decades of weather.",
    image: deckAsset.url,
    scope: [
      "Decks, porches, and pergolas",
      "Siding, trim, and rainscreen details",
      "Window and door replacement",
      "Grading and drainage corrections",
    ],
    typical: "3–10 weeks",
  },
];

export type Project = {
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  image: string;
  summary: string;
  stats: { label: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: "ridgeline-residence",
    title: "Ridgeline Residence",
    category: "New Construction",
    location: "Hillside District",
    year: "2025",
    image: heroAsset.url,
    summary:
      "A 3,400 sq ft custom home on a sloped lot, with engineered concrete retaining walls and an exposed timber frame.",
    stats: [
      { label: "Square feet", value: "3,400" },
      { label: "Duration", value: "11 months" },
      { label: "Change orders", value: "2" },
    ],
  },
  {
    slug: "brookfield-kitchen",
    title: "Brookfield Kitchen",
    category: "Kitchens & Baths",
    location: "Brookfield",
    year: "2025",
    image: kitchenAsset.url,
    summary:
      "A load-bearing wall removal opened the kitchen to the dining room, with new cabinetry, stone tops, and rewired lighting.",
    stats: [
      { label: "Duration", value: "9 weeks" },
      { label: "Structural beam", value: "22 ft" },
      { label: "On schedule", value: "Yes" },
    ],
  },
  {
    slug: "north-street-addition",
    title: "North Street Addition",
    category: "Additions",
    location: "North Street",
    year: "2024",
    image: additionAsset.url,
    summary:
      "A 620 sq ft rear addition with matched siding, shingle detailing, and a new stone foundation wall.",
    stats: [
      { label: "Square feet", value: "620" },
      { label: "Duration", value: "5 months" },
      { label: "Permits", value: "4" },
    ],
  },
  {
    slug: "maple-avenue-renovation",
    title: "Maple Avenue Renovation",
    category: "Renovations",
    location: "Maple Avenue",
    year: "2024",
    image: remodelAsset.url,
    summary:
      "A full interior rebuild of a 1940s home — new systems, insulation, oak flooring, and restored beam work.",
    stats: [
      { label: "Rooms", value: "11" },
      { label: "Duration", value: "7 months" },
      { label: "Systems replaced", value: "All" },
    ],
  },
  {
    slug: "cedar-deck",
    title: "Cedar Deck & Rear Entry",
    category: "Exteriors",
    location: "Westgate",
    year: "2024",
    image: deckAsset.url,
    summary:
      "An elevated cedar deck with concealed fasteners, integrated lighting, and a rebuilt rear entry threshold.",
    stats: [
      { label: "Square feet", value: "420" },
      { label: "Duration", value: "6 weeks" },
      { label: "Warranty", value: "5 years" },
    ],
  },
  {
    slug: "library-millwork",
    title: "Study & Library Millwork",
    category: "Carpentry",
    location: "Old Town",
    year: "2023",
    image: carpentryAsset.url,
    summary:
      "Shop-built white oak casework with hand-cut joinery, fitted to a room that was out of square by nearly an inch.",
    stats: [
      { label: "Linear feet", value: "38" },
      { label: "Duration", value: "5 weeks" },
      { label: "Material", value: "White oak" },
    ],
  },
];

export const processSteps = [
  {
    n: "01",
    title: "First conversation",
    body: "A phone call or site visit to understand what you want to build, what's driving the timeline, and what budget range is realistic.",
  },
  {
    n: "02",
    title: "Site assessment",
    body: "We measure, photograph, and check structure, drainage, and existing systems so the estimate reflects the real house — not assumptions.",
  },
  {
    n: "03",
    title: "Line-item estimate",
    body: "A written proposal broken out by scope with allowances stated plainly. You see where every dollar goes before signing.",
  },
  {
    n: "04",
    title: "Contract & schedule",
    body: "A fixed scope, a payment schedule tied to milestones, and a published build calendar with named crew leads.",
  },
  {
    n: "05",
    title: "Construction",
    body: "Daily site cleanup, weekly progress updates with photos, and documented change orders before any extra work begins.",
  },
  {
    n: "06",
    title: "Inspections & punch list",
    body: "Municipal inspections, our own quality checklist, and a walkthrough where you mark anything that isn't right.",
  },
  {
    n: "07",
    title: "Closeout & warranty",
    body: "Final documentation, manuals, and finish specs handed over — backed by a written workmanship warranty.",
  },
];
