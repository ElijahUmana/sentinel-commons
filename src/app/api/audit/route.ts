import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { getStore } from "@/lib/store";

const execAsync = promisify(exec);

export async function GET() {
  const store = getStore();
  const audits = (await store.getJSON<Record<string, unknown>[]>("audit_trail")) || [];
  return NextResponse.json({
    audits,
    network: "bittensor-testnet",
    wallet: "5CDCagj5oRZVvXWTxAQeGJ9z3jSCQAVvvnTzUpeVQwcyYKQY",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { evaluationData } = body;

    if (!evaluationData) {
      return NextResponse.json({ error: "evaluationData required" }, { status: 400 });
    }

    // Use python3.12 from brew or venv python
    const venvPython = process.env.PYTHON_PATH || "/opt/homebrew/bin/python3.12";
    const scriptPath = path.join(process.cwd(), "safety", "bittensor_audit.py");
    const dataArg = JSON.stringify(evaluationData).replace(/'/g, "'\\''");

    const { stdout, stderr } = await execAsync(
      `${venvPython} ${scriptPath} '${dataArg}'`,
      { timeout: 60000 }
    );

    if (stderr) console.error("Bittensor stderr:", stderr);

    const result = JSON.parse(stdout.trim());

    // Store the audit record
    const store = getStore();
    await store.appendToArray("audit_trail", {
      ...result,
      evaluationData,
      storedAt: new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Audit error:", error);
    const msg = error instanceof Error ? error.message : "Audit failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
