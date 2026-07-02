## Objective
Integrate the uploaded `Aviator_Tube_CGAT6-100MM_Caviar.glb` 3D model as the primary product visual for the **Caviar Stix Indica** product, replacing the static image on both the product card grid and the product detail page. The viewer auto-rotates and allows user drag-to-orbit.

## Technical Approach

### 1. Asset Upload
- Upload `Aviator_Tube_CGAT6-100MM_Caviar.glb` via `lovable-assets create` to generate a `.asset.json` pointer.
- Register the CDN URL in `src/lib/strain-assets.ts` under a new `STRAIN_3D_MODEL` map keyed by `caviar-stix-indica`.

### 2. Dependency Installation
- Add `@react-three/fiber`, `@react-three/drei`, and `three` as runtime dependencies.
- Add `@types/three` as a dev dependency.

### 3. 3D Viewer Component (`src/components/brand/Product3DViewer.tsx`)
- **SSR-safe**: Create as a `.client.tsx` file so it is excluded from the server bundle (Cloudflare Worker compatibility).
- **Features**:
  - Load GLB via `<Suspense>` with `useGLTF` from `@react-three/drei`.
  - Auto-rotate using a slow `useFrame` rotation on the model group.
  - User override via `<OrbitControls>` from `@react-three/drei` — controls are active immediately, and auto-rotation pauses/resumes based on interaction.
  - Soft studio lighting with `<Environment preset="studio" />` or basic `<ambientLight>` + `<directionalLight>` for the dark brand theme.
  - Dark background matching `var(--bg-rich)` or transparent canvas so it blends with card/page backgrounds.
- **Responsive sizing**: Accepts a `className` prop; the parent container controls dimensions. Cards get a square aspect container, the detail page gets a larger framed container.

### 4. Card Integration (`src/components/brand/StrainCard.tsx` & `CaviarStixCard.tsx`)
- In `StrainCard`, before returning the `<CaviarStixCard>`, check if `strain.slug === 'caviar-stix-indica'` and a 3D model exists.
- In `CaviarStixCard`, replace the static `<motion.img>` with `<Product3DViewer>` when the 3D model is available for that strain. The viewer fills the product image area (`relative flex-[7]` container).
- Keep the existing product chrome (corner ornaments, badges, overlay text) unchanged.

### 5. Detail Page Integration (`src/routes/strain.$slug.tsx`)
- In the "BUY ZONE" section, replace the static `<img>` with `<Product3DViewer>` when the current slug is `caviar-stix-indica` and a 3D model URL exists.
- The viewer sits inside the existing `rounded-lg bg-[color:var(--bg-surface)] p-12` container, filling the left column.

### 6. Build Verification
- Run `bun run build` to confirm `@react-three/fiber` bundles cleanly in the Vite + TanStack Start setup.
- If SSR treeshaking issues occur, ensure the `.client.tsx` suffix prevents server-side inclusion.

## Out of Scope
- No 3D for other strains (static images remain).
- No animation beyond auto-rotate + orbit.
- No AR / fullscreen modal / zoom modal.

## Acceptance Criteria
- [ ] `caviar-stix-indica` card on `/shop` shows the 3D model auto-rotating.
- [ ] Dragging the model in the card pauses auto-rotation and allows manual orbit.
- [ ] `/strain/caviar-stix-indica` detail page shows the same 3D viewer replacing the static product image.
- [ ] Other products continue to show static images with no regression.
- [ ] Build completes without errors.
