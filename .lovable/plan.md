# Terps — Call follow-ups (8 Sep)

Cosmetic and copy pass from this morning's call, plus the email domain fix, the first-visit popup and the Strain Library page. No pricing or payment changes.

## 1. Email domain fix

Every address changes from `terpnation.co.za` to `terpsnation.co.za`:
- `sales@terpsnation.co.za` (contact, footer, internal order notices)
- `orders@terpsnation.co.za` (default sender on outgoing mail)

Every outbound email also sets reply-to `sales@terpsnation.co.za`, so a customer or stockist replying lands in your inbox. Done in one place so nothing is missed. Mail still won't actually leave the site until the sending key is added and `terpsnation.co.za` is verified.

## 2. Homepage

Final order: **Hero → Infused Pre-Rolls → Caviar Stix → Drop Alerts → Footer.** Nothing else.

1. **Hero** — remove the "Terps." wordmark above "Flavour first."; keep the headline and surrounding text, positioned to suit the new background photo. Extra top padding on mobile so the logo isn't squashed against the top of the screen.
2. **Infused Pre-Rolls** — big bold heading "Infused Pre-Rolls", smaller subheading "The only premium infused pre-roll you need.", description "Premium flower hand infused with cured hash and crumble, each checked by hand." Tiles swap to the lifestyle photos.
3. **Caviar Stix** — stays on the **black** background (the site's accent, agreed 3 Sept). Heading "Caviar Stix", subheading "Cream of the crop" (smaller), description "Taking our infused pre-rolls to the next level. Coated with live rosin and sprinkled with a generous amount of hash." No height equalising here.
4. **Drop Alerts** — kept, but the "Stay close" label and the "Quiet emails. New flavours…" line are removed.

Removed from the homepage entirely: "The Craft — built slowly, built once" (its three cards move to Our Story), all quote banners, the "Follow Terps" social section (the footer covers it), the "Stock Terps in your store" band, and the Strain Library block. There is **no** stockist block on the homepage — the header tab and the popup replace it.

**Header, site-wide:** black background in both states (top of page and scrolled), light text and icons, logo about 1.5× its current size. Mobile top padding fix included, plus the phone top-crop fix on the logo.

**Product galleries:** both product blocks get a small gallery built from the new shoot photos (the numbered selections from Dean's folder — 47, 48, 56, 110, 115–119, Divine Matcha 62, Terps 23), replacing the cartoon/AI-style product artwork everywhere it appears.

*Note on the shared notes:* they say keep "Discover the Collection" and "Our Story" on the homepage; your correction sets the final order above, so those two blocks come off the homepage and the header tabs carry them instead.


## 3. First-visit popup (homepage only)

Message: "First time here? Sign up to become a stockist, or continue shopping." Two buttons — stockist sign-up and continue shopping. Shown once per visitor and remembered.

Rules:
- Homepage only.
- Only after the age check is confirmed **and** the cookie banner has been handled, then a 2-second delay.
- Never shown to someone signed in with a stockist account.
- Escape and the × dismiss it and count as seen.
- On phones both variants appear as a bottom sheet; the side variant sits clear of the cookie banner.
- A hidden `?visitorPrompt=1` link forces it open for screen recording, and does nothing on the live site.

Two variants to choose from: centre modal and slide-in side panel.

## 4. Navigation

- The existing "Strains" tab is renamed **Strain Library** (same address). No extra tab.
- Add a top-level stockist tab so it's easy to find: "Become a Stockist", or "Stockist Portal" once signed in.

## 5. Strain Library page

- Heading "Strain Library"; the existing "language of flavour" intro and terpene copy stay, followed by an "Understanding terpenes" explainer.
- Effect-category chips stay.
- Lists **every active strain regardless of stock**, with out-of-stock clearly marked.
- **FAQ accordion** at the bottom, six starter questions (drafted by me, for you to refine): what is an infused pre-roll; what is a Caviar Stix; what's the difference between them; how do I store them; where can I buy Terps; how do I become a stockist.
- **THC % and batch number removed everywhere they appear** — strain cards, product cards and product detail pages. Strain name, weight and effect category stay.

## 6. Wholesale / stockist page

- Background image swapped.
- Three steps become **two**: 1. Create your stockist account. 2. Sign in to your portal, browse box pricing, place orders. All "we'll review / waiting for approval / tell us about your store" wording goes.
- **"What you get" is four cards**: the customer-routing card unchanged, "Box pricing across the full collection", "Early access to new product drops", "Marketing material for your socials". "Real margin for real retailers" and every "curated" removed.
- **Sign-up form**: the "Tell us about your store." step becomes "Your details". Only required fields show by default — business name, business type, contact name, email, phone, address line 1, city, province. Trading name, VAT number, registration number, monthly volume, address line 2 and postal code sit behind one "Add optional details" toggle.
- Sweep the whole site for "48 hours" and "verification link" and remove every hit; confirm sign-up drops straight into the portal.

## 7. Shop / collection page

- Keep the "✦ The Collection" label and the page heading; headings get heavier weight.
- New collection-header photo behind the page header with a dark overlay for legibility.
- Remove the subline under the heading and the four feature chips.
- Product-group headings read exactly "Infused Pre-Rolls" and "Caviar Stix".
- All product card tiles identical size and aspect ratio, on the same cream background for both lines.
- Remove the header search button (it does nothing today).

## 8. Mobile pass

Once desktop edits land: full sweep at phone widths — header, hero, both product blocks, popup bottom sheet, strain library, FAQ accordion, shop and stockist pages. No sideways scrolling, every button reachable.

## 9. Our Story (/about)

- Remove the photo of JM, the "Four drops, one standard" copy and any batch copy.
- Add a **"The craft"** section built from the three cards taken off the homepage.
- Swap in the new story photos.
- Body copy left as-is, but the text blocks are structured so new copy is a one-line swap when you send it.

## Waiting on you

- The photos (hero, product/lifestyle, collection header, story) — arriving with your approval.
- Wholesale and retail price list.
- New Our Story copy.
- Confirmation that `terpsnation.co.za` is ready so sending can be switched on.

## Not in this pass (Phase 2)

Chat assistant at the bottom of the site, stockist portal extras (marketing-material downloads, discount codes, tasting-event booking), admin dashboard, spin-to-win offer.

## Technical notes

- `src/lib/brand.ts` gains the corrected addresses; `src/lib/email.server.ts` sets the sender default and a `reply_to` on every send.
- Homepage: `src/routes/index.tsx` (blocks deleted, not hidden); `src/components/brand/CaviarStixTeaser.tsx` keeps its dark tone.
- `src/components/layout/Header.tsx`: forced dark surface in both scroll states, larger `Logo` height, nav rename, stockist tab, search control removed, mobile padding.
- New `src/components/layout/VisitorPrompt.tsx` with two variants, `terps:visitor-prompt-seen` flag, gated on age-gate + cookie-consent state, `import.meta.env.DEV`-only query override; rendered from `src/routes/__root.tsx` for `/` only.
- `src/routes/strains.tsx` becomes the full library page (content moved in from the homepage) plus terpene explainer and a shadcn accordion FAQ.
- THC/batch removal: `StrainCard.tsx`, `StrainInformation.tsx`, `shop.tsx`, `strain.$slug.tsx` (data columns untouched).
- `src/routes/wholesale.index.tsx` for cards/steps/form grouping; `src/routes/stockists.tsx` subheading only; `src/routes/shop.tsx` for header image, chips and tile sizing; `src/routes/about.tsx` for §9.
- New photos go in as CDN asset pointers.
- No database or checkout changes. Closes with typecheck, build and a phone-width sweep.
