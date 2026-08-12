import heroImg from "@/assets/wf-hero.jpg";
import sensorImg from "@/assets/wf-sensor.jpg";
import opsImg from "@/assets/wf-ops.jpg";
import aerialImg from "@/assets/wf-aerial.jpg";
import benchImg from "@/assets/wf-bench.jpg";

export const media = { heroImg, sensorImg, opsImg, aerialImg, benchImg };

export type Stage = {
  n: string;
  slug: string;
  title: string;
  kicker: string;
  body: string;
  detail: string[];
  accent: string;
};

/** The signature nine-stage architecture: detection → responder. */
export const stages: Stage[] = [
  {
    n: "01",
    slug: "sensor-node",
    title: "Sensor node",
    kicker: "Distributed environmental sensing",
    body: "Field-hardened nodes placed across terrain monitor local conditions continuously and report over a wireless network.",
    detail: [
      "Designed for solar power and long unattended service intervals",
      "Low-bandwidth wireless links suited to remote terrain",
      "Sensing set intended to include temperature, humidity, and particulate indicators",
      "Node health and connectivity reported alongside measurements",
    ],
    accent: "#38bdf8",
  },
  {
    n: "02",
    slug: "detection",
    title: "Detection",
    kicker: "A potential wildfire event is identified",
    body: "On-node and ground-based processing look for the signatures that separate a potential ignition from ordinary daily variation.",
    detail: [
      "Local processing at the node reduces bandwidth and latency",
      "Cross-referencing neighbouring nodes to reduce false positives",
      "Thresholds intended to adapt to season, terrain, and weather",
      "Every candidate event carries its supporting measurements",
    ],
    accent: "#38bdf8",
  },
  {
    n: "03",
    slug: "alert",
    title: "Alert",
    kicker: "Event and location sent to the Operations Center",
    body: "A detection becomes a structured alert — location, time, supporting sensor data — routed to people, not just a dashboard.",
    detail: [
      "Structured event payload with geospatial position",
      "Redundant communication paths where coverage allows",
      "Alert enters a queue with an auditable timeline",
      "Duplicate and related alerts grouped into one incident",
    ],
    accent: "#f59e0b",
  },
  {
    n: "04",
    slug: "operations-center",
    title: "Operations Center",
    kicker: "24/7/365 monitoring, evaluation, coordination",
    body: "Someone is watching. Alerts are reviewed, incidents are opened, missions are coordinated, and the record is kept as it happens.",
    detail: [
      "Continuous monitoring of the detection network",
      "Alert review, triage, and incident creation",
      "UAV mission coordination and asset tracking",
      "Communications with field personnel and response partners",
    ],
    accent: "#f59e0b",
  },
  {
    n: "05",
    slug: "uav-dispatch",
    title: "UAV dispatch",
    kicker: "An aircraft can be assigned to investigate",
    body: "When an alert warrants a closer look, an aircraft is assigned a mission with the event location as its objective.",
    detail: [
      "Mission definition tied to the originating incident",
      "Pre-flight checks and airspace considerations",
      "Payload selection for the conditions",
      "Launch and mission state tracked in the Operations Center",
    ],
    accent: "#f59e0b",
  },
  {
    n: "06",
    slug: "autonomous-flight",
    title: "Autonomous flight",
    kicker: "The UAV navigates toward the event",
    body: "Autonomous or operator-assisted navigation moves the aircraft toward the coordinates while telemetry streams back.",
    detail: [
      "Waypoint navigation toward the event location",
      "Operator oversight and takeover by design",
      "Position, altitude, and health telemetry in real time",
      "Behaviour on link loss defined as a safety requirement",
    ],
    accent: "#22d3ee",
  },
  {
    n: "07",
    slug: "investigation",
    title: "Investigation",
    kicker: "RGB and thermal sensors provide aerial eyes",
    body: "Optical and thermal payloads look at what the ground sensors could only infer — is there a fire, where exactly, and what is around it.",
    detail: [
      "RGB imagery for human-readable context",
      "Thermal imaging for heat signatures through haze and low light",
      "Georeferenced frames tied to aircraft position",
      "Persistent observation over the area where appropriate",
    ],
    accent: "#22d3ee",
  },
  {
    n: "08",
    slug: "intelligence",
    title: "Intelligence",
    kicker: "Imagery, thermal and geospatial data processed",
    body: "Onboard and ground-based processing turn raw frames and telemetry into a coherent picture of the incident.",
    detail: [
      "Location, imagery, and thermal information combined on one map",
      "Incident timeline assembled from sensor, flight, and operator events",
      "Terrain and access context layered alongside the event",
      "Designed for export in formats responders can actually use",
    ],
    accent: "#22d3ee",
  },
  {
    n: "09",
    slug: "responder",
    title: "Responder",
    kicker: "Useful information delivered to the people responding",
    body: "The output of the system is not an alarm. It is a clear, verified picture handed to the people who decide what happens next.",
    detail: [
      "Concise incident summary with position and imagery",
      "Ongoing updates while the aircraft is on station",
      "Human review before anything is passed on",
      "Responders remain the decision-makers, always",
    ],
    accent: "#4ade80",
  },
];

