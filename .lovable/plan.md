## Terps — Palette + Saturation Refinement

Scope: tokens, accent color, strain palettes, button styling, mode toggle, and a few homepage saturation/CTA trims. **No typography changes. No structural/page changes. No functional changes.**

---

### 1. `src/styles.css` — rewrite the token layer

Replace the existing `:root` (dark default) and `html.light` blocks with the Luna palette, but keep the project's pattern of "dark = `:root`, light = `html.light` class" so the existing `useTheme()` hook keeps working (rather than introducing `[data-theme="dark"]`).

- `:root` → dark mode (deep forest):
  - `--bg-base: #111B10`, `--bg-surface: #1A251A`, `--bg-elevated: #232E22`, `--bg-rich: #0B130B`
  - `--bg-contrast: #FBFDFD`
  - `--text-primary: #FBFDFD`, `--text-secondary: #ADB7A5`, `--text-tertiary: #7C8478`
  - `--border-subtle: #283526`, `--border-strong: #3D4F3A`, `--border-luxe: rgba(164,178,133,0.40)`
  - `--on-gold: #111B10` (now "on-accent")
- `html.light` → cream-off-white:
  - `--bg-base: #FBFDFD`, `--bg-surface: #F2F4F0`, `--bg-elevated: #E8EBE2`, `--bg-rich: #FFFFFF`
  - `--bg-contrast: #111B10`
  - `--text-primary: #111B10`, `--text-secondary: #4A5547`, `--text-tertiary: #7C8478`
  - `--border-subtle: #DDE0D6`, `--border-strong: #B8BDAE`, `--border-luxe: rgba(164,178,133,0.40)`
  - `--on-gold: #FBFDFD`
- Shared accent (same on both modes):
  - `--accent-gold: #A4B285` (kept under the same variable name to avoid renaming every consumer)
  - `--accent-gold-hover: #B6C29A`
  - `--accent-gold-deep: #6B7559`
  - `--accent-gold-muted: rgba(164,178,133,0.18)`
- Status: `--status-success: #6B8E5A`, `--status-error: #B85555`, plus a new `--status-warning: #C9A24B` (only place gold survives).
- Reduce `.hero-video` light-mode `opacity` from `0.85` to `0.7` and add a similar dark-mode `.hero-video { opacity: 0.55; }` so hero feels more atmospheric.
- Body grain stays at 0.03 (unchanged).

Note: we keep variable *names* like `--accent-gold` so the dozens of `text-[color:var(--accent-gold)]` usages across the codebase automatically inherit the new sage color. Renaming would be a huge mechanical churn for no visual gain.

---

### 2. Strain palette overrides — `src/lib/strain-assets.ts` (or wherever accent_color_accent is sourced)

Audit how `strain.accent_color_accent` is set. If it's stored in the DB, override at render time in `StrainCard.tsx` and `strain.$slug.tsx` via a small slug→palette map:

```
green-crack       → primary #283526, accent #A4B285
blue-dream        → primary #2B3D52, accent #B8C5D2
mango-sapphire    → primary #8B5A2F, accent #D4A87C
girl-scout-cookie → primary #3D2E1F, accent #B89870
```

In `StrainCard`, reduce the radial accent glow alpha from `18` (hex `18` = ~9%) to `0F` (~6%), and fade the gradient further into the base color at the edges. In `strain.$slug.tsx` hero, do the same on the colored background wash and bump the bottom gradient opacity for atmosphere.

---

### 3. `src/components/brand/GoldButton.tsx`

No structural changes — only token usage. Because we kept the `--accent-gold` / `--on-gold` variable names, `primary` already becomes olive-sage with correct contrast text (`#111B10` in light, `#FBFDFD` in dark) automatically. Verify `secondary` and `tertiary` variants still read correctly on cream and forest; tweak the tertiary `hover:bg-white/5` to `hover:bg-[color:var(--accent-gold-muted)]` so it works in light mode too.

---

### 4. Mode toggle refinement — `src/components/layout/Header.tsx`

- Position: already in the utility cluster; move it to be the **first** item before search/account/cart.
- Icon: Lucide `Sun` / `Moon` at `strokeWidth={1.5}`, size 18.
- Hover: `transition-transform duration-300 hover:scale-105 hover:rotate-12`.
- Smooth mode transition: add `transition-colors duration-300` to `html, body` in `styles.css` so the whole site fades between modes rather than snapping.

---

### 5. Gold removal sweep

Grep for hardcoded gold hexes (`D4A52A`, `C9A24B`, any `oklch(... 80)` gold leftovers) and any literal "gold" copy in class strings. Replace with token references. Specific spots to verify:
- "BATCH NO. 04 · ACTIVE" badge → `text-[color:var(--accent-gold)]` (now sage) or `text-secondary` per spec.
- Meta XS labels using `gold` prop in `MetaLabel` → unchanged (auto-themed via token).
- Strain card "BATCH 04" marker → wrap in `opacity-60`.
- Hairlines via `.hairline-gold` and `border-gold-luxe` → already token-driven, will auto-shift to sage.
- Pulsing dots / glows → token-driven; verify visually.

---

### 6. Homepage saturation + CTA trim — `src/routes/index.tsx`

- Hero wordmark radial glow: reduce from current alpha to `0.10` and switch to sage.
- Featured strain angled card: shrink + drop opacity ~40%, or swap for a soft circular sage gradient blob behind the product.
- Marquee strip: tighten height/padding if present; remove if it's already minimal noise.
- Hero bottom gradient: increase opacity for atmosphere.
- Remove mid-section CTAs. Keep CTAs only in:
  1. Hero (2 buttons)
  2. End of The Collection grid
  3. End of strain library teaser
  4. Closing band
- Editorial lifestyle photo overlays: add darker gradient overlay (`from-[color:var(--bg-base)]/60`).

---

### 7. Files touched

- `src/styles.css` — token rewrite, hero-video opacities, global color transition
- `src/lib/strain-assets.ts` — new muted strain palette map (or new helper file imported by StrainCard + strain.$slug.tsx)
- `src/components/brand/StrainCard.tsx` — pull from new palette map, lower glow alpha
- `src/components/brand/GoldButton.tsx` — minor tertiary hover tweak
- `src/components/layout/Header.tsx` — toggle position, icon refinement, hover animation
- `src/routes/index.tsx` — saturation reductions + CTA trim
- `src/routes/strain.$slug.tsx` — hero wash opacity, palette source

### 8. Out of scope (per brief)

- No font changes, no structural reflow, no route changes
- No cart/checkout/auth/BobPay changes
- No new copy
- No DB migrations (strain accents overridden client-side via slug map)

---

### Acceptance

1. Light mode: off-white `#FBFDFD`, near-black `#111B10` text, sage `#A4B285` accents.
2. Dark mode: deep forest `#111B10`, cream text, same sage accents.
3. No gold anywhere except optional `warning` status.
4. Strain cards use the four muted palettes from the table.
5. All buttons use sage primary with 4px radius, typography untouched.
6. Toggle is first in header cluster, smooth 300ms cross-mode fade.
7. Homepage reads calmer — fewer mid-section CTAs, softer featured card, softer glows.
