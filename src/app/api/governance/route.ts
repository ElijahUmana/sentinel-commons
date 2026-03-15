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
    title: "Allocate 20% of treasury yield to community events",
    description: "Direct 20% of Meteora LP fees earned to fund weekly community events at Frontier Tower, including speaker series, workshops, and networking sessions across all floors.",
    proposer: "0x61ff...b143",
    floorId: null,
    status: "active",
    votesFor: 12,
    votesAgainst: 3,
    voters: {},
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "prop-002",
    title: "Increase safety evaluation frequency to every 6 hours",
    description: "Run Inspect AI adversarial evaluations against all community agents every 6 hours instead of every 24 hours, to catch safety regressions faster.",
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
    title: "Fund AI Safety Reading Group on Floor 9",
    description: "Allocate 200 USDC from Floor 9 treasury for weekly AI safety reading group — covers food, drinks, and printed materials.",
    proposer: "0x61ff...b143",
    floorId: 9,
    status: "passed",
    votesFor: 15,
    votesAgainst: 2,
    voters: {},
    createdAt: new Date(Date.now() - 172800000).toISOString(),
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
    } else {
      proposal.votesAgainst++;
    }
    proposal.voters[voterAddr] = body.vote;

    // Check if passed (>50% with at least 5 votes)
    const total = proposal.votesFor + proposal.votesAgainst;
    if (total >= 5 && proposal.votesFor / total > 0.5) {
      proposal.status = "passed";
    }

    await store.setJSON("proposals", proposals);
    return NextResponse.json({ proposal });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
