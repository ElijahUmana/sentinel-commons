# MASTER PLAN V3 — FINAL PUSH

## Time: ~4 hours until 8 AM deadline

## What we claimed vs what we have

| What we claimed | What we have | Gap |
|---|---|---|
| Agent manages floor budgets, events, equipment, bounties | Chat agent with 9 tools that can answer questions | Agent doesn't actually MANAGE anything — it answers questions ABOUT things |
| Safety watchdog continuously tests agent | Inspect AI harness works, Lit signing works, Bittensor storage works | Works but not visible — no activity feed, no evaluation history shown |
| Human governance controls agent behavior | Governance page with proposals and voting (persistent) | Proposals are about general topics — not about AGENT BEHAVIOR (no rules, no constraints) |
| Tamper-proof receipts for every action | Lit signing + Solana memo + Bittensor hash all work | Works but proof isn't shown — no audit trail view |
| Frontier Tower specific | Floor selection, building data, real floor names | Surface level — no real floor budget data, no actual resource coordination |
| Multi-agent (Coordinator + Safety Sentinel) | Two PKPs but same backend | Not truly separate agents |
| Metaplex on-chain identity | Registered on Solana devnet with AgentIdentity | Done ✅ |
| Arkhai escrow | Real escrow on Base Sepolia | Done ✅ |
| Unbrowse web intelligence | Real CoinGecko data via Unbrowse | Done ✅ |
| Holonym verification | Real SBT check on Optimism | Done ✅ |

## Track-by-track honest assessment

### Protocol Labs (AI Safety) — STRONG
- Inspect AI harness: ✅ works, 100% accuracy
- Reusable evaluation: ✅ anyone can run it
- Specific failure mode: ✅ social engineering
- GAP: Results not visible in UI. No evaluation history page.

### Bittensor — ADEQUATE
- Touches stack: ✅ local chain, system.remark
- Threat model: ✅ documented
- GAP: Local chain, not testnet. Acceptable for hackathon.

### Solana — ADEQUATE
- Agent reads live data: ✅ Meteora
- On-chain actions: ✅ Metaplex registration, memo transactions
- GAP: Agent doesn't execute LP positions. Reads only.

### Metaplex — STRONG ($5K prize)
- Registration: ✅ real MPL Core asset with AgentIdentity
- On-chain: ✅ verifiable on Solana Explorer
- GAP: No x402 middleware. No token launch.

### Unbrowse — ADEQUATE
- Uses Unbrowse: ✅ real CoinGecko data
- Autonomous decisions: ✅ informs LP recommendations
- GAP: Only works when Unbrowse is running locally.

### Frontier Tower — WEAK
- Conversational agent: ✅ chat works well
- Building specific: ✅ real floor names, resources
- GAP: No real coordination happening. No onboarding flow. No bounty routing. The agent TALKS about the building but doesn't DO anything for it.

### Meteora — ADEQUATE
- Reads pool state: ✅ live data
- Analyzes fees: ✅ strategy recommendations
- Explains reasoning: ✅ transparent
- GAP: Doesn't execute positions. Read-only.

### Arkhai — ADEQUATE
- Real escrow: ✅ on Base Sepolia
- On-chain TX: ✅ verifiable
- GAP: Only one escrow. No novel arbiter implemented.

### Lit Protocol — STRONG
- Chipotle API: ✅ real signing
- PKPs: ✅ two PKPs, permission groups, IPFS CID
- TEE attestation: ✅ working
- GAP: Verification not shown in UI.

### Human Tech — ADEQUATE
- Registered: ✅ frontier.human.tech
- Holonym SBT: ✅ real on-chain verification
- Covenant alignment: ✅ documented
- GAP: No deeper WaaP or Human Network integration.

## What ACTUALLY needs to happen (prioritized)

We have 4 hours. Focus on what moves the needle most.

### Priority 1: README update (30 min)
The README is outdated. It still references the old GitHub URL. It doesn't have on-chain addresses. It doesn't tell the story. This is what judges read FIRST.

Update with:
- The pitch (world problem, three layers, scenarios)
- On-chain proof (all addresses, tx hashes, CIDs)
- How to run (correct instructions)
- Track-specific sections
- Architecture diagram

### Priority 2: Submission on DevSpot (30 min)
Create the project, select all tracks, write descriptions.
Also submit on frontier.human.tech as artifact.

### Priority 3: Final testing (20 min)
Run through the complete demo flow once.
Fix any broken pieces.

### Priority 4: Video recording (20 min)
Screen record a 3-minute walkthrough of the demo.
Upload to YouTube as unlisted.

## What to STOP doing

- Stop changing the dashboard. It's good enough.
- Stop adding features. Ship what works.
- Stop iterating on UI. Focus on submission materials.

## Execution order

1. Update README with full story + on-chain proof
2. Final test run
3. Submit to DevSpot (all tracks)
4. Submit to frontier.human.tech
5. Record video demo
6. Push final commit
