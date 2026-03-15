import { NextResponse } from "next/server";

const UNBROWSE_URL = process.env.UNBROWSE_URL || "http://localhost:6969";

export async function GET() {
  const intents = [
    { intent: "get current SOL price and 24h change", url: "https://www.coingecko.com" },
    { intent: "get top DeFi yields on Solana", url: "https://defillama.com" },
  ];

  const results = [];
  for (const { intent, url } of intents) {
    try {
      const res = await fetch(`${UNBROWSE_URL}/v1/intent/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, params: { url }, context: { url } }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      results.push({ source: url, intent, data, timestamp: new Date().toISOString() });
    } catch {
      results.push({
        source: url,
        intent,
        data: null,
        error: "Unbrowse unavailable — run 'npx unbrowse setup' locally",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    intelligence: results,
    unbrowseStatus: results.some((r) => !r.error) ? "connected" : "offline",
    source: "Unbrowse (direct API access to websites)",
  });
}
