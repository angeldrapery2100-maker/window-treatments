# Agent instructions — window-treatments (angel-drapery.com)

**FIRST: read `docs/NEXT-STEPS-2026-07-05.md`** — it has the current roadmap,
the non-negotiable rules ("军规"), and the key-file map. Summary of the rules:

- Verify every change with BOTH:
  `cd apps/web && ../../node_modules/.bin/tsc --noEmit` (exit 0) AND
  `cd packages/shared && npx vitest run` (all green).
- Pricing parity with the internal AAPP software is sacred. Engine:
  `packages/shared/src/pricing/aapp/` · spec: `docs/aapp-pricing-spec.md` ·
  product wiring: `docs/aapp-engine-wiring.md`. Never change test expectations
  to make tests pass — a mismatch means the two systems diverged.
- The two server pricing entry points must change together:
  `apps/web/src/app/api/store/pricing/calculate/route.ts` and
  `apps/web/src/lib/productPricing.ts`.
- AI assistant knowledge lives in `apps/web/src/app/api/store/assistant/knowledge/`;
  after editing run `node apps/web/scripts/generate-assistant-knowledge.mjs` and
  commit the regenerated `knowledge.generated.ts`. No prices in knowledge files.
- Sandbox quirks: `.git/*.lock` files can't be unlinked — `mv` them aside and
  retry; `next build` can't run in the sandbox (tsc + vitest are the gate;
  Vercel builds on push). Deploy = `git push origin main` (user pushes).
- Small, focused commits. No framework migrations, no inventory/RMA/multi-currency.
