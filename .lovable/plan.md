## Wave 1B — Luna Full Pivot to Cream Base

Flip the site's base tonality from dark to cream. Dark becomes punctuation (hero, modals, newsletter, footer, status band, Caviar Stix teaser). All Wave 1 functionality stays intact.

### 1. Token rewrite — `src/styles.css`

Replace `:root` with the new cream-first palette from the brief. Keep the existing token *names* the layout already uses (`--bg-base`, `--bg-surface`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--accent-gold`, `--accent-gold-hover`, `--accent-gold-muted`, `--border-subtle`, `--border-strong`, `--border-luxe`, `--on-gold`) so existing components re-skin automatically. Add new tokens for the dark/sage layers:

- `--bg-base: #F5F1E8`, `--bg-surface: #FAF7F0`, `--bg-elevated: #EBE6D8`
- `--bg-dark: #0B0A08`, `--bg-dark-surface: #131210`, `--bg-dark-elevated: #1D1B17`
- `--bg-sage: #C5CDB5`, `--bg-sage-deep: #6B7559`
- `--text-primary: #0B0A08`, `--text-secondary: #5C5852`, `--text-tertiary: #8A8479`
- `--text-on-dark: #F5F1E8`, `--text-on-dark-secondary: #B5AFA1`, `--text-on-dark-tertiary: #6B665A`
- `--accent-gold: #5C6650` (cream-readable sage; default accent)
- `--accent-gold-hover: #4B5440`, `--accent-gold-muted: rgba(92,102,80,0.10)`
- `--accent-on-dark: #8B9577`, `--accent-on-dark-hover: #9CA589`
- Strain tints: sativa `#5A7D3A`, hybrid `#3A6A99`, indica `#6B4E97` (all with 10% bg tints)
- `--border-subtle: #E6E1D2`, `--border-strong: #C8C1AE`, `--border-on-dark: rgba(245,241,232,0.12)`, `--border-luxe: rgba(11,10,8,0.08)`
- `--on-gold: #F5F1E8` (cream-on-dark pill text)
- Soften shadows for cream surfaces.
- Tone down film grain on cream (drop opacity to ~0.015, switch blend to `multiply`).

Expose the new dark/sage/on-dark tokens through `@theme inline` so Tailwind `bg-*`/`text-*` helpers work.

### 2. New utility — Section tones

Add three thin section wrapper classes / utilities in `styles.css`:
- `.tone-cream` — default (no-op, since base is cream).
- `.tone-dark` — `background: var(--bg-dark); color: var(--text-on-dark);` and remap nested `--bg-base/surface/elevated`, `--text-primary/secondary/tertiary`, `--accent-gold`, `--border-subtle/strong` to their on-dark equivalents via CSS variable overrides on the wrapper. This is the key mechanism: any existing component dropped inside `.tone-dark` automatically renders correctly without per-component branching.
- `.tone-sage` — same trick, swapping bg to `--bg-sage` with dark text/icons.

### 3. Section retoning (wrap-only, no component rewrites)

Wrap homepage sections in `src/routes/index.tsx` with the right tone class per the brief's section map:
- Hero → `.tone-dark`
- FeatureBand → `.tone-sage`
- Collection grid → cream (default)
- Caviar Stix Coming Soon → `.tone-dark`
- Green Crack feature, Craft, Strain Library, Stockist CTA, Closing → cream
- Lifestyle band, Newsletter → `.tone-dark`
- Footer → `.tone-dark`

Add a new full-width `<div className="tone-dark">` status band above the header ("BATCH 04 ACTIVE", ~30px tall, sage accent text).

Other routes:
- `shop.tsx`, `strains.tsx`, `stockists.tsx`, `about.tsx`, `wholesale.tsx` → cream (default; no wrapper needed but verify any forced dark backgrounds are removed).
- `strain.$slug.tsx` → wrap the photography hero in `.tone-dark`; rest cream.

### 4. Component touch-ups

- **`Header.tsx`** — already uses tokens; with new tokens it becomes cream w/ dark text automatically. Verify mobile overlay (`bg-rich`) reads correctly; change overlay to `bg-base` for cream.
- **`FeatureBand.tsx`** — switch wrapper bg from `bg-elevated` to `var(--bg-sage)`; icons + labels stay token-driven.
- **`Logo.tsx`** — already forced dark logo; on cream we want the light/wordmark variant. Flip to the light/dark-text variant of the wordmark for cream sections; keep dark-bg variant inside `.tone-dark` wrappers via a prop or by reading the inherited text color.
- **`GoldButton.tsx`** — keep name (cleanup deferred). Add `variant="dark"` (dark fill, cream text — default on cream pages) and `variant="cream"` (cream fill, dark text — used inside `.tone-dark` sections). Update existing call sites that sit inside dark sections (CaviarStixComingSoon CTA, NotifyMeModal CTA, newsletter band, lifestyle band) to `variant="cream"`. Everything else uses the new `variant="dark"` default.
- **`StrainCard.tsx` / `CaviarStixCard.tsx`** — keep photography zone dark (existing radial backdrop). Switch info band surface to cream (`--bg-surface` is already cream after the token swap) — this happens automatically. Verify the "View strain" pill renders as dark-on-cream.
- **`NotifyMeModal.tsx`** — wrap `DialogContent` inner with `.tone-dark` so it becomes a dark modal floating on cream pages. Deepen the Radix overlay (`rgba(11,10,8,0.6)`).
- **`CaviarStixComingSoon.tsx`** — already a hero-style section; wrap in `.tone-dark` (or rely on parent wrapper from step 3) and switch its CTA to `variant="cream"`.
- **`CartDrawer.tsx`, mobile menu, search modal, toasts (sonner), empty/loading states** — audit and ensure they pick up cream from tokens; for the cart drawer and mobile menu keep cream surfaces with dark text.

### 5. Stockist map

In `StockistMap.tsx`, swap the Carto tile URL from `dark_all` to `light_all` (Positron). Keep pin color as sage (`--accent-gold`).

### 6. Audit pass (after changes)

Walk Home → Shop → Strain detail → Strains → Stockists → Our Story → Wholesale on desktop + mobile. Verify:
- No surface still rendering near-black as the page background.
- Dark sections feel intentional (hero, Caviar Stix teaser, lifestyle, newsletter, footer, status band, modals).
- FeatureBand is sage between dark hero and cream grid.
- All form inputs match their parent tone (cream-on-cream vs dark-on-dark).
- Wave 1 features intact: strain-type pills, Notify Me wired, Caviar Stix subscribe writing to DB, no stock counts.
- WCAG AA contrast on body copy in both tones.

### Files touched

- `src/styles.css` (token rewrite + tone-utility classes)
- `src/routes/index.tsx`, `src/routes/shop.tsx`, `src/routes/strain.$slug.tsx`, `src/routes/strains.tsx`, `src/routes/stockists.tsx`, `src/routes/about.tsx`, `src/routes/wholesale.tsx` (section wrappers / remove residual dark bg classes)
- `src/components/layout/Header.tsx` (mobile overlay surface; add top status band — or add status band in `__root.tsx` above `<Header />`)
- `src/components/brand/FeatureBand.tsx` (sage bg)
- `src/components/brand/Logo.tsx` (tone-aware variant)
- `src/components/brand/GoldButton.tsx` (add `dark` + `cream` variants; default `dark`)
- `src/components/brand/CaviarStixComingSoon.tsx`, `src/components/brand/NotifyMeModal.tsx` (wrap `.tone-dark`, swap button variant)
- `src/components/brand/StockistMap.tsx` (light tiles)
- `src/components/cart/CartDrawer.tsx`, `src/components/layout/Footer.tsx` (verify; footer wrap in `.tone-dark`)

### Notes / non-goals

- Not renaming `GoldButton` → `PrimaryButton` (optional cleanup, deferred).
- Not touching Wave 1 data migrations, DB schema, or any server functions.
- Light-mode CSS block stays commented out (now moot).
