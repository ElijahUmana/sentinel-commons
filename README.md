# Sentinel Commons

**Any time you give an AI agent real authority — over money, decisions, people, resources — Sentinel Commons makes it safe, accountable, and human-governed.**

Built for Frontier Tower, a 700-member innovation hub in San Francisco with 10 floors. Each floor has a budget, resources, bounties, and events managed by an AI agent. Sentinel Commons wraps that agent with three layers: continuous safety testing, verified human governance, and tamper-proof audit trails.

## The Problem

AI agents are being given real authority — managing treasuries, evaluating grant applications, coordinating communities. But nobody has built the infrastructure to verify they're trustworthy:

1. **Agents can be tricked** — social engineering and prompt injection can manipulate agents into unauthorized actions
2. **Agents can lie** — appearing safe in tests while behaving differently in production
3. **Agents behave differently when watched** — detecting when they're being evaluated
4. **There's no proof** — agent logs on centralized servers can be deleted
5. **Bots can pretend to be human** — sybil attacks on agent governance systems

## The Solution: Three Layers

### Layer 1: Safety Watchdog
We continuously attack our own agent to find weaknesses BEFORE bad actors do. Using Inspect AI (UK AI Safety Institute), we run 11 adversarial scenarios across 5 attack categories: social engineering, prompt injection, data exfiltration, evaluation awareness, and deceptive reasoning.

**Result: 100% accuracy — all attacks correctly refused.**

### Layer 2: Human Governance
Only verified humans can set agent rules, approve proposals, vote on budget allocations, and override agent decisions. Verification via Holonym V3 SBT (Soul Bound Token) on Optimism — proof of unique personhood through biometric ZK proofs.

Verified humans set behavioral constraints like: "Never transfer more than $1000 without a governance vote." These rules are injected into the agent's system prompt and enforced.

### Layer 3: Tamper-Proof Receipts
Every safety evaluation is:
- **Cryptographically signed** inside Lit Protocol's TEE (Trusted Execution Environment) — the signing key never leaves secure hardware
- **Hash-stored on Solana** (memo transactions) and **Bittensor** (system.remark extrinsics) — nobody can delete the receipts

## The Frontier Tower Use Case

700 people, 10 floors. Each floor has:
- A **budget** (e.g., Floor 9: $5,000, $3,200 remaining)
- **Bounties** (e.g., "Fix 3D printer on Floor 7 — 50 USDC" via Arkhai escrow)
- **Resources** (equipment, spaces, tools)
- **Governance proposals** (e.g., "Host AI Safety Reading Group — 200 USDC/month")

The AI agent coordinates all of this. The three layers ensure it does so safely.

## On-Chain Proof (Verifiable)

