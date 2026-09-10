# TERPS — Read-Only QA Audit (10 Sep 2026)

No code, data, configuration or deployment was changed. Findings are from source inspection, read-only database queries, live browser checks against the running preview at 390 / 768 / 1280 px, and one unauthenticated read-only API probe. Anything not directly observed is marked UNVERIFIED.

Environment note that colours much of this report: `BOBPAY_MERCHANT_ID`, `BOBPAY_API_KEY`, `BOBPAY_API_URL`, `BOBPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `WHOLESALE_ADMIN_EMAIL` and `PUBLIC_SITE_URL` are **not configured** in this environment. Payment initiation and every outbound email therefore cannot run today, regardless of code quality.

---

## 1. ROUTE INVENTORY

All routes returned HTTP 200 at 390 / 768 / 1280 px with no horizontal overflow and no console errors (only warnings, listed in §19).

| Path | Purpose | Loads | Notes |
|---|---|---|---|
| `/` | Homepage | Yes | See §2 |
| `/shop` | Collection | Yes | Tabs All / Infused Pre-Rolls / Caviar Stix |
| `/strains` | Strain Library | Yes | Nav label is "Strain Library", URL still `/strains`; page title still "Strains · Terps" |
| `/strain/$slug` | Product detail | Yes | 7 slugs live |
| `/about` | Our Story | Yes | |
| `/stockists` | Stockist locator | Yes | |
| `/wholesale` | Become a stockist + signup | Yes | |
| `/wholesale/login` | Stockist sign-in | Yes | |
| `/wholesale/dashboard`, `/catalog`, `/checkout`, `/orders`, `/orders/$id` | Stockist portal | Yes (auth) | Client-side gate only |
| `/account/login`, `/register`, `/forgot-password`, `/reset-password` | Retail auth | Yes | |
| `/account`, `/orders`, `/orders/$orderNumber`, `/addresses`, `/settings` | Retail account | Yes (auth) | Client-side gate only |
| `/checkout` | Retail checkout | Redirects to `/shop` when cart empty (`checkout.tsx:126-129`) | Confirmed live: `/checkout` rendered the shop page in all three viewports |
| `/order/$orderNumber` | Order confirmation | Yes | |
| `/admin/strains/$id/edit` | Strain content editor | Yes (admin gate) | Only admin screen in the app |
| `/legal/terms`, `/privacy`, `/refunds`, `/shipping`, `/cannabis-disclaimer` | Legal | Yes | All carry a visible placeholder warning |
| `/sitemap.xml` | Sitemap | Yes | Dynamic |
| `/api/public/bobpay-webhook`, `/api/public/wholesale-approval-email` | Server endpoints | n/a | |
| unknown paths | 404 | Yes | Branded "Lost in the field." page; browser logs the expected 404 |

**Broken/dead navigation:** none. Every header and footer link resolves to an existing route.

**Unfinished elements found:** "Download Invoice · Coming Soon" disabled button (`_authenticated/account.orders.$orderNumber.tsx:135`); wholesale marketing page promises Early Access and Marketing Material that do not exist in the portal; no `head()` on `_authenticated.tsx` and `wholesale.dashboard.tsx` (they inherit the root title).

---

## 2. HOMEPAGE AUDIT (`src/routes/index.tsx`)

Order as it currently appears:

1. **Hero** — H1 "Flavour first." Sub-copy "South Africa's premium handcrafted infused pre-rolls." CTAs: gold "Discover the collection" → `/shop`; ghost "Our story" → `/about`. Asset: `src/assets/hero-mindspark.jpg` (2.0 MB, parallax still, not video). Functional; visible at all breakpoints.
2. **Infused Pre-Rolls** — label "✦ Infused Pre-Rolls", H2 "Infused Pre-Rolls", italic line "The only premium infused pre-roll you need.", body "Premium flower, hand-infused with cured hash and crumble. Every pre-roll is checked by hand before it's sealed in its tube." Up to 3 photo tiles from live Supabase strains. CTA "Shop the collection" → `/shop`. Functional.
3. **Caviar Stix** (`CaviarStixTeaser.tsx`, dark section) — label "✦ Caviar Stix", H2 "Caviar Stix", italic "Cream of the crop.", body "Taking our infused pre-rolls to the next level. Coated with live rosin and sprinkled with a generous amount of hash." Images `divine-115/116/117`. CTA "Shop the collection" → `/shop`.
4. **Drop Alerts** — H2 "Get word when the next drop lands.", email field, "Notify me", success "You're on the list.", error "Try a valid email." Writes to `subscribers`. Functional (no email sent — §11).

Presence checks:

| Item | Present |
|---|---|
| Large TERPS branding on homepage | No — logo only in the fixed header |
| Extra logo above "Flavour first" | No |
| "Flavour first" | Yes (H1) |
| Hero video | No — still image `hero-mindspark.jpg` |
| Infused Pre-Rolls section | Yes |
| Caviar Stix section | Yes |
| "The only premium infused pre-roll you need" | Yes |
| "Cream of the crop" | Yes (lower-case "crop", full stop) |
| "Craft. Built slowly. Built once." | Not on homepage — lives on `/about` ("✦ The Craft", "Built slowly. Built once.") |
| Quote/testimonial banners | Not on homepage — one pull-quote on `/about`: "We don't chase hype. We chase flavour." |
| Strain Library promotion | No |
| Stockist / wholesale promotion | No section; only the header link and the first-visit popup |
| Newsletter section | Yes, as "Drop Alerts" |
| "Stay Close" | No |
| "Quiet emails, new flavours…" | No |
| "Follow Terps" / social section | No — Instagram link exists only in the footer |
| Search icon/function | No (removed from header) |
| "4 drops" / "4 flavours" / "1 standard" / "Batch 04" / "Limited First Batch" | None anywhere in `src/` |
| "Coming Soon" | Only the invoice button on the account order page |

---

## 3. PRODUCT PRESENTATION

**Infused Pre-Rolls** — heading "Infused Pre-Rolls"; italic subhead "The only premium infused pre-roll you need."; description as quoted above (hash + crumble, no live-rosin claim — correct); real shoot photography (`divine-110/118/119`) plus one older render for Girl Scout Cookie (`product-girl-scout-cookie.jpg`); CTA to `/shop`; **live price R180** each; purchasable end-to-end up to the payment step.

**Caviar Stix** — spelling is "Caviar Stix" everywhere, consistently (no "Sticks", no "STIX"); heading "Caviar Stix"; subhead "Cream of the crop."; description mentions live rosin and hash, which is appropriate for this product; images `divine-115/116/117`; CTA to `/shop`; **live price R350** each; purchasable up to payment.

Terminology sweep (user-facing): "live rosin" appears in `CaviarStixTeaser.tsx:38`, `CartDrawer.tsx:113`, `strains.tsx:94`, and the site-wide default description in `__root.tsx:26`. The phrase "live hash rosin" appears nowhere. "flavour" is used in all visible copy; "flavor" appears only in database column names. No user-facing "THC" or "Batch" strings remain.

Imagery: real shoot photography on homepage, shop header, Caviar, strains grid and About. Remaining non-photographic assets: `product-girl-scout-cookie.jpg` render, `hero-mindspark.jpg`, and rotating 3D product models used on `/shop` and product pages.

**Price expectation mismatch:** brief says pre-rolls R160 and Caviar Stix R210. Live database says **R180** and **R350** for every SKU. This is a data decision, not a bug.

---

## 4. COLLECTION + PRODUCT DETAIL QA

| Area | Status | Evidence |
|---|---|---|
| Collection page | WORKING | `shop.tsx` — photo header, tabs, filters, live Supabase data |
| Product cards | WORKING | `StrainCard.tsx`, `CaviarStixCard.tsx` (now matched sizing/background) |
| Product detail | WORKING | `strain.$slug.tsx` + Product JSON-LD |
| Image gallery / slider | PARTIAL | Single image or single rotating 3D model; no gallery/carousel exists |
| Descriptions & strain info | WORKING | `StrainInformation.tsx` |
| Pricing display | WORKING (values differ from brief) | |
| Stock state | WORKING | sold-out badges from `stock_quantity` |
| Quantity controls | WORKING | `QuantityStepper.tsx`, clamped to stock |
| Add to cart | WORKING | Zustand + localStorage |
| Cart | WORKING | `CartDrawer.tsx`, live totals, R80 delivery, free ≥ R500 |
| Guest checkout | WORKING | `checkout.tsx` |
| Customer login at checkout | WORKING | |
| Order creation | WORKING | Server re-validates price and stock, writes `orders` + `order_items` |
| Payment initiation (BobPay) | NOT CONFIGURED / BROKEN today | Credentials absent; order is created then the user sees "Payments are not yet configured. Please contact sales@…" |
| Webhook / status handling / idempotency / failed payments | WORKING in code, UNVERIFIED live | `bobpay-webhook.ts`; duplicate paid webhook returns early with no stock or email side effects; signature verification is skipped with a warning if the secret is unset |
| Confirmation page | WORKING (paid state UNVERIFIED) | `/order/$orderNumber` renders pending / paid / failed |
| Cart persistence | WORKING | local persistence plus `syncCartOnSignIn()` wired in `__root.tsx:94` |

No real transaction was attempted.

---

## 5. OUT-OF-STOCK / NOTIFY ME

- UI: EXISTS (`NotifyMeModal.tsx`), shown on sold-out products.
- Capture: WORKING — inserts email + strain into `restock_notifications` (`forms.functions.ts:19-29`).
- Notification emails: **NOT IMPLEMENTED.** No code reads that table and no job or trigger sends restock mail. The modal promises an email that nothing currently sends.
- Admin visibility of the list: NOT IMPLEMENTED.

---

## 6. STRAIN LIBRARY

- Route `/strains`, reachable from the header as "Strain Library"; H1 "The language of flavour."
- Shows the six-question FAQ, terpene education content, and a grid of all active strains with sold-out overlays.
- Per-strain detail pages show strain type, effect category, flavour tags, effects / helps-with / negatives, terpene breakdown, lineage, weight and total terpenes.
- **THC percentage: absent from all user-facing copy** (column exists in the database only). Batch numbers likewise removed.
- Cross-links: header nav and product pages; the homepage no longer promotes the library.
- Mobile: loads cleanly at 390 px, no overflow. 3D viewers add several THREE.js deprecation warnings.

---

## 7. STOCKIST LOCATOR

- Provider: Leaflet + react-leaflet with CARTO/OpenStreetMap tiles — **no paid map API key required or configured**; the Google Maps connector is not used. Map renders (verified live, no failed tile requests).
- Data: 6 active stockists (Durban, Cape Town ×2, Johannesburg ×2, Pretoria) with valid coordinates.
- Search: substring match over name/address/suburb/city/postal code. **No autocomplete/suggestions.** Province, strain and "open now" filters work.
- "Use my location": on `/stockists` it calls browser geolocation and silently does nothing if denied — no fallback UI (weak point). The "find closest stockist" modal is better: geolocation → IP lookup via ipapi.co → manual province picker.
- Distance sorting: haversine, working. Markers: custom pins, click syncs list and map. `tel:` links present; no per-stockist email link. Directions open Google Maps.
- Permission accepted / denied paths: UNVERIFIED in a real browser prompt; behaviour above is from implementation reading.
- Mobile: usable at 390 px, no overflow.

---

## 8. BECOME A STOCKIST / WHOLESALE SIGNUP

- Header shows "Become a Stockist" (switches to "Stockist Portal" when signed in as a stockist). Footer has Wholesale and Wholesale Login.
- First-visit popup (`VisitorPrompt.tsx`): homepage only; fires 2 s after both the age gate and cookie consent are set; hidden for existing stockists; label "✦ Welcome to Terps", heading "First time here?", body "Sign up to become a stockist, or continue shopping."; CTA 1 "Sign up for wholesale pricing" → `/wholesale`; CTA 2 "Continue shopping" (dismiss). Stored under `terps:visitor-prompt-seen` with **no expiry** — never shown again on that device. Mobile renders as a bottom sheet.
- Fields — required: email, password (min 8), business name, business type, contact name, contact email, contact phone, address line 1, city, province. Optional behind an "Add optional details" toggle: trading as, estimated monthly volume, VAT number, company registration (CIPC), address line 2, postal code.
- **VAT number: optional.** Company/store info: mandatory (name, type, address).
- **Not collected:** separate delivery address, "tell us about your store" free text, public stockist-map opt-in.
- Approval: **automatic** — the account is written as `approved` at signup. No manual review, no admin approval queue, no email-verification gate before portal access, and **no "48 hours" or "verification link" wording anywhere**.
- After registration: success panel "You're all set…" with a button into `/wholesale/dashboard`; an internal "new stockist" notification email is attempted; a "stockist welcome" email is attempted via the approval webhook and database trigger. Both are no-ops today (no Resend key).

---

## 9. WHOLESALE PRICING + PORTAL

**Critical finding — wholesale pricing is NOT hidden from retail visitors.** The server function correctly gates the wholesale catalog on an approved account, but the `strains` table's read policy is row-level only, so `wholesale_box_price_zar`, `wholesale_minimum_boxes` and related columns are readable through the public data API with the anon key that ships in every page's JavaScript. This was confirmed live with an unauthenticated read. Wholesale prices are not displayed in retail UI, but they are technically public.

Portal status (Phase 1, implemented): login; dashboard; catalog with box price, unit price, box quantity and minimum-boxes enforcement (client and server); wholesale cart; checkout with prefilled address, 15 % VAT and R250 flat delivery; order list and order detail with payment/fulfilment status; account contact/address editing.

Not implemented (marketing promise or future): pricing tiers (single flat box price only), marketing-materials library, new-drop announcements, discount codes, event/tasting booking, saved or repeat orders, admin approval screens. Caviar Stix rows have `wholesale_box_price_zar = NULL`, so they cannot currently be ordered wholesale.

Authenticated portal walkthrough was not re-run in this pass — status is from code and schema reading: UNVERIFIED live.

---

## 10. CUSTOMER ACCOUNTS

Registration WORKING (Supabase sign-up; auto-confirm is enabled, so email verification does not block sign-in). Login WORKING (password and magic link). Logout WORKING. Password reset WORKING (Supabase-managed email — will not deliver without provider config; UNVERIFIED end-to-end). Profile WORKING. Addresses full CRUD WORKING. Order history WORKING. Reorder PARTIAL — re-adds items with a hardcoded weight and stock ceiling, corrected server-side at checkout. Cart persistence WORKING, including merge on sign-in.

---

## 11. EMAIL SYSTEM

- Provider: **Resend**, through a single helper `src/lib/email.server.ts`. `RESEND_API_KEY` is **not set**, so every send returns a loud `missing_api_key` outcome and no mail is delivered. All email statuses below are therefore NOT OPERATIONAL today.
- Sender: `Terps <orders@terpsnation.co.za>`; reply-to `sales@terpsnation.co.za` on every send.
- Implemented types: internal new-stockist notification, stockist welcome, retail order confirmation, internal new-order (retail), wholesale order confirmation, internal new-order (wholesale).
- Supabase-managed (not through Resend): sign-up verification and password reset. Whether those use a custom domain is a project auth setting — UNVERIFIED.
- Not implemented: notify-me/restock email, newsletter send (subscribers are only stored), stockist-request acknowledgement.
- Domain spelling: only `terpsnation.co.za` appears. No "terpnation", "Terp Nation" or "Terps Nation" variants remain in code.

---

## 12. OUR STORY (`/about`)

Sections: hero ("✦ Our Story" / "Flavour first. Always."); narrative body with a pull-quote "We don't chase hype. We chase flavour."; "✦ The Craft" three-card grid — Selected Strains / Extended Curing / Hand Infusion; CTA "Discover the collection". Images: three real shoot photos, all lazy-loaded. No developer/team/placeholder photograph remains. No "4 drops / 1 standard" range messaging. Copy reads as brand-voiced rather than generic AI filler, though it is long. All images use empty alt text.

---

## 13. LEGAL PAGES + AGE GATE

- Age gate: full-screen overlay, enforced client-side only, stored as `terps_age_verified` with a **30-day** expiry; "Exit" sends the visitor to google.com. It reappears after 30 days or if storage is cleared. No server enforcement (UNVERIFIED as a compliance question).
- Cookie consent: `terps:cookie-consent` with accept / granular preferences, stored indefinitely, never re-prompts once accepted. No analytics or marketing scripts are actually gated by those flags because no tracking script is installed.
- All five legal pages have real, on-topic section structure and body copy (POPIA references, refunds, shipping, cannabis disclaimer) **but every page renders a visible banner: "This is a placeholder. Final legal copy to be reviewed by qualified counsel before launch."** Treat as placeholder.

---

## 14. DELIVERY

Courier delivery only. In-store pickup is effectively disabled: the checkout schema accepts `delivery` only and the order is stored as `standard`. Retail shipping is flat **R80, free over R500**, computed client-side and re-computed server-side. Full shipping address is collected and validated. No rate calculator, no zone logic, no placeholder pickup option left in the UI.

---

## 15. PAYMENT / BOBPAY

Integration is genuinely coded, not stubbed: order creation, payment initiation with reference and return/callback URLs, HMAC-verified webhook, paid/failed status handling, stock decrement, idempotent duplicate handling, and confirmation states. However `BOBPAY_MERCHANT_ID`, `BOBPAY_API_KEY`, `BOBPAY_API_URL` and `BOBPAY_WEBHOOK_SECRET` are **not configured**, so today a customer completing checkout gets an order record and the message "Payments are not yet configured. Please contact sales@terpsnation.co.za." Environment (test vs live) is therefore undetermined — UNVERIFIED. If the webhook secret is left unset in production, the handler accepts unsigned callbacks with only a log warning — that must not ship.

---

## 16. ADMIN / BACKEND

| Capability | Status |
|---|---|
| Strain content (name, story, lineage, effects, flavours, terpenes) + AI auto-fill | WORKING (`/admin/strains/$id/edit`) |
| Product images | NOT IMPLEMENTED |
| Pricing | NOT IMPLEMENTED |
| Inventory / stock | NOT IMPLEMENTED |
| Orders | NOT IMPLEMENTED |
| Customers | NOT IMPLEMENTED |
| Wholesale customers | NOT IMPLEMENTED (self-service only) |
| Stockists | NOT IMPLEMENTED |
| Stockist map visibility | NOT IMPLEMENTED |
| Coupons | NOT IMPLEMENTED (no table) |
| Newsletter | PARTIAL (capture only, no list/export/send) |
| Notify-me subscriptions | PARTIAL (capture only) |
| Site content / CMS | NOT IMPLEMENTED (copy hardcoded) |
| Terpenes | PARTIAL (read-only) |
| Reports / exports | NOT IMPLEMENTED |
| Shipping config | NOT IMPLEMENTED |

Admin access is decided by a `role: "admin"` value in the auth user's metadata; there is **no roles table and no `has_role()` function**, which is weaker than the recommended pattern. Day-to-day operations (orders, stock, prices, stockists) currently require direct backend access rather than an admin UI.

---

## 17. MOBILE QA (390 / 768 / desktop)

Measured across 16 routes at each width: every page 200 (404 route excepted), **no horizontal scrolling anywhere**, no broken images once scrolled into view, no console errors. Header, hero, product cards, product pages, Strain Library, stockist map, forms and footer all render. Age gate, cookie banner and wholesale popup appear as intended.

Observations rather than measured failures: the 3D product viewers are the heaviest element on mobile and log deprecation warnings; the homepage hero image is 2.0 MB; several product videos in `public/` are 1.9–2.8 MB and `public/hero.mp4` is 34 MB and no longer referenced by any code (dead weight in the repo). Tap-target sizes, text wrapping at very small widths and layout shift were not measured numerically — UNVERIFIED.

---

## 18. UX + VISUAL QUALITY

Aligned with the brief: cream foundation with deliberate dark sections, editorial type, real photography leading, homepage reduced to four sections, no stock-photo clichés.

Weak points:
- Product presentation is inconsistent: some products show real photography, one shows an older render (Girl Scout Cookie), and product pages show a spinning 3D tube — three different visual languages for the same range.
- Body copy is wordy in places (About narrative, wholesale benefit cards); the brand voice would read stronger with fewer words.
- Repeated "Shop the collection" gold button in three consecutive sections feels templated.
- No single-product hero moment — nothing on the homepage shows one pack at scale.
- The Drop Alerts block is a plain form and currently the least designed section on the page.
- Legal pages carrying a visible "placeholder" banner will read as unfinished to any client who clicks them.
- Rotating 3D models are the one over-animated element; they also add the only console noise.

---

## 19. TECHNICAL QA

- Console: no errors on any route. Warnings only — a framer-motion scroll-container warning on `/` and repeated `THREE.Clock` deprecation warnings wherever a 3D model renders.
- Network: no failed requests other than expected aborted 3D-model/blob loads when a viewer unmounts, and the deliberate 404 test.
- Images: none permanently broken; lazy-loaded shoot photos simply had not decoded yet at first paint on mobile.
- Alt text: **every content image uses empty `alt=""`** — poor for accessibility and image search.
- Headings: one H1 per page, sensible hierarchy.
- Metadata: unique title/description/OG/Twitter on all content routes via `seoMeta()`; `_authenticated.tsx` and `wholesale.dashboard.tsx` have no `head()` (private pages, low impact).
- **No canonical tags anywhere** — should be added before launch, especially with a preview domain, a `lovable.app` domain and a custom domain all serving the same site.
- Sitemap dynamic and working; robots.txt present and sensible; favicon/PWA assets complete.
- Performance: multi-MB hero and product assets, plus 3D model downloads, are the main risk on mobile data.

---

## 20. FINAL REPORT

### A. Executive summary — completion estimates
- Visual/design: **85 %**
- Homepage: **90 %**
- Retail e-commerce: **75 %** (blocked at payment)
- Wholesale: **70 %**
- Stockist locator: **85 %**
- Content: **65 %** (legal placeholders, price decisions, mixed imagery)
- Mobile: **90 %**
- Technical/production readiness: **55 %**
- **Overall Phase 1: ~72 %**

### B. Working correctly
Homepage structure and copy; header/footer navigation with no dead links; shop with tabs and filters; product detail pages with strain and terpene information; cart with live totals and delivery rules; guest and signed-in checkout up to payment; server-side price and stock re-validation; order creation and confirmation states; retail accounts (registration, login, logout, reset, profile, addresses, order history, cart merge); stockist locator with real map, 6 stockists, filters and distance sorting; wholesale signup, instant approval, portal, catalog with box pricing and minimum boxes, wholesale cart, checkout, order history; age gate and cookie consent; branded 404 and error pages; sitemap, robots, favicon/PWA; per-route metadata; responsive behaviour at all three widths.

### C. Partially complete
Product imagery consistency; single-image product galleries; notify-me (capture only); newsletter (capture only); reorder (hardcoded weight/stock); wholesale portal versus its marketing promises; wholesale Caviar Stix box pricing missing; admin surface (strain copy only); stockist "use my location" with no denial fallback on `/stockists`; Supabase-managed auth emails.

### D. Missing / broken before Phase 1 can be called finished
1. BobPay credentials — no customer can pay today.
2. Resend key — no email of any kind is delivered.
3. Wholesale box pricing readable by the public data API.
4. Legal pages still labelled placeholder.
5. Retail prices in the database do not match the stated R160 / R210.
6. Notify-me sends no email.
7. No admin UI for orders, stock, prices or stockists.
8. Webhook signature secret unset (must be required in production).
9. No canonical tags.
10. No descriptive image alt text.

### E. Content / client input required
Final retail prices per line; whether Caviar Stix is sold wholesale and at what box price; approved legal copy (terms, privacy, refunds, shipping, disclaimer) from counsel; replacement photography for Girl Scout Cookie and a decision on 3D-versus-photo product treatment; confirmed hero asset (still or video); real stockist list for launch; whether VAT number should become mandatory; whether stockists must be manually approved rather than instantly; social handles beyond Instagram; whether a public stockist-map opt-in and "tell us about your store" field are wanted; BobPay merchant credentials and environment; sending domain verification for email.

### F. Phase 2 / future
Pricing tiers, discount codes, marketing-materials library, drops calendar, event/tasting booking, saved/repeat wholesale orders, invoice PDFs, reports and exports, a CMS for site copy, restock-email automation, stockist self-service map opt-in, richer product galleries, analytics/pixel integration.

### G. Top 10 priorities
1. Configure and test BobPay end-to-end, with the webhook secret mandatory.
2. Configure Resend and verify the sending domain; test all six email types.
3. Close the wholesale-price exposure on the public data API.
4. Set final retail and wholesale prices in the database (including Caviar Stix box price).
5. Replace legal placeholders with approved copy and remove the banner.
6. Build a minimal admin console for orders, stock and prices.
7. Implement restock notification emails, or soften the notify-me promise.
8. Standardise product imagery across homepage, shop and product pages.
9. Add canonical tags and descriptive alt text.
10. Trim asset weight (2 MB hero, product videos, unused 34 MB `hero.mp4`) and reconsider 3D on mobile.

### H. Files / components likely to require changes
`src/lib/checkout.functions.ts`, `src/routes/api/public/bobpay-webhook.ts`, `src/lib/email.server.ts`, `src/lib/forms.functions.ts`, `src/lib/wholesale.functions.ts` and the `strains` read policy/grants, `src/routes/legal.*.tsx` + `src/components/layout/LegalPage.tsx`, `src/lib/seo.ts`, `src/lib/strain-assets.ts`, `src/components/brand/StrainCard.tsx` / `CaviarStixCard.tsx` / `Product3DViewer*.tsx`, `src/routes/stockists.tsx` (geolocation denial), `src/routes/admin.*` (new admin screens), `src/components/brand/NotifyMeModal.tsx`, `public/` assets. No changes were made.

### I. Recommendation

**READY FOR CLIENT VISUAL REVIEW, BUT NOT FUNCTIONALLY COMPLETE.**

Visually and structurally the site is close to launch quality: every page loads, navigation is clean, the homepage follows the agreed structure, real photography leads, and nothing is broken at phone, tablet or desktop width. Functionally, though, the two things that make it a business — taking payment and sending email — are unconfigured, so no order can be paid for and no confirmation reaches anyone. There is also a real security gap in wholesale pricing being readable publicly, the legal pages still declare themselves placeholders, and the prices on the site do not match the prices stated in the brief. Show it to the client for look, feel and copy now; do not present it as transactable until payment, email, pricing and the data-exposure fix are done.
