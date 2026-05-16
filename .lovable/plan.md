# Refinement Plan — Strain Cards + Four Missing Pages

## 1. Strain card redesign (`src/components/brand/StrainCard.tsx`)

Replace the current overlapping single-pane layout with a true two-zone split. Same component, same props — every existing usage (homepage, /shop, related grids) inherits the fix.

Structure:

```text
┌──────────────────────────┐
│ Batch 04        [EFFECT] │  Zone 1 — product hero (60%)
│                          │  • dark gradient + low-opacity accent glow upper
│        ╱tube image╲      │  • product tube, 5° tilt, soft drop shadow
│        ╲          ╱      │  • NO strain name, NO "FLAV OUR FIRST"
│                          │
├──────────────────────────┤  ← 1px gold hairline divider
│ Strain Name              │  Zone 2 — info band (40%)
│ tagline italic           │  • solid var(--bg-surface)
│                          │  • 20px padding
│ R180   0.75G · LIVE…     │
│              DISCOVER →  │
└──────────────────────────┘
```

Hover: card translates `-2px`, gold edge glow (box-shadow with `--accent-gold` at low opacity), arrow slides +4px, image scales 1.02. No rotation. Aspect ratio `4/5`, radius `8px`.

Sold-out variant keeps the same structure: image at 60% opacity, effect chip swapped for `StatusBadge kind="soldout"`, CTA reads "Join waitlist →".

## 2. `/shop` — The Collection (`src/routes/shop.tsx`)

Full catalog page driven by existing `listStrains()` server fn.

- Centered header: gold "✦ THE COLLECTION" meta label, Fraunces display L "Every drop. Every flavor.", body lead (max 500px).
- Sticky filter+sort bar between two gold hairlines.
  - Left: "FILTER" button with chevron — opens a side `Sheet` drawer on mobile, expands an inline collapsible panel on desktop.
  - Center: live "Showing N strains" meta count.
  - Right: native styled `Select` for sort — Newest / Price ↑ / Price ↓ / Most loved (proxy: `is_featured` then name).
- Filter panel (state managed locally with `useState`, hydrated from URL search params via `Route.useSearch` / `navigate` so `/shop?effect=daytime` deep links work):
  - Effect checkboxes (daytime/balanced/nighttime).
  - Flavor family checkboxes (derived from `flavor_tags` union, mapped to 7 families).
  - Price range dual-handle slider (Radix Slider already in `ui/`), R0–R500.
  - Availability checkboxes (in stock / limited via `is_limited` / sold out).
  - "Clear filters →" ghost link.
- Grid: 1/2/3 cols with 32px gap, uses new `StrainCard`.
- Empty state when filtered list is empty: centered Fraunces italic "No drops match that combination." + "Reset filters →" CTA.

## 3. `/strains` — Strain Library (`src/routes/strains.tsx`)

Loader prefetches both `listTerpenes()` and `listStrains()` (strains needed for pill chips).

Sections:

1. **Hero** — gold "✦ THE STRAIN LIBRARY", Fraunces display XL "The language of flavor.", body L copy.
2. **Terpene Index** — 1/2/3 col grid of 8 terpene cards from the `terpenes` table. Each card: 8px radius, dark surface, 40px padding. Lucide icon mapped per slug (`limonene→Citrus, myrcene→Mango (Apple), pinene→TreePine, caryophyllene→Pepper, linalool→Flower2, humulene→Leaf, terpinolene→Sparkles, ocimene→Wheat`) at stroke 1.5. Gold hairline under icon. Display M name, "TASTES LIKE" meta + `tastes_like`, `long_description` paragraph (falls back to `short_descriptor`), "FOUND IN" + pill chips of `found_in_strain_slugs` that resolve to strain names (linking to `/strain/$slug`).
3. **Effect Categories** — three full-width editorial blocks (Daytime / Balanced / Nighttime) using the supplied copy, with strain pill chips filtered by `effect_category` linking to `/shop?effect=…`. Gold hairline between.
4. **How to read a Terps label** — gold "✦ TRANSPARENCY", Fraunces display M, an annotated tube illustration built with the existing tube product image + absolutely-positioned Fraunces italic callouts (CSS lines), plus closing body L copy.
5. **FAQ** — Radix Accordion (`ui/accordion`) with 6 supplied questions, Fraunces display S triggers, body M answers written in brand voice.

