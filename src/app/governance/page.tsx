"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, CheckCircle, XCircle, Vote, Shield, ExternalLink, Building2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FLOORS } from "@/components/ConnectWallet";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  floorId: number | null;
  status: "active" | "passed" | "rejected";
  votesFor: number;
  votesAgainst: number;
  voters?: Record<string, string>;
  createdAt: string;
}

export default function GovernancePage() {
  const { address, isVerified, isLoading: authLoading, floor } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFloorId, setNewFloorId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [votingOn, setVotingOn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const floorName = FLOORS.find((f) => f.id === floor)?.name;

  const loadProposals = useCallback(async () => {
    setLoading(true);
    try {
      const url = floor ? `/api/governance?floorId=${floor}` : "/api/governance";
      const res = await fetch(url);
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch {
      setError("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [floor]);

  useEffect(() => { loadProposals(); }, [loadProposals]);

  async function submitProposal() {
    if (!newTitle.trim() || !isVerified || !address) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: newTitle.trim(),
          description: newDesc.trim() || newTitle.trim(),
          proposer: `${address.slice(0, 6)}...${address.slice(-4)}`,
          floorId: newFloorId || floor || null,
        }),
      });
      const data = await res.json();
      if (data.proposal) {
        setProposals((prev) => [data.proposal, ...prev]);
        setNewTitle("");
        setNewDesc("");
        setShowNewProposal(false);
      } else {
        setError(data.error || "Failed to create proposal");
      }
    } catch {
      setError("Failed to submit proposal");
    } finally {
      setSubmitting(false);
    }
  }

  async function vote(proposalId: string, voteType: "for" | "against") {
    if (!isVerified || !address) return;
    setVotingOn(proposalId);
    setError(null);
    try {
      const res = await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vote",
          proposalId,
          vote: voteType,
          voter: address,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.proposal) {
        setProposals((prev) =>
          prev.map((p) => (p.id === data.proposal.id ? data.proposal : p))
        );
      }
    } catch {
      setError("Failed to vote");
    } finally {
      setVotingOn(null);
    }
  }

  const hasVoted = (proposal: Proposal) => {
    if (!address || !proposal.voters) return false;
    return !!proposal.voters[address.toLowerCase()];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {floor ? `Floor ${floor} Governance` : "Community Governance"}
          </h1>
          <p className="text-gray-400 text-sm">
            {floor
              ? `${floorName} — proposals and voting for your floor. Only verified humans can participate.`
              : "Frontier Tower — only verified humans can propose and vote. Agents execute — humans decide."}
          </p>
        </div>
        {floor && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400">Floor {floor}</span>
          </div>
        )}
      </div>

      {/* Auth status */}
      {!address && !authLoading && (
        <div className="glass rounded-xl p-6 mb-6 text-center animate-fade-in">
          <Users className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">Connect to Participate</h2>
          <p className="text-sm text-gray-400 mb-4">
            Enter your address from frontier.human.tech in the nav bar to verify your humanity and participate in governance.
          </p>
        </div>
      )}

      {address && !isVerified && !authLoading && (
        <div className="glass rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-yellow-400">Humanity Not Verified</div>
              <div className="text-xs text-gray-400">
                Your address ({address.slice(0, 6)}...{address.slice(-4)}) does not have a Holonym SBT on Optimism.{" "}
                <a href="https://frontier.human.tech" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  Verify at frontier.human.tech
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {address && isVerified && (
        <div className="glass rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm font-medium text-emerald-400">Verified Human</div>
                <div className="text-xs text-gray-400">
                  {address.slice(0, 6)}...{address.slice(-4)} — Holonym V3 SBT on Optimism
                </div>
              </div>
            </div>
            <a
              href="https://optimistic.etherscan.io/tx/0xbd00f9fcb91b3508fe8fa0b71c8de1750bdb57a50e73c6a3ee39d6b1441fe6be"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              View SBT <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-xs text-red-400 mb-4 animate-fade-in">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* New proposal */}
      {isVerified && (
        <div className="mb-6">
          {!showNewProposal ? (
            <button
              onClick={() => setShowNewProposal(true)}
              className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-emerald-400/30 transition-colors"
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
                placeholder="Describe your proposal..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-emerald-400/50 resize-none"
              />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">Scope:</span>
                <button
                  onClick={() => setNewFloorId(null)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                    newFloorId === null ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : "border-gray-700 text-gray-400"
                  }`}
                >
                  Building-wide
                </button>
                {floor && (
                  <button
                    onClick={() => setNewFloorId(floor)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                      newFloorId === floor ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400" : "border-gray-700 text-gray-400"
                    }`}
                  >
                    Floor {floor} only
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitProposal}
                  disabled={submitting || !newTitle.trim()}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-400/20 border border-emerald-400/30 rounded-lg text-sm text-emerald-400 hover:bg-emerald-400/30 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No proposals yet.{isVerified ? " Be the first to propose!" : ""}
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const total = proposal.votesFor + proposal.votesAgainst;
            const pctFor = total > 0 ? (proposal.votesFor / total) * 100 : 50;
            const voted = hasVoted(proposal);
            return (
              <div key={proposal.id} className="glass rounded-xl p-5 animate-slide-up">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        proposal.status === "active"
                          ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                          : proposal.status === "passed"
                          ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                          : "bg-red-400/10 text-red-400 border border-red-400/20"
                      }`}>
                        {proposal.status}
                      </span>
                      {proposal.floorId ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                          Floor {proposal.floorId}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                          Building-wide
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600">
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
                {proposal.status === "active" && isVerified && !voted && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => vote(proposal.id, "for")}
                      disabled={votingOn === proposal.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-colors disabled:opacity-50"
                    >
                      {votingOn === proposal.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Vote className="w-3 h-3" />}
                      Vote For
                    </button>
                    <button
                      onClick={() => vote(proposal.id, "against")}
                      disabled={votingOn === proposal.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" /> Against
                    </button>
                  </div>
                )}
                {proposal.status === "active" && voted && (
                  <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> You voted
                  </div>
                )}
                {proposal.status === "active" && !isVerified && (
                  <div className="mt-3 text-xs text-gray-500">
                    {address ? "Verify your humanity to vote" : "Connect wallet to vote"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
