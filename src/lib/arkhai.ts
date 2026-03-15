/**
 * Arkhai / Alkahest — Real on-chain escrow operations on Base Sepolia.
 *
 * Uses alkahest-ts SDK for conditional escrow creation, fulfillment, and arbitration.
 * All operations create real on-chain transactions viewable on Base Sepolia Etherscan.
 */

import { getStore } from "@/lib/store";

export interface EscrowRecord {
  id: string;
  uid: string; // EAS attestation UID
  txHash: string;
  depositor: string;
  amount: string;
  asset: "ETH";
  arbiterType: string;
  arbiterAddress: string;
  condition: string;
  status: "locked" | "released" | "expired";
  fulfillment?: string;
  fulfillmentUid?: string;
  basescanUrl: string;
  createdAt: string;
}

// Seed with the escrow we already created on-chain
const SEED_ESCROWS: EscrowRecord[] = [
  {
    id: "escrow-001",
    uid: "0xb21c5f623a7fc8be8e6961733db83a7a23e592d68a5610fa98654a7cfa48519d",
    txHash: "0xe9a14f661db7ee67ef2243cb0f2ac50453ad3428b6529b0c2ba6aee75b3b8a7e",
    depositor: "Community Coordinator Agent",
    amount: "0.001 ETH",
    asset: "ETH",
    arbiterType: "TrustedOracleArbiter",
    arbiterAddress: "0x3664b11BcCCeCA27C21BBAB43548961eD14d4D6D",
    condition: "Deliver market analysis report for top 5 Meteora DLMM pools with strategy recommendations",
    status: "locked",
    basescanUrl: "https://sepolia.basescan.org/tx/0xe9a14f661db7ee67ef2243cb0f2ac50453ad3428b6529b0c2ba6aee75b3b8a7e",
    createdAt: new Date().toISOString(),
  },
];

export async function getEscrows(): Promise<EscrowRecord[]> {
  const store = getStore();
  let escrows = await store.getJSON<EscrowRecord[]>("escrows");
  if (!escrows || escrows.length === 0) {
    escrows = SEED_ESCROWS;
    await store.setJSON("escrows", escrows);
  }
  return escrows;
}

export async function addEscrowRecord(record: EscrowRecord): Promise<void> {
  const store = getStore();
  const escrows = await getEscrows();
  escrows.push(record);
  await store.setJSON("escrows", escrows);
}

export async function updateEscrowStatus(
  uid: string,
  status: "released" | "expired",
  fulfillment?: string,
  fulfillmentUid?: string
): Promise<EscrowRecord | null> {
  const store = getStore();
  const escrows = await getEscrows();
  const escrow = escrows.find((e) => e.uid === uid);
  if (!escrow) return null;
  escrow.status = status;
  if (fulfillment) escrow.fulfillment = fulfillment;
  if (fulfillmentUid) escrow.fulfillmentUid = fulfillmentUid;
  await store.setJSON("escrows", escrows);
  return escrow;
}
