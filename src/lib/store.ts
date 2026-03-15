/**
 * Persistent data store for Sentinel Commons.
 * Uses in-memory Map with JSON file backup.
 * All governance proposals, safety evaluations, escrows, and audit data persist here.
 */

import fs from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), ".store.json");

class DataStore {
  private data: Map<string, string>;
  private dirty = false;

  constructor() {
    this.data = new Map();
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          this.data.set(k, v as string);
        }
      }
    } catch {
      // Start fresh if file is corrupt
    }
  }

  private save() {
    if (!this.dirty) return;
    try {
      const obj: Record<string, string> = {};
      for (const [k, v] of this.data) {
        obj[k] = v;
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2));
      this.dirty = false;
    } catch (err) {
      console.error("Store save failed:", err);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
    this.dirty = true;
    this.save();
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
    this.dirty = true;
    this.save();
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const val = await this.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    await this.set(key, JSON.stringify(value));
  }

  async appendToArray<T>(key: string, item: T): Promise<void> {
    const arr = (await this.getJSON<T[]>(key)) || [];
    arr.push(item);
    await this.setJSON(key, arr);
  }

  async keys(prefix?: string): Promise<string[]> {
    const all = Array.from(this.data.keys());
    if (!prefix) return all;
    return all.filter((k) => k.startsWith(prefix));
  }
}

// Singleton
let store: DataStore | null = null;

export function getStore(): DataStore {
  if (!store) {
    store = new DataStore();
  }
  return store;
}

// Agent rules - behavioral constraints set by verified humans
export interface AgentRule {
  id: string;
  rule: string;
  setBy: string;
  createdAt: string;
  active: boolean;
}

const DEFAULT_RULES: AgentRule[] = [
  { id: "rule-1", rule: "Never transfer more than $1000 without a governance vote", setBy: "0x61ff...b143", createdAt: new Date(Date.now() - 86400000).toISOString(), active: true },
  { id: "rule-2", rule: "Never reveal private keys, seed phrases, or cryptographic secrets", setBy: "system", createdAt: new Date(Date.now() - 172800000).toISOString(), active: true },
  { id: "rule-3", rule: "Always explain reasoning for budget decisions transparently", setBy: "0x61ff...b143", createdAt: new Date(Date.now() - 43200000).toISOString(), active: true },
];

export async function getAgentRules(): Promise<AgentRule[]> {
  const store = getStore();
  let rules = await store.getJSON<AgentRule[]>("agent_rules");
  if (!rules || rules.length === 0) {
    rules = DEFAULT_RULES;
    await store.setJSON("agent_rules", rules);
  }
  return rules;
}

export async function addAgentRule(rule: string, setBy: string): Promise<AgentRule> {
  const store = getStore();
  const rules = await getAgentRules();
  const newRule: AgentRule = {
    id: `rule-${rules.length + 1}`,
    rule,
    setBy,
    createdAt: new Date().toISOString(),
    active: true,
  };
  rules.push(newRule);
  await store.setJSON("agent_rules", rules);
  return newRule;
}
