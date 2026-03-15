# FINAL PLAN — 3 hours to deadline

## What's done and working
- 10 backend integrations (Meteora, Metaplex, Lit, Bittensor, Arkhai, Unbrowse, Holonym, Solana, Inspect AI, Claude)
- Chat with 9 real tools
- Governance with persistent proposals + agent rules (injected into agent behavior)
- Audit trail page with signed evaluations
- Landing page with without/with story
- Floor selection onboarding
- Attack demo on dashboard
- All tests pass

## What's still wrong
1. No floor budget data — the pitch says "each floor has a budget" but we don't show one
2. No bounties — the pitch says "route bounties" but Arkhai escrows aren't framed as bounties
3. Existing governance proposals are generic — not about floor activities
4. README is outdated — doesn't have on-chain addresses or the full story
5. Not submitted to DevSpot or frontier.human.tech

## Execution (in order)

### 1. Add floor budget to building data (15 min)
- Each floor gets a simulated budget
- Dashboard shows "Floor 9 budget: $5,000 / $3,200 remaining"
- Agent can answer "what's our budget?" with real data

### 2. Frame escrows as bounties (10 min)
- Rename "Service Escrows" to "Bounties" in UI
- The existing Arkhai escrow becomes a bounty ("Fix 3D printer on Floor 7 — 0.001 ETH")
- Chat tool "create_service_escrow" becomes a bounty creation tool

### 3. Seed better governance proposals (10 min)
- Replace generic proposals with floor-activity ones:
  "Host weekly AI safety reading group (200 USDC)"
  "Purchase new soldering station for Floor 4 (500 USDC)"
  "Sponsor 3 members to attend ETH SF meetup (300 USDC)"

### 4. Update README (30 min)
- Full story from the pitch
- All on-chain addresses and TX hashes
- How to run
- Track-specific sections
- Architecture

### 5. Submit to DevSpot (20 min)
- Create project, select all 10 tracks
- Write track-specific descriptions

### 6. Submit to frontier.human.tech (10 min)
- Submit as artifact with description

### 7. Final commit and push (5 min)

## Total: ~1.5 hours, leaving buffer for issues
