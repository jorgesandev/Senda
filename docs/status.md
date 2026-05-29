# Status — Senda

*Actualiza este archivo al terminar cada tarea. Es la foto actual del proyecto.*

---

## Última actualización

**2026-05-29** — Polish UI/UX Fase 1-2 aplicado; Fases 3-6 agregadas al plan antes de Bloque 5. Backend desplegado en GCP.

---

## Despliegue en producción

| Servicio | URL | Estado |
|---|---|---|
| Frontend (Vercel) | Configurado en Vercel — actualizar con URL cuando esté disponible | ✅ desplegado |
| API (Cloud Run) | `https://senda-api-131553755517.us-central1.run.app` | ✅ público |
| Valhalla (Cloud Run) | `https://senda-valhalla-131553755517.us-central1.run.app` | ✅ público, min-instances=1 |
| Firestore | Proyecto `sendamx`, colección `features` | ✅ 8 features activas |

**Variable en Vercel:** `NEXT_PUBLIC_API_URL = https://senda-api-131553755517.us-central1.run.app`

---

## Bloques completados

| Bloque | Nombre | Estado |
|---|---|---|
| 0 | Setup y accesos | ✅ completo |
| 1 | Valhalla real con Tijuana | ✅ completo |
| 2 | Matriz viva en el ruteo | ✅ completo |
| 3 | Capa viva + Citizen Loop | ✅ completo |
| 4 | Accesibilidad total | ✅ completo (4.7 demo pendiente) |

**Bloque activo:** 5 — Visión Gemini  
Ver `docs/plan_ejecucion.md` para detalle de tareas.

---

## Lo que funciona ahora

### Ruteo
- Valhalla 3.5.1 con tiles reales de Tijuana
- Geocoding con Google Geocoding API
- Ruta peatonal con peor-caso multi-perfil (WHEELCHAIR, BLIND, REDUCED_MOB, LOW_VISION, DEAF_HOH, COGNITIVE)
- WHEELCHAIR → 1607m ruta directa, evita 3 barreras
- BLIND → 1642m ruta alterna norte, evita tactile_missing + aerial_obstacle
- `exclude_locations` en caliente para avoidance inmediato

### Capa viva
- Firestore como base de datos persistente (8 features sembradas)
- In-memory store sincronizado para reads rápidos
- `GET /features/stream` SSE: eventos `initial` / `ready` / `new_feature`
- `POST /report` crea features y las propaga via SSE
- Fallback in-memory silencioso si Firestore falla

### Citizen Loop
- `rerouteIfNeeded`: barrera nueva dentro de 80m de la ruta activa con efecto=B → recalcula ruta
- `LiveRerouteToast` visual + haptic block al disparar
- `StoreInitializer` mantiene SSE activo entre páginas

### Accesibilidad de la app (Bloque 4)
- **Voz:** `SpeechRecognition` real en es-MX; comandos `plan_route` / `report_feature` / `open_map`
- **TTS:** `speechSynthesis` es-MX; narración automática de ruta al llegar resultado
- **Botones:** "Leer ruta" en `RouteResultCard`, "Leer indicaciones" en `StepList`
- **Háptica:** `navigator.vibrate` real; `caution=[80,70,80]` y `block=[360]`
- **Visual alerts:** banner fijo top-0 amber/rojo 3.5s con `role="alert"` para DEAF_HOH
- **Controles:** alto contraste, tamaño texto 100/125/150/200%, narrador on/off, solo-vibración
- **Persistencia:** preferencias a11y en `localStorage` (`senda_a11y_prefs`)
- **Auto-prefs:** `matchMedia` detecta `prefers-contrast` y `prefers-reduced-motion` en primer carga
- **ARIA:** `aria-pressed`, `aria-live`, `role="alert"`, `role="application"` en mapa, targets ≥48px

### Mapa
- Google Maps JS con estilo oscuro personalizado
- Markers por kind/severidad con icono + color (nunca solo color)
- Polyline de ruta verde con casing blanco
- `FeatureMarker` en `RouteResultCard` con barreras evitadas/aprovechadas
- `/map` es ahora la superficie principal full-screen: search bar compacta arriba, chips de perfil compactos, origen colapsable, micrófono integrado y resultado de ruta flotante sin `AppHeader`/`BottomNav` encima del mapa.

---

## Lo que falta (próximos bloques)

| Bloque | Qué | Prioridad |
|---|---|---|
| Polish UI/UX P.2-P.5 | Bottom sheet de ruta, reporte sobre mapa, controles flotantes, QA demo | P0 demo |
| 5 | Visión Gemini: clasificar fotos de reportes | P1 |
| 9 | Deploy final: Lighthouse a11y=100, slide research campo, README limpio | P0 pitch |
| 4.7 | Demo a ciegas en vivo (operación por voz+haptic con ojos cerrados) | P0 pitch |
| 6 | PWA offline, brújula, amenidades/transporte/cruces | P1 |
| 7 | Tablero de gobierno `/gov` con heatmap y priorización | P2 |

---

## GCP — recursos activos

```
Proyecto:    sendamx
Región:      us-central1
Cloud Run:   senda-api (min=0, max=3), senda-valhalla (min=1, max=1)
Firestore:   (default) nam5
Artifact Registry: cloud-run-source-deploy
```

**Para rebuilds:**
```bash
# API
gcloud run deploy senda-api --source apps/api --region us-central1 --allow-unauthenticated --port 8080

# Valhalla (solo si cambian los tiles)
gcloud run deploy senda-valhalla --source services/valhalla --region us-central1 --allow-unauthenticated --port 8002 --memory 1Gi --min-instances 1 --max-instances 1

# Solo env vars (no rebuild)
gcloud run services update senda-api --region us-central1 --update-env-vars "KEY=VALUE"
```

---

## Arquitectura clave (decisiones no obvias)

- **TIPO vs EFECTO**: `matrix.py` / `lib/matrix.ts` son la única fuente de verdad de impacto por perfil. Nunca `if profile == X` en routing.
- **GeoJSON order**: coords siempre `[lng, lat]` hacia el mapa, nunca `[lat, lng]`.
- **Peor caso multi-perfil**: cualquier `B` entre perfiles activos → exclude_location.
- **Seed path en Docker**: `features_seed.json` está fuera del contexto de `apps/api/`. En producción, Firestore ya tiene los datos. El fallback al seed file es solo para local.
- **SSE keepalive**: `/features/stream` emite `: keepalive\n\n` cada 30s para mantener la conexión viva en proxies.
- **Valhalla en Cloud Run**: tiles horneados en la imagen Docker (`services/valhalla/Dockerfile`). `min-instances=1` para evitar cold starts lentos (~10s) durante el demo.
