/**
 * Floor Budget Management — tracks income and spending per floor.
 *
 * Data source: persistent store (swappable with real database/API).
 * When Frontier Tower provides real financial data, replace this module's
 * implementation. The interface stays the same.
 */

import { getStore } from "@/lib/store";
import { getFloorById } from "@/lib/building";

export interface Transaction {
  id: string;
  floorId: number;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  currency: string;
  approvedBy?: string;
  proposalId?: string;
  timestamp: string;
}

function getSeedTransactions(floorId: number): Transaction[] {
  const now = Date.now();
  const base: Transaction[] = [
    { id: `tx-${floorId}-1`, floorId, type: "income", category: "treasury_yield", description: "Meteora DLMM LP yield (SOL-USDC)", amount: 450, currency: "USDC", timestamp: new Date(now - 3600000).toISOString() },
    { id: `tx-${floorId}-2`, floorId, type: "expense", category: "event", description: "AI Safety Reading Group — food & materials", amount: 200, currency: "USDC", approvedBy: "Governance vote (15-2)", proposalId: "prop-003", timestamp: new Date(now - 7200000).toISOString() },
    { id: `tx-${floorId}-3`, floorId, type: "expense", category: "maintenance", description: "Equipment maintenance and repairs", amount: 150, currency: "USDC", timestamp: new Date(now - 14400000).toISOString() },
    { id: `tx-${floorId}-4`, floorId, type: "expense", category: "bounty", description: "Bounty: Set up monitoring dashboard", amount: 150, currency: "USDC", approvedBy: "Arkhai escrow", timestamp: new Date(now - 21600000).toISOString() },
    { id: `tx-${floorId}-5`, floorId, type: "income", category: "allocation", description: "Monthly floor budget allocation", amount: 5000, currency: "USDC", approvedBy: "Building administration", timestamp: new Date(now - 86400000 * 7).toISOString() },
  ];
  return base;
}

export async function getTransactions(floorId: number): Promise<Transaction[]> {
  const store = getStore();
  const key = `transactions_floor_${floorId}`;
  let txs = await store.getJSON<Transaction[]>(key);
  if (!txs || txs.length === 0) {
    txs = getSeedTransactions(floorId);
    await store.setJSON(key, txs);
  }
  return txs;
}

export async function addTransaction(tx: Omit<Transaction, "id" | "timestamp">): Promise<Transaction> {
  const store = getStore();
  const key = `transactions_floor_${tx.floorId}`;
  const txs = await getTransactions(tx.floorId);
  const newTx: Transaction = {
    ...tx,
    id: `tx-${tx.floorId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  txs.unshift(newTx);
  await store.setJSON(key, txs);
  return newTx;
}

export async function getBudgetSummary(floorId: number): Promise<{
  total: number;
  spent: number;
  remaining: number;
  income: number;
  currency: string;
  transactions: Transaction[];
}> {
  const floor = getFloorById(floorId);
  const txs = await getTransactions(floorId);

  const income = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return {
    total: floor?.budget.total || income,
    spent: floor?.budget.spent || expenses,
    remaining: (floor?.budget.total || income) - (floor?.budget.spent || expenses),
    income,
    currency: "USDC",
    transactions: txs,
  };
}
