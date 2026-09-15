# Terpenes page, product layout, reviews and a joints-sold counter

The reference images are used for layout structure only. No Smokey branding, wording, artwork, ratings, names or delivery promises are copied. Everything is an original Terps interpretation in the existing cream design with black accents. No THC/CBD, potency, batch, laboratory or health claims are introduced anywhere.

## 1. Terpene page — "Understanding terpenes."

Restructure `/strains` so it reads visually rather than as a wall of text.

- **Intro** — heading "Understanding terpenes." with a neutral explanation: terpenes are aromatic compounds that contribute to a strain's aroma and flavour.
- **Three cards** — Aroma (contributes to a strain's scent), Flavour (contributes to the flavour profile), Composition (different strains contain different terpene combinations). No "synergy", no "entourage effect", no therapeutic language.
- **Terpene cards** — one per terpene in the database: original ingredient illustration, name, aroma/flavour words, short neutral description, and links to the Terps strains that contain it. No percentages, no promised effects.
- **Flavour tiles** — Citrus, Berry, Tropical, Pine/Wood, Floral, Earthy, Spicy, Sweet. Every tile filters to real matching strains; nothing is a dead control.
- Existing educational FAQs stay, trimmed.

Ingredient images are generated as original Terps-consistent assets with meaningful alt text. No product photography is invented.

## 2. Product page order

1. Breadcrumbs
2. Gallery
3. Name and category
4. Short summary
5. Average rating and review count — only once approved reviews exist
6. Price, stock state, quantity, Add to Cart (or Notify Me)
7. About this product
8. Flavour words, effect classification, terpene names (no percentages, no medical claims)
9. Caviar infusion components where relevant
10. Customer reviews
11. Find a stockist and collection links

The removed profile tables, medical panels, lab/potency/batch data, lineage walls and badge strip stay removed.

## 3. Reviews

- Only signed-in retail customers with a paid, non-cancelled, non-refunded order containing that product can submit. Guests must create an account and claim their order first (that flow already exists).
- One review per customer per product. Rating is a whole number 1–5. Body has a sensible minimum and maximum length. HTML and scripts are stripped; content renders as plain text.
- Submissions and edits are rate-limited.
- Display shows first name plus surname initial, or "Verified customer". Never the email, order number or account ID. The verified-purchase mark is decided on the server, never sent from the browser.
- No seeded or fake reviews, ever.

Moderation safety (full dashboard still out of scope):

- Status is `pending`, `approved` or `rejected`; new reviews start `pending`.
- Only approved reviews are publicly visible and only they affect averages.
- Editing an approved review sends it back to `pending`.
- Approval/rejection is admin or service-role only through existing backend tooling; customers cannot approve anything, and the public cannot read pending or rejected reviews.
- Timestamped moderation trail kept.
- A report-review action ships with the feature.

Privacy Policy and Terms gain a short passage explaining that submitted reviews may be shown publicly after moderation, kept marked for legal review.

## 4. Rating aggregates

Averages and counts come from approved reviews only, with no order or customer data exposed. Products with none say "No reviews yet" rather than showing zero stars. The breakdown totals equal the approved review count exactly. Reviews load separately so the buy area never waits on them.

## 5. "Terps joints sold" counter

Compact counter in the header, counting purchases only — never cart additions.

- Units from verified paid orders only; failed, cancelled, refunded, test and fixture orders excluded.
- Retail counts individual joints. Single-strain wholesale boxes count boxes × units per box. Mixed boxes count their exact component quantities.
- Webhook replays and orders appearing in more than one payment/audit table never double-count.
- Only the single aggregate number is returned; no customer, order or revenue data.
- Documented cache with a controlled refresh interval, and the number moves after a newly verified payment.
- Baseline stays at zero in one configurable server-side setting until you give me a documented historical figure. No animated or simulated increments, no "around South Africa" or "around the world" claims. If the total is zero it either shows zero honestly or stays hidden until the first paid unit.
- Stays compact on mobile without wrapping, overflowing or covering navigation.

## Technical notes

- New table `product_reviews`: customer, strain, rating, body, status, moderation timestamps, plus a `review_reports` table for the report action. Row-level security: public read of approved rows only; insert/update restricted to the owning customer and gated by a security-definer function that confirms a paid, non-cancelled, non-refunded order containing that strain; status transitions to approved/rejected restricted to admin/service role.
- Aggregates and the joints-sold total come from narrowly scoped security-definer functions returning only numbers, with execute limited to the roles that need them.
- Counter total sums paid retail order items plus wholesale single and mixed-box component quantities, keyed off the same paid-status idempotency the payment webhook already uses.
- Terpene ingredient assets are generated project assets mapped by terpene slug; flavour tiles reuse the existing strain filter helpers.
- Product page keeps its current server functions; reviews and aggregates load in their own queries.

## 6. Testing and reporting

Evidence for: anonymous submission blocked; non-purchaser blocked; qualifying purchaser succeeds; cross-account create/edit fails; duplicate review fails; invalid rating fails; unsafe HTML stored and rendered safely; new review pending and publicly invisible; approved review appears and updates aggregates; edit returns to pending; rejected review stays private; aggregate and breakdown correct; counter ignores cart additions; counter ignores failed, cancelled, refunded and fixture orders; counter counts retail, single-strain and mixed-box quantities correctly; webhook replay does not increase it; terpene flavour links reach real filtered results; purchase and Notify Me flows intact; wholesale pricing and mixed-box security unchanged; no horizontal overflow at 390/768/1440; no critical console errors.

Report returns the preview URL, changed files, migrations, security policies, screenshots and a PASS/FAIL/BLOCKED matrix. Nothing is published to production.

## Out of scope

Moderation dashboard, review replies, photo reviews, review request emails, and any change to delivery pricing, VAT or payment configuration.
