import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import crypto from "crypto";
import { Connection, Keypair, Transaction, TransactionInstruction, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import fs from "fs";
import { getStore } from "@/lib/store";

const execAsync = promisify(exec);
const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

function computeHash(data: Record<string, unknown>): string {
  const str = JSON.stringify(data, Object.keys(data).sort(), 0)
    .replace(/\s/g, "");
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function storeOnSolana(hash: string): Promise<{
  success: boolean;
  signature?: string;
  explorer?: string;
  error?: string;
}> {
  try {
    const walletPath = path.join(process.cwd(), ".solana-wallet.json");
    if (!fs.existsSync(walletPath)) return { success: false, error: "Solana wallet not found" };

    const conn = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    const wallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf8"))));

    const memoData = `SENTINEL_AUDIT|${hash}|${new Date().toISOString()}`;
    const tx = new Transaction().add(
      new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM,
        data: Buffer.from(memoData),
      })
    );

    const sig = await sendAndConfirmTransaction(conn, tx, [wallet]);
    return {
      success: true,
      signature: sig,
      explorer: `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function storeOnBittensor(evaluationData: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const venvPython = path.join(process.cwd(), ".venv", "bin", "python3.12");
    const scriptPath = path.join(process.cwd(), "safety", "bittensor_audit.py");
    const dataArg = JSON.stringify(evaluationData).replace(/'/g, "'\\''");

    const btNetwork = process.env.BITTENSOR_NETWORK || "ws://127.0.0.1:9944";
    const { stdout } = await execAsync(
      `BITTENSOR_NETWORK="${btNetwork}" ${venvPython} ${scriptPath} '${dataArg}'`,
      { timeout: 60000 }
    );
    return JSON.parse(stdout.trim());
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function GET() {
  const store = getStore();
  const audits = (await store.getJSON<Record<string, unknown>[]>("audit_trail")) || [];
  return NextResponse.json({
    audits,
    networks: {
      solana: { network: "devnet", wallet: "672FfwmZciUHgJ1mNPMKALoPyGQ2wpuRBBqNDCccXDpT" },
      bittensor: { network: "testnet", wallet: "5CDCagj5oRZVvXWTxAQeGJ9z3jSCQAVvvnTzUpeVQwcyYKQY" },
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { evaluationData } = body;

    if (!evaluationData) {
      return NextResponse.json({ error: "evaluationData required" }, { status: 400 });
    }

    const hash = computeHash(evaluationData);

    // Store on BOTH sovereign networks in parallel
    const [solanaResult, bittensorResult] = await Promise.all([
      storeOnSolana(hash),
      storeOnBittensor(evaluationData),
    ]);

    const auditRecord = {
      hash,
      solana: solanaResult,
      bittensor: bittensorResult,
      evaluationData,
      storedAt: new Date().toISOString(),
    };

    // Persist
    const store = getStore();
    await store.appendToArray("audit_trail", auditRecord);

    return NextResponse.json(auditRecord);
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 500 }
    );
  }
}