## 4. `/stockists` — Store Locator (`src/routes/stockists.tsx`)

Loader prefetches `listStockists()` (add a small server fn returning all active stockists with `carried_strain_ids`) plus `listStrains()` for the strain filter.

Layout:

- Hero with gold label, Fraunces display XL "Where to find us.", body lead, refined search input (location-pin Lucide icon, controlled state filters list by name/city/suburb/postal), "Use my location →" ghost link triggering `navigator.geolocation`.
- 60/40 desktop split (list left, map right). Mobile: list stacked + a "Show map" toggle reveals a 50vh map drawer.
- **Map**: Google Maps JavaScript API via `@vis.gl/react-google-maps` (small, modern wrapper). Custom dark luxury style JSON inlined. Gold pins (single accent color). Click pin → scrolls list item into view + highlights it + opens info window with name/address/"View detail →".
- Filter bar above list: city/province `Select`, "Carries this strain" multi-select (popover with checkboxes), "Open now" toggle (`Switch` from `ui/`, computed from `hours_json`).
- Stockist cards: 8px radius, dark surface, 24px padding, gold hairline between siblings. Display S name, body M address, meta line for distance (haversine from granted geolocation) + hours summary, `tel:` phone link, flavor chips for `carried_strain_ids` resolved to strain names. Footer row: "GET DIRECTIONS →" (opens `https://www.google.com/maps/dir/?api=1&destination=…`) and "VIEW DETAIL →" ghost (anchors to that card).
- Bottom CTA band: deep dark gradient, Fraunces display M "Stock Terps in your store.", body L, primary gold button → `/wholesale`.

**Requires a Google Maps JS API key** as `VITE_GOOGLE_MAPS_API_KEY`. If not provided we'll render a graceful fallback ("Map unavailable — view list below") so the page still works.

## 5. `/about` — Our Story (`src/routes/about.tsx`)

Static editorial page, no Supabase calls beyond the closing showcase (uses `listStrains()`).

- Hero: gold "✦ OUR STORY", giant Fraunces display XL "Flavor first." with Fraunces italic gold "Always." beneath.
- Long-form body, max-width 720px, line-height 1.8, with the 5 supplied paragraphs.
- `PullQuote` (already in `brand/`) between paragraphs 2 and 3: "We don't chase hype. We chase flavor."
- 2–3 full-bleed (within max-width) lifestyle photos at 12px radius, lazy loaded. Use existing strain hero images as placeholders (no new asset generation needed; can swap later).
- Closing showcase: gold "✦ THE COLLECTION", Fraunces display M "Four drops. One standard.", row of 4 tube product images on a dark gradient strip, gold CTA "DISCOVER ALL FOUR →" → `/shop`.

Each route file also gets proper `head()` metadata (title, description, og:title/description) per the route-architecture guidance — no more "Coming soon" titles.

## 6. Animations & responsiveness

All sections wrap content in `ScrollReveal` (already in `brand/`) for the cinematic 80px fade-up with 100ms stagger. Grids stack to 1 column below 768px. Map collapses on mobile. Cart/checkout/auth flows are untouched.

## Technical notes

- One new server fn: `src/lib/stockists.functions.ts` → `listStockists()` returning all active rows from `stockists` (table has `stockists_public_read` RLS, so `supabaseAdmin` is fine for projection control).
- New dep: `@vis.gl/react-google-maps` (~10kb, official Google Maps wrapper). No new icon libs — Lucide already installed.
- New secret needed: `VITE_GOOGLE_MAPS_API_KEY`. Will request via `add_secret` after plan approval. Page degrades gracefully if missing.
- StrainCard signature stays `{ strain: Strain }` — drop-in replacement for all 3 call sites.
- URL state on `/shop` uses TanStack Router `validateSearch` (Zod) so filters are bookmarkable and `/shop?effect=daytime` deep links from /strains work.
- No DB migrations required; all four pages consume already-seeded tables.
- `/strains` route file currently shadows the dynamic `/strain/$slug` route — they're distinct paths so no conflict, but I'll double-check the routeTree regen.

## Out of scope (call out but not building)

- "Most loved" sort is stubbed to `is_featured DESC, name ASC` (no reviews/likes data yet).
- Restock-notify "Notify me" UI is still deferred (separate prompt).
- Lifestyle photos use existing hero imagery; bespoke brand photography swap is a later content task.
