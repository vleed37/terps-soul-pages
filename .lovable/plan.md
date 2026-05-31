# Phase 1.5 — Pre-launch Polish

Five focused workstreams. No new product features. Out-of-scope (Phase 2) items listed at the bottom of the prompt are explicitly avoided.

---

## 1. Security & repo hygiene

**1A. Timing-safe webhook secret comparison**
- File: `src/routes/api/public/wholesale-approval-email.ts`
- Replace `if (provided !== secret)` with the same pattern already used in `src/routes/api/public/bobpay-webhook.ts`:
  - Convert both strings to `Buffer` via `Buffer.from(...)`.
  - Short-circuit with 401 when `provided.length !== secret.length` (timingSafeEqual throws on mismatched length).
  - Otherwise call `crypto.timingSafeEqual(a, b)`; return 401 if false.
- Import `timingSafeEqual` from `crypto` (already proven to work in the Worker runtime by the BobPay route).

**1B. .gitignore**
- Append `.env` (and `.env.*.local` for good measure) to `.gitignore`. Existing tracked `.env` stays tracked; this only prevents future drift.

---

## 2. SEO foundation

**2A. Per-route `head()` titles + descriptions** for: `/`, `/shop`, `/strain/$slug` (dynamic from loader data), `/strains`, `/stockists`, `/about`, `/wholesale`. Use the exact strings in the brief.

**2B. OG + Twitter card meta** added to the same `head()` on each route above. Set `og:type` = `product` on `/strain/$slug`, `website` elsewhere. Build absolute `og:url` and `og:image` from a single `PUBLIC_SITE_URL` constant in `src/lib/seo.ts` (defaults to `https://terps2.carbonmediasolutions.com`). `og:site_name` = `Terps`.
- Remove the existing global `og:image` from `src/routes/__root.tsx` (root og:image overrides every leaf per TanStack head-merge rules). Keep generic charset/viewport/twitter-card defaults at root.
- Strain detail prefers `strain.hero_image_url || product_image_url`, falls back to `/og/default.jpg`.

**2C. OG fallback image** — generate `public/og/default.jpg` (1200×630, cream `#F5F1E8`, sage hairline, centered Terps wordmark, "Flavour First." beneath). One file, used everywhere except strain detail.

**2D. Sitemap + robots**
- Static `public/sitemap.xml` listing `/`, `/shop`, `/strains`, every strain detail slug currently in DB (green-crack, blue-dream, mango-sapphire, girl-scout-cookie, caviar-stix-sativa/hybrid/indica), `/stockists`, `/about`, `/wholesale`. Single `<lastmod>` = build date.
- `public/robots.txt` exactly as specified.

**2E. Product JSON-LD on `/strain/$slug`** via the route's `head().scripts` array: `@type: Product`, name, description, image, `brand: { @type: Brand, name: "Terps" }`, `offers: { @type: Offer, priceCurrency: "ZAR", price, availability: in/out of stock based on stock_quantity }`. No aggregateRating yet (no reviews).

---

## 3. Legal & compliance

**3A. Five legal routes** under `src/routes/legal.*.tsx`:
- `/legal/terms`, `/legal/privacy`, `/legal/refunds`, `/legal/shipping`, `/legal/cannabis-disclaimer`
- Shared layout component `LegalPage` (cream surface, Fraunces H1, "Last updated" line, prominent amber/sage placeholder banner: *"This is a placeholder. Final legal copy to be reviewed by qualified counsel before launch."*). Mirrors `/about` chrome.
- Structural placeholder content per topic (POPIA-aware sections for Privacy; sections like "Eligibility / 18+", "Order Acceptance", "Pricing", "Risk of Loss" for Terms; etc.). Clearly non-legal-advice wording.
- Each route has its own `head()` meta.

**3B. Footer "Legal" column**
- Add a 4th column to `src/components/layout/Footer.tsx` linking to all 5 pages.
- Add a small lock-icon link to Cannabis Disclaimer next to the existing "18+ · Bred in South Africa" footnote.

