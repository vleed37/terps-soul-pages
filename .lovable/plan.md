# Terps — Call follow-ups (8 Sep)

Cosmetic and copy pass from this morning's call, plus the email domain fix and two new pieces (first-visit popup, Strain Library page). No pricing or payment changes.

## 1. Email domain fix

Every address changes from `terpnation.co.za` to `terpsnation.co.za`:
- `sales@terpsnation.co.za` (contact, footer, internal order notices)
- `orders@terpsnation.co.za` (default sender on outgoing mail)

Done in one place (`src/lib/brand.ts` plus the sender default), so nothing is missed. Mail still won't actually leave the site until the Resend key is added and `terpsnation.co.za` is verified — that stays on the outstanding list.

## 2. Homepage restructure

Order after the change:

1. **Hero** — remove the "Terps." wordmark above "Flavour first."; keep the headline and surrounding text, positioned to suit the new background photo once it arrives. More top padding on mobile so the header logo isn't squashed against the top of the screen.
2. **Infused Pre-Rolls** — big bold heading "Infused Pre-Rolls", smaller subheading "The only premium infused pre-roll you need.", description "Premium flower hand infused with cured hash and crumble, each checked by hand." Product tiles swap to the lifestyle photos.
3. **Caviar Stix** — heading "Caviar Stix", subheading "Cream of the crop" (smaller), description "Taking our infused pre-rolls to the next level. Coated with live rosin and sprinkled with a generous amount of hash." Cream background to match the pre-roll block, and both blocks made the same height.
4. **Stockists** — kept.
5. **Drop alerts** — kept, but the "Stay close" label and the "Quiet emails. New flavours…" line are removed.

Removed from the homepage entirely: the four small feature chips under the pre-roll heading, "The Craft — built slowly, built once", all quote banners, the "Follow Terps" social section (footer already covers it), the "Stock Terps in your store" band at the bottom, and the Strain Library block.

The "selected strains / extended curing / hand infusion" copy moves into Our Story rather than being thrown away.

## 3. First-visit popup

Shown once per visitor (remembered, so it doesn't nag), after the age check: "First time here? Sign up to become a stockist, or continue shopping." Two buttons — stockist sign-up and continue shopping.

Two versions built so you can choose from a screen recording:
- centre modal
- slide-in panel from the side

## 4. Navigation

Add a top-level tab so becoming a stockist is easy to find instead of buried at the bottom, alongside the existing tabs. It reads "Become a Stockist", or "Stockist Portal" once someone is signed in.

Also add a **Strain Library** tab.

## 5. Strain Library page

The strain library moves off the homepage to its own page: heading "Strain Library", the existing "language of flavour" intro and terpene copy kept, the list of strains with their terpenes and effects, then an "Understanding terpenes" explainer below. FAQs are not included for now.

On the strain cards: remove the batch number and THC percentage lines (we don't have those yet); keep strain name, weight and effect category.

## 6. Wholesale / stockist page

- Background image swapped (once supplied).
- Three steps become **two**: 1. Create your stockist account. 2. Sign in to your portal, browse box pricing, place orders. All "we'll review / waiting for approval / tell us about your store" wording goes.
- "What you get" trimmed to two cards: box pricing across the full collection, and early access to new product drops. Remove the "real margin for real retailers" and "curated" lines.
- Stockists line becomes "Stocked at premium retailers across South Africa" — drop "each one personally selected".

## 7. Shop / collection page

- Remove the duplicated "The Collection" label above the heading; keep the section headings but bolder.
- Rename the pre-roll category to "Infused Pre-Rolls".
- Remove the search button in the header (it does nothing today).
- Product images swap to the new photos.

## 8. Mobile pass

Once the desktop edits land: full sweep at phone widths — header spacing, hero text, the two product blocks, popup, strain library and stockist page. No sideways scrolling, every button reachable.

## Waiting on you

- New hero photo (the burning Caviar Stix with the smoke trail on black) and the lifestyle product/Our Story photos — I'll hold the layout with current images until you paste them here.
- Wholesale and retail price list.
- Our Story written copy.
- Confirmation once `terpsnation.co.za` is ready so I can switch the sending on.

## Not in this pass (noted for later)

Chat assistant at the bottom of the site, FAQ section, stockist marketing-material downloads / discount codes / tasting-event booking in the portal, admin dashboard, spin-to-win offer. These stay on the Phase 2 list.

## Technical notes

- `src/lib/brand.ts` gains the corrected addresses; the sender default in `src/lib/email.server.ts` follows.
- Homepage work is in `src/routes/index.tsx`, with removed blocks deleted rather than hidden; `src/components/brand/CaviarStixTeaser.tsx` gets the new copy and cream surface.
- New `src/components/layout/WelcomePopup.tsx` with two variants behind a flag, stored under `terps:welcome-seen`; rendered from `src/routes/__root.tsx` after the age gate.
- New route `src/routes/strains.tsx` becomes the full library page (it already exists — content moves in from the homepage), plus terpene explainer copy.
- `src/components/layout/Header.tsx`: nav array gains Strain Library, search control removed, mobile top padding adjusted.
- `src/routes/wholesale.index.tsx` and `src/routes/shop.tsx` for the copy/step changes.
- No database or checkout changes. Closes with typecheck, build and a phone-width sweep.
