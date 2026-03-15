# MASTER PLAN V5 — Coherent Story, Role-Based Experience, Production Architecture

## The Core Problem

The app has all the integrations but no coherent story. A Frontier Tower floor lead
managing a $5,000 budget sees the same screen as a new member checking if the 3D printer
is available. There's no agent activity showing what it actually DID. The data architecture
doesn't clearly support swapping in real Frontier Tower APIs.

## What Makes the Story Coherent

### The Users (3 roles)

1. **Floor Member** — works on a floor. Wants to:
   - See what's happening on their floor (events, bounties, proposals)
   - Chat with the agent (ask questions, find resources, get onboarded)
   - Vote on proposals
   - Claim bounties

2. **Floor Lead** — manages the floor. Wants to:
   - Everything a member can do PLUS:
   - See budget with transaction history
   - Create proposals and bounties
   - Set agent rules
   - Run safety evaluations
   - View audit trail

3. **Building Admin** (stretch) — oversees all floors. Wants to:
   - Building-wide budget overview
   - Cross-floor coordination
   - Agent management

### The Agent's Story

The agent isn't just answering questions. It's DOING things:
- Processing budget allocations when proposals pass
- Routing bounty payments when work is completed
- Coordinating equipment sharing across floors
- Refusing unauthorized actions and logging them
- Reporting on treasury yields

This activity should be VISIBLE — a feed of what the agent did.

### The Data Architecture

Everything flows through clean interfaces that can be swapped:

```
src/lib/building.ts    → Floor data (swap with Frontier Tower API)
src/lib/store.ts       → State data (swap with database)
src/lib/arkhai.ts      → Escrow data (already on-chain)
src/app/api/*          → API layer (stays the same regardless of data source)
```

## Execution

### Phase 1: Role selection + auth enhancement
- After floor selection, ask: "What's your role on Floor X?"
- Member / Floor Lead
- Store in auth context + localStorage
- Different dashboard based on role

### Phase 2: Agent activity feed
- Create activity log in data store
- Seed with realistic activities
- Show on dashboard as a live feed
- New activities added when chat/governance/safety events happen

### Phase 3: Budget transactions
- Add transaction history to floor budget
- Show recent allocations, bounty payments, yield earned
- Floor lead sees full history, member sees summary

### Phase 4: Floor lead dashboard
- Budget management view (transactions, remaining, projections)
- Create bounty button
- Safety evaluation with full pipeline results
- Agent rules management (prominent, not in a tab)

### Phase 5: Member dashboard
- Floor status (what's happening, upcoming events)
- Active bounties they can claim
- Proposals they can vote on
- Chat CTA (primary action)

### Phase 6: Architecture cleanup
- Ensure building.ts has clear interface comments
- Add "Data Source" documentation showing how to swap
- Clean up any dead code
