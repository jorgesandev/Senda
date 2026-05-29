# CLAUDE.md — Senda

## Session Start — Read These First

At the beginning of every session, before writing any code, read **in this order**:

1. `docs/status.md` — deployed URLs, what works today, what's pending
2. `docs/plan_ejecucion.md` — current block, completed tasks, what's next
3. `docs/SRS.md` — product spec and data contracts
4. `README.md` — public setup and architecture overview

This is mandatory. Do not skip even if the task seems clear from the prompt.

## When a Task Is Done

After completing any task, update **all three** before reporting done:

1. **`docs/plan_ejecucion.md`** — mark the task `[x]` and add a `Nota:` line explaining what was implemented, any non-obvious decisions, and file paths affected.
2. **`docs/status.md`** — update the relevant section (what works, URLs, pending items). Keep it as a current snapshot, not a history.
3. **`README.md`** — update if the public-facing description, setup steps, or architecture changed.

Never leave these three out of sync.

## Project

Accessible pedestrian routing for Tijuana. SRS at `docs/SRS.md`. Execution order at `docs/plan_ejecucion.md`. Implementation rules at `AGENTS.md` (read both).

## Stack

| Layer | Tech | Path |
|---|---|---|
| Web | Next.js 14 App Router, TS, Tailwind, Zustand, Google Maps JS | `apps/web` |
| API | FastAPI, pydantic v2, httpx | `apps/api` |
| Routing | Valhalla (Cloud Run prod / local Docker dev) | `services/valhalla` |
| Data | GeoJSON/MapFeature, seed | `data/seed` |

## Local Dev

```bash
# Web (port 3000)
cd apps/web && bun dev

# API (port 8080)
cd apps/api && .venv/bin/uvicorn main:app --reload --port 8080

# Valhalla (local)
docker compose -f services/valhalla/docker-compose.yml up
```

## Key Contracts

- `MapFeature` — the one data entity; `kind: barrier|amenity|transport|crossing`
- `RouteRequest` — `{ origin, destination, profiles[] }` — profiles always sent, never omitted
- `RouteResponse` — `{ coords, distance_m, eta_min, features_evitadas, features_aprovechadas, steps }`
- TIPO vs EFECTO: `matrix.py` / `lib/matrix.ts` hold the impact table; routing calls it, never inlines `if profile == X`

## Current Block

Check `docs/plan_ejecucion.md` for the active block — it is the authoritative source.  
Check `docs/status.md` for the current deployment state and what's actually working.

Completed so far: Bloque 0–4 (Valhalla real, geocoding, route drawing, impact matrix, Firestore, SSE citizen loop, full accessibility — voice, TTS, haptics, visual alerts, ARIA).

## Verification Shortcuts

```bash
# Matrix sanity
cd apps/api && .venv/bin/python -c "import matrix; print(matrix.resolve_effect(['WHEELCHAIR'], {'kind':'barrier','subtipo':'surface_broken','atributos':{}}))"

# Route smoke (local)
curl -s -X POST http://localhost:8080/route \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Av Revolucion TJ","destination":"Zona Rio","profiles":["WHEELCHAIR"]}' | python3 -m json.tool | head -20

# Route smoke (production)
curl -s -X POST https://senda-api-131553755517.us-central1.run.app/route \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Av Revolucion TJ","destination":"Zona Rio","profiles":["WHEELCHAIR"]}' | python3 -m json.tool | head -10

# Features
curl -s http://localhost:8080/features | python3 -m json.tool | head -30
```

## File Map (most-edited)

```
apps/api/
  matrix.py       impact table + resolve_effect()
  features.py     in-memory store + seed load
  routing.py      Valhalla caller + build_dynamic_excludes()
  main.py         FastAPI endpoints

apps/web/
  lib/matrix.ts   TS mirror of impact matrix
  lib/map.ts      featureColor(feature, profiles?)
  lib/store.ts    Zustand — profiles[], activeRoute, liveFeatures, a11yPrefs
  lib/voice.ts    SpeechRecognition + speechSynthesis (es-MX)
  lib/haptics.ts  Vibration API patterns
  lib/api.ts      requestRoute(), getFeatures()
  components/MapView.tsx        Google Maps, route + markers
  components/VoiceController.tsx  FAB mic + mute toggle
  components/HapticController.tsx background haptics + visual alert banner
  components/RouteResultCard.tsx  ruta + narración + barreras
  components/AccessibilityControls.tsx  contraste, texto, narrador, solo-vibración
```

## Git Rules

**Never commit.** Only the developer runs `git commit`/`git add`/`git push`. When a task is done, report what changed and give a suggested commit message — nothing more.

## Rules (short form)

- Package manager: **bun** (never npm/npx/yarn/pnpm).
- Multi-profile worst-case: any `B` among selected profiles → block.
- Coords to web map: `[lng, lat]` (GeoJSON order).
- Firestore active (Bloque 3 done); in-memory store always kept in sync for fast reads.
- `exclude_locations` for hot avoidance; never modify Valhalla tiles for demo path.
- Do not commit `.env` or credentials.
- No TODO comments — open items live in `docs/plan_ejecucion.md`.
- Seed file (`data/seed/features_seed.json`) is outside the `apps/api/` Docker context — Firestore is the production source of truth.
