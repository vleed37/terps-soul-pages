## Objective
Replace the static product images for all 7 strains with auto-rotating 3D models (no user interaction / controls).

## Uploaded → Slug Mapping
| GLB file | Strain slug |
|---|---|
| `003-CaviarStix_Hybrid.glb` | `caviar-stix-hybrid` |
| `003-CaviarStix_Indica.glb` | `caviar-stix-indica` (replaces existing) |
| `003-CaviarStix_Sativa.glb` | `caviar-stix-sativa` |
| `003-Terps_BlueDream.glb` | `blue-dream` |
| `003-Terps_GirlScoutCookies.glb` | `girl-scout-cookie` |
| `003-Terps_GreenCrack.glb` | `green-crack` |
| `003-Terps_MangoSapphire.glb` | `mango-sapphire` |

## Changes

### 1. Assets
- Upload each GLB via `lovable-assets create --file /mnt/user-uploads/<file>` and write `.asset.json` pointers into `src/assets/`.
- Delete the now-unused existing `aviator-tube-caviar.glb.asset.json` (its CDN object) and replace with the new Indica model.

### 2. `src/lib/strain-assets.ts`
- Import all 7 new `.asset.json` pointers.
- Expand `STRAIN_3D_MODEL` to include all 7 slugs.

### 3. `src/components/brand/Product3DViewerInner.tsx`
- Remove `OrbitControls` entirely (no user interaction — no orbit, no zoom, no pan).
- Keep auto-rotation via `useFrame` on the model group (constant spin, never paused).
- Remove the hover-pause logic and pointer handlers.
- Make the canvas non-interactive: add `style={{ pointerEvents: 'none' }}` on the `<Canvas>` so drag/scroll pass through to the page.

### 4. `src/components/brand/StrainCard.tsx`
- For non-premium strains, when `getStrain3DModel(slug)` returns a URL, render `<Product3DViewer>` in the image slot instead of the static `<motion.img>`. Keep static image path as fallback for any slug without a model.

### 5. `src/components/brand/CaviarStixCard.tsx`
- Already 3D-enabled; will automatically pick up the new Hybrid + Sativa models via the expanded map. No code change needed beyond verifying.

### 6. `src/routes/strain.$slug.tsx`
- Existing 3D block already keys off `getStrain3DModel(slug)`; will automatically apply to all 7 products now. No code change needed beyond verifying.

### 7. Verify
- Run `bun run build` to confirm clean bundle.
- Visit `/shop` and a couple of detail pages via preview to confirm each product rotates on its own and does not respond to drag/scroll.

## Out of Scope
- No zoom, drag, orbit, or fullscreen.
- No lighting/camera redesign per-model (shared viewer config; can tune later if a specific model frames poorly).
- No changes to product metadata, pricing, or copy.
