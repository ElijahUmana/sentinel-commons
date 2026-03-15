# MASTER PLAN V2 — UX REBUILD

## The Problem

All 10 integrations work in the backend. Tests pass 10/10. But the frontend is trash:

1. **Governance page uses useState, not the API** — proposals vanish on refresh
2. **Dashboard is a generic dev tool** — no user journey, no personalization
3. **No landing experience** — you jump straight into a wall of data
4. **Nothing feels like Frontier Tower** — could be any generic app
5. **Integrations work but aren't showcased** — Lit signatures, Bittensor hashes, Metaplex registration aren't visible
6. **No differentiated experience** — a new member sees the same thing as a floor lead

## What Needs to Change

### Phase A: Fix Governance Page (connect to API, persistent, floor-aware)

The governance page must call `/api/governance` instead of using local state. This is the #1 UX-breaking issue.

What to fix:
- Fetch proposals from `/api/governance?floorId=X` on mount
- Create proposals via `POST /api/governance` with `action: "create"`
- Vote via `POST /api/governance` with `action: "vote"` — pass voter address
- Show floor-specific proposals when floor is selected
- Show building-wide proposals (floorId: null) always
- Double-vote prevention (already in API)
- Verification gate using auth context (already in auth)
- Show "passed" proposals as executed with Solana memo link

### Phase B: Rebuild Dashboard as User-Centric Experience

The dashboard should tell a STORY, not dump data:

**For unconnected visitors:**
- Hero section: "Sentinel Commons for Frontier Tower"
- "Ten Floors, One Thesis" — the building's actual tagline
- Quick stats: pools tracked, proposals active, attacks blocked
- "Connect your wallet from frontier.human.tech to get started"

**For connected + verified members:**
- Personalized greeting: "Welcome back, Floor 9: AI & Autonomous Systems"
- YOUR floor's governance proposals with vote buttons
- Community Coordinator agent status with safety score
- Recent safety events (attacks detected, evaluations run)
- Treasury overview (top pools, total fees)
- Quick actions: "Chat with agent", "Create proposal", "Run safety eval"
- Infrastructure status (compact, not a huge grid)

**For unverified users:**
- Same view but governance actions disabled
- Prominent "Verify your humanity" CTA

### Phase C: Make Safety Pipeline Visible

When someone runs an evaluation or when an attack is detected, the UI should SHOW the full pipeline:

1. Inspect AI evaluation result (accuracy score)
2. Lit Protocol attestation (signature, signer PKP, CID)
3. Bittensor audit hash (block hash, tx hash)
4. Solana memo audit (tx signature, explorer link)

All in one card. Not scattered. One pipeline visualization.

### Phase D: Polish & Cohesion

- Remove the tech stack grid (or make it tiny/footer)
- Consistent card styling
- Error states that help users (not just "failed")
- Loading skeletons
- Smooth transitions between states

## Implementation Order

| Phase | What | Time |
|-------|------|------|
| A | Fix governance page → API connection | 30 min |
| B | Rebuild dashboard | 45 min |
| C | Safety pipeline visualization | 20 min |
| D | Polish & cohesion | 15 min |
| — | Commit, test, push | 10 min |
| **Total** | | **~2 hours** |

## What This Achieves Per Track

### Protocol Labs
Before: "Run Evaluation" button with no visible result
After: Full pipeline card showing Inspect AI accuracy → Lit signature → Bittensor hash

### Bittensor
Before: "Audit: Bittensor network" text label
After: Real tx hashes displayed, block hashes, verifiable records

### Metaplex
Before: Static "EKt86T...Amjw" address
After: Clickable Solana Explorer link, registration details visible

### Frontier Tower
Before: Generic dashboard
After: Floor-specific experience, personalized greeting, persistent governance

### Human Tech
Before: Holonym verification works but buried
After: Verification is prominent, governance is real and persistent

### All tracks
Before: 10 working backends, generic frontend
After: Each integration's results are VISIBLE and VERIFIABLE in the UI
