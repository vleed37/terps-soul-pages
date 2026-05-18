## Terps — Luna Composition Pass

Four targeted composition moves to bring the site closer to the Luna reference. **No palette changes, no typography swaps, no functional changes.** The Sansita Swashed wordmark stays (per earlier scope), but its placement and layout shift.

---

### 1. Centered wordmark header with split nav — `src/components/layout/Header.tsx`

Restructure the header into a three-column grid:

```
[ SHOP   ABOUT   JOURNAL ]   [ WORDMARK ]   [ THEME · SEARCH · ACCOUNT · CART ]
       left nav                   center               right utility cluster
```

- Desktop layout: CSS grid `grid-cols-[1fr_auto_1fr]`, `items-center`.
- Left nav: 3 primary links — "The Collection" (/shop), "Strains" (/strains), "Our Story" (/about). Move "Stockists" into the right cluster as a small text link or keep it in the left nav as a 4th item (we'll keep 4 to avoid hiding a primary route).
- Center: the existing `<Logo>` becomes the centered wordmark. Slightly smaller default height (56px → 48px when scrolled to 36px) so the centered placement reads refined, not heavy.
- Right cluster: theme toggle · search · account · cart — order unchanged.
- Mobile: unchanged hamburger pattern, but wordmark moves to true center using `justify-between` with menu-left, logo-center, cart-right.
- Scrolled state: keep the existing background/blur behavior; only the layout grid changes.

---

### 2. Solid sage feature band — new component, used on home + product pages

Create `src/components/brand/FeatureBand.tsx`: a full-bleed horizontal band with background `var(--accent-gold)` (olive sage), containing 4 icon + meta-label pairs.

Default content:
- Premium Flower · Hand-Infused · Lab Verified · Bred in SA

Styling:
- Background: `bg-[color:var(--accent-gold)]`
- Text + icons: `text-[color:var(--on-gold)]` (auto-themed — dark forest in light mode, cream in dark mode)
- Icons: Lucide `Leaf`, `Droplet`, `ShieldCheck`, `MapPin` at strokeWidth 1.5, 18px
- Layout: 4 evenly distributed items, py-5, meta-xs caps labels
- Mobile: 2x2 grid, py-6

Placement:
- Homepage (`src/routes/index.tsx`): inserted directly after the hero, before "The Collection" section
- Strain detail page (`src/routes/strain.$slug.tsx`): below the buy zone, above the story section
- Shop page: below the shop hero/title

---

### 3. Strain card restyle — white tile + thin-outline CTA — `src/components/brand/StrainCard.tsx`

Replace the current gradient-washed card with a Luna-style tile:

- Card surface: `bg-[color:var(--bg-rich)]` (true white in light mode, deep forest-black in dark mode)
- Border: `border border-[color:var(--border-subtle)]`, no shadow at rest, soft shadow on hover (`var(--shadow-card)`)
- Border radius: 8px (down from 12px) for a sharper editorial feel
- Layout: product image on a clean neutral upper block (no radial accent glow — drop it entirely), info band below
- Image area: aspect-[4/5] split into ~70% image / 30% info. Background of image area = `bg-[color:var(--bg-surface)]` (off-white cream / deeper forest). No gradient, no glow.
- Info band:
  - Product name: Fraunces serif, smaller (1.5rem instead of 1.75rem)
  - Tiny meta-xs caps line: "INFUSED · 0.75G"
  - Price: bold body, no italic tagline
  - CTA: thin-outline pill button "ADD TO CART" or "VIEW STRAIN" (uses GoldButton `secondary` variant which is already outline). Sold-out variant shows "JOIN WAITLIST".
- Remove the italic tagline + "Discover →" link — Luna cards are quieter.

This affects every page that renders `<StrainCard>` (home grid, shop grid, related on strain detail).

---

### 4. Final black contrast band — `src/routes/index.tsx`

Replace section 8 (closing) with a hard contrast slab matching Luna's "Elevate intentionally." block:

- Section background: `bg-[color:var(--bg-contrast)]` (always near-black `#111B10`, regardless of mode — provides the same visual punch in both modes)
- Text: `text-[color:var(--text-on-dark)]` (always cream)
- Content: oversized Fraunces serif statement aligned left, padding `py-32 md:py-40`, max-width contained
- Copy: keep "Flavour first. Always." or simplify to a single sentence
- Optional small circular sage moon/leaf glyph aligned right (mirrors Luna's circular badge) — can use a simple SVG circle with the sage accent at low opacity
- No CTA inside this band — let it close silently like Luna's "Elevate intentionally."
- Remove the `lifestyle4` background image + overlay; this is a pure type-on-dark composition

Footer continues below as-is.

---

### Files touched

- `src/components/layout/Header.tsx` — three-column grid, centered wordmark
- `src/components/brand/FeatureBand.tsx` — **new**
- `src/components/brand/StrainCard.tsx` — Luna-style tile rewrite
- `src/routes/index.tsx` — insert FeatureBand after hero, replace closing section with contrast band
- `src/routes/strain.$slug.tsx` — insert FeatureBand below buy zone
- `src/routes/shop.tsx` — insert FeatureBand below shop title

### Out of scope

- Colors, tokens, typography, fonts — all unchanged
- Hero composition (the user opted to keep the dark video hero — that was move #2 in the gap list, deliberately skipped here)
- Wordmark glyph swap (Sansita Swashed stays — only its placement changes)
- Editorial photography swaps (move #6 — skipped)
- Section count / "fewer blocks" restraint (move #8 — already trimmed earlier; not re-touched)
- Functionality, routes, cart, checkout, auth — untouched

### Acceptance

1. Header reads as centered wordmark with split nav, like Luna.
2. A solid olive-sage band sits below the hero, on shop, and on strain detail pages.
3. Strain cards look like quiet white/forest tiles with a thin-outline CTA — no glow, no italic tagline.
4. Homepage closes on a hard near-black band with a serif statement, no photo behind it.
5. All four changes work in both light and dark modes via existing tokens.
