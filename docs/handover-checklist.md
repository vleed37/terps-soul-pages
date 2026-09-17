# Terps — client handover checklist

Everything below is either **information only Terps can supply** or **a credential only
Terps can obtain**. The site is built and working around each item; nothing is invented,
and every outstanding item is visible live in the admin under **Settings → Readiness**.

Where to enter each item is named per row. Nothing here needs a developer.

## 1. Business & legal information
Enter in **Admin → Settings → Business & legal**.

| Needed | Notes |
| --- | --- |
| Registered legal entity name | As registered with CIPC |
| Company registration number | |
| Registered business address | Shown on the legal pages |
| Contact telephone number | |
| Sales / orders email | |
| Privacy contact email | Required by the privacy policy |
| Shipping contact email | |
| Refunds contact email | |
| Policy effective date | The date the policies take effect |
| VAT registered: yes / no | If yes, also the VAT number |
| Legal review approved | Set only once a legal practitioner has approved the wording |

Until the fields are complete **and** legal approval is recorded, every policy page
shows a visible draft notice. VAT stays switched off until registration is confirmed.

## 2. Delivery decisions
Enter in **Admin → Settings → Shipping**.

| Needed | Notes |
| --- | --- |
| Retail delivery fee | |
| Wholesale delivery fee | |
| Free delivery: offered or not | And the order value that qualifies |
| Courier / delivery provider | No courier account is connected yet |
| Order processing time | On the Business & legal tab |
| Standard delivery estimate | On the Business & legal tab |
| Delivery pricing confirmed | Rates and estimates stay hidden from customers until this is set |

The site never advertises a rate, a free-delivery offer or a delivery estimate while
pricing is unconfirmed. Charges are always calculated on the server, never in the browser.

## 3. Photography
Upload in **Admin → Settings → Imagery** (site imagery) and **Admin → Products** (per product).

- Product photograph for each of the 7 live products (also used on cards and social previews)
- Full box and variety/mixed box photograph for each product family
- Wholesale catalogue and large-order imagery
- Homepage hero image and stockist display image
- Default social sharing image

Current images are the existing studio and library shots; uploads replace them
automatically with no code change. The 3D product models stay as they are.

## 4. Stockists
Enter in **Admin → Stockists**.

- Real stockist names, addresses, contact details and trading hours
- Which products each stockist carries

The 6 placeholder locations remain switched off and must not be reactivated.
Wholesale accounts are approved automatically as before; appearing on the public map is
a separate opt-in and additionally requires complete public details, an active account
and at least one paid wholesale order.

## 5. Credentials (Terps must obtain these)
Provided to us privately — never entered on a page.

| Credential | Purpose | Effect while missing |
| --- | --- | --- |
| BobPay merchant ID, API key, API URL | Taking live payments | Checkout reports payment not configured |
| BobPay webhook secret | Confirming paid orders | Unsigned confirmations are rejected |
| Email sending key and verified sender domain | Order and account emails | Emails are skipped, orders still save |
| Mapping (geocoding) credential | Turning stockist addresses into map pins | Pins must be positioned by hand |

## 6. Final sign-off before going live
- Every item in **Settings → Readiness** resolved or knowingly accepted
- Legal pages approved and the draft notice gone
- Real stockists live, placeholders still off
- A test payment completed end to end with live credentials

## Update — final audit (post-verification)

Changed during the final audit:

1. **Online payment is now gated on confirmed delivery pricing.** Until "delivery
   pricing confirmed" is ticked in Admin → Settings → Shipping, retail checkout
   shows "Delivery: to be confirmed", the Place Order button is disabled, and the
   server refuses to create an order or start a payment. Wholesale trade orders are
   gated the same way. Nothing can be charged on an unconfirmed rate.
   → Terps must confirm retail fee, trade fee, free-delivery decision + threshold,
     and courier before checkout can accept payment.
2. **Suspended stockists now disappear from the public map/finder** automatically,
   and reappear on reactivation. Wholesale access and public listing remain separate.
3. **Public site settings are now readable by the public site** (business/legal,
   shipping, imagery). Secrets remain in the locked secrets table.

Still required from Terps (unchanged): business/legal details + explicit legal
review approval, VAT decision, confirmed delivery pricing, final product/box/
homepage/social photography, real stockist list, BobPay merchant ID + API key +
the real webhook secret from BobPay (the current webhook secret is a development
placeholder), Resend key for email, a mapping/geocoding key, and one live
end-to-end payment test.

Outstanding developer item (small): once BobPay supplies its webhook payload spec,
add an amount check against the stored order total as defence-in-depth. Signature
verification, replay protection and single stock decrement are already in place.

## Update — settings-driven legal pages and search metadata

1. **Legal pages now read the admin business & legal settings.** Trading name,
   legal entity, registration number, VAT status/number, business address,
   telephone, sales/privacy/shipping/refunds email addresses, policy effective
   date, processing time, delivery estimates and the returns notification period
   all come from Admin → Settings → Business & legal. Anything still blank shows
   an honest "to be confirmed" marker — no value is invented. The draft notice
   only disappears once every required field is complete **and** legal review is
   explicitly approved in admin.
2. **Preferred-URL (canonical) tags** are emitted on the indexable public pages
   (home, shop and both categories, product pages, strain library, stockist
   finder, our story, wholesale landing, legal pages) using the production site
   origin. Product pages canonicalise to their own product URL, including when
   reached through an older slug.
3. **Private and transactional pages are marked not-for-search**
   (`noindex, nofollow`, no canonical, no product preview data): checkout, order
   status, sign-in/registration/password pages, the account area, the stockist
   portal and its order pages, and admin.

### What BobPay must supply for paid-amount verification

The signed confirmation we receive today contains only `reference`,
`transaction_id`, `status` and `event`. To validate the amount paid we need
BobPay to document: the field carrying the amount actually paid, its unit
(Rand or cents), the currency field, and confirmation that both are inside the
signed payload. Once supplied, the amount is compared against the stored order
total and mismatches are rejected without marking paid, releasing stock or
sending confirmation. This is tracked on the readiness dashboard as
"Paid-amount verification".
