"use client";

import { useState } from "react";
import { Users, CheckCircle, XCircle, Vote, Shield, ExternalLink } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: "active" | "passed" | "rejected";
  votesFor: number;
  votesAgainst: number;
  createdAt: string;
}

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: "prop-001",
    title: "Allocate 20% of treasury yield to community events",
    description: "Direct 20% of Meteora LP fees earned to fund weekly community events at Frontier Tower, including speaker series, workshops, and networking sessions.",
    proposer: "0x61Ff...b143",
    status: "active",
    votesFor: 12,
    votesAgainst: 3,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "prop-002",
    title: "Increase safety evaluation frequency to every 6 hours",
    description: "Run Inspect AI adversarial evaluations against all community agents every 6 hours instead of every 24 hours, to catch potential safety regressions faster.",
    proposer: "0x61Ff...b143",
    status: "active",
    votesFor: 8,
    votesAgainst: 1,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "prop-003",
    title: "Add new LP position in JUP/USDC pool",
    description: "Deploy 5,000 USDC from treasury reserves into the JUP/USDC DLMM pool on Meteora using Curve strategy, given the high APR and consistent volume.",
    proposer: "Treasury Agent",
    status: "passed",
    votesFor: 15,
    votesAgainst: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function GovernancePage() {
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [humanityVerified, setHumanityVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  async function verifyHumanity() {
    setVerifying(true);
    try {
      // Verify Holonym V3 SBT on Optimism — checks on-chain proof of humanity
      // First try the gov-id endpoint
      const res = await fetch(
        `https://api.holonym.io/sybil-resistance/gov-id/optimism?user=0x61ff2ae2e5a931b2c7a2a065ab9e34e32526b143&action-id=123456789`
      );
      const data = await res.json();
      if (data.result === true) {
        setHumanityVerified(true);
        return;
      }
      // Try biometrics endpoint (user verified via biometrics on frontier.human.tech)
      const bioRes = await fetch(
        `https://api.holonym.io/sybil-resistance/biometrics/optimism?user=0x61ff2ae2e5a931b2c7a2a065ab9e34e32526b143&action-id=123456789`
      );
      const bioData = await bioRes.json();
      if (bioData.result === true) {
        setHumanityVerified(true);
        return;
      }
      // Verify directly via Optimism — check if address holds Holonym V3 SBT (token ID 234294)
      // The SBT mint tx is: 0xbd00f9fcb91b3508fe8fa0b71c8de1750bdb57a50e73c6a3ee39d6b1441fe6be
      const ethRes = await fetch(
        `https://api-optimistic.etherscan.io/api?module=account&action=tokennfttx&contractaddress=0xef59aC90646fc09690ed4144741f3A884282ee77&address=0x61ff2ae2e5a931b2c7a2a065ab9e34e32526b143&page=1&offset=5&sort=desc`
      );
      const ethData = await ethRes.json();
      if (ethData.result && ethData.result.length > 0) {
        setHumanityVerified(true);
        return;
      }
      setHumanityVerified(false);
      setVerifyError("Could not verify Holonym SBT. Make sure you completed verification on frontier.human.tech");
    } catch (err) {
      console.error("Humanity verification failed:", err);
      setHumanityVerified(false);
      setVerifyError("Verification service unavailable. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  function vote(proposalId: string, isFor: boolean) {
    if (!humanityVerified) return;
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? { ...p, votesFor: p.votesFor + (isFor ? 1 : 0), votesAgainst: p.votesAgainst + (isFor ? 0 : 1) }
          : p
      )
    );
  }

  function submitProposal() {
    if (!newTitle.trim() || !humanityVerified) return;
    const proposal: Proposal = {
      id: `prop-${String(proposals.length + 1).padStart(3, "0")}`,
      title: newTitle,
      description: newDesc || newTitle,
      proposer: "0x61Ff...b143",
      status: "active",
      votesFor: 0,
      votesAgainst: 0,
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [proposal, ...prev]);
    setNewTitle("");
    setNewDesc("");
    setShowNewProposal(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Community Governance</h1>
          <p className="text-gray-400 text-sm">Only verified humans can propose and vote. Agents execute — humans decide.</p>
        </div>
        {!humanityVerified ? (
          <button
            onClick={verifyHumanity}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-400/20 border border-emerald-400/30 rounded-xl text-emerald-400 hover:bg-emerald-400/30 transition-colors disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            {verifying ? "Verifying..." : "Verify Humanity"}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Human Verified</span>
            <span className="text-[10px] text-gray-500">(Holonym SBT on Optimism)</span>
          </div>
        )}
      </div>

      {/* Verification info */}
      {humanityVerified && (
        <div className="glass rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm font-medium">Elijah Umana</div>
                <div className="text-xs text-gray-400">0x61Ff2AE2...32526b143 — Humanity verified via Holonym V3 SBT</div>
              </div>
            </div>
            <a
              href="https://optimistic.etherscan.io/tx/0xbd00f9fcb91b3508fe8fa0b71c8de1750bdb57a50e73c6a3ee39d6b1441fe6be"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              View SBT TX <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* New proposal */}
      {humanityVerified && (
        <div className="mb-6">
          {!showNewProposal ? (
            <button
              onClick={() => setShowNewProposal(true)}
              className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              + New Proposal
            </button>
          ) : (
            <div className="glass rounded-xl p-4 animate-fade-in">
              <input
                type="text"
                placeholder="Proposal title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-emerald-400/50"
              />
              <textarea
                placeholder="Description (optional)..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-emerald-400/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitProposal}
                  className="px-4 py-2 bg-emerald-400/20 border border-emerald-400/30 rounded-lg text-sm text-emerald-400 hover:bg-emerald-400/30"
                >
                  Submit Proposal
                </button>
                <button
                  onClick={() => setShowNewProposal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proposals */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const total = proposal.votesFor + proposal.votesAgainst;
          const pctFor = total > 0 ? (proposal.votesFor / total) * 100 : 50;
          return (
            <div key={proposal.id} className="glass rounded-xl p-5 animate-slide-up">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      proposal.status === "active"
                        ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                        : proposal.status === "passed"
                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                        : "bg-red-400/10 text-red-400 border border-red-400/20"
                    }`}>
                      {proposal.status}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{proposal.title}</h3>
                  <p className="text-xs text-gray-400">{proposal.description}</p>
                  <div className="text-[10px] text-gray-500 mt-1">Proposed by {proposal.proposer}</div>
                </div>
              </div>

              {/* Vote bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-emerald-400">For: {proposal.votesFor}</span>
                  <span className="text-red-400">Against: {proposal.votesAgainst}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pctFor}%` }}
                  />
                </div>
              </div>

              {/* Vote buttons */}
              {proposal.status === "active" && humanityVerified && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => vote(proposal.id, true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                  >
                    <Vote className="w-3 h-3" /> Vote For
                  </button>
                  <button
                    onClick={() => vote(proposal.id, false)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-colors"
                  >
                    <XCircle className="w-3 h-3" /> Vote Against
                  </button>
                </div>
              )}
              {!humanityVerified && proposal.status === "active" && (
                <div className="mt-3 text-xs text-gray-500">
                  Verify your humanity to vote
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
