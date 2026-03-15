/**
 * Metaplex Agent Registry — Register the Sentinel Community Coordinator on Solana devnet.
 *
 * This script:
 * 1. Creates an MPL Core collection for Sentinel Commons agents
 * 2. Creates an agent asset (the Community Coordinator) with a PDA wallet
 * 3. Registers the agent's identity via registerIdentityV1
 * 4. Sets up executive delegation for autonomous operation
 *
 * Run: npx tsx scripts/register-agent.ts
 */

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { mplCore, create, createCollection } from "@metaplex-foundation/mpl-core";
import {
  mplAgentIdentity,
  mplAgentTools,
  registerIdentityV1,
  registerExecutiveV1,
  delegateExecutionV1,
  findAgentIdentityV1Pda,
  findExecutiveProfileV1Pda,
} from "@metaplex-foundation/mpl-agent-registry";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== Sentinel Commons — Metaplex Agent Registration ===\n");

  // 1. Load wallet
  const walletPath = path.join(process.cwd(), ".solana-wallet.json");
  if (!fs.existsSync(walletPath)) {
    throw new Error("Wallet not found at .solana-wallet.json. Run Phase 1 first.");
  }
  const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));

  // 2. Setup Umi
  const umi = createUmi("https://api.devnet.solana.com")
    .use(mplCore())
    .use(mplAgentIdentity())
    .use(mplAgentTools());

  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(walletData));
  umi.use(keypairIdentity(keypair));
  console.log("Wallet:", keypair.publicKey);

  // Check balance
  const balance = await umi.rpc.getBalance(keypair.publicKey);
  console.log("Balance:", Number(balance.basisPoints) / 1e9, "SOL\n");

  if (Number(balance.basisPoints) < 0.1e9) {
    throw new Error("Insufficient SOL balance. Need at least 0.1 SOL.");
  }

  // 3. Create collection
  console.log("Creating collection...");
  const collection = generateSigner(umi);
  await createCollection(umi, {
    collection,
    name: "Sentinel Commons Agents",
    uri: "https://raw.githubusercontent.com/elijah-ship-it/sentinel-commons/main/metadata/collection.json",
  }).sendAndConfirm(umi);
  console.log("✓ Collection:", collection.publicKey, "\n");

  // 4. Create agent asset
  console.log("Creating agent asset...");
  const asset = generateSigner(umi);
  await create(umi, {
    asset,
    name: "Sentinel Community Coordinator",
    uri: "https://raw.githubusercontent.com/elijah-ship-it/sentinel-commons/main/metadata/agent.json",
    collection,
  }).sendAndConfirm(umi);
  console.log("✓ Agent Asset:", asset.publicKey, "\n");

  // 5. Register identity
  console.log("Registering identity...");
  await registerIdentityV1(umi, {
    asset: asset.publicKey,
    collection: collection.publicKey,
    agentRegistrationUri:
      "https://raw.githubusercontent.com/elijah-ship-it/sentinel-commons/main/metadata/agent-registration.json",
  }).sendAndConfirm(umi);

  const identityPda = findAgentIdentityV1Pda(umi, { asset: asset.publicKey });
  console.log("✓ Identity PDA:", identityPda, "\n");

  // 6. Register executive profile
  console.log("Registering executive profile...");
  await registerExecutiveV1(umi, {
    payer: umi.payer,
  }).sendAndConfirm(umi);

  const executiveProfile = findExecutiveProfileV1Pda(umi, {
    authority: umi.identity.publicKey,
  });
  console.log("✓ Executive Profile:", executiveProfile, "\n");

  // 7. Delegate execution
  console.log("Delegating execution...");
  await delegateExecutionV1(umi, {
    agentAsset: asset.publicKey,
    agentIdentity: identityPda,
    executiveProfile,
  }).sendAndConfirm(umi);
  console.log("✓ Execution delegated\n");

  // 8. Output results
  const results = {
    collection: String(collection.publicKey),
    asset: String(asset.publicKey),
    identityPda: String(identityPda),
    executiveProfile: String(executiveProfile),
    wallet: String(keypair.publicKey),
  };

  console.log("=== REGISTRATION COMPLETE ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\nAdd to .env.local:");
  console.log(`METAPLEX_COLLECTION_ADDRESS=${results.collection}`);
  console.log(`METAPLEX_ASSET_ADDRESS=${results.asset}`);

  // Save results to file
  fs.writeFileSync(
    path.join(process.cwd(), ".metaplex-registration.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("\nSaved to .metaplex-registration.json");
}

main().catch((err) => {
  console.error("Registration failed:", err);
  process.exit(1);
});
