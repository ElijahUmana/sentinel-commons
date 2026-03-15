/**
 * Frontier Tower building data module.
 *
 * Currently uses structured data based on real Frontier Tower floor info.
 * Designed to be replaced with real API connections when Frontier Tower
 * provides their member database, event calendar, and resource system.
 */

export interface Floor {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  resources: string[];
  currentEvents: string[];
  budget: { total: number; spent: number; currency: string };
  bounties: { title: string; amount: string; status: string }[];
}

export interface BuildingData {
  name: string;
  floors: Floor[];
  thesis: string;
  totalMembers: number;
  governanceExperiment: string;
  website: string;
}

export function getBuildingData(): BuildingData {
  return {
    name: "Frontier Tower",
    thesis: "Ten Floors, One Thesis: AI generates enormous value. Who builds the systems that govern it?",
    totalMembers: 700,
    website: "frontiertower.io",
    governanceExperiment:
      "8+ floors are each governing their own floor treasuries during the Intelligence at the Frontier hackathon (March 14-15, 2026). 20% of hackathon event profits flow into the community treasury.",
    floors: [
      {
        id: 2,
        name: "Main Stage",
        description: "Keynotes, panels, and marquee sessions for the entire Frontier Tower community",
        memberCount: 80,
        resources: ["Stage & AV Equipment", "Seating for 200", "Live Streaming Setup", "Recording Equipment"],
        currentEvents: ["Intelligence at the Frontier Hackathon"],
        budget: { total: 8000, spent: 5200, currency: "USDC" },
        bounties: [{ title: "Set up live streaming for hackathon demos", amount: "200 USDC", status: "open" }],
      },
      {
        id: 4,
        name: "Robotics & Hard Tech",
        description: "Physical AI, robotics, hardware prototyping, and the intersection of atoms and bits",
        memberCount: 60,
        resources: ["Robot Lab", "Electronics Workbench", "Soldering Stations", "Oscilloscopes"],
        currentEvents: [],
        budget: { total: 5000, spent: 2100, currency: "USDC" },
        bounties: [{ title: "Repair soldering station #3", amount: "150 USDC", status: "open" }, { title: "Calibrate oscilloscopes", amount: "100 USDC", status: "claimed" }],
      },
      {
        id: 6,
        name: "Arts & Music",
        description: "Creative expression at the frontier — generative art, music technology, and cultural production",
        memberCount: 45,
        resources: ["Recording Studio", "Digital Art Stations", "Performance Space", "VR Headsets"],
        currentEvents: [],
        budget: { total: 3000, spent: 800, currency: "USDC" },
        bounties: [{ title: "Design generative art for hackathon badge", amount: "100 USDC", status: "open" }],
      },
      {
        id: 7,
        name: "Frontier Makerspace",
        description: "Hands-on building, prototyping, and maker culture. Bring your projects and tools.",
        memberCount: 55,
        resources: ["3D Printers", "CNC Router", "Laser Cutter", "Hand Tools & Workbenches"],
        currentEvents: [],
        budget: { total: 4000, spent: 1500, currency: "USDC" },
        bounties: [{ title: "Fix 3D printer #2 (jammed extruder)", amount: "50 USDC", status: "open" }, { title: "Organize tool wall", amount: "30 USDC", status: "completed" }],
      },
      {
        id: 8,
        name: "Neuro & Biotech",
        description: "Brain-computer interfaces, neurotechnology, biotechnology, and the future of human augmentation",
        memberCount: 40,
        resources: ["EEG Equipment", "Microscopes", "Bio-sample Prep Area", "Research Library"],
        currentEvents: [],
        budget: { total: 6000, spent: 3400, currency: "USDC" },
        bounties: [],
      },
      {
        id: 9,
        name: "AI & Autonomous Systems",
        description: "Autonomous agents, AI infrastructure, and systems that operate independently at scale",
        memberCount: 75,
        resources: ["GPU Compute Cluster", "ML Workstations", "Inference Servers", "Whiteboard Room"],
        currentEvents: ["AI Safety Reading Group"],
        budget: { total: 5000, spent: 1800, currency: "USDC" },
        bounties: [{ title: "Write safety evaluation for new chat agent", amount: "200 USDC", status: "open" }, { title: "Set up monitoring dashboard", amount: "150 USDC", status: "claimed" }],
      },
      {
        id: 11,
        name: "Longevity",
        description: "Life extension, healthspan research, aging biology, and the science of living longer and better",
        memberCount: 35,
        resources: ["Biomarker Testing Equipment", "Cold Plunge", "Research Library", "Meeting Rooms"],
        currentEvents: [],
        budget: { total: 3500, spent: 900, currency: "USDC" },
        bounties: [],
      },
      {
        id: 12,
        name: "Ethereum & Decentralized Tech",
        description: "Ethereum ecosystem, decentralized protocols, on-chain governance, and Web3 infrastructure. Home of the Ethereum Foundation's first permanent community hub.",
        memberCount: 90,
        resources: ["Validator Nodes", "Hardware Wallet Lab", "Smart Contract Dev Environment"],
        currentEvents: ["ETH SF Weekly Meetup"],
        budget: { total: 7000, spent: 4200, currency: "USDC" },
        bounties: [{ title: "Audit smart contract for floor governance", amount: "500 USDC", status: "open" }],
      },
      {
        id: 14,
        name: "Human Flourishing",
        description: "Flourishing Systems Foundation — wellness, community building, and human-centered technology",
        memberCount: 50,
        resources: ["Meditation Room", "Community Kitchen", "Garden Terrace", "Wellness Library"],
        currentEvents: [],
        budget: { total: 3000, spent: 1200, currency: "USDC" },
        bounties: [{ title: "Organize community dinner for 50 people", amount: "300 USDC", status: "open" }],
      },
      {
        id: 16,
        name: "D/acc",
        description: "Defensive acceleration — building resilient, decentralized systems that protect human agency",
        memberCount: 65,
        resources: ["Secure Compute Lab", "Air-Gapped Workstations", "Cryptography Library"],
        currentEvents: [],
        budget: { total: 5000, spent: 2000, currency: "USDC" },
        bounties: [{ title: "Security audit of building network", amount: "400 USDC", status: "open" }],
      },
    ],
  };
}

export function getFloorById(floorId: number): Floor | undefined {
  return getBuildingData().floors.find((f) => f.id === floorId);
}

export function searchResources(query: string): { floor: Floor; resource: string }[] {
  const results: { floor: Floor; resource: string }[] = [];
  const q = query.toLowerCase();
  for (const floor of getBuildingData().floors) {
    for (const resource of floor.resources) {
      if (resource.toLowerCase().includes(q)) {
        results.push({ floor, resource });
      }
    }
  }
  return results;
}

export function getFloorsWithEvents(): Floor[] {
  return getBuildingData().floors.filter((f) => f.currentEvents.length > 0);
}
