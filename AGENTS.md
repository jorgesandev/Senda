# Senda Agent Guide

## Session Start — Mandatory Reads

Before touching any code, read these files **in order**:

```
docs/status.md           ← deployed URLs, what works today, what's pending
docs/plan_ejecucion.md   ← active block, completed tasks, what's next
docs/SRS.md              ← product spec, data contracts, matrix rules
README.md                ← architecture, setup, public context
```

Do not skip. `docs/status.md` tells you the current live state. `docs/plan_ejecucion.md` tells you what to build next.

## When a Task Is Done

Before reporting a task as complete, update **all three**:

1. **`docs/plan_ejecucion.md`** — mark `[x]` on the completed subtask and add a `Nota:` line that explains:
   - what was implemented
   - any non-obvious architectural decisions
   - file paths changed or created
2. **`docs/status.md`** — update the relevant section to reflect the new state. Keep it as a current snapshot, not a history log.
3. **`README.md`** — update if the public-facing description, quickstart steps, or architecture diagram changed.

Never leave these three out of sync with the actual code.

## Project Intent

Senda is an accessible pedestrian routing app for Tijuana. Keep the implementation aligned with:

1. `docs/SRS.md` as the product/spec authority.
2. `docs/plan_ejecucion.md` as the execution order.
3. `docs/status.md` as the current live state.
4. `README.md` as the public setup and project summary.

Do not add product behavior outside the SRS unless the SRS is updated in the same change.

## Current Priority

Read `docs/plan_ejecucion.md` to find the current active block. Bloques 0–4 are complete.

## Stack

- Web: `apps/web`, Next.js 14 App Router, TypeScript, Tailwind, Google Maps JS, Zustand, Lucide.
- API: `apps/api`, FastAPI, pydantic v2, httpx.
- Routing: Valhalla — Cloud Run in production (`docs/status.md`), local Docker for dev (`services/valhalla`, port 8002).
- Data: GeoJSON-like `MapFeature` contracts, seed data in `data/seed`.

## Local Commands

Web:

```bash
cd apps/web
bun install
bun dev
bun run build
```

API:

```bash
cd apps/api
pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8080
```

Valhalla (local dev):

```bash
docker compose -f services/valhalla/docker-compose.yml up
```

API smoke checks:

```bash
# Local
curl http://localhost:8002/status
curl http://localhost:8080/health

# Production (URLs in docs/status.md)
curl https://senda-api-131553755517.us-central1.run.app/health
```

Matrix sanity check:

```bash
cd apps/api
.venv/bin/python -c "import matrix; print(matrix.resolve_effect(['WHEELCHAIR'], {'kind': 'barrier', 'subtipo': 'surface_broken', 'atributos': {}}))"
```

## Implementation Rules

- Keep mocks typed and explicit in TypeScript.
- In Python, unimplemented real integrations should raise `NotImplementedError`.
- Do not leave TODO comments; track pending work in `docs/plan_ejecucion.md`.
- Preserve the SRS distinction between objective feature type and profile-specific effect.
- Multi-profile route impact uses worst-case severity.
- Coordinates exposed to the web map must be `[lng, lat]` (GeoJSON order).
- Use `exclude_locations` for hot Valhalla avoidance in the MVP path.
- The seed file (`data/seed/features_seed.json`) is outside the `apps/api/` Docker build context. Never rely on it being present in production — Firestore is the source of truth.

## Accessibility Requirements

Accessibility is a core feature, not polish:

- interactive targets must be at least 48x48px;
- color must not be the only signal (always icon + label);
- maintain visible focus, semantic labels, and keyboard operation;
- support high contrast, scalable text, voice/TTS, and haptics where implemented;
- avoid UI changes that make VoiceOver/TalkBack behavior worse;
- `aria-live`, `role="alert"`, `aria-pressed` on all dynamic + toggle elements.

## Frontend Design Rules

- Use existing tokens in `apps/web/app/globals.css` and Tailwind config.
- Use Lucide icons for controls when an icon exists.
- Keep the map/routing experience as the first-screen product surface.
- Build dense, operational UI for repeated use; avoid landing-page patterns.
- Do not introduce decorative gradients, blobs, or card-inside-card layouts.

## Git Rules

**Never commit.** Only the developer commits. When a task is finished, report what changed and provide a suggested commit message — do not run `git commit`, `git add`, or `git push` under any circumstance.

## Verification Expectations

For API/routing changes:

- run the relevant Python smoke command;
- hit `/health`;
- when Valhalla is involved, verify a real `/route` response with Tijuana coordinates.

For web changes:

- run `bun run build` when feasible;
- manually check the main route planner flow in the browser;
- check mobile-sized layout for overlapping text or controls.

## Secrets

Do not commit `.env`, Firebase credentials, API keys, or generated credentials. Use `infra/.env.example` for documented variables.
