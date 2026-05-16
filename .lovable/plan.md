# Terps — Phase A Build Plan

Build the consumer foundation for Terps: design system, primitives, navigation, and all public pages. Cart/checkout/accounts are out of scope (Prompts 2 & 3). Any "Add to Cart" triggers a toast pointing to sales@terpsnation.co.za.

## 1. Foundation setup

- Enable Lovable Cloud (Supabase) and run the migration with `strains`, `terpenes`, `stockists`, `subscribers`, `restock_notifications`, `wholesale_inquiries` (RLS + public read policies as specified). Seed the 4 strains, 8 terpenes, 6 stockists.
- Copy uploaded assets into `src/assets/`: `LogoTerps.png`, `BlueDream.webp`, `GreenCrack.webp`, `MangoSapphire.webp`, `GirlScoutCookies.webp`, and the 4 lifestyle photos.
- Store `GOOGLE_MAPS_API_KEY` via the secrets tool (will prompt user for the value).
- Install dependencies: `framer-motion`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@react-google-maps/api`.
- Add Google Fonts (Fraunces, Sansita Swashed 900, Manrope) via `<link>` in root head.

## 2. Design system (`src/styles.css`)

- Replace token block with the spec's full dark palette (warm-near-black bases, cream text tiers, refined gold accent, luxe borders). Convert all hex to `oklch` per project rule.
- Add semantic tokens: `--font-display` (Fraunces), `--font-wordmark` (Sansita Swashed), `--font-body` (Manrope); shadow tokens; radius tokens (buttons 4px, cards 8px).
- Add subtle 0.03-opacity grain texture on `body`.
- Set dark as the default (no light mode).

## 3. Component primitives (`src/components/ui` extensions + new `src/components/brand/`)

- Customize shadcn `button` variants: `primary` (gold, 4px, uppercase tracked), `secondary` (gold outline), `tertiary` (cream outline), `ghost` (Fraunces italic with → arrow underline animation).
- Refined `input`, `textarea`, `select` styling (dark surface, gold focus border, uppercase tracked labels).
- New: `MetaLabel`, `HairlineRule`, `EffectChip`, `FlavorChip`, `StatusBadge`, `QuantityStepper`, `StrainCard` (editorial 4/5 aspect with radial accent glow, 5° tube tilt, hover lift + edge glow), `SectionHeading`, `PullQuote`, `ScrollReveal` (Framer Motion `whileInView` fade-up wrapper).
- `ProductImage`, `LifestyleImage` helpers.

## 4. Layout & navigation

- `src/components/layout/Header.tsx`: 88px sticky → 60px compressed with backdrop blur, logo PNG, centered uppercase nav with gold center-out underline + active gold dot, right-side search/account/cart icons (thin Lucide 1.5 stroke). Mobile: hamburger → full-screen menu with large Fraunces nav links.
- `src/components/layout/Footer.tsx`: 3-column (logo+slogan / Explore / Connect+newsletter), gold hairline, bottom bar with 18+ meta and legal links.
- `src/components/layout/AgeGate.tsx`: atmospheric blur backdrop, centered elevated card, persists `terps_age_verified` in localStorage for 30 days; exit → google.com.
- Wrap all routes via `__root.tsx` (Header + Outlet + Footer + AgeGate + Sonner Toaster).

## 5. Routes (TanStack Start file-based, each with own `head()`)

- `src/routes/index.tsx` — Home: hero (100vh, parallax, batch marker, wordmark, Fraunces tagline, dual CTAs, scroll cue) → The Collection grid → Featured Strain full-bleed → The Craft 3-col → Lifestyle pull quote → Strain Library teaser → Find Terps (list + map) → Drop alerts (newsletter) → Closing → Footer. NO marquee.
- `src/routes/shop.tsx` — The Collection: header, sticky filter+sort bar, filter panel (effect/flavor/price/availability), responsive grid (3/2/1), empty state.
- `src/routes/strain.$slug.tsx` — Strain detail: cinematic 85vh hero, sticky-left product zone + right buy panel (Add to Cart triggers toast), The Story 2-col, Profile 3 cards (effect gauge, flavor, terpenes), Lab Results spec sheet + terpene bars, Available At stockists, Related drops.
- `src/routes/strains.tsx` — Strain Library: hero, 8-card terpene index, 3 stacked effect category sections, label annotation section, FAQ accordion.
- `src/routes/stockists.tsx` — Find Terps: hero with search + "use my location", 60/40 list+map (mobile toggle), Google Maps with dark custom style + gold pins + info windows, filters, bottom "Become a Stockist" CTA band.
- `src/routes/about.tsx` — Our Story: editorial long-form, interleaved lifestyle photos, major pull quote, closing strain showcase.
- `src/routes/wholesale.tsx` — Inquiry form (RHF + Zod) → `wholesale_inquiries` insert via server fn, success message.
- Root `notFoundComponent` — Fraunces italic "This drop has finished." + CTA back to collection.

## 6. Data layer

- `src/lib/strains.functions.ts`, `terpenes.functions.ts`, `stockists.functions.ts`, `subscribers.functions.ts`, `wholesale.functions.ts` — `createServerFn` reads/inserts via `supabaseAdmin` (public reads, scoped inserts with Zod validation).
- Route loaders call these server fns; use TanStack Query `useSuspenseQuery` where filters need client state (shop page filters via `validateSearch`).
- Newsletter and restock inserts validate email format and length.

## 7. Animations & polish

- Framer Motion `ScrollReveal` (fade-up 80px, 500ms ease-out, 100ms stagger).
- Hero parallax at 0.4x scroll speed.
- All hover transitions 400ms (no bounce).
- Image fade-in on load (600ms).
- Sonner toast styled to match design tokens for "Cart launching soon — send an inquiry to sales@terpsnation.co.za".

## 8. SEO

- Each route's `head()` sets distinct title (<60ch with "Terps" suffix), description (<160ch), og:title/og:description; strain pages set og:image from product image, stockists page sets og:image to a lifestyle photo. Root sets default twitter card + viewport + Fraunces/Manrope preconnect.

## Technical notes

- All colors in `src/styles.css` as `oklch` semantic tokens; components reference tokens only (no hardcoded hex in JSX).
- Logo always from PNG asset; Sansita Swashed Black only as fallback wordmark.
- Strain detail "Add to Cart" calls `toast()` from sonner — no cart state introduced this phase.
- Google Maps loaded via `@react-google-maps/api` with `useJsApiLoader`; API key read from `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` (publishable in client).
- Filter state on `/shop` lives in URL search params via `validateSearch` + `Route.useSearch()` / `useNavigate`.
- Every route with a loader includes `errorComponent` + `notFoundComponent`.
- No mobile bottom nav; no marquee; no pill primary buttons.

## Questions before I implement

1. The Google Maps API key — should I prompt to add `VITE_GOOGLE_MAPS_API_KEY` as a public env var (it's restricted by referrer in Google Cloud), or store it via the secrets manager and proxy map tile usage server-side? Recommend the former for the JS Maps API.
2. The hero cinematic background images and lifestyle/atmospheric photos beyond the 4 lifestyle uploads — should I generate additional moody product/smoke shots with imagegen, or reuse the 4 lifestyle photos + strain creatives across hero moments?
