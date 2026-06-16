---
name: verify-ui
description: Performs rigorous validation checks against frontend components to ensure absolute code reusability and design adherence.
---
# UI & Component Compliance Verification Checklist
1. Scan the modified folder scope inside `frontend/src/` to confirm that redundant, non-reusable layout markup hasn't been duplicated.
2. Verify that common UI elements like cards, table rows, and status badges call out to unified modules in `src/components/ui/`.
3. Check that font-family definitions separate system labels from monospaced compute data metrics.
4. Execute `npm run build` directly inside the frontend pathway to confirm that the full compiler passes with zero TypeScript or style lints.