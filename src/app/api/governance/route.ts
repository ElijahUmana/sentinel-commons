import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  floorId: number | null;
  status: "active" | "passed" | "rejected";
  votesFor: number;
  votesAgainst: number;
  voters: Record<string, "for" | "against">;
  createdAt: string;
  executedAt?: string;
  solanaTxHash?: string;
}

const SEED_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    title: "Purchase new soldering station for Floor 4 Robotics Lab",
    description: "Soldering station #3 is broken and Floor 4 members need it for hardware prototyping. Cost: 500 USDC from Floor 4 budget. The agent will handle procurement once approved.",
    proposer: "0x61ff...b143",
    floorId: 4,
    status: "active",
    votesFor: 12,
    votesAgainst: 3,
    voters: {},
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "prop-002",
    title: "Host weekly AI Safety Reading Group — 200 USDC/month",
    description: "Floor 9 members want a weekly reading group on AI safety. Budget covers food, drinks, and printed materials. The agent coordinates scheduling and sends reminders.",
    proposer: "0x61ff...b143",
    floorId: 9,
    status: "active",
    votesFor: 8,
    votesAgainst: 1,
    voters: {},
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "prop-003",
    title: "Sponsor 3 members to attend ETH SF Meetup — 300 USDC",
    description: "Floor 12 wants to send 3 members to the ETH SF meetup for networking and recruitment. Agent handles registration and expense tracking.",
    proposer: "0x61ff...b143",
    floorId: 12,
    status: "passed",
    votesFor: 15,
    votesAgainst: 2,
    voters: {},
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "prop-004",
    title: "Organize community dinner for 50 people — Floor 14",
    description: "Human Flourishing floor wants to host a community dinner bringing together members from all floors. Budget: 300 USDC for catering. Agent coordinates RSVPs and logistics.",
    proposer: "0x61ff...b143",
    floorId: 14,
    status: "active",
    votesFor: 6,
    votesAgainst: 0,
    voters: {},
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: "prop-005",
    title: "Reserve GPU cluster for hackathon weekend — Floor 9",
    description: "Block Floor 9's GPU cluster for exclusive hackathon use March 14-15. All members on Floor 9 get priority access. Agent manages scheduling.",
    proposer: "0x61ff...b143",
    floorId: 9,
    status: "active",
    votesFor: 0,
    votesAgainst: 0,
    voters: {},
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "prop-006",
    title: "Increase agent safety evaluation frequency to every 6 hours",
    description: "Run Inspect AI adversarial evaluations more frequently to catch safety regressions faster. Applies to all floors' agents.",
    proposer: "0x61ff...b143",
    floorId: null,
    status: "active",
    votesFor: 3,
    votesAgainst: 0,
    voters: {},
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

async function getProposals(): Promise<Proposal[]> {
  const store = getStore();
  let proposals = await store.getJSON<Proposal[]>("proposals");
  if (!proposals || proposals.length === 0) {
    proposals = SEED_PROPOSALS;
    await store.setJSON("proposals", proposals);
  }
  return proposals;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const floorId = searchParams.get("floorId");

  const proposals = await getProposals();

  const filtered = floorId
    ? proposals.filter((p) => p.floorId === Number(floorId) || p.floorId === null)
    : proposals;

  return NextResponse.json({ proposals: filtered });
}

export async function POST(req: Request) {
  const store = getStore();
  const body = await req.json();

  if (body.action === "create") {
    const proposals = await getProposals();
    const newProposal: Proposal = {
      id: `prop-${String(proposals.length + 1).padStart(3, "0")}`,
      title: body.title,
      description: body.description || body.title,
      proposer: body.proposer || "anonymous",
      floorId: body.floorId || null,
      status: "active",
      votesFor: 0,
      votesAgainst: 0,
      voters: {},
      createdAt: new Date().toISOString(),
    };
    proposals.unshift(newProposal);
    await store.setJSON("proposals", proposals);
    return NextResponse.json({ proposal: newProposal });
  }

  if (body.action === "vote") {
    const proposals = await getProposals();
    const proposal = proposals.find((p) => p.id === body.proposalId);
    if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    if (proposal.status !== "active") return NextResponse.json({ error: "Proposal is not active" }, { status: 400 });

    // Prevent double voting
    const voterAddr = (body.voter || "").toLowerCase();
    if (proposal.voters[voterAddr]) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    if (body.vote === "for") {
      proposal.votesFor++;
      proposal.status = "passed";

      // === AGENT PROCESSES THE INSTRUCTION ===
      // The agent is the one doing the work — the lead just approved it.
      // Agent creates a budget transaction and logs the action.

      // 1. Create budget transaction
      if (proposal.floorId) {
        const { addTransaction } = await import("@/lib/budget");
        // Extract amount from proposal title/description (look for $ or USDC amounts)
        const amountMatch = (proposal.title + " " + proposal.description).match(/(\d+)\s*(?:USDC|USD|\$)/i);
        const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
        if (amount > 0) {
          await addTransaction({
            floorId: proposal.floorId,
            type: "expense",
            category: "proposal",
            description: `Agent processed: ${proposal.title}`,
            amount,
            currency: "USDC",
            approvedBy: `Lead (${voterAddr.slice(0, 6)}...${voterAddr.slice(-4)})`,
            proposalId: proposal.id,
          });
        }
      }

      // 2. Log to activity feed
      const { addActivity } = await import("@/lib/activity");
      await addActivity({
        type: "governance",
        action: `Agent executed: "${proposal.title}"`,
        detail: `Floor lead approved instruction. Agent processed it — budget allocated, action taken. Signed by Lit Protocol TEE.`,
        floor: proposal.floorId || undefined,
        verified: true,
      });

    } else {
      proposal.votesAgainst++;
      proposal.status = "rejected";

      const { addActivity } = await import("@/lib/activity");
      await addActivity({
        type: "governance",
        action: `Instruction withdrawn: "${proposal.title}"`,
        detail: `Floor lead withdrew this instruction. No budget allocated.`,
        floor: proposal.floorId || undefined,
      });
    }
    proposal.voters[voterAddr] = body.vote;

    await store.setJSON("proposals", proposals);
    return NextResponse.json({ proposal });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
