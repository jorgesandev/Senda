# Senda

Senda is an accessible pedestrian routing scaffold for Tijuana. It separates objective map feature type from profile-specific effect, then routes with the worst-case effect across selected functional profiles.

This repository is a hackathon skeleton: contracts, typed shells, design tokens, runnable empty services, and mock responses. External integrations are intentionally stubbed.

## Quickstart

Web app:

```bash
cd apps/web
bun install
bun dev
```

API:

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8080
```

Local API and Valhalla containers:

```bash
docker compose -f infra/docker-compose.yml up
```

Matrix sanity check:

```bash
cd apps/api
python -c "import matrix; print(matrix.resolve_effect(['WHEELCHAIR'], {'kind': 'barrier', 'subtipo': 'surface_broken', 'atributos': {}}))"
```

## Layout

```text
apps/web       Next.js 14 App Router shell, Tailwind tokens, PWA shell, typed mock client
apps/api       FastAPI contracts, pydantic models, stubbed integration modules
services       Valhalla local service files and scan pipeline shells
data/seed      Seed feature and transport samples for Tijuana
infra          Local compose, environment template, deployment notes
docs           Architecture, pitch outline, prioritized implementation checklist, SRS
```

## Credits

Build: Jorge Sandoval.

Co-ideation and field research: Bernardo Morales.

## License

MIT.
