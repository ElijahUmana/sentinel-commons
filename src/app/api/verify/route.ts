import { NextResponse } from "next/server";

const HOLONYM_V3_SBT = "0x2aa822e264f8cc31a2b9c22f39e5551241e94dfb";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const OPTIMISM_RPC = "https://mainnet.optimism.io";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  const addr = address.toLowerCase().replace("0x", "");

  // Method 1: Try Holonym API
  for (const credType of ["biometrics", "gov-id", "phone"]) {
    try {
      const res = await fetch(
        `https://api.holonym.io/sybil-resistance/${credType}/optimism?user=0x${addr}&action-id=123456789`
      );
      const data = await res.json();
      if (data.result === true) {
        return NextResponse.json({ verified: true, method: `holonym-${credType}`, network: "optimism" });
      }
    } catch {}
  }

  // Method 2: Scan recent blocks for Holonym V3 SBT Transfer to this address
  // Optimism public RPC limits block range to ~2000 blocks
  // We scan in chunks from a recent start block
  try {
    const paddedAddr = "0x000000000000000000000000" + addr;

    // Get current block
    const blockRes = await fetch(OPTIMISM_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
    });
    const blockData = await blockRes.json();
    const currentBlock = parseInt(blockData.result, 16);

    // Scan the last ~20000 blocks in chunks of 2000 (covers ~last few days on Optimism)
    const CHUNK_SIZE = 2000;
    const TOTAL_RANGE = 20000;
    const startBlock = currentBlock - TOTAL_RANGE;

    for (let from = startBlock; from < currentBlock; from += CHUNK_SIZE) {
      const to = Math.min(from + CHUNK_SIZE - 1, currentBlock);
      const res = await fetch(OPTIMISM_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getLogs",
          params: [
            {
              address: HOLONYM_V3_SBT,
              topics: [TRANSFER_TOPIC, null, paddedAddr],
              fromBlock: "0x" + from.toString(16),
              toBlock: "0x" + to.toString(16),
            },
          ],
          id: 1,
        }),
      });
      const data = await res.json();
      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        const log = data.result[0];
        return NextResponse.json({
          verified: true,
          method: "holonym-sbt-onchain",
          network: "optimism",
          txHash: log.transactionHash,
          blockNumber: parseInt(log.blockNumber, 16),
          tokenId: log.topics[3] ? parseInt(log.topics[3], 16) : null,
        });
      }
    }
  } catch (err) {
    console.error("Optimism RPC scan failed:", err);
  }

  return NextResponse.json({ verified: false });
}
