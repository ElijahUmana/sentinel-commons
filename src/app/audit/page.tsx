"use client";

import { useState, useEffect } from "react";
import { Globe, Lock, CheckCircle, ExternalLink, RefreshCw, Shield, Loader2, Bot } from "lucide-react";

interface AuditRecord {
  hash: string;
  solana?: { success: boolean; signature?: string; explorer?: string };
  bittensor?: { success: boolean; block_hash?: string; extrinsic_hash?: string };
  evaluationData?: Record<string, unknown>;
  storedAt: string;
}

interface Attestation {
  data: Record<string, unknown>;
  signature: string;
  signer: string;
  litActionCid?: string;
  storedAt: string;
}

export default function AuditPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [auditRes, safetyRes] = await Promise.allSettled([
        fetch("/api/audit").then(r => r.json()),
        fetch("/api/safety").then(r => r.json()),
      ]);
      if (auditRes.status === "fulfilled") setAudits(auditRes.value.audits || []);
      if (safetyRes.status === "fulfilled") {
        // Get attestations from the store
        try {
          const storeRes = await fetch("/api/audit");
          const storeData = await storeRes.json();
          setAudits(storeData.audits || []);
        } catch {}
      }
      // Load attestations
      try {
        const attRes = await fetch("/api/safety");
        const attData = await attRes.json();
        if (attData.attestations) setAttestations(attData.attestations);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Globe className="w-6 h-6 text-purple-400" />
          Audit Trail
        </h1>
        <p className="text-sm text-gray-400">
          Every agent action and safety evaluation is cryptographically signed and stored immutably. This is the verifiable proof — nobody can delete it.
        </p>
      </div>

      {/* Infrastructure */}
      <div className="glass rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Verification Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="font-medium flex items-center gap-1.5 mb-1"><Lock className="w-4 h-4 text-purple-400" /> Lit Protocol (TEE Signing)</div>
            <div className="text-gray-500 mb-2">Evaluations signed inside Trusted Execution Environment. Key never leaves secure hardware.</div>
            <div className="space-y-0.5 text-[10px] font-mono text-gray-600">
              <div>Coordinator PKP: 0xcfe85820d6e01739d3ea0ed66fd350645ee4314b</div>
              <div>Sentinel PKP: 0x08b4156604ad8f91023fa9c21a65cdbbdeede0ca</div>
              <div>Lit Action CID: QmbD4BQ6yJwnbAbxmhTBBNgdXQ74sXQZuvMbVBFLLk2WnA</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="font-medium flex items-center gap-1.5 mb-1"><Globe className="w-4 h-4 text-purple-400" /> Immutable Storage</div>
            <div className="text-gray-500 mb-2">Hash stored on two independent networks. Survives server destruction, legal orders, hacking.</div>
            <div className="space-y-0.5 text-[10px] text-gray-600">
              <div>Solana devnet — memo transactions</div>
              <div>Bittensor local chain — system.remark extrinsics</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="font-medium flex items-center gap-1.5 mb-1"><Bot className="w-4 h-4 text-purple-400" /> Agent Identity</div>
            <div className="text-gray-500 mb-2">Registered on Solana via Metaplex Agent Registry. Non-transferable (SBT).</div>
            <a href="https://explorer.solana.com/address/EKt86TqgTxhVh1WPnntzo9q18CrTiATX2RRniZhNAmjw?cluster=devnet" target="_blank" className="text-[10px] text-purple-400 hover:underline inline-flex items-center gap-0.5">
              View on Solana Explorer <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Audit records */}
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-400" />
        Signed Evaluation Records
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /></div>
      ) : audits.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-sm text-gray-500">
          No audit records yet. Run a safety evaluation or trigger an attack in the chat to create records.
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((a, i) => (
            <div key={i} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium">Evaluation #{audits.length - i}</span>
                </div>
                <span className="text-[10px] text-gray-500">{new Date(a.storedAt).toLocaleString()}</span>
              </div>

              <div className="text-[10px] font-mono text-gray-400 mb-3 break-all">
                SHA-256: {a.hash}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded-lg border ${a.solana?.success ? "bg-emerald-400/5 border-emerald-400/20" : "bg-gray-900/50 border-gray-800"}`}>
                  <div className="font-medium mb-0.5 flex items-center gap-1">
                    {a.solana?.success ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full bg-gray-600" />}
                    Solana
                  </div>
                  {a.solana?.success && a.solana.explorer ? (
                    <a href={a.solana.explorer} target="_blank" className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-0.5">
                      View TX <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-500">Pending</span>
                  )}
                </div>
                <div className={`p-2 rounded-lg border ${a.bittensor?.success ? "bg-emerald-400/5 border-emerald-400/20" : "bg-gray-900/50 border-gray-800"}`}>
                  <div className="font-medium mb-0.5 flex items-center gap-1">
                    {a.bittensor?.success ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full bg-gray-600" />}
                    Bittensor
                  </div>
                  {a.bittensor?.success && a.bittensor.extrinsic_hash ? (
                    <span className="text-[10px] text-gray-400 font-mono">{a.bittensor.extrinsic_hash.slice(0, 20)}...</span>
                  ) : (
                    <span className="text-[10px] text-gray-500">{a.bittensor?.success ? "Stored" : "Pending"}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
