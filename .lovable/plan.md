
# Phase 1 / Wave 1 — Luna Alignment

Scope: palette + spacing + atomic additions. No restructuring of pages, typography choices, or existing features.

---

## A. Remove dark/light toggle (single mode)

- `src/components/layout/Header.tsx`: remove the theme toggle button on desktop + mobile.
- `src/lib/theme.ts`: keep file but stop using `useTheme()`. Strip `html.light` class application from `__root.tsx` (and any boot script).
- `src/styles.css`: comment out the entire `html.light { … }` block (preserved verbatim for future revival). Leave `:root` as the single source of truth.

## B. Warm-dark Luna palette

Rewrite `:root` tokens in `src/styles.css` away from forest-green toward neutral warm-dark cream + restrained sage.

```text
bg-base   #0B0A08      text-primary    #F5F1E8
bg-surface #131210     text-secondary  #B5AFA1
bg-elevated #1D1B17    text-tertiary   #6B665A
bg-contrast #F5F1E8    text-on-light   #0B0A08
accent    #8B9577 (sage-grey, sparing)
accent-hover #9CA589   accent-deep #5C6650   accent-muted rgba(...,.12)
border-subtle #1D1B17  border-strong #2A2722
border-luxe rgba(245,241,232,.08)
```

Strain-type tokens (added):
```text
--strain-sativa #7AB360  / -bg rgba(...,.10)
--strain-hybrid #6F94BD  / -bg rgba(...,.10)
--strain-indica #9683B5  / -bg rgba(...,.10)
```

Audit + fix:
- `FeatureBand.tsx`: drop sage-green background → `bg-elevated`, icons/labels in sage accent.
- `src/routes/index.tsx`: hero & section backgrounds → warm-dark; bump hero photo dark overlay opacity ~+15%.
- All radial gradients: −40% opacity; replace any forest-green stops with warm-dark base.
- Strain card surfaces → `bg-surface`.
- Reduce sage usage: keep for eyebrows, hairlines, dividers at lowered opacity; primary buttons stay cream pill on dark.

Motion:
- Transitions 400→500ms global slowdown (GoldButton hover, StrainCard hover, ghost-link, underline-grow).
- Strain card hover lift: 3–4px / 400ms ease-out.
- "BATCH · ACTIVE" pulse → 3s cycle.

## C. Typography refinements

In `styles.css`:
- Display headlines (Fraunces): `letter-spacing: -0.02em` for large sizes via utility / base h1–h2 rule.
- Body: `line-height: 1.65`.
- `.meta-xs`: tracking `0.18em`.
- Section padding: +20% on major homepage / detail sections (apply via existing `py-24` → `py-28/32` where appropriate).
- Add `.prose-measure { max-width: 620px }` (or apply `max-w-[620px]` to body paragraphs).

## D. Strain-type colored sections

Data: migration to set `strain_type` correctly:
- green-crack → sativa, blue-dream → hybrid, mango-sapphire → hybrid, girl-scout-cookie → indica, caviar-stix-{sativa|hybrid|indica} → respective.

New component `src/components/brand/StrainTypePill.tsx` (small tinted pill, 11px Manrope tracked).

Surfaces:
- `StrainCard` + `CaviarStixCard`: add top-left strain-type pill (keep existing effect chip top-right).
- `routes/strain.$slug.tsx`: insert pill into the meta row after weight.
- `routes/shop.tsx`: add a "STRAIN TYPE" filter group above existing filters — checkbox triplet with colored dots; URL param `strain_type` (multi).
- `routes/strains.tsx`: add new "BY STRAIN TYPE" section below the terpene grid, above Daytime/Balanced/Nighttime — three tinted panels linking to `/shop?strain_type=…`.

## E. Hide stock counts + Notify Me

Audit + remove "{n} IN STOCK" / "LIMITED" text across:
- `StrainCard`, `CaviarStixCard`, `routes/strain.$slug.tsx`, homepage featured grids.

New display rules:
- In stock → no indicator.
- In stock + `is_limited` → "LIMITED RELEASE" sage pill.
- Out of stock → muted "CURRENTLY OUT OF STOCK"; CTA becomes "NOTIFY ME WHEN BACK".

New `src/components/brand/NotifyMeModal.tsx` (Dialog, surface bg, 40px padding, 480px max):
- Sage eyebrow, Fraunces "Be first to know.", body referencing strain name, email input, optional "drop announcements" checkbox, cream pill "NOTIFY ME", italic ghost "Continue browsing".
- Success: "✓ You're on the list." auto-close 2s.

Backend (`src/lib/forms.functions.ts`):
- New `submitRestockNotification({ email, strainId, subscribeToDrops })` → insert into `restock_notifications`; if checkbox, also insert into `subscribers` with `source: 'restock-modal'`. Uses existing RLS (public insert allowed on both tables).

## F. Caviar Stix Coming Soon

Homepage (`routes/index.tsx`):
- Remove the existing Caviar Stix product grid section between Collection and Craft.
- Replace with new `CaviarStixComingSoon` section component (centered, max-w-720, 160px+ vertical padding, subtle sage radial glow):
  - Eyebrow "✦ COMING SOON"
  - Fraunces display L "Caviar Stix."
  - Italic subhead "The cream of the crop. Loading."
  - Body copy from spec, sage hairline 120px, "Drops in two weeks…" line.
  - Inline email + "NOTIFY ME" pill → writes to `subscribers` with `source: 'caviar-stix-coming-soon'` via a new `submitComingSoonSubscribe` server fn.
  - Success: Fraunces italic confirmation.

Caviar Stix remains browseable on `/shop` (with PREMIUM tag, no homepage feature).

---

## Acceptance

- No theme toggle anywhere; light tokens commented but present.
- All backgrounds neutral warm-dark; FeatureBand no longer green.
- Sage feels precious; spacing and line-height noticeably airier.
- Strain-type pills on cards + detail meta row; STRAIN TYPE filter on shop; new section on Strain Library.
- Zero stock counts visible; out-of-stock products open Notify Me modal writing to DB.
- Caviar Stix homepage section is the Coming Soon teaser only; cards still live on /shop.
- Cart, checkout, auth, wholesale, stockists, footer untouched.

## Files touched (approx)

- Edit: `src/styles.css`, `src/components/layout/Header.tsx`, `src/components/brand/FeatureBand.tsx`, `src/components/brand/StrainCard.tsx`, `src/components/brand/CaviarStixCard.tsx`, `src/components/brand/GoldButton.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/shop.tsx`, `src/routes/strains.tsx`, `src/routes/strain.$slug.tsx`, `src/lib/forms.functions.ts`.
- New: `src/components/brand/StrainTypePill.tsx`, `src/components/brand/NotifyMeModal.tsx`, `src/components/brand/CaviarStixComingSoon.tsx`.
- Migration: update `strain_type` values for existing strains.
