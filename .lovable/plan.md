# Phase 1 — Audit, Complete, Verify

Most of Phase 1 already exists and works (retail catalogue, cart, checkout, orders, accounts, wholesale portal with protected box pricing, Strain Library, legal pages, age gate, first-visit prompt). This pass closes the verified gaps, removes remaining fake content, moves fee/tax settings into one place, and then runs the full acceptance test suite.

## What I verified before writing this

- Six placeholder stockists are live and public, all with fake `555` phone numbers (The Divine Collective, Herb House, The Greenroom, Terp Bar, Flavor Room, The Pre-Roll Co.).
- Retail delivery fee R80 / free over R500 is hard-coded inside the checkout server code, not in the settings file. Wholesale R250 and a 15% VAT rate do sit in the settings file.
- No email key and no payment credentials are stored in the project, so email sending and BobPay checkout cannot be verified live yet.
- Product pages already avoid THC/CBD, batch, lab and medical claims. But "Lab Verified" still shows in a homepage/section badge strip, the site's own search-result description still says "Live rosin. Lab verified.", and the cart still labels every item "Live rosin".
- Stockist page still says "We work with curated dispensaries across SA."
- Wholesale accounts have no map-listing opt-in fields at all, so the map eligibility rule does not exist yet.
- Order detail has a dead "Download Invoice · Coming Soon" button.
- No guest-order claiming exists when a customer registers with an email that placed guest orders.
- Stockist search has no suburb/city alias matching (so "JHB" finds nothing).

## Work to do

### 1. Remove remaining fake and unverifiable content
- Deactivate the six placeholder stockists (reversible: set inactive, no deletion) and confirm the finder shows an honest empty state with "Become a stockist" and contact actions.
- Remove the "Lab Verified" badge, fix the site description to drop "Live rosin. Lab verified.", remove the blanket "Live rosin" label from cart lines (Caviar Stix copy keeps live rosin, which is correct).
- Replace the "curated dispensaries" line with: "Interested in carrying Terps as a retailer? Create a stockist account to access wholesale ordering."
- Remove the dead invoice button.

### 2. One settings source for money
- Move retail delivery fee and free-delivery threshold into the shared settings file, read by both the checkout page and the server, and mark all four commercial values (R80, R500, R250, VAT status) as pending owner confirmation in comments and in the launch-blocker list.
- Make the VAT rate switchable in one place so wholesale totals show no VAT until registration is confirmed. I will not change the current 15% behaviour without your confirmation — flag only.

### 3. Stockist map listing (missing feature)
Additive migration on wholesale accounts: map opt-in flag, public store name, public address, public phone, and a listing state. A stockist becomes publicly visible only when they opted in, supplied complete public details, and have a successfully paid wholesale order. Registration step 2 gains the opt-in checkbox with conditional required fields and a plain explanation of when and how the listing appears. Map opt-out keeps the business fully private; personal signup data is never exposed publicly.

### 4. Stockist finder search
Add suburb/city/province alias matching (JHB → Johannesburg, Jozi, CPT → Cape Town, PTA/Tshwane → Pretoria, Durbs → Durban, plus province abbreviations), keeping existing filters, geolocation, nearest-first sorting and marker selection.

### 5. Customer account completeness
- Claim prior guest orders when a customer registers or signs in with a matching email (server-side, address-scoped, one-time).
- Verify redirect-back-after-login for protected account routes, address CRUD, marketing opt-in/out, and that account deletion keeps order records while removing profile data.

### 6. Email and payment readiness
Wire the remaining pieces so nothing is missing except the credentials themselves: verify the sender name "Terps", reply-to sales@terpsnation.co.za on every send, newsletter confirmation/success feedback, and that every failure is logged loudly without leaking secrets. Payment and email credentials are external inputs; I will request them when you are ready, and until then these journeys are tested with clearly labelled test fixtures and reported as blocked, not passing.

### 7. Legal wording
Soften or remove any statement that adult-use commercial sale is lawful, keep delivery-only wording consistent in Terms/Refunds/Shipping, ensure the privacy page names the actual services used, add legal links at checkout, and mark every legal page as awaiting owner/legal review.

### 8. Security and isolation audit
Re-verify row-level security on every user-facing table, confirm wholesale pricing is unreachable for anonymous and retail users, confirm cross-account reads fail, confirm webhook signature rejection and replay idempotency, and confirm no secret appears in browser bundles or responses.

### 9. Full acceptance test run
Retail journey (guest and signed-in, single order, single stock decrement, failed/cancelled payments leave stock alone), customer account journey, wholesale journey (mandatory-only and optional-details signup, immediate access, minimum order, map rules), engagement (newsletter dedupe, notify-me dedupe, no restock sending), and responsive/accessibility checks at 390px, 768px and 1440px.

## Technical notes

- Migrations are additive only: new nullable columns on `wholesale_accounts` plus a listing-eligibility helper; placeholder stockists are set `is_active = false` rather than deleted. No table drops, no data resets.
- Guest-order claiming runs in an authenticated server function using the verified session email; RLS policies for `orders` are widened only to `customer_id = auth.uid()` rows.
- Public stockist reads keep the existing narrow column projection; new map fields are exposed only through the same public projection once eligible.
- Fee/VAT constants centralise in `src/lib/brand.ts`; `checkout.functions.ts` and `wholesale.functions.ts` import them so server totals stay authoritative.
- Alias matching is a client-side lookup table applied to the existing filter; no schema change.
- Phase 2 items (admin dashboard, restock sending, discounts, exports, chatbot, reviews) stay out.

## Known launch blockers (external inputs)

Payment credentials and BobPay approval for the Terps merchant entity and final domain; email sending domain verification and key; real stockist list with addresses, phones, coordinates and hours; confirmation of VAT registration; confirmation of R80/R500 retail and R250 wholesale delivery; courier details; final legal sign-off; approved photography for any remaining stock imagery.
