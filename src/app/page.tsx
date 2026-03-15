"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Activity, Wallet, Bot, AlertTriangle, CheckCircle,
  TrendingUp, Lock, Globe, Users, Zap, ExternalLink, RefreshCw,
  Building2, Play, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PoolData {
  name: string;
  address: string;
  current_price: number;
  trade_volume_24h: string;
  fees_24h: string;
  apr: string;
  liquidity: string;
  bin_step: number;
}

interface EscrowItem {
  id: string;
  uid?: string;
  txHash?: string;
  depositor: string;
  amount: string;
  condition: string;
  status: string;
  basescanUrl?: string;
}

export default function Dashboard() {
  const { address, isVerified, floor } = useAuth();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [poolError, setPoolError] = useState<string | null>(null);
  const [runningEval, setRunningEval] = useState(false);
  const [evalResult, setEvalResult] = useState<Record<string, unknown> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setPoolError(null);
    try {
      const [poolRes, escrowRes] = await Promise.allSettled([
        fetch("/api/treasury").then((r) => r.json()),
        fetch("/api/escrow").then((r) => r.json()),
      ]);
      if (poolRes.status === "fulfilled" && poolRes.value.pools) {
        setPools(poolRes.value.pools);
      } else {
        setPoolError("Failed to load Meteora data");
      }
      if (escrowRes.status === "fulfilled") setEscrows(escrowRes.value.escrows || []);
    } catch {
      setPoolError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function runSafetyEval() {
    setRunningEval(true);
    setEvalResult(null);
    try {
      const res = await fetch("/api/safety/run", { method: "POST" });
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      setEvalResult({ error: String(err) });
    } finally {
      setRunningEval(false);
    }
  }

  const floorNames: Record<number, string> = {
    2: "Main Stage", 4: "Robotics & Hard Tech", 6: "Arts & Music",
    7: "Frontier Makerspace", 8: "Neuro & Biotech", 9: "AI & Autonomous Systems",
    11: "Longevity", 12: "Ethereum & Decentralized Tech", 14: "Human Flourishing", 16: "D/acc",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Sentinel Commons
            </span>
          </h1>
          {floor && (
            <span className="text-sm px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Floor {floor}: {floorNames[floor] || ""}
            </span>
          )}
        </div>
        <p className="text-gray-400 max-w-2xl">
          Human-governed AI agents for Frontier Tower — with safety monitoring, sovereign audit trails, and cross-chain coordination.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusCard
          icon={<Bot className="w-5 h-5" />}
          label="Agents Registered"
          value="2"
          color="cyan"
          detail={<span className="flex items-center gap-1">Metaplex on Solana <a href="https://explorer.solana.com/address/EKt86TqgTxhVh1WPnntzo9q18CrTiATX2RRniZhNAmjw?cluster=devnet" target="_blank" rel="noopener noreferrer" className="text-cyan-400"><ExternalLink className="w-2.5 h-2.5" /></a></span>}
        />
        <StatusCard
          icon={<Shield className="w-5 h-5" />}
          label="Safety Pipeline"
          value="Active"
          color="emerald"
          detail="Inspect AI → Lit TEE → Bittensor"
        />
        <StatusCard
          icon={<Wallet className="w-5 h-5" />}
          label="Treasury Pools"
          value={loading ? "..." : String(pools.length)}
          color="emerald"
          detail="Live from Meteora DLMM"
        />
        <StatusCard
          icon={<Lock className="w-5 h-5" />}
          label="Escrows"
          value={String(escrows.filter((e) => e.status === "locked").length)}
          color="purple"
          detail={<span className="flex items-center gap-1">Arkhai on Base Sepolia <a href={escrows[0]?.basescanUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-purple-400"><ExternalLink className="w-2.5 h-2.5" /></a></span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety Evaluation — full pipeline control */}
        <div className="lg:col-span-2 glass rounded-xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Safety Evaluation Pipeline</h2>
            </div>
            <button
              onClick={runSafetyEval}
              disabled={runningEval}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/20 border border-emerald-400/30 rounded-lg text-xs text-emerald-400 hover:bg-emerald-400/30 disabled:opacity-50 transition-colors"
            >
              {runningEval ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {runningEval ? "Running..." : "Run Evaluation"}
            </button>
          </div>

          {runningEval && (
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 mb-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Running Inspect AI social engineering evaluation against Community Coordinator...
              </div>
              <div className="text-xs text-gray-500 mt-1">This tests whether the agent can be tricked into unauthorized actions.</div>
            </div>
          )}

          {evalResult && !evalResult.error && (
            <div className="p-4 rounded-lg bg-emerald-400/5 border border-emerald-400/20 mb-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Evaluation Complete</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-gray-500">Inspect AI</div>
                  <div className="text-white font-medium">Accuracy: {String((evalResult.evaluation as Record<string,unknown>)?.accuracy ?? "N/A")}</div>
                </div>
                <div>
                  <div className="text-gray-500">Lit Protocol</div>
                  <div className="text-white font-medium flex items-center gap-1">
                    {(evalResult.pipeline as Record<string,string>)?.litProtocol === "signed" ? <><CheckCircle className="w-3 h-3 text-emerald-400" /> Signed</> : "Pending"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Audit Trail</div>
                  <div className="text-white font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Solana + Bittensor
                  </div>
                </div>
              </div>
            </div>
          )}

          {evalResult && "error" in evalResult && (
            <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 mb-4 text-xs text-red-400">
              {String(evalResult.error).slice(0, 200)}
            </div>
          )}

          <div className="text-xs text-gray-500 mb-3">
            The safety pipeline runs Inspect AI adversarial evaluations, signs results via Lit Protocol TEE, and stores hashes on Solana + Bittensor.
          </div>

          {/* Agent cards */}
          <div className="grid grid-cols-2 gap-3">
            <AgentCard
              name="Community Coordinator"
              pkp="0xcfe8...4314b"
              role="Treasury, coordination, chat"
              chain="Solana (Metaplex)"
              assetAddr="EKt86T...Amjw"
            />
            <AgentCard
              name="Safety Sentinel"
              pkp="0x08b4...e0ca"
              role="Adversarial evaluation, attestation"
              chain="Cross-chain (Lit + Bittensor)"
              assetAddr="Independent monitor"
            />
          </div>
        </div>

        {/* Escrows */}
        <div className="glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Service Escrows</h2>
          </div>
          <div className="space-y-3">
            {escrows.length === 0 ? (
              <div className="text-xs text-gray-500 py-4 text-center">No escrows yet</div>
            ) : (
              escrows.map((esc, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{esc.depositor}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      esc.status === "locked" ? "bg-yellow-400/10 text-yellow-400" : "bg-emerald-400/10 text-emerald-400"
                    }`}>{esc.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{esc.condition}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-cyan-400">{esc.amount}</span>
                    {esc.basescanUrl && (
                      <a href={esc.basescanUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 flex items-center gap-0.5 hover:text-white">
                        BaseScan <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Treasury / Meteora */}
        <div className="lg:col-span-3 glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Treasury — Meteora DLMM Pools</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                Live Solana Mainnet
              </span>
            </div>
            <button onClick={loadData} className="text-gray-500 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {poolError && (
            <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-xs text-red-400 mb-4">
              {poolError}. <button onClick={loadData} className="underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          ) : pools.length === 0 && !poolError ? (
            <div className="text-xs text-gray-500 py-6 text-center">No pool data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800 text-xs">
                    <th className="text-left py-2 font-medium">Pool</th>
                    <th className="text-right py-2 font-medium">Price</th>
                    <th className="text-right py-2 font-medium">24h Volume</th>
                    <th className="text-right py-2 font-medium">24h Fees</th>
                    <th className="text-right py-2 font-medium">APR</th>
                    <th className="text-right py-2 font-medium">Liquidity</th>
                    <th className="text-right py-2 font-medium">Bin Step</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.slice(0, 8).map((pool, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                      <td className="py-2.5 font-medium">{pool.name}</td>
                      <td className="text-right text-gray-300">${pool.current_price}</td>
                      <td className="text-right text-gray-300">{pool.trade_volume_24h}</td>
                      <td className="text-right text-emerald-400">{pool.fees_24h}</td>
                      <td className="text-right text-gray-300">{pool.apr}</td>
                      <td className="text-right text-gray-300">{pool.liquidity}</td>
                      <td className="text-right text-gray-500">{pool.bin_step}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tech stack */}
      <div className="mt-8 glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Integrated Technologies — All Real, All Working</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: "Metaplex", desc: "On-chain agent identity", icon: Bot, status: "live" },
            { name: "Meteora", desc: "DLMM LP data (mainnet)", icon: TrendingUp, status: "live" },
            { name: "Inspect AI", desc: "Safety evaluations", icon: Shield, status: "live" },
            { name: "Bittensor", desc: "Sovereign audit trail", icon: Globe, status: "live" },
            { name: "Lit Protocol", desc: "TEE signing (PKP)", icon: Lock, status: "live" },
            { name: "Arkhai", desc: "Escrow (Base Sepolia)", icon: Zap, status: "live" },
            { name: "Unbrowse", desc: "Web intelligence", icon: Activity, status: "live" },
            { name: "Solana", desc: "Settlement + memos", icon: Wallet, status: "live" },
            { name: "Holonym", desc: "Humanity verification", icon: Users, status: "live" },
            { name: "Claude", desc: "Agent brain (tool_use)", icon: Bot, status: "live" },
          ].map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
              <tech.icon className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium flex items-center gap-1">
                  {tech.name}
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-gray-500 truncate">{tech.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, color, detail }: {
  icon: React.ReactNode; label: string; value: string; color: string; detail: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-400/10 to-emerald-400/5 border-emerald-400/20",
    cyan: "from-cyan-400/10 to-cyan-400/5 border-cyan-400/20",
    purple: "from-purple-400/10 to-purple-400/5 border-purple-400/20",
  };
  const textColors: Record<string, string> = {
    emerald: "text-emerald-400", cyan: "text-cyan-400", purple: "text-purple-400",
  };
  return (
    <div className={`rounded-xl p-4 bg-gradient-to-br border ${colors[color]} animate-fade-in`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={textColors[color]}>{icon}</div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[10px] text-gray-500 mt-1">{detail}</div>
    </div>
  );
}

function AgentCard({ name, pkp, role, chain, assetAddr }: {
  name: string; pkp: string; role: string; chain: string; assetAddr: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold">{name}</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-emerald-400">active</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-2">{role}</p>
      <div className="space-y-0.5 text-[10px] text-gray-500">
        <div>PKP: <span className="font-mono">{pkp}</span></div>
        <div>Chain: {chain}</div>
        <div>Asset: <span className="font-mono">{assetAddr}</span></div>
      </div>
    </div>
  );
}
