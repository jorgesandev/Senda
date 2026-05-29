# Senda

Senda es una app map-first de ruteo peatonal accesible para Tijuana. Construida por el equipo Entropyc para HackFox 2026, track *Tijuana Sin Barreras*.

Separa el **tipo objetivo** de una barrera urbana de su **efecto por perfil**, y planea rutas usando el peor caso entre los perfiles funcionales seleccionados (silla de ruedas, ceguera, movilidad reducida, etc.). Un reporte ciudadano recalcula las rutas activas en tiempo real.

**Demo:** [Vercel — ver `docs/status.md` para URL actualizada]  
**API:** `https://senda-api-131553755517.us-central1.run.app`

---

## Quickstart local

### Web (puerto 3000)

```bash
cd apps/web
bun install
bun dev
```

### API (puerto 8080)

```bash
cd apps/api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8080
```

### Valhalla (ruteo, puerto 8002)

```bash
docker compose -f services/valhalla/docker-compose.yml up
```

### Variables de entorno

Copia `infra/.env.example` a `apps/web/.env` y `apps/api/.env` y llena las claves. Mínimo para correr local:

```
# apps/api/.env
GOOGLE_MAPS_API_KEY=...
FIREBASE_PROJECT_ID=sendamx
VALHALLA_URL=http://localhost:8002

# apps/web/.env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Smoke test

```bash
# Matriz de impacto
cd apps/api
.venv/bin/python -c "import matrix; print(matrix.resolve_effect(['WHEELCHAIR'], {'kind':'barrier','subtipo':'surface_broken','atributos':{}}))"
# → B

# Ruta real
curl -s -X POST http://localhost:8080/route \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Av Revolucion Tijuana","destination":"Zona Rio","profiles":["WHEELCHAIR"]}' \
  | python3 -m json.tool | head -10
```

---

## Arquitectura

```
apps/web        Next.js 14 App Router — mapa, ruteo, reportes, accesibilidad
apps/api        FastAPI — /route, /features, /features/stream (SSE), /report
services/       Valhalla con tiles reales de Tijuana
data/seed/      Features sembradas (barreras y amenidades en Av. Revolución)
docs/           SRS, plan de ejecución, status actual
```

### Flujo principal

```
Usuario abre el mapa → escribe destino (texto o voz) → ajusta perfiles
  → API geocodifica → consulta features del bbox
  → matrix.resolve_effect (peor caso multi-perfil)
  → Valhalla route con exclude_locations para barreras B
  → mapa dibuja ruta + markers → TTS narra resultado

Ciudadano reporta barrera (foto + GPS)
  → POST /report → Firestore → SSE broadcast
  → haversine <80m de ruta activa + efecto=B
  → rerouteIfNeeded → vibración háptica + banner visual + LiveRerouteToast
```

### Principio TIPO vs EFECTO

Una barrera tiene atributos físicos objetivos (`surface_broken`, `ramp_missing`, etc.). Un perfil tiene sensibilidades funcionales. El costo de ruteo es `matrix.resolve_effect(perfiles, feature)`. Nunca se escribe `if profile == "WHEELCHAIR"` en el código de ruteo.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind, Zustand, Google Maps JS |
| Accesibilidad | Web Speech API, speechSynthesis, Vibration API, ARIA |
| Backend | FastAPI, pydantic v2, Python 3.12 |
| Ruteo | Valhalla 3.5.1 con OpenStreetMap Tijuana |
| Base de datos | Firestore (capa viva) + in-memory store (reads rápidos) |
| Deploy | Cloud Run (API + Valhalla), Vercel (web) |

---

## Despliegue en producción

Ver `docs/status.md` para URLs actualizadas y comandos de rebuild.

```bash
# Rebuild API
gcloud run deploy senda-api --source apps/api --region us-central1 --allow-unauthenticated --port 8080

# Rebuild Valhalla (solo si cambian los tiles)
gcloud run deploy senda-valhalla --source services/valhalla --region us-central1 --allow-unauthenticated --port 8002 --memory 1Gi --min-instances 1 --max-instances 1
```

---

## Créditos

Desarrollo: Jorge Sandoval ([jorgesandoval.dev](https://jorgesandoval.dev))  
Co-ideación e investigación de campo: Bernardo Morales ([bernardmora.github.io](https://bernardmora.github.io))

## Licencia

MIT
