# MASTER PLAN V4 — Maximum Quality, Every Track Fully Met

## Remaining Gaps (Honest)

### 1. Metaplex — We're leaving $5,000 on the table
Base requirement (registration) is met. But the challenge says:
- "Bonus: launch a token with compelling utility or community function"
- x402-compatible API for agent payments
We've done neither. For a $5K prize, we need the token launch.

**Fix:** Launch SNTL governance token on Solana devnet via Metaplex.
- Token gives voting weight in governance
- Minted by the agent's PDA wallet
- Airdrop to verified members

### 2. Human Tech — Surface-level integration
The bonus challenge offers up to $6,000. We registered and use Holonym.
But the challenge says: "Build with or integrate human.tech tools — WaaP, Human Passport, Human Network — or demonstrate clear alignment with their stack."

We use Passport. We should also:
- Submit project as artifact on frontier.human.tech
- Show deeper Covenant alignment in the UI itself (not just README)

**Fix:** Add Covenant principles display in the governance page. Submit artifact.

### 3. Production quality issues
- No loading skeletons (just spinners)
- Chat markdown rendering is basic (dangerouslySetInnerHTML)
- No error boundaries
- Landing page preview shows "Loading live data..." for 5+ seconds
- Floor selection grid is functional but plain

**Fix:** Add skeleton loaders, improve chat rendering, add error boundaries.

### 4. The experience still lacks soul
- After selecting a floor, the dashboard has good structure (agent + three layers)
- But it doesn't FEEL like you're managing a real community
- The bounties in building.ts are there but not shown on the dashboard
- The chat is great but not integrated into the main experience

**Fix:** Show bounties on dashboard. Make chat accessible inline.

## Execution Order

### Phase I: Metaplex Token Launch (for $5K prize)
- Create SNTL token on Solana devnet
- Mint to agent's wallet
- Document in README

### Phase II: Human Tech Enhancement
- Add Covenant display to governance page
- Prepare frontier.human.tech artifact submission text

### Phase III: Dashboard bounties + polish
- Show floor bounties on dashboard
- Fix loading states
- Error boundaries

### Phase IV: Final commit, push, submit
- Update README with token info
- Push to GitHub
- Submit to DevSpot
- Submit to frontier.human.tech
