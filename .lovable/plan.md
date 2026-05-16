
# Terps Prompt 3 — Auth + Account System

Adapted for the TanStack Start stack already in place (file routes, server fns, Supabase auth middleware — not `react-router-dom` / `RequireAuth`).

## 1. Database (single migration)

- `customers` table — PK = `auth.users.id`, fields: `full_name, phone, birthdate, customer_type, marketing_opt_in, created_at, updated_at`. RLS: owner-only read/insert/update.
- `addresses` table — `customer_id` FK, label/full_name/phone/street/unit/suburb/city/province/postal_code/country/is_default. RLS: owner-only ALL.
- `handle_new_user()` trigger on `auth.users` insert → inserts `customers` row AND backfills `orders.customer_id` for any prior guest orders matching the new user's email.
- Tighten existing RLS:
  - `orders`: add `orders_own_read` (auth.uid = customer_id).
  - `order_items`: add `order_items_own_read` via parent order.
  - Keep existing public INSERT policies for guest checkout intact.
- Guest order lookup: handled via a public server fn (`getOrderByNumber`) that already uses `supabaseAdmin` — RLS is for direct client queries only.

## 2. Auth configuration

Enable email/password + magic link via `supabase--configure_auth` (signup ON, auto_confirm OFF so verification works, HIBP ON). No Google sign-in unless requested.

## 3. Browser auth glue

- `src/hooks/use-auth.ts` — thin hook around `supabase.auth.getSession()` + `onAuthStateChange`. Exposes `{ user, session, loading }`. Mounted ONCE in `__root.tsx` to invalidate router/queries on auth changes (per Supabase integration guide).
- `src/lib/auth.functions.ts` — `getMyCustomer`, `updateMyCustomer`, `getMyOrders`, `getMyOrderDetail`, `listMyAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`, `deleteMyAccount` (uses `supabaseAdmin.auth.admin.deleteUser`). All guarded by `requireSupabaseAuth` except `deleteMyAccount` which validates then uses admin client.

## 4. Routes (file-based)

Public auth routes:
- `src/routes/account.login.tsx`
- `src/routes/account.register.tsx`
- `src/routes/account.forgot-password.tsx`
- `src/routes/account.reset-password.tsx`

Protected layout + children (under `_authenticated`):
- `src/routes/_authenticated.tsx` — `beforeLoad` gates on `supabase.auth.getUser()`, redirects to `/account/login?redirect=<href>` if no user. Renders shared sidebar + `<Outlet />`.
- `src/routes/_authenticated/account.tsx` — Overview tab.
- `src/routes/_authenticated/account.orders.tsx` — order list with filters/sort.
- `src/routes/_authenticated/account.orders.$orderNumber.tsx` — order detail (timeline, items, delivery, payment, reorder CTA).
- `src/routes/_authenticated/account.addresses.tsx` — CRUD grid + modal.
- `src/routes/_authenticated/account.settings.tsx` — personal info, change email, change password, marketing toggles, delete account.

Shared `AccountSidebar` component with `motion.layoutId` for the active gold rail.

## 5. Cart sync on login

`src/lib/cart-sync.ts` — called from the `onAuthStateChange` listener on SIGN_IN. Reads local Zustand items, calls a `mergeCart` server fn (auth-protected) that upserts a `carts` row keyed on `customer_id`, merges items (sum quantities, cap at stock), then returns the merged set. Local store is rehydrated from the server result. On SIGN_OUT, local cart is preserved.

## 6. Checkout integration

Edit `src/routes/checkout.tsx`:
- If unauthenticated → top banner "Have an account? Sign in for faster checkout →" linking to `/account/login?redirect=/checkout`.
- If authenticated → loader prefetches customer + addresses; form is pre-filled; address section shows a saved-address dropdown plus "+ Add new". On submit, server fn now also accepts `customer_id` (read from auth context inside the handler — extend `initiateBobpayPayment` with optional `.middleware([attachSupabaseAuth-optional])` pattern; simpler: branch inside the handler using a new optional auth middleware that doesn't reject on missing token). "Save this address" toggle calls `createAddress` on success.

## 7. Auth pages (design)

All four use a shared `AuthCard` shell: dark base, atmospheric image at 0.06 opacity, centered card (`max-w-[480px]`, 8px radius, 64px padding, `bg-surface`, gold hairline). Logo PNG 64px at top. Fraunces display headlines, Manrope body, gold meta labels, primary 4px gold CTA, secondary outline CTA.

- Login: email + password (eye toggle) + magic-link toggle + Forgot link.
- Register: full name, email, password (with weak/strong text indicator), confirm, phone (optional), DOB, 18+/terms checkbox (required), marketing checkbox.
- Forgot: email + inline success state.
- Reset: new password + confirm; on `PASSWORD_RECOVERY` event redirect to dashboard with toast.

## 8. Email templates

Scaffold Lovable auth email templates with branded dark editorial style (white email body background, gold accents, Fraunces headings rendered as image-safe web-safe stack with Fraunces fallback). Subjects:
- "Confirm your Terps account"
- "Reset your Terps password"
- "Your Terps sign-in link"

Triggered via the standard email-domain setup flow once the user provides a sender domain.

## 9. Animations

- Auth card: fade-in 400ms.
- Sidebar active rail: framer-motion `layoutId` 500ms cubic-bezier.
- Order rows: stagger fade-in 60ms.
- Form focus: 300ms gold border.

## Technical notes (TanStack-specific corrections from the original prompt)

- No `react-router-dom`, no `RequireAuth` HOC — use `_authenticated` layout + `beforeLoad` + `redirect()`.
- No `AuthProvider` context — use the `useAuth` hook + Supabase listener at root. The router context already carries query state.
- Account data fetched via `createServerFn` + `requireSupabaseAuth` (not direct client queries from components) so RLS is enforced server-side and we can return clean DTOs.
- Account-delete uses `supabaseAdmin.auth.admin.deleteUser` inside a server fn after the user is validated.

## Deferred

- Invoice PDF (button shown with "Coming soon" badge).
- Tracking URL integration (button only renders when `tracking_url` exists on the order).
