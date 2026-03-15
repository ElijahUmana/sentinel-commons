import { NextResponse } from "next/server";
import { getEscrows, addEscrowRecord, updateEscrowStatus, type EscrowRecord } from "@/lib/arkhai";

export async function GET() {
  const escrows = await getEscrows();
  return NextResponse.json({
    escrows,
    chain: "Base Sepolia",
    source: "Arkhai/Alkahest (on-chain)",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      // Dynamic import for ESM-only alkahest-ts
      const { makeClient, encodeTrustedOracleDemand } = await import("alkahest-ts");
      const { createWalletClient, http, parseEther } = await import("viem");
      const { baseSepolia } = await import("viem/chains");
      const { privateKeyToAccount } = await import("viem/accounts");

      const privateKey = process.env.BASE_SEPOLIA_PRIVATE_KEY;
      if (!privateKey) {
        return NextResponse.json({ error: "BASE_SEPOLIA_PRIVATE_KEY not configured" }, { status: 500 });
      }

      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http(process.env.ALKAHEST_RPC_URL || "https://sepolia.base.org"),
      });

      const client = makeClient(walletClient);

      // Encode demand: TrustedOracle with our account as oracle
      const demand = encodeTrustedOracleDemand({
        oracle: account.address,
        data: "0x",
      });

      const amountEth = body.amount ? String(parseFloat(body.amount) / 1000) : "0.001";
      const expiration = BigInt(Math.floor(Date.now() / 1000) + 86400);

      const result = await client.nativeToken.escrow.nonTierable.create(
        parseEther(amountEth),
        { arbiter: client.contractAddresses.trustedOracleArbiter, demand },
        expiration
      );

      const record: EscrowRecord = {
        id: `escrow-${Date.now()}`,
        uid: result.attested?.uid || "",
        txHash: result.hash,
        depositor: body.depositor || "Community Coordinator Agent",
        amount: `${amountEth} ETH`,
        asset: "ETH",
        arbiterType: "TrustedOracleArbiter",
        arbiterAddress: client.contractAddresses.trustedOracleArbiter,
        condition: body.condition || "Deliver service as specified",
        status: "locked",
        basescanUrl: `https://sepolia.basescan.org/tx/${result.hash}`,
        createdAt: new Date().toISOString(),
      };

      await addEscrowRecord(record);

      return NextResponse.json({
        escrow: record,
        message: "Escrow created on Base Sepolia via Alkahest",
      });
    }

    if (action === "fulfill") {
      const escrow = await updateEscrowStatus(
        body.escrowUid,
        "released",
        body.fulfillment
      );
      if (!escrow) {
        return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
      }
      return NextResponse.json({ escrow });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Escrow error:", error);
    const msg = error instanceof Error ? error.message : "Escrow operation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
