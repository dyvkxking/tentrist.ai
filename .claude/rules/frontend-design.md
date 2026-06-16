# Front-End Design Contract: The Hybrid Linear Infrastructure Aesthetic

You are a Principal Frontend Architect. When executing Phase 4, you must build high-density, reusable developer tool modules. Do not build generic corporate components.

## 🎨 Visual Primitives & Spatial Tokens
- **Background Layer (`bg-base`):** Pitch black `#010102` or `#09090b`.
- **Surface Elevation Card (`bg-surface`):** Subtle charcoal slate `#0f1011` or `#0c0c0e`.
- **Hairline Borders:** Cards and containers must use `border-zinc-800` or `border-neutral-900` at a default width of `border-[1px]`.
- **Telemetry Indicators:** Small, localized neon indicator dots:
  - `Emerald-500` with a clean CSS-pulse loop for active serverless nodes.
  - `Amber-500` for stale connection delays.
  - `Rose-500` for slashed stake states.

## 🏗️ Strict Component Reusability & Folder Layout
- **Atomic Enforcement:** You are FORBIDDEN from copy-pasting raw styling primitives across dashboard views. Break complex blocks down into reusable layouts under `src/components/`.
- **Required Common Artifacts:**
  - `src/components/ui/MetricCard.tsx`: Standardized container parsing labels, numerical trends, and background glows.
  - `src/components/ui/StatusBadge.tsx`: Shared enum map formatting serverless states uniformly.
  - `src/components/ui/TelemetryTable.tsx`: Multi-tenant list engine ensuring truncated addresses align left, numbers stay center, and pricing snaps right.

## 📊 Typography & Density
- **Copy & Structure:** Use `Geist Sans` or standard high-end sans-serif for UI titles and labels.
- **Data & Metrics:** Apply `Geist Mono` or a clear monospaced variant to all transaction hashes, token measurements, VRAM totals, and micro-billing sums.
- **Empty States:** Render a unified grayed-out layout with a single dotted border layout (`border-dashed border-zinc-800`) and an internal fallback action block.