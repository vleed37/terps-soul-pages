## Add Light Mode Toggle

Add a theme toggle (sun/moon icon) in the header that switches between the existing dark theme and a new cream light theme (#FFF8EA background). Preference persists in localStorage.

### Light theme tokens (added to `src/styles.css`)

Add a `.light` class on `<html>` that overrides the `:root` variables:

```
--bg-base: #FFF8EA            (cream)
--bg-surface: #F5EDD8         (slightly deeper cream for cards)
--bg-elevated: #EFE4C8        (elevated panels)
--bg-rich: #FAF1DC            (darkest cream — used where dark mode uses pure black)

--text-primary: #1A1408        (deep warm black for body text)
--text-secondary: #5C4A2E      (warm muted brown)
--text-tertiary: #8A7550       (faded ink)

--accent-gold: #8B6914         (deeper gold — readable on cream)
--accent-gold-hover: #A07E1F
--accent-gold-muted: rgba(139,105,20,0.12)
--accent-gold-deep: #6B500F

--border-subtle: #E8DCC0
--border-strong: #D4C39A
--border-luxe: rgba(139,105,20,0.30)

--shadow-card: 0 8px 24px rgba(60,40,10,0.10)
--shadow-card-hover: 0 16px 48px rgba(60,40,10,0.18)
```

Body grain overlay opacity reduced to ~0.015 in light mode (overlay blend looks heavy on cream).

### Theme provider

New file `src/lib/theme.ts`: tiny zustand-or-hook store that reads/writes `terps_theme` in localStorage, toggles the `light` class on `document.documentElement`, defaults to `dark`. Initialized in `__root.tsx` `RootComponent` via `useEffect` to avoid SSR hydration mismatch.

### Header toggle

In `src/components/layout/Header.tsx`, add a sun/moon icon button (lucide `Sun`/`Moon`) next to the Search/Account/Cart cluster on desktop, and inside the mobile menu as a small row. Uses same `text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]` styling — auto-themed.

### Components that need a light-mode pass

These currently hardcode dark-only colors and need tweaks so they read well on cream:

- **`AgeGate.tsx`** — backdrop `bg-[color:var(--bg-rich)]/90` works; lifestyle bg image `opacity-15` → keep, fine on both.
- **`Header.tsx`** scrolled bg `bg-[color:var(--bg-base)]/85` — token-driven, fine.
- **Mobile menu** uses `bg-[color:var(--bg-rich)]` — fine via tokens.
- **Hero video on `index.tsx`** `opacity-60` reads dark on cream. Add `mix-blend-multiply` in light mode (or wrap with a cream overlay) so the video tints into the cream background instead of looking like a dark hole.
- **`GoldButton`** primary uses gold bg + `--bg-rich` text — in light mode `--bg-rich` becomes cream, which fails contrast on gold. Override primary text to `#1A1408` (or just `--text-primary`) so it stays readable in both modes.
- **`StrainCard`** — uses tokens; just verify accent glow still reads on cream (may need lower opacity in light).
- **Footer** — currently `bg-[color:var(--bg-rich)]`; with cream tokens it will be near-white. Acceptable, will look like a continuation. Verify.

### Out of scope

- No backend/data changes.
- No content/copy changes.
- No new routes.
- Cart/checkout/auth flows untouched.

### Files touched

- `src/styles.css` (add `.light` block + adjust grain opacity)
- `src/lib/theme.ts` (new)
- `src/routes/__root.tsx` (init theme on mount, prevent FOUC)
- `src/components/layout/Header.tsx` (toggle button, desktop + mobile)
- `src/components/brand/GoldButton.tsx` (primary text color override for light)
- `src/routes/index.tsx` (hero video blend mode in light)
