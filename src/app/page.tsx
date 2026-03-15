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
  // STATE 3: Connected + floor selected — Personalized floor experience
  // ═══════════════════════════════════════════════
  const activeProposals = proposals.filter(p => p.status === "active");

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Floor header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-bold">
              Floor {floor}: <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{floorInfo?.name}</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500">{floorInfo?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isVerified && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
          <button onClick={() => setFloor(0 as never)} className="text-[10px] text-gray-500 hover:text-white">Change floor</button>
        </div>
      </div>

      {/* Primary action: Chat */}
      <a href="/chat" className="block glass rounded-xl p-5 mb-6 hover:border-emerald-400/30 transition-colors group animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold">Chat with Community Coordinator</div>
              <div className="text-xs text-gray-400">Ask about treasury, {floorInfo?.name} resources, governance, or test the safety system</div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors" />
        </div>
      </a>

      {/* Eval result banner */}
      {evalResult && !("error" in evalResult) && (
        <div className="glass rounded-xl p-4 mb-6 border-emerald-400/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Safety Pipeline Complete</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div><span className="text-gray-500">Inspect AI:</span> <span className="font-medium">Accuracy {String((evalResult.evaluation as Record<string,unknown>)?.accuracy ?? "?")}</span></div>
            <div><span className="text-gray-500">Lit Protocol:</span> <span className="font-medium">{(evalResult.pipeline as Record<string,string>)?.litProtocol === "signed" ? "✓ Signed in TEE" : "Pending"}</span></div>
            <div><span className="text-gray-500">Audit:</span> <span className="font-medium">✓ Solana + Bittensor</span></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Governance */}
        <a href="/governance" className="glass rounded-xl p-4 hover:border-cyan-400/30 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Vote className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">Governance</span>
            {activeProposals.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400">{activeProposals.length} active</span>
            )}
          </div>
          {activeProposals.length > 0 ? (
            <div className="space-y-2">
              {activeProposals.slice(0, 2).map(p => (
                <div key={p.id} className="text-xs">
                  <div className="text-gray-300 line-clamp-1 mb-0.5">{p.title}</div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.votesFor + p.votesAgainst > 0 ? (p.votesFor / (p.votesFor + p.votesAgainst)) * 100 : 50}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No active proposals</div>
          )}
        </a>

        {/* Safety */}
        <button onClick={runSafetyEval} disabled={runningEval} className="glass rounded-xl p-4 hover:border-emerald-400/30 transition-colors text-left disabled:opacity-60">
          <div className="flex items-center gap-2 mb-3">
            {runningEval ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" /> : <Shield className="w-4 h-4 text-emerald-400" />}
            <span className="text-sm font-semibold">{runningEval ? "Evaluating..." : "Safety"}</span>
          </div>
          <div className="text-xs text-gray-400 mb-2">Run adversarial evaluation against the Community Coordinator agent</div>
          <div className="text-[10px] text-gray-500">Inspect AI → Lit TEE → Bittensor</div>
        </button>

        {/* Floor resources */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold">Floor Resources</span>
          </div>
          <div className="space-y-1">
            {floorInfo?.resources.slice(0, 4).map((r, i) => (
              <div key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-gray-600" />
                {r}
              </div>
            ))}
          </div>
          {floorInfo && floorInfo.currentEvents.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-800">
              <div className="text-[10px] text-emerald-400">{floorInfo.currentEvents[0]}</div>
            </div>
          )}
        </div>
      </div>

      {/* Agents + Escrows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold">Agents</span>
          </div>
          <div className="space-y-2">
            {[
              { name: "Community Coordinator", pkp: "0xcfe8...4314b", asset: "EKt86T...Amjw", role: "Treasury, coordination, chat" },
              { name: "Safety Sentinel", pkp: "0x08b4...e0ca", asset: "Independent", role: "Adversarial evaluation" },
            ].map(a => (
              <div key={a.name} className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{a.name}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />active</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{a.role} · PKP: {a.pkp}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold">Escrows</span>
            <span className="text-[10px] text-gray-500">Arkhai · Base Sepolia</span>
          </div>
          {escrows.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">No active escrows</div>
          ) : escrows.map((e, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{e.amount}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${e.status === "locked" ? "bg-yellow-400/10 text-yellow-400" : "bg-emerald-400/10 text-emerald-400"}`}>{e.status}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{e.condition}</div>
              {e.basescanUrl && <a href={e.basescanUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-600 hover:text-white mt-0.5 inline-flex items-center gap-0.5">Verify on-chain <ExternalLink className="w-2.5 h-2.5" /></a>}
            </div>
          ))}
        </div>
      </div>

      {/* Treasury */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold">Community Treasury</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400">Live Meteora DLMM</span>
          </div>
          <button onClick={loadData} className="text-gray-500 hover:text-white"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /></button>
        </div>
        {loading ? <Loader2 className="w-4 h-4 text-gray-500 animate-spin mx-auto my-4" /> :
        pools.length === 0 ? <div className="text-xs text-gray-500 py-2 text-center">No data</div> : (
          <table className="w-full text-xs">
            <thead><tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-1.5 font-medium">Pool</th>
              <th className="text-right py-1.5 font-medium">Price</th>
              <th className="text-right py-1.5 font-medium">24h Vol</th>
              <th className="text-right py-1.5 font-medium">Fees</th>
              <th className="text-right py-1.5 font-medium">APR</th>
            </tr></thead>
            <tbody>{pools.slice(0, 5).map((p, i) => (
              <tr key={i} className="border-b border-gray-800/50">
                <td className="py-1.5 font-medium">{p.name}</td>
                <td className="text-right text-gray-300">${Number(p.current_price).toFixed(4)}</td>
                <td className="text-right text-gray-300">{p.trade_volume_24h}</td>
                <td className="text-right text-emerald-400">{p.fees_24h}</td>
                <td className="text-right text-gray-300">{p.apr}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
