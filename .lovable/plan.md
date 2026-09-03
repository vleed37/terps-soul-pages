# Homepage restructure — Phase 1 polish

Editorial rewrite of the homepage, lighter global chrome, and one place for brand contact details. No database, checkout, wholesale, stockist, admin, age-gate or cookie-consent behaviour changes.

## A. Brand constants

New `src/lib/brand.ts`:

```ts
export const SALES_EMAIL = "sales@terpnation.co.za";
export const INSTAGRAM_HANDLE = "@terps.official_";
export const INSTAGRAM_URL = "https://instagram.com/terps.official_";
```

Swap the hard-coded address for `SALES_EMAIL` in all 11 files (display text and `mailto:` hrefs built by template string, so rendered output is byte-identical):

- src/components/layout/Footer.tsx
- src/components/layout/LegalPage.tsx
- src/lib/cart-toast.ts
- src/lib/checkout.functions.ts
- src/lib/wholesale.functions.ts
- src/routes/wholesale.index.tsx
- src/routes/wholesale.dashboard.tsx
- src/routes/wholesale.dashboard.index.tsx
- src/routes/legal.privacy.tsx
- src/routes/legal.refunds.tsx
- src/routes/api/public/wholesale-approval-email.ts

## B. Global chrome

**src/routes/__root.tsx** — delete the fixed top status band ("Premium Infused · Batch 04 Active") and reduce `<main>` padding from `pt-[116px]` to `pt-[88px]` (header-only height). Title untouched.

**Offset audit (the removed 28px band shifted everything).** Confirmed dependants:
- `src/components/layout/Header.tsx` — header is `fixed ... top-[28px]`, heights 88px (top of page) / 64px (scrolled), same on desktop and mobile → becomes `top-0`.
- `src/components/brand/StockistContextBanner.tsx` — also `fixed top-[28px] z-40`, currently overlapping the header → repositioned to sit directly under it (`top-[88px]`, matching the unscrolled header height) so it stacks below the header instead of on top of it.
- Remaining sticky offsets (`shop.tsx` `sticky top-20`, `stockists.tsx`/`wholesale.dashboard.checkout.tsx` `top-24`, `checkout.tsx` `top-32`) are measured from their own scroll containers, and the wholesale dashboard layout uses no fixed top offset, so each is re-checked in the browser and only adjusted if a gap or overlap appears.
- No `scroll-margin-top` / `scroll-mt` usage exists anywhere in `src/`, so no anchor targets need updating.

**src/components/layout/Footer.tsx** — logo `height` 64 → 90 (~40% larger), remove the "Flavour First." line, and reduce the bottom line to just the 18+ lock link to `/legal/cannabis-disclaimer` plus the copyright ("Batch 04 active" and "Bred in South Africa" removed). Email link uses `SALES_EMAIL`.


## C. Homepage — src/routes/index.tsx

Constants at the top of the file so media can be swapped later without touching layout:
`HERO_MEDIA` (currently `hero-mindspark.jpg`) and `STOCKIST_IMAGE` (currently `stockist-display.jpg`).

Final section order:

1. **Hero** — same parallax wrapper and overlay. `<Logo onTone="dark">` at ~1.5× current brand size, then H1 "Flavour first.", subline "South Africa's premium handcrafted infused pre-rolls.", one gold pill CTA "Discover the collection" → `/shop`. Old headline, "Our story" button and premium/batch copy removed.
2. **FeatureBand removed** from the homepage; `src/components/brand/FeatureBand.tsx` stays on disk.
3. **Infused Pre-Rolls teaser** — label "✦ Infused Pre-Rolls", heading "The only premium infused pre-roll you need.", the supplied body copy, a row of 2–3 product images on cream tiles (same imagery the collection cards use, via `getStrainProductImage`), CTA "Shop the collection" → `/shop`. No `StrainCard` rendering here.
4. **Caviar Sticks teaser** — `CaviarStixComingSoon.tsx` reworked in place (dark section, sage glow kept): label "✦ Caviar Sticks", heading "The only caviar stick you need.", subline "Cream of the crop.", body placeholder "[Caviar description — client to supply]", CTA "Shop the collection" → `/shop`. Coming-soon/drop-date/limited-batch copy and the inline email capture are removed, so the component no longer imports `subscribeEmail`.
5. **Socials block** — replaces the featured-strain section: label "✦ Follow Terps", Instagram icon + `INSTAGRAM_HANDLE` → `INSTAGRAM_URL`, mail icon + `SALES_EMAIL` mailto, same editorial type scale. Featured-strain markup removed from the homepage; `StrainCard` and the product-image helper stay available for `/shop`.
6. **The Craft** — unchanged.
7. **Lifestyle pull-quote** — same image and layout, quote becomes "Every pre-roll is checked by hand before it's sealed."
8. **Strain Library teaser** — unchanged, CTA points at `/strains`.
9. **Become a Stockist** — heading "Stock Terps in your store.", the supplied body copy, CTA "Become a stockist" → `/wholesale`, image from `STOCKIST_IMAGE`.
10. **Drop Alerts** — unchanged.
11. **Closing "Flavour first. Always." section removed.**

Unused imports (`FeatureBand`, `greenCrack`, strain filters no longer needed) are cleaned up so the build stays clean.

## D. Checks

- Typecheck and build clean, no unused-import or missing-route errors.
- Browser pass at 375px and 390px through every section: hero logo/CTA fit, product tiles stack, socials block wraps, no horizontal scroll, images lazy-loaded below the fold with explicit aspect ratios to avoid shift.

## Files touched

`src/lib/brand.ts` (new), `src/routes/index.tsx`, `src/routes/__root.tsx`, `src/components/layout/Footer.tsx`, `src/components/brand/CaviarStixComingSoon.tsx`, `src/components/layout/LegalPage.tsx`, `src/lib/cart-toast.ts`, `src/lib/checkout.functions.ts`, `src/lib/wholesale.functions.ts`, `src/routes/wholesale.index.tsx`, `src/routes/wholesale.dashboard.tsx`, `src/routes/wholesale.dashboard.index.tsx`, `src/routes/legal.privacy.tsx`, `src/routes/legal.refunds.tsx`, `src/routes/api/public/wholesale-approval-email.ts`.
