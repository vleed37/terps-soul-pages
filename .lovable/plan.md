## Goal
Get `/wholesale/login` resolving cleanly, then audit and polish the existing stockist dashboard (overview, catalog, checkout, orders list, order detail) so the whole flow works end-to-end on the brand styling.

## 1. Fix the `/wholesale/login` 404

The route file (`src/routes/wholesale.login.tsx`) and the generated `routeTree.gen.ts` both register `/wholesale/login` correctly, so the screenshot's "This drop has finished" is almost certainly the root `notFoundComponent` catching a runtime/SSR error from the login page rather than a missing route.

Steps:
- Open `src/routes/wholesale.login.tsx` and verify the component renders without touching `window`/`localStorage` at module scope, and that all imports (`AuthCard`, `AuthField`, `supabase`, etc.) resolve.
- Open `src/routes/wholesale.index.tsx` (the new index) and confirm the route id is `/wholesale/` and it does not also try to claim `/wholesale/login`.
- Force a regen of `src/routeTree.gen.ts` if the new file rename hasn't fully propagated.
- Smoke-test `/wholesale/login` and `/wholesale/dashboard` in the preview after the fix.

## 2. Polish the existing dashboard pages

Files in scope (already exist, will be cleaned up — no new sections):

- `wholesale.dashboard.tsx` — shell layout. Verify it renders `<Outlet />`, has a working sign-out, brand-correct sidebar/topbar, and the cart drawer trigger. Make sure unauthenticated users redirect to `/wholesale/login` (they already do via `beforeLoad`).
- `wholesale.dashboard.index.tsx` — overview. Tighten the stat cards, recent-orders list, and "Update details" CTA. Make sure empty/loading states are readable (current bg is very dark).
- `wholesale.dashboard.catalog.tsx` — product grid. Confirm box pricing, qty stepper, "Add to order" toast, and minimum-box logic display correctly. Fix any low-contrast text.
- `wholesale.dashboard.checkout.tsx` — order summary + submit. Verify cart totals, address/notes fields, and that submitting creates an order and clears the cart.
- `wholesale.dashboard.orders.index.tsx` — order history list. Ensure each row links to the detail page and status pills render.
- `wholesale.dashboard.orders.$id.tsx` — order detail. Verify line items, totals, payment + fulfillment status, and a back link to the list.

For all six pages:
- Fix any text that is unreadably dark on the wholesale background (carry over the contrast pass from the public `/wholesale` page).
- Use brand tokens (`--accent-gold`, `--bg-surface`, `--text-secondary`, etc.) — no raw hex.
- Replace any inline placeholder content with the real copy / data already wired through `@/lib/wholesale.functions`.
- Make sure every loading and empty state has visible copy.

## Out of scope
- No new dashboard sections (account settings, invoices, support, etc.).
- No schema or server-function changes unless a polish item exposes a bug.
- No changes to the public `/wholesale` apply page or the public site footer.

## Technical notes
- Route IDs: `createFileRoute("/wholesale/")`, `/wholesale/login`, `/wholesale/dashboard`, `/wholesale/dashboard/`, `/wholesale/dashboard/catalog`, `/wholesale/dashboard/checkout`, `/wholesale/dashboard/orders/`, `/wholesale/dashboard/orders/$id`.
- `wholesale.dashboard.tsx` is the layout — must keep `<Outlet />`.
- Auth gate stays in `wholesale.dashboard.tsx` `beforeLoad` (calls `supabase.auth.getUser()` and redirects to `/wholesale/login` with `redirect` search param).
- Login page already navigates back to the `redirect` search param on success.
