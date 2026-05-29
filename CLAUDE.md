# CLAUDE.md — Senda

## Session Start — Read These First

At the beginning of every session, before writing any code, read:

1. `docs/plan_ejecucion.md` — current block, completed tasks, what's next
2. `docs/SRS.md` — product spec and data contracts
3. `README.md` — public setup and architecture overview

This is mandatory. Do not skip even if the task seems clear from the prompt.

## Project

Accessible pedestrian routing for Tijuana. SRS at `docs/SRS.md`. Execution order at `docs/plan_ejecucion.md`. Implementation rules at `AGENTS.md` (read both).

## Stack

| Layer | Tech | Path |
|---|---|---|
| Web | Next.js 14 App Router, TS, Tailwind, Zustand, Google Maps JS | `apps/web` |
| API | FastAPI, pydantic v2, httpx | `apps/api` |
| Routing | Valhalla (local Docker) | `services/valhalla`, port 8002 |
| Data | GeoJSON/MapFeature, seed | `data/seed` |

## Local Dev

```bash
# Web (port 3000)
cd apps/web && bun dev

# API (port 8080)
cd apps/api && .venv/bin/uvicorn main:app --reload --port 8080

# Valhalla
docker compose -f services/valhalla/docker-compose.yml up
```

## Key Contracts

- `MapFeature` — the one data entity; `kind: barrier|amenity|transport|crossing`
- `RouteRequest` — `{ origin, destination, profiles[] }` — profiles always sent, never omitted
- `RouteResponse` — `{ coords, distance_m, eta_min, features_evitadas, features_aprovechadas, steps }`
- TIPO vs EFECTO: `matrix.py` / `lib/matrix.ts` hold the impact table; routing calls it, never inlines `if profile == X`

## Current Block

Check `docs/plan_ejecucion.md` for the active block — it is the authoritative source.

Completed so far: Bloque 0–3 (Valhalla real, geocoding, route drawing, impact matrix, Firestore, SSE citizen loop).

## Verification Shortcuts

```bash
# Matrix sanity
cd apps/api && .venv/bin/python -c "import matrix; print(matrix.resolve_effect(['WHEELCHAIR'], {'kind':'barrier','subtipo':'surface_broken','atributos':{}}))"

# Route smoke
curl -s -X POST http://localhost:8080/route \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Av Revolucion TJ","destination":"Zona Rio","profiles":["WHEELCHAIR"]}' | python3 -m json.tool | head -20

# Features (should return real seed data)
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
  lib/store.ts    Zustand — profiles[], activeRoute, liveFeatures
  lib/api.ts      requestRoute(), getFeatures()
  components/MapView.tsx     Google Maps, route + markers
  components/FeatureMarker.tsx  icon+color, in RouteResultCard
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