**3C. Cookie consent banner**
- New `src/components/layout/CookieConsent.tsx` mounted in `__root.tsx` (after `AgeGate`, below `Toaster`).
- Sticky bottom, cream surface, sage hairline top, dismissible. Hidden once accepted.
- "Manage Preferences" opens a small Dialog with three toggles: essential (forced on, disabled), analytics (off), marketing (off).
- Persists to `localStorage["terps:cookie-consent"]` = `{ accepted, essential: true, analytics, marketing, timestamp }`.
- No actual gating logic yet — pure framework.

---

## 4. Error handling & loading states

**4A. Custom 404**
- Replace the inline `NotFoundComponent` in `src/routes/__root.tsx` with brand-aligned full page: Fraunces "Lost in the field.", body copy, three editorial cards → Shop / Strains / Stockists.

**4B. Top-level error boundary**
- Replace the inline `ErrorComponent` in `__root.tsx` with: Fraunces "Something went off-script.", body, single "Return home" GoldButton. Console.error the error.

**4C. Skeleton loaders** via TanStack Router `pendingComponent` on these routes:
- `/shop` — 6 strain card skeletons
- `/strains` — strain row skeletons
- `/stockists` — map block + list skeleton
- `/account/orders` — 3 order row skeletons
- `/wholesale/dashboard` (index) — 4 stat cards + recent orders skeleton
- `/wholesale/dashboard/catalog` — 4 card skeletons
- `/wholesale/dashboard/orders` — order row skeletons
- Use existing `<Skeleton>` primitive (`src/components/ui/skeleton.tsx`) tinted cream, subtle pulse. Skeletons only show during real loads (route's existing `pendingMs` default already avoids flashes on cached data).

---

## 5. Favicon & PWA manifest

**5A. Favicon set** in `public/`:
- `favicon.ico` (multi-res), `apple-touch-icon.png` (180×180, rounded), `icon-192.png`, `icon-512.png`.
- Design: cream background, sage "T" mark derived from the existing Sansita Swashed wordmark.
- Generated via `imagegen` (premium for legibility) then converted/resized using `nix run nixpkgs#imagemagick` for the .ico multi-res.

**5B. Manifest**
- `public/manifest.json` exactly as specified.
- In `__root.tsx` `head().links`: add `{ rel: "manifest", href: "/manifest.json" }`, `{ rel: "icon", href: "/favicon.ico" }`, `{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" }`.
- Add `{ name: "theme-color", content: "#5C6650" }` to root meta.

---

## Technical notes

- `PUBLIC_SITE_URL` constant centralised in `src/lib/seo.ts`; everything (sitemap, OG urls, robots.txt) imports from it. Default `https://terps2.carbonmediasolutions.com`.
- Strain detail SEO requires the loader to return the strain so `head({ loaderData })` can read name/tagline/THC/image. Current route already loads it — confirm and wire `loaderData` through.
- All new components honour design tokens in `src/styles.css`; no raw hex except in `manifest.json` and generated assets.
- Mobile QA at 375px for: legal pages, 404, error boundary, cookie banner (must not cover header cart icon or any primary CTA).

## Acceptance verification

After build:
1. View-source on `/`, `/shop`, `/strain/green-crack`, `/stockists`, `/strains`, `/about`, `/wholesale` — confirm unique title/desc/OG/Twitter tags and Product JSON-LD on the strain page.
2. `curl /sitemap.xml` and `/robots.txt` — valid output.
3. Each legal route renders with placeholder banner; footer links navigate; lock icon link works.
4. First visit shows cookie banner; Accept persists in localStorage; Manage Preferences modal works.
5. Hit `/strain/does-not-exist` → custom 404. Throw an error in a route → branded error page.
6. Favicon visible in tab; iOS "Add to Home Screen" uses apple-touch-icon; `manifest.json` parses.
7. Approval webhook with wrong secret returns 401; with right secret still works (manual curl test).
8. `cat .gitignore | grep '^\.env'` returns a match.