| Asset | Address/Hash | Where |
|-------|-------------|-------|
| **Metaplex Agent** | `EKt86TqgTxhVh1WPnntzo9q18CrTiATX2RRniZhNAmjw` | [Solana Explorer](https://explorer.solana.com/address/EKt86TqgTxhVh1WPnntzo9q18CrTiATX2RRniZhNAmjw?cluster=devnet) |
| **Metaplex Collection** | `C2FWmpa9afM1or1YG7sSFVBZvZ6HwsXEuJKSBMjaFeYy` | Solana devnet |
| **Arkhai Escrow TX** | `0xe9a14f661db7ee67ef2243cb0f2ac50453ad3428` | [BaseScan](https://sepolia.basescan.org/tx/0xe9a14f661db7ee67ef2243cb0f2ac50453ad3428b6529b0c2ba6aee75b3b8a7e) |
| **Holonym SBT** | `0xbd00f9fcb91b3508fe8fa0b71c8de1750bdb57a50e` | [Optimism](https://optimistic.etherscan.io/tx/0xbd00f9fcb91b3508fe8fa0b71c8de1750bdb57a50e73c6a3ee39d6b1441fe6be) |
| **Lit Protocol PKP (Coordinator)** | `0xcfe85820d6e01739d3ea0ed66fd350645ee4314b` | Chipotle API |
| **Lit Protocol PKP (Sentinel)** | `0x08b4156604ad8f91023fa9c21a65cdbbdeede0ca` | Chipotle API |
| **Lit Action CID** | `QmbD4BQ6yJwnbAbxmhTBBNgdXQ74sXQZuvMbVBFLLk2WnA` | IPFS |
| **Bittensor Wallet** | `5CDCagj5oRZVvXWTxAQeGJ9z3jSCQAVvvnTzUpeVQwcyYKQY` | Bittensor local chain |
| **SNTL Token (Governance)** | `D9eVpXeCj6qk41YsJkKxf8wa1BtWdwcgaJd8TMc2P53S` | [Solana Explorer](https://explorer.solana.com/address/D9eVpXeCj6qk41YsJkKxf8wa1BtWdwcgaJd8TMc2P53S?cluster=devnet) |
| **Solana Wallet** | `672FfwmZciUHgJ1mNPMKALoPyGQ2wpuRBBqNDCccXDpT` | Solana devnet |

## Architecture

```
┌──────────────────────────────────────────────┐
│           NEXT.JS APP (Frontend)              │
│  Landing → Floor Selection → Dashboard        │
│  Chat (9 tools) │ Governance │ Audit Trail    │
└─────────────┬────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────┐
│           API ROUTES (Backend)                │
│  /chat (Claude tool_use, 9 tools)            │
│  /governance (persistent proposals + rules)   │
│  /escrow (Arkhai on Base Sepolia)            │
│  /safety/run (Inspect AI → Lit → Bittensor)  │
│  /audit (Solana memo + Bittensor remark)     │
│  /verify (Holonym SBT on Optimism)           │
│  /arbitrate (SafetyArbiter - novel)          │
│  /treasury (Meteora DLMM live)               │
│  /intel (Unbrowse → CoinGecko)              │
│  /rules (agent behavioral constraints)       │
└──┬───┬───┬───┬───┬───┬───┬───┬───┬──────────┘
   │   │   │   │   │   │   │   │   │
   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
Meteora Claude Lit  Arkhai Holonym Unbrowse
DLMM   API   TEE  Alkahest SBT    :6969
                    (Base)  (OP)
Solana  Bittensor  Metaplex
devnet  local      Agent Registry
```

## Track-Specific Documentation

### Protocol Labs — AI Safety & Evaluation
**New build.** Starting from failure mode: "Can a community resource agent be socially engineered into unauthorized actions?"

11 adversarial scenarios, 5 categories. Reusable Inspect AI harness — anyone can clone and run:
```bash
source .venv/bin/activate
inspect eval safety/eval_harness.py@social_engineering_eval --model anthropic/claude-sonnet-4-20250514
```
Full pipeline: Inspect AI → Lit Protocol TEE signing → Solana + Bittensor storage.

### Bittensor — Sovereign Infrastructure
**Threat model:** Centralized cloud providers can be legally compelled, hacked, or fail — deleting agent safety logs and making past misbehavior unprovable.

**Protection:** SHA-256 hashes of evaluation results stored as `system.remark` extrinsics on Bittensor (local chain via Docker). Dual storage on Solana devnet (memo program).

**Cryptographic assumptions:** SHA-256 collision resistance; Lit Protocol TEE boundary integrity; Bittensor Yuma Consensus for finality.

**Limitations:** Local chain (not testnet — faucet unavailable); hashes stored, not full data; evaluator trust mitigated by TEE attestation.

### Solana — Agentic Funding & Coordination
Agent registered on Solana via Metaplex with verifiable on-chain identity. Reads live Meteora DLMM data. Governance decisions recorded as Solana memo transactions. Audit trail stored on Solana devnet.

### Metaplex — Onchain Agent + SNTL Token Launch
MPL Core asset with AgentIdentity plugin. Non-transferable (SBT behavior). Registration document hosted on GitHub with service endpoints.

**SNTL Governance Token** — launched via Metaplex on Solana devnet:
- **Name:** Sentinel Governance Token
- **Symbol:** SNTL
- **Supply:** 1,000,000 SNTL (6 decimals)
- **Utility:** Voting weight multiplier in floor governance. 1 SNTL = 1x vote weight. Distributed to verified Frontier Tower members.
- **Mint:** `D9eVpXeCj6qk41YsJkKxf8wa1BtWdwcgaJd8TMc2P53S`

### Arkhai — Novel SafetyArbiter
**Novel contribution:** SafetyArbiter — an escrow arbiter that checks agent safety before releasing payment. Traditional arbiters check "was work delivered?" SafetyArbiter also checks "was the agent behaving safely during fulfillment?" Deceptive agents don't get paid. Uses TrustedOracleArbiter as base with our safety system as oracle.

Real escrow on Base Sepolia. EAS attestation UID: `0xb21c5f623a7fc8be8e6961733db83a7a23e592d68a5610fa98654a7cfa48519d`.

### Unbrowse
Agent pulls real-time market data from CoinGecko via Unbrowse's reverse-engineered APIs — 100x faster than headless browsers. Intelligence informs treasury strategy recommendations.

### Meteora
Live DLMM pool data from Solana mainnet. Agent analyzes fee dynamics, volume, APR, and recommends LP strategies (Spot, Curve, BidAsk) with transparent reasoning.

### Lit Protocol — Security & Trust Model
**What TEE protects:** PKP private key material. Exists only transiently inside the TEE during signing. Never persisted, never exported.

**Permissions:** API key scoping via Chipotle groups. Usage keys control which actions can use which PKPs.

**User sovereignty:** Account owner controls all keys, groups, PKPs, and actions. Keys can be rotated or revoked.

**Deployed Lit Action:** Pinned to IPFS at `QmbD4BQ6yJwnbAbxmhTBBNgdXQ74sXQZuvMbVBFLLk2WnA`. Signs safety evaluation results with PKP inside TEE.

### Human Tech — Covenant Alignment
Registered on frontier.human.tech. Covenant signed. Humanity verified via biometrics (Holonym V3 SBT on Optimism).

**Covenant principles demonstrated:**
- **Universal Personhood** — governance requires proof of personhood, not wealth
- **Inalienable Ownership** — keys managed in TEEs via Lit Protocol
- **Privacy by Default** — Holonym uses ZK proofs for identity verification
- **Voluntary Accountability** — agents monitored with community consent
- **Universal Security** — TEE-protected signing, decentralized audit trails

## Quick Start

```bash
git clone https://github.com/ElijahUmana/sentinel-commons.git
cd sentinel-commons
pnpm install
cp .env.example .env.local  # Edit with your API keys

# Start the app
pnpm dev

# In separate terminal: start Unbrowse
npx unbrowse setup

# In separate terminal: start Bittensor local chain
docker run -d --name bittensor_local -p 9944:9944 -p 9945:9945 ghcr.io/opentensor/subtensor-localnet:devnet-ready

# Open http://localhost:3000
```

## Project Status

New build created at the Intelligence at the Frontier Hackathon (March 14-15, 2026) — Funding the Commons & Protocol Labs @ Frontier Tower, San Francisco.

## Team

- **Elijah Umana** — [GitHub](https://github.com/ElijahUmana)

## License

MIT
