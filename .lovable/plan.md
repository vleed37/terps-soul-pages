# Product detail relayout and retail consistency fixes

## Outcome

Replace every retail product detail page with one consistent, image-led layout: product photograph, concise buying information, strain-specific stockist access, and Caviar infusion details only. Remove the long editorial, technical, trust, premium, and Instagram-order sections without changing cart, stock, checkout, wholesale pricing, or stockist-search behavior.

The current short database descriptions will be used as supplied. No new product claims or copy will be invented.

## File-by-file implementation

### `src/routes/strain.$slug.tsx`

- Replace the video/AI-art hero, 3D buy area, story, profile/lab, trust row, and `StrainInformation` output with one compact product layout shared by all seven products.
- Render in this order:
  1. Large product photograph from the product-image resolver, with stable responsive dimensions and useful alt text.
  2. Product name, public retail price, current short description, effects chips, flavour chips, quantity selector, and primary Add to cart action.
  3. Compact “Where to find `<strain>`” block. Its main action opens the existing `FindClosestStockistModal` with this product’s ID/name, preserving strain filtering; a secondary link goes to `/stockists`.
  4. Caviar Stix only: “Infusion components”.
- Keep current sold-out behavior: replace Add to cart with “Notify me when back”; still show the stockist block.
- Remove the Instagram ordering link.
- Preserve the existing cart insertion and stock-limit behavior.
- Generate the free-delivery line from `FREE_DELIVERY_THRESHOLD` rather than embedded `R500` text.
- Keep product SEO and Product JSON-LD, but ensure they use the simplified product data and product photograph rather than AI hero art.
- Remove unused imports and state associated with the deleted sections.

### `src/lib/strain-assets.ts`

- Make dedicated `product-<slug>` photography the first choice where it exists for each supplied product.
- Keep the existing shop-card photograph as the fallback when no dedicated product image exists.
- Do not use `STRAIN_IMAGE` AI artwork on product detail pages.
- Leave 3D-model mappings available for other existing surfaces, but the product detail page will no longer render the 3D viewer.

### `src/lib/brand.ts`

- Establish the requested retail source of truth:
  - `DELIVERY_FEE = 80`
  - `FREE_DELIVERY_THRESHOLD = 500`
- Update `retailDeliveryFee()` to use those constants.
- Keep `WHOLESALE_DELIVERY_FEE = 250` and VAT behavior unchanged.

### `src/lib/store/cart.ts`

- Remove the duplicate numeric delivery constants.
- Import `DELIVERY_FEE` and `FREE_DELIVERY_THRESHOLD` from `brand.ts` and re-export them only if existing callers require that API.
- Keep `computeTotals()` behavior unchanged while making it use the centralized values.

### `src/lib/checkout.functions.ts`

- Continue using the centralized `retailDeliveryFee()` server-side, ensuring checkout remains authoritative.
- No payment, order, or delivery-flow change is planned.

### `src/components/cart/CartDrawer.tsx`

- Source the free-delivery threshold from `brand.ts` and keep the remaining-to-free-delivery calculation dynamic.

### `src/routes/checkout.tsx`

- Replace embedded “Free over R500” text with text derived from `FREE_DELIVERY_THRESHOLD`.
- Keep delivery-only checkout and totals unchanged.

### `src/routes/legal.shipping.tsx`

- Generate the public delivery-fee and free-delivery wording from `DELIVERY_FEE` and `FREE_DELIVERY_THRESHOLD`, so policy text changes with checkout in one place.

### `src/server.ts`

- Normalize every HTML document response, including branded error HTML, to `Cache-Control: no-cache, must-revalidate, max-age=0`.
- Do not override non-HTML responses, so hashed JavaScript/CSS/images retain platform long-term immutable caching.

### Additive database migration

- Change only the public display name, not the identifier:

```sql
UPDATE public.strains
SET name = 'Girl Scout Cookies'
WHERE slug = 'girl-scout-cookie'
  AND name = 'Girl Scout Cookie';
```

- The slug and URL remain `/strain/girl-scout-cookie`; therefore no redirect is needed and existing links, carts, assets, and SEO URLs remain valid.

## Purchasing audit

- **Add to cart is live for retail now.** It writes to the local cart and opens the cart drawer; stock quantity limits and sold-out handling apply.
- There is **no dedicated product-purchasing feature flag**. Missing BobPay credentials block the later payment handoff, not Add to cart.
- Implementation will retain Add to cart as the primary CTA and remove the Instagram link. Since no purchase flag exists, no new flag will be introduced.

## Cache header audit and target

- Current localhost HTML: no explicit `Cache-Control` header.
- Current custom-domain HTML: `no-cache, must-revalidate, max-age=0` from the hosting layer.
- Current hashed CSS: `public, max-age=31536000, immutable`.
- New app-enforced HTML policy: `no-cache, must-revalidate, max-age=0` on every HTML document response in all environments.
- Hashed JavaScript, CSS, CDN media, and other non-HTML assets will keep their existing long-lived cache behavior.

## Verification

- Check all seven active product URLs individually.
- At 375px and 390px, verify image framing, text wrapping, chip wrapping, quantity/Add to cart controls, sold-out state, stockist modal, `/stockists` link, and no horizontal overflow or layout shift.
- Verify a standard pre-roll and all three Caviar variants at desktop width; confirm infusion components appear only for Caviar.
- Verify Girl Scout Cookies displays everywhere while `/strain/girl-scout-cookie` still resolves and no redirect is necessary.
- Verify Add to cart opens the cart and uses the correct product, quantity, price, and image; verify Instagram ordering is absent.
- Verify delivery values agree across product page, cart, checkout, and shipping policy.
- Check HTML document and hashed asset response headers after implementation.
- Run the project typecheck, inspect the generated build result, and check browser console/runtime/network errors.

## Expected changed files

- `src/routes/strain.$slug.tsx`
- `src/lib/strain-assets.ts`
- `src/lib/brand.ts`
- `src/lib/store/cart.ts`
- `src/components/cart/CartDrawer.tsx`
- `src/routes/checkout.tsx`
- `src/routes/legal.shipping.tsx`
- `src/server.ts`
- One new additive migration for the Girl Scout Cookies display-name update

No wholesale pricing, auth, approval, BobPay behavior, stockist data, or Phase 2 reviews will be changed.