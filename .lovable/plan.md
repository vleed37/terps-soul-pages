## Changes

### 1. Header logo (src/components/layout/Header.tsx)
- Double logo size: `height={scrolled ? 48 : 64}` (was 24/32).
- Bump mobile menu logo to `height={56}`.

### 2. Hero section (src/routes/index.tsx)
- Remove the `<Logo>` element in the hero.
- Remove the "Premium infused pre-rolls · South Africa" MetaLabel.
- Remove the top-right "Batch No. 04 · Active" pill (the `absolute right-6 top-28` block).
- Remove the bottom "Scroll" indicator block.
- Keep video, headline, body copy, CTAs, and Hairline.

### 3. Strain card redesign (src/components/brand/StrainCard.tsx)
- Swap image source to the upright `product-*` shots via a new map (green-crack → product-green-crack.png, blue-dream → product-blue-dream.jpg, mango-sapphire → product-mango-sapphire.jpg, girl-scout-cookie → product-girl-scout-cookie.jpg). Add these to `src/lib/strain-assets.ts` as `getStrainProductImage(slug)`.
- Remove the rotation (`rotate: "5deg"` → none) so product sits upright.
- Remove the batch number ("TRP-04-…") top-left meta.
- Remove the EffectChip / StatusBadge (Daytime/Balanced/Nighttime) top-right.
- Keep the colored accent glow behind the product (driven by `accent_color_accent`) but ensure no "FLAV OUR FIRST" text — already gone; verify image used is the clean product shot, not the colored-card composite.
- Add `rounded-lg overflow-hidden` to the image zone so corners are curved.

### 4. Collection grid (src/routes/index.tsx)
- Change the strains grid from `sm:grid-cols-2 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2` (2x2 on desktop) and widen cards by reducing max width or increasing gap. Use `max-w-[900px] mx-auto` for the grid container so the 2x2 reads as a focused showcase.

### 5. Featured section image (src/routes/index.tsx)
- Replace `greenCrack` (slanted composite) image with `productGreenCrack` (upright PNG) for the right-side image.
- Remove the `transform: rotate(8deg)` inline style so the product stands upright.
- Keep the background `greenCrack` image (faint, opacity-30) as ambient texture, OR swap to a neutral gradient — keep as-is for now since the user only flagged the foreground.

### 6. Global rounded image corners
- Add `rounded-lg` (or `rounded-md`) to all `<img>` and `<video>` elements used as content/media across:
  - `src/routes/index.tsx` (hero video, featured image, lifestyle bands, closing band, terpene cards already rounded)
  - `src/routes/about.tsx`, `src/routes/shop.tsx`, `src/routes/strains.tsx`, `src/routes/stockists.tsx`, `src/routes/strain.$slug.tsx`
- For full-bleed background images (hero video, lifestyle full-section backgrounds), wrap in a parent with `rounded-lg overflow-hidden` only where the image is contained — leave true full-bleed sections square to avoid awkward gaps. Apply rounding to:
  - Featured product image
  - Lifestyle cards/inline images
  - Product images on strain detail
  - About story images
- Use `rounded-[var(--radius)]` or `rounded-xl` consistently; pick `rounded-xl` for a "slight curve" feel.

## Out of scope
- No backend/data changes.
- No new routes.
- Cart, checkout, auth untouched.
