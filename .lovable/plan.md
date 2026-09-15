# Terpenes page, product layout, reviews and a live counter

Four changes, based on the reference layouts you sent. The Terps cream design stays; nothing about pricing, payments, wholesale security or stock handling changes.

## 1. Terpene page — visual, not text-heavy

Restructure `/strains` so it reads like a guide instead of a wall of copy:

- **Top: "Understanding terpenes."** Short intro plus three small cards — Aroma, Effects, Synergy — with one line each.
- **Featured terpenes.** One card per terpene (eight in the database) with a generated ingredient image (lemon, mango, pine, lavender, pepper, hops and so on), the name, its flavour words, and its short descriptor. Each image gets alt text so the page still makes sense read aloud.
- **Terpenes by flavour.** A row of flavour tiles — Citrus, Berry, Tropical, Pine, Floral, Earthy, Spicy, Sweet — each linking into the matching strains.
- **Which terpenes are in your favourite flavour?** A compact grid pairing an everyday flavour with the terpenes behind it.
- Existing educational FAQs stay, trimmed. No potency, lab or medical claims — that rule is unchanged.

I generate the ingredient images and save them as project assets. No product photography is invented.

## 2. Product page layout

Reordered to match your description, using the sections that already exist:

1. Photo gallery, name, short summary line, price, quantity, **Add to Cart** (or Notify Me when out of stock) — everything needed to buy, above the fold.
2. **About this product** — the fuller description, flavour notes, effect words, and the terpenes in that strain (names and flavour words only, no percentages), plus the Caviar infusion components where relevant.
3. **Reviews.**
4. Stockist finder and collection links at the end.

## 3. Customer reviews — verified buyers only

- Signed-in customers can rate 1–5 stars and write a short review, but only for a product they have actually bought on a paid order. Everyone else sees the reviews and a prompt to sign in.
- Each review shows the reviewer's first name, a "Verified purchase" mark, the rating, the text and the date.
- The product page shows the average rating and review count near the name, and the full list lower down with a rating breakdown.
- One review per customer per product, editable by that customer, and no anonymous submissions.

## 4. "Joints sold" counter

A slim counter in the site header showing total joints sold — counting units from **paid** orders only (retail units plus wholesale box units), added to a starting number.

I need one thing from you: **the starting number** to seed it with. Until you give me a figure I will build it counting paid orders only and leave the baseline at zero, so the number is always honest.

## Technical notes

- New table `product_reviews` (customer, strain, rating, body, timestamps) with row-level security: public read of approved reviews; insert/update only by the signed-in customer, and only when a paid order containing that strain exists for them. Verification runs in a security-definer database function, so the browser cannot fake a purchase.
- Rating aggregates read through a public view/function so anonymous visitors can see averages without exposing order data.
- Counter total comes from a security-definer function summing units on `orders`/`order_items` and `wholesale_order_items` where payment status is paid, plus a configurable baseline constant. Cached client-side and refreshed periodically — no per-render database hit.
- Terpene ingredient images become project assets referenced from the terpenes data by slug.
- Product page keeps its current server functions; the reviews block loads separately so the buy area never waits on it.
- Regression pass afterwards: routes, checkout, webhook idempotency, wholesale protection, and phone/tablet/desktop widths.

## Out of scope

Review moderation dashboard, replies, photo reviews, review email requests, and any change to delivery pricing, VAT or payment status.
