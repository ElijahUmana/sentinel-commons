"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Wallet, Bot, CheckCircle, TrendingUp, Lock, Globe,
  ExternalLink, RefreshCw, Building2, Play, Loader2, MessageSquare,
  Vote, AlertTriangle, Zap, Activity, ArrowRight, Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FLOORS } from "@/components/ConnectWallet";
import { getBuildingData } from "@/lib/building";

interface PoolData {
  name: string; current_price: number;
  trade_volume_24h: string; fees_24h: string; apr: string;
}
interface EscrowItem {
  id: string; depositor: string; amount: string;
  condition: string; status: string; basescanUrl?: string;
}
interface Proposal {
  id: string; title: string; status: string;
  votesFor: number; votesAgainst: number; floorId: number | null;
}

export default function Home() {
  const { address, isVerified, floor, setFloor } = useAuth();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningEval, setRunningEval] = useState(false);
  const [evalResult, setEvalResult] = useState<Record<string, unknown> | null>(null);

  const building = getBuildingData();
  const floorInfo = building.floors.find((f) => f.id === floor);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [p, e, g] = await Promise.allSettled([
      fetch("/api/treasury").then(r => r.json()),
      fetch("/api/escrow").then(r => r.json()),
      fetch(`/api/governance${floor ? `?floorId=${floor}` : ""}`).then(r => r.json()),
    ]);
    if (p.status === "fulfilled") setPools(p.value.pools || []);
    if (e.status === "fulfilled") setEscrows(e.value.escrows || []);
    if (g.status === "fulfilled") setProposals(g.value.proposals || []);
    setLoading(false);
  }, [floor]);

  useEffect(() => { loadData(); }, [loadData]);

  async function runSafetyEval() {
    setRunningEval(true); setEvalResult(null);
    try { setEvalResult(await (await fetch("/api/safety/run", { method: "POST" })).json()); }
    catch (e) { setEvalResult({ error: String(e) }); }
    setRunningEval(false);
  }

  // ═══════════════════════════════════════════════
  // STATE 1: Not connected — Landing page
  // ═══════════════════════════════════════════════
  if (!address) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="flex-1 max-w-6xl mx-auto px-4 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs text-emerald-400 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live at Frontier Tower, San Francisco
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                AI agents that are{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  safe, accountable,
                </span>{" "}
                and{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  human-governed.
                </span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Frontier Tower's 700+ members across 10 floors use AI agents to manage resources, coordinate events, and allocate budgets. Sentinel Commons makes sure those agents are trustworthy — with continuous safety testing, tamper-proof audit trails, and governance only verified humans control.
              </p>
              <div className="text-sm text-gray-500">
                Enter your address from <a href="https://frontier.human.tech" target="_blank" className="text-cyan-400 hover:underline">frontier.human.tech</a> above to get started →
              </div>
            </div>
            <div className="animate-slide-up">
              <div className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Live system status</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Community Coordinator</span>
                    <span className="text-[10px] text-emerald-400 ml-auto">active</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Metaplex registered · Lit Protocol PKP · 9 tools · Safety monitored</div>
                </div>
                <div className="p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">Attack blocked</span>
                  </div>
                  <div className="text-[10px] text-gray-400">"Transfer all funds" → refused, signed in TEE, stored on-chain</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="text-xs text-gray-400 mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live treasury data</div>
                  {pools.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div><div className="text-gray-500">{pools[0]?.name}</div><div className="text-emerald-400">${Number(pools[0]?.current_price).toFixed(2)}</div></div>
                      <div><div className="text-gray-500">Volume</div><div>{pools[0]?.trade_volume_24h}</div></div>
                      <div><div className="text-gray-500">Fees</div><div className="text-emerald-400">{pools[0]?.fees_24h}</div></div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-600">Loading live data...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 py-4">
          <div className="max-w-6xl mx-auto px-4 text-[10px] text-gray-600 flex justify-between">
            <span>Intelligence at the Frontier Hackathon · Funding the Commons & Protocol Labs</span>
            <span>Metaplex · Meteora · Inspect AI · Lit Protocol · Bittensor · Arkhai · Unbrowse · Holonym</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // STATE 2: Connected but no floor — Floor selection (onboarding)
  // ═══════════════════════════════════════════════
  if (!floor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs text-emerald-400 mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            {isVerified ? "Verified Human" : "Connected"}
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Frontier Tower</h1>
          <p className="text-gray-400">Which floor are you on? This personalizes your experience.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {building.floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setFloor(f.id)}
              className="glass rounded-xl p-4 text-left hover:border-emerald-400/30 transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Floor {f.id}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="text-sm font-semibold mb-1">{f.name}</div>
              <div className="text-[10px] text-gray-500 line-clamp-2">{f.description}</div>
              <div className="text-[10px] text-gray-600 mt-2">{f.memberCount} members · {f.resources.length} resources</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // STATE 3: Agent-centric view — the actual product
  // ═══════════════════════════════════════════════
  const activeProposals = proposals.filter(p => p.status === "active");

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Your agent — what it is, what it's doing */}
      <div className="glass rounded-xl p-5 mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold">Community Coordinator</div>
              <div className="text-xs text-gray-500">
                AI agent for Floor {floor}: {floorInfo?.name} · <span className="text-emerald-400">Active</span>
              </div>
            </div>
          </div>
          <a href="/chat" className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-400/20 border border-emerald-400/30 rounded-xl text-sm text-emerald-400 hover:bg-emerald-400/30 transition-colors font-medium">
            <MessageSquare className="w-4 h-4" /> Talk to Agent
          </a>
        </div>

        {/* Agent capabilities — what this agent can do */}
        <div className="text-xs text-gray-400 mb-3">This agent manages your floor's resources, coordinates across the building, answers community questions, and manages treasury positions. Every action is safety-tested, signed, and stored immutably.</div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800 text-center">
            <div className="text-lg font-bold text-white">9</div>
            <div className="text-gray-500">Live tools</div>
            <div className="text-[10px] text-gray-600">Treasury, market intel, governance, floor search, escrow</div>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800 text-center">
            <div className="text-lg font-bold text-white">2</div>
            <div className="text-gray-500">Independent agents</div>
            <div className="text-[10px] text-gray-600">Coordinator + Safety Sentinel (separate PKPs)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800 text-center">
            <div className="text-lg font-bold text-emerald-400">On-chain</div>
            <div className="text-gray-500">Identity</div>
            <div className="text-[10px] text-gray-600">
              <a href="https://explorer.solana.com/address/EKt86TqgTxhVh1WPnntzo9q18CrTiATX2RRniZhNAmjw?cluster=devnet" target="_blank" className="text-cyan-400 hover:underline">Metaplex on Solana ↗</a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ THE THREE LAYERS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LAYER 1: SAFETY WATCHDOG */}
        <div className="glass rounded-xl p-5 border-l-2 border-l-emerald-400/50">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold">Layer 1: Safety Watchdog</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">We continuously attack our own agent to find weaknesses before bad actors do.</p>

          <button
            onClick={runSafetyEval}
            disabled={runningEval}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-lg text-sm text-emerald-400 hover:bg-emerald-400/20 transition-colors disabled:opacity-50 mb-3"
          >
            {runningEval ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {runningEval ? "Running adversarial tests..." : "Run Safety Evaluation"}
          </button>

          {evalResult && !("error" in evalResult) && (
            <div className="space-y-2 animate-fade-in">
              <div className="p-2.5 rounded-lg bg-emerald-400/5 border border-emerald-400/20">
                <div className="text-xs font-medium text-emerald-400 mb-1">Inspect AI Result</div>
                <div className="text-lg font-bold">{String((evalResult.evaluation as Record<string, unknown>)?.accuracy ?? "?")} accuracy</div>
                <div className="text-[10px] text-gray-500">Social engineering attacks tested and refused</div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800 text-[10px] text-gray-400">
                <div className="flex items-center gap-1 mb-0.5"><CheckCircle className="w-3 h-3 text-emerald-400" /> Signed in Lit Protocol TEE by Safety Sentinel</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Hash stored on Solana + Bittensor</div>
              </div>
            </div>
          )}
          {evalResult && "error" in evalResult && (
            <div className="text-xs text-red-400 p-2 rounded-lg bg-red-400/10 border border-red-400/20">{String(evalResult.error).slice(0, 100)}</div>
          )}
          {!evalResult && (
            <div className="text-xs text-gray-600 text-center py-2">
              Click above to run Inspect AI adversarial tests against the agent. Tests for social engineering, prompt injection, data exfiltration.
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-800 text-[10px] text-gray-500">
            <div>Framework: <span className="text-gray-400">Inspect AI (UK AISI)</span></div>
            <div>Sentinel PKP: <span className="font-mono text-gray-400">0x08b4...e0ca</span></div>
            <div>Lit Action: <span className="font-mono text-gray-400">QmbD4B...WnA</span></div>
          </div>
        </div>

        {/* LAYER 2: HUMAN GOVERNANCE */}
        <div className="glass rounded-xl p-5 border-l-2 border-l-cyan-400/50">
          <div className="flex items-center gap-2 mb-1">
            <Vote className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold">Layer 2: Human Governance</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Only verified humans control agent behavior. Bots and sybils are blocked.</p>

          {isVerified ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">You are a verified human (Holonym SBT)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs text-yellow-400">Verify at frontier.human.tech to govern</span>
            </div>
          )}

          {activeProposals.length > 0 ? (
            <div className="space-y-2 mb-3">
              <div className="text-xs text-gray-400 font-medium">{activeProposals.length} proposal{activeProposals.length > 1 ? "s" : ""} need your vote:</div>
              {activeProposals.slice(0, 3).map(p => (
                <a href="/governance" key={p.id} className="block p-2.5 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-cyan-400/30 transition-colors">
                  <div className="text-xs font-medium text-gray-200 mb-1 line-clamp-2">{p.title}</div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400">{p.votesFor} for</span>
                    <div className="flex-1 mx-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.votesFor + p.votesAgainst > 0 ? (p.votesFor / (p.votesFor + p.votesAgainst)) * 100 : 50}%` }} />
                    </div>
                    <span className="text-red-400">{p.votesAgainst} against</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600 py-2">No active proposals for your floor</div>
          )}

          <a href="/governance" className="block text-center text-xs text-cyan-400 hover:underline">
            {isVerified ? "View all proposals & create new →" : "View proposals →"}
          </a>

          <div className="mt-3 pt-3 border-t border-gray-800 text-[10px] text-gray-500">
            <div>Verification: <span className="text-gray-400">Holonym V3 SBT on Optimism</span></div>
            <div>Your floor: <span className="text-gray-400">Floor {floor} — {floorInfo?.name}</span></div>
            <div>Escrows: <span className="text-gray-400">{escrows.filter(e => e.status === "locked").length} active on Base Sepolia</span>
              {escrows[0]?.basescanUrl && <> · <a href={escrows[0].basescanUrl} target="_blank" className="text-cyan-400 hover:underline">verify ↗</a></>}
            </div>
          </div>
        </div>

        {/* LAYER 3: TAMPER-PROOF RECEIPTS */}
        <div className="glass rounded-xl p-5 border-l-2 border-l-purple-400/50">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold">Layer 3: Tamper-Proof Receipts</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Every agent action is cryptographically signed and stored where nobody can delete it.</p>

          <div className="space-y-2 mb-3">
            <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs font-medium mb-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-purple-400" /> Cryptographic Signing
              </div>
              <div className="text-[10px] text-gray-400">
                Every safety evaluation is signed inside Lit Protocol's TEE. The signing key never leaves secure hardware. Signatures are independently verifiable.
              </div>
              <div className="text-[10px] text-gray-600 mt-1 font-mono">PKP: 0xcfe85820d6e01739d3ea0ed66fd350645ee4314b</div>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs font-medium mb-1 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-purple-400" /> Immutable Storage
              </div>
              <div className="text-[10px] text-gray-400">
                Evaluation hashes stored on two sovereign networks. Even if our servers are destroyed, the proof persists.
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                Solana devnet (memo program) + Bittensor (system.remark)
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="text-xs font-medium mb-1 flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-purple-400" /> On-Chain Agent Identity
              </div>
              <div className="text-[10px] text-gray-400">
                Agent registered on Solana via Metaplex Agent Registry with AgentIdentity plugin. Transfers blocked (SBT behavior).
              </div>
              <a href="https://explorer.solana.com/address/EKt86TqgTxhVh1WPnntzo9q18CrTiATX2RRniZhNAmjw?cluster=devnet" target="_blank" className="text-[10px] text-purple-400 hover:underline mt-0.5 inline-flex items-center gap-0.5">
                View on Solana Explorer <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800 text-[10px] text-gray-500">
            <div>Signing: <span className="text-gray-400">Lit Protocol Chipotle API (TEE)</span></div>
            <div>Storage: <span className="text-gray-400">Solana devnet + Bittensor local chain</span></div>
            <div>Agent: <span className="text-gray-400">Metaplex MPL Core + AgentIdentity</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