/** Sensing modalities — intentionally described as intent, not spec. */
export const sensing = [
  { label: "Temperature", note: "Ambient and rate-of-change signals across the node network." },
  { label: "Humidity", note: "Relative humidity as part of local fire-weather context." },
  { label: "Smoke / particulate indicators", note: "Particulate sensing under evaluation as a detection input." },
  { label: "Atmospheric measurements", note: "Pressure and related environmental measures for context." },
  { label: "Wind context", note: "Local conditions that shape how an event may develop." },
  { label: "Node health", note: "Power, link quality, and status reported with every reading." },
];

/** Operations Center responsibilities — real organizational capability. */
export const opsResponsibilities = [
  "Monitoring the detection network and node health",
  "Receiving, reviewing, and triaging alerts",
  "Opening and monitoring incidents",
  "Coordinating UAV missions end to end",
  "Tracking aircraft and field assets",
  "Reviewing imagery and telemetry as it arrives",
  "Maintaining incident timelines and records",
  "Communications with field personnel and response partners",
  "Maintaining situational awareness across the network",
];

export type UavCapability = { title: string; body: string; state: "In development" | "Planned" | "Prototype" };

export const uavCapabilities: UavCapability[] = [
  { title: "Rapid deployment", body: "Designed to launch on an assigned mission shortly after an alert is reviewed.", state: "In development" },
  { title: "Autonomous or assisted navigation", body: "Waypoint navigation toward the event with operator oversight and takeover.", state: "In development" },
  { title: "Thermal imaging", body: "Heat signatures through smoke, haze, and darkness where optical imagery falls short.", state: "Prototype" },
  { title: "RGB / optical imaging", body: "Human-readable imagery of the event and the terrain around it.", state: "Prototype" },
  { title: "Location awareness", body: "Georeferenced position tied to every frame and telemetry sample.", state: "In development" },
  { title: "Real-time communications", body: "Live link to the Operations Center for telemetry and imagery.", state: "In development" },
  { title: "Persistent observation", body: "Remaining on station to keep eyes on a developing situation.", state: "Planned" },
];

export type Phase = {
  n: string;
  title: string;
  body: string;
  state: "Underway" | "In progress" | "Ahead";
};

export const phases: Phase[] = [
  { n: "01", title: "Research", body: "Wildfire detection literature, aviation constraints, engineering trade-offs, and conversations about what responders actually need.", state: "Underway" },
  { n: "02", title: "System design", body: "Architecture for the sensor node, UAV, communications, Operations Center, and software that ties them together.", state: "Underway" },
  { n: "03", title: "Prototype", body: "Building and bench-testing the first components — node hardware, payload, and mission software.", state: "In progress" },
  { n: "04", title: "Field testing", body: "Detection, communications, flight, sensing, and reliability tested outside the lab in real conditions.", state: "Ahead" },
  { n: "05", title: "Pilot", body: "Working toward supervised real-world evaluation alongside people who respond to fires.", state: "Ahead" },
  { n: "06", title: "Deployment", body: "Eventual operational deployment of the integrated system.", state: "Ahead" },
];

export const fieldConstraints = [
  { title: "Heat", body: "Electronics and batteries have to keep working when ambient conditions are already extreme." },
  { title: "Smoke", body: "Optical sensing degrades exactly when it matters most — which is why thermal sits beside it." },
  { title: "Dust and weather", body: "Sealing, ingress protection, and materials chosen for seasons outdoors, not demo days." },
  { title: "Wind", body: "Flight envelopes and mounting hardware designed around gusty terrain-driven conditions." },
  { title: "Remote terrain", body: "Nodes go where roads don't. Service intervals and mounting must respect that." },
  { title: "Limited connectivity", body: "Low-bandwidth, intermittent links are the assumption, not the failure case." },
  { title: "Distance", body: "Long stretches between nodes, launch points, and events shape range requirements." },
  { title: "Power and endurance", body: "Solar budgets on the ground, battery budgets in the air, both under real duty cycles." },
  { title: "Maintenance", body: "Anything deployed has to be serviceable by a small team with limited access." },
];

export const expansion = [
  { title: "Search and rescue", body: "Aerial search patterns with thermal imaging over difficult terrain." },
  { title: "Storm response", body: "Rapid aerial assessment where ground access is cut off." },
  { title: "Disaster mapping", body: "Georeferenced imagery to build a picture of what changed and where." },
  { title: "Other natural hazards", body: "The same sensing, autonomy, and coordination foundation, pointed at a different problem." },
];

export const involvement = [
  { title: "Engineers", body: "Mechanical, electrical, and systems engineers who want hardware in the field." },
  { title: "Robotics developers", body: "Autonomy, controls, navigation, and flight software." },
  { title: "Software developers", body: "Mission control, geospatial tooling, data pipelines, and the Operations Center stack." },
  { title: "Researchers", body: "Detection methods, sensing, remote sensing, and evaluation methodology." },
  { title: "Fire professionals", body: "The people who know what information is actually useful, and when." },
  { title: "Mentors and advisors", body: "Aerospace, nonprofit, regulatory, and operational experience." },
  { title: "Sponsors and funders", body: "Support that turns a prototype into a field-tested system." },
  { title: "Manufacturing partners", body: "Fabrication, enclosures, PCBs, and small-batch production." },
];
