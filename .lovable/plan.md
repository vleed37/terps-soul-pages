## Wave 1B Cleanup + Mobile Audit

Three small retones to finish the Luna cream pivot, then a screenshot-based mobile audit at 375px on the 8 key routes.

### 1. Stockists page — wholesale CTA to cream

`src/routes/stockists.tsx`, "Stock Terps in your store." section near the bottom.

- Remove the dark radial-gradient `--bg-rich` background div and any `.tone-dark` wrapper.
- Let the section inherit the page's cream surface.
- Use `<GoldButton variant="dark">` (dark pill on cream) for "Become a stockist".
- Keep copy and ScrollReveal unchanged.

Result: cream → dark footer rhythm matches the homepage treatment.

### 2. Our Story — "Four drops. One standard." to cream

`src/routes/about.tsx`, closing showcase.

- Remove the radial-gradient + `--bg-surface`/`--bg-rich` backdrop on the cards container.
- Cards sit directly on the page cream; keep the grid spacing and hover translate.
- Leave product images as-is (each strain photo brings its own color).
- "Discover all four" stays `GoldButton` default (dark variant on cream).

No StrainCard component change needed — the homepage grid already renders on cream, so the card surface is already correct.

### 3. Strain Library — transparency section to sage

`src/routes/strains.tsx`, "✦ Transparency · Every detail is on the tube." section.

Option A (sage card):
- Wrap the two-column grid (product + paragraph) in a rounded container with `backgroundColor: var(--bg-sage)`, generous padding (e.g. `p-12 md:p-20`), `rounded-2xl`.
- Use `.tone-sage` utility so nested text tokens remap correctly; product callouts switch from gold to a dark hairline tone for legibility on sage (`color: #0B0A08` with `opacity 0.7`, em-dash hairline kept).
- Soften the product image drop-shadow to `drop-shadow(0_24px_40px_rgba(40,60,40,0.25))` (sage-tinted, not black) so it sits on sage cleanly.
- Paragraph text uses dark-on-sage tokens.
- Heading + MetaLabel stay on cream above the sage card (creates the framed editorial moment).

This creates the third sage moment on the site (FeatureBand, sativa panel in BY STRAIN TYPE, transparency card) — a deliberate pattern.

### 4. Mobile audit

After the three fixes ship, run a browser pass at viewport 375×812 (and spot-check 414×896 for the Homepage hero + Stockists list) on:

`/`, `/shop`, `/strain/green-crack`, `/strain/caviar-stix-sativa`, `/strains`, `/stockists`, `/about`, `/wholesale`

For each route capture a full-page screenshot and check against the inventory in the prompt:
- Status band sits cleanly above header, no overlap with hero
- No horizontal scroll
- Section padding feels right at 24px (not 80px+)
- FeatureBand: already `grid-cols-2 md:grid-cols-4` — verify the 2×2 reads cleanly
- The Collection grid: already `grid-cols-1 sm:grid-cols-2` — verify full-width single column at 375px
- Caviar Stix Coming Soon: email + Notify pill stack vertically
- BY STRAIN TYPE panels: stack vertically (already `grid-cols-1 md:grid-cols-3`)
- Terpene grid: already `grid-cols-1` on mobile — verify
- Stockists: list full-width single column; the "Show map" toggle already exists — verify it works and the map renders above when toggled. Tighten if needed so map appears above list by default on mobile rather than requiring the toggle.
- Strain detail hero: oversized strain name doesn't overflow; tighten `tracking` on mobile if it does
- Modals: Notify Me, Cart drawer, mobile menu, search — full-width, accessible close, 44px tap targets
- Tap targets: buttons, "Use my location" link, filter dropdowns

Report back with screenshots of any layout breaks. Mobile fix pass is a separate follow-up — this plan ships the 3 retones and produces the audit; it does not pre-emptively re-layout the entire mobile experience.

### Files touched

- `src/routes/stockists.tsx` — remove dark CTA wrapper, switch button variant
- `src/routes/about.tsx` — remove gradient frame on closing showcase
- `src/routes/strains.tsx` — wrap transparency two-col in sage card, retone callouts

### Out of scope

- No design-system token changes
- No StrainCard / CaviarStixCard / FeatureBand component edits
- No data, auth, or RLS changes
- Mobile fixes (only the audit + screenshots in this pass)
