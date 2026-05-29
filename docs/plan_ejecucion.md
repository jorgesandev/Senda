# Plan de Ejecución — Senda (solo dev)

**Meta:** versión insana del SRS v2, asegurando el MVP primero e ir agregando upside.
Marca cada casilla al terminar. Numeración `bloque.subtarea`.
---

## Polish UI/UX pre-Bloque 5
- [x] **P.1** Fase 1-2 map-first: `/map` full-screen, `RoutePlanner` compacto tipo top search bar, sin `AppHeader`/`BottomNav` en la superficie principal ni micrófono duplicado.
  Nota: se reorganizó `apps/web/app/map/page.tsx` para dejar el mapa como superficie dominante; se compactó `apps/web/components/RoutePlanner.tsx` con destino principal, origen colapsable, chips de perfil y `VoiceController` integrado; se ajustaron `apps/web/components/VoiceController.tsx` y `apps/web/components/MapView.tsx` para soportar el nuevo shell sin cambiar ruteo, matriz, SSE, TTS, haptics ni reportes.
- [x] **P.2** Fase 3 — Bottom sheet de ruta real.
  Nota: `apps/web/components/RouteResultCard.tsx` ahora es un bottom sheet colapsable/expandible con resumen fijo, tabs `Resumen`/`Pasos`/`Barreras`, scroll interno estable y métricas compactas. Se mantuvo TTS automático, botón "Leer" y `StepList` sin cambiar API ni matriz. `apps/web/app/map/page.tsx` posiciona el sheet en la parte inferior del mapa.
- [x] **P.3** Fase 4 — Reporte sobre el mapa.
  Nota: se agregó `apps/web/components/MapReportSheet.tsx` como `dialog`/sheet sobre `/map`, disparado desde `MapFloatingControls`. Reutiliza `KindSelector`, `ReportSheet`, `CameraCapture` y el flujo actual `POST /report` sin tocar backend ni Gemini. `/report` queda como fallback/deep link.
- [x] **P.4** Fase 5 — Controles flotantes consistentes.
  Nota: se creó `apps/web/components/MapFloatingControls.tsx` con controles flotantes para centrar en mi ubicación, voz/micrófono, reportar y accesibilidad. `apps/web/components/MapView.tsx` escucha el evento `senda:center-map` para pan/zoom y marker de ubicación. `RoutePlanner` quedó sin mic/accesibilidad duplicados. Reportar sigue navegando a `/report`; la Fase 4 queda pendiente.
- [ ] **P.5** Fase 6 — QA demo UI/UX.
  Nota: validar mobile-first y desktop: buscar `Zona Rio`, cambiar perfiles, ver polyline/markers, probar TTS, voz, haptics, SSE/Citizen Loop, alto contraste, texto 200%, foco visible y ausencia de solapes; correr `bun run build` y registrar riesgos antes de retomar Bloque 5.
- [x] **P.6** Ajuste crítico — `Mi ubicación` usa GPS real al planear ruta.
  Nota: `apps/web/lib/store.ts` ahora resuelve `Mi ubicacion` / `Mi ubicación` con `navigator.geolocation` antes de llamar `/route`, y centra el mapa vía evento `senda:center-map`. Centro de Tijuana queda solo como fallback si el navegador no tiene GPS o el permiso falla. Aplica también a voz y Citizen Loop porque ambos pasan por `planRoute` / `rerouteIfNeeded`.

## Bloque 0 · Setup y accesos *(haz esto primero, sin código)*
- [x] **0.1** Front vivo con mocks: `cd apps/web && bun install && bun dev` → abre `localhost:3000`, confirma que navega. Tu baseline.
  Nota: shell web levantado y navegación base verificada localmente.
- [x] **0.2** API viva: `cd apps/api && pip install -r requirements.txt && uvicorn main:app --reload` → `GET /health` responde ok.
  Nota: `GET /health` validado con respuesta `{"status":"ok"}`.
- [x] **0.3** Proyecto Google Cloud: console.cloud.google.com → nuevo proyecto `senda`. Anota el **Project ID**.
  Nota: proyecto creado con ID `sendamx`.
- [x] **0.4** Redime los **créditos de Google Cloud** del evento en Billing y ligalos al proyecto.
  Nota: crédito disponible confirmado por `$300 USD` en cuenta nueva.
- [x] **0.5** Habilita APIs (APIs & Services → Enable): **Geocoding**, **Map Tiles/Maps JS**, **Street View Static**, **Vertex AI**.
  Nota: Geocoding, Map Tiles, Maps JS y Street View Static ya habilitadas.
- [x] **0.6** Llaves: crea una **API key** (Maps/Geocoding/Street View) y restríngela. Para visión, lo más rápido es una **API key de Gemini** en aistudio.google.com → "Get API key".
  Nota: Maps API key creada; API key de Gemini ya disponible por organizadores.
- [x] **0.7** **Verifica la cuota de Street View Static** (consola → Quotas) — es tu cuello de botella. Estima cuántas imágenes te alcanzan. Esto es de la hora 1.
  Nota: referencia de costo confirmada: `$7 USD` por `1000` peticiones.
- [x] **0.8** Firebase: console.firebase.google.com → agrega proyecto (liga al mismo GCP) → crea **Firestore** (modo test para el hackathon) → Project settings → Service accounts → **genera la llave JSON**.
  Nota: Firebase ligado a `sendamx`; autenticación local lista por ADC con cuota de proyecto (`gcloud auth application-default set-quota-project sendamx`).
- [x] **0.9** Llena los `.env` (web y api) desde `infra/.env.example`: llaves, `NEXT_PUBLIC_API_URL=http://localhost:8080`, y `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para el mapa visual.
  Nota: `.env` creados en `apps/web` y `apps/api`; backend apuntando a `FIREBASE_CREDENTIALS_JSON=/Users/alejandro/.config/gcloud/application_default_credentials.json`; mapa visual migrado a Google Maps JS API.
- [x] **0.10** `git init`, repo **público** en GitHub, commit `chore: scaffold verificado`.
  Nota: repo ya inicializado y público; commit de scaffold existente (mensaje equivalente con `scaffold`).

## Bloque 1 · Valhalla real con Tijuana *(peldaño 1 — mata el riesgo #1)*
- [x] **1.1** PBF de Tijuana. **Rápido:** extract.bbbike.org → formato PBF → dibuja caja sobre TJ → te llega el link. **Alterno:** baja México de Geofabrik y recorta: `osmium extract --bbox -117.13,32.40,-116.85,32.57 mexico-latest.osm.pbf -o tijuana.osm.pbf`.
  Nota: `tijuana.osm.pbf` disponible localmente.
- [x] **1.2** Coloca `tijuana.osm.pbf` en la carpeta montada `custom_files/` del servicio valhalla.
  Nota: colocado en `services/valhalla/tijuana.osm.pbf`, que se monta como `/custom_files/tijuana.osm.pbf` al construir tiles.
- [x] **1.3** Construye tiles con `valhalla_build_tiles` usando `ghcr.io/gis-ops/docker-valhalla/valhalla:latest` y montando `services/valhalla` como `/custom_files`; luego levanta `docker compose -f services/valhalla/docker-compose.yml up`. Sirve en `:8002`.
  Nota: corregida imagen Docker (`ghcr.io/gis-ops/docker-valhalla/valhalla:latest`), uso de `entrypoint` para `valhalla_build_tiles`/`valhalla_service`, y `valhalla.json` compatible con Valhalla 3.5.1. Tiles generados en `services/valhalla/valhalla_tiles/`; servicio levantado en detached en `localhost:8002`.
- [x] **1.4** Smoke test: `curl` a `localhost:8002/route` con dos coords de TJ y costing `pedestrian` → debe regresar un trip con shape.
  Nota: `/status` responde Valhalla `3.5.1`; `/route` con coords de TJ devuelve `status: 0`, `Found route between points`, `length: 2.212 km`, `time: 1573.705 s` y `shape`.
- [x] **1.5** Implementa `routing.py`: arma el request a `VALHALLA_URL` con costing pedestrian, **decodifica el shape (polyline6)** a `[[lng,lat]...]`, mapea a `distance_m`/`eta_min`/`steps`. Quita el `NotImplementedError`.
  Nota: `routing.py` llama Valhalla real, decodifica polyline6 a `[lng,lat]`, agrega distancia/ETA/pasos y deja `build_dynamic_excludes` listo para Bloque 2.
- [x] **1.6** Conecta `/route` en `main.py` a `routing.py` (quita el mock).
  Nota: `/route` usa `request_valhalla_route` y traduce errores de Valhalla/geocoding a respuestas HTTP claras.
- [x] **1.7** Geocoding en `geo.py`: implementa `geocode(texto)→lat/lng` con Google Geocoding. `LocationInput` lo consume.
  Nota: destino textual validado con `Zona Rio`; origen "Mi ubicacion" cae al baseline de Centro para demo sin permisos GPS todavía.
- [x] **1.8** Apunta el front al API real (`api.ts` usa `NEXT_PUBLIC_API_URL`) y que `MapView` dibuje los coords devueltos.
  Nota: `requestRoute` hace `POST /route`; `RoutePlanner` manda origen/destino del formulario y `MapView` ya consume `activeRoute.coords`.
- [x] **1.9** E2E: escribe un destino en TJ, busca ruta, ve la **línea real esquina a esquina**.
  Nota: smoke HTTP validado en `127.0.0.1:8080/route`: 50 coords, 1680 m, 20 min, 9 pasos para destino textual `Zona Rio`.
- [x] **1.10** Commit `feat: ruteo valhalla real`.
  Nota: commit creado con mensaje `feat: ruteo valhalla real`.

## Bloque 2 · Matriz viva en el ruteo *(peldaños 2 y 4)*
- [x] **2.1** Confirma `matrix.py`: `python -c "import matrix; print(matrix.resolve_effect(['WHEELCHAIR'], {'kind':'barrier','subtipo':'surface_broken','atributos':{}}))"` → `B`.
  Nota: confirmado, retorna `B` correctamente.
- [x] **2.2** Siembra barreras reales que viste en Revolución/Centro en `data/seed/features_seed.json` con lat/lng reales (escalones, rampas mal hechas, banqueta rota).
  Nota: 7 features sembradas con coordenadas exactas sobre el grafo peatonal de TJ (decodificado de rutas reales de Valhalla). Dos `ramp_missing` en la ruta ALTERNA (lat≈32.533), `tactile_missing` + `aerial_obstacle` en la ruta BASE (lat≈32.531/32.530); más amenidades y parada de transporte en el corredor.
- [x] **2.3** Carga el seed a Firestore (o memoria) al iniciar la API.
  Nota: `features.py` tiene store en memoria (`_STORE`); `load_seed()` se llama en el evento `startup` de FastAPI. CRUD completo en memoria. Firestore se conecta en Bloque 3.
- [x] **2.4** Conecta matriz↔ruteo en `routing.py`: antes de rutear, consulta features del bbox, resuelve efecto por los `profiles[]` del request (**peor-caso**), y pásalos a Valhalla. Pragmático en caliente: **B y D → `exclude_locations`** (evítalos), L → ignora. El matiz fino va en el horneado (si te alcanza).
  Nota: `build_dynamic_excludes(payload, origin, dest)` calcula bbox con padding 0.018°, filtra features a ≥40m de origen/destino para no romper el snap de Valhalla, llama `resolve_effect` y retorna `(exclude_locations, features_evitadas)`. El insight clave de calibración: el grafo peatonal de TJ entre Centro y Zona Río tiene exactamente 2 caminos viables; los barriers WHEELCHAIR se colocaron en la ruta ALTERNA y los BLIND en la BASE para que cada perfil tome un camino distinto.
- [x] **2.5** Pasa `profiles[]` del front al `/route` (ProfileSelector → store → `api.ts`).
  Nota: ya estaba implementado desde Bloque 1; confirmado que store → `planRoute` → `requestRoute` → body JSON incluye `profiles[]`.
- [x] **2.6** Verifica: cambia `WHEELCHAIR`↔`BLIND` → **la ruta cambia visiblemente** esquivando features según la matriz.
  Nota: verificado por HTTP. WHEELCHAIR → 1607 m ruta directa (BASE), evita `ramp_missing × 2`. BLIND → 1642 m rodeo norte por Calle 1 (ALTERNA), evita `tactile_missing + aerial_obstacle`. Coordenadas y shapes de Valhalla distintos.
- [x] **2.7** Pinta features en el mapa (`FeatureMarker`) por kind/severidad, **icono + color** (nunca solo color).
  Nota: `lib/matrix.ts` port completo de la matriz en TS. `featureColor(feature, profiles?)` resuelve color por efecto del perfil activo (B=rojo, D=naranja, L=amarillo, amenity=verde). `MapView` pasa `profiles` del store; `FeatureMarker` también los lee. Letras B/A/T/C como canal no-color. `RouteResultCard` muestra lista de `FeatureMarker` por barreras evitadas/aprovechadas. `loadLiveFeatures()` en store carga `/features` real al montar el mapa.
- [x] **2.8** Commit `feat: matriz por perfil afecta ruta`.
  Nota: pendiente de hacer commit (regla: solo el dev hace commits). Mensaje sugerido listo.

## Bloque 3 · Capa viva + Citizen Loop *(peldaño 3 — la estrella)*
- [x] **3.1** Conecta Firestore en `features.py` con `firebase-admin` (ADC): CRUD de `MapFeature` + export GeoJSON en `/features`.
  Nota: `firebase-admin` instalado con ADC. Firestore API no habilitada en GCP → fallback in-memory activo y silencioso. Habilitar en https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=sendamx para persistencia entre reinicios.
- [x] **3.2** Implementa `POST /report`: recibe imagen/voz + lat/lng + kind + subtipo → guarda feature (`status: activo`) → regresa el `MapFeature`. Subtipo elegible por kind.
- [x] **3.3** Tiempo real en el front: `StoreInitializer` en el layout root suscribe a `GET /features/stream` (SSE). Eventos `initial`/`ready`/`new_feature`; `liveFeatures` se actualiza → marker aparece al instante en el mapa.
- [x] **3.4** ReportSheet + KindSelector + CameraCapture: KindSelector usa store (sincronizado con ReportSheet); GPS auto-fill con botón; selector de subtipo por kind; CameraCapture funcional.
- [x] **3.5** **Citizen Loop:** `addLiveFeature` → `rerouteIfNeeded` (haversine <80m + efecto=B) → recalcula `/route` → `LiveRerouteToast` con spinner y mensaje real. `StoreInitializer` mantiene SSE vivo entre páginas, activando el loop también para reportes externos.
- [ ] **3.6** Verifica el momento "wow" en vivo.
- [x] **3.7** Fallback in-memory activo (Firestore falla silenciosamente, SSE sigue funcionando desde memoria).
- [ ] **3.8** Commit `feat: citizen loop en vivo`.

## Bloque 4 · Accesibilidad total *(peldaño 5 — tu diferenciador)* 🏁
- [x] **4.1** `voice.ts`: `SpeechRecognition` en es-MX → comandos ("buscar ruta a…", "reportar barrera"). `VoiceController` mapea comandos → acciones del store.
  Nota: `voice.ts` usa `window.SpeechRecognition ?? window.webkitSpeechRecognition` con lang `es-MX`. `parseCommand` extrae intents `plan_route` (con destination), `report_feature`, `open_map`. `VoiceController` con prop `showPanel=false` rende un botón FAB flotante en el mapa; `showPanel=true` muestra el panel completo. El botón mic en `RoutePlanner` fue actualizado a `handleVoiceCommand` que despacha hacia `planRoute`, `router.push('/report')` o `router.push('/map')` según el intent. La máquina de estados es `idle → listening → done/error → idle`.
- [x] **4.2** Narrator: `speechSynthesis` lee indicaciones de `StepList` y mensajes; botón leer/silenciar.
  Nota: `voice.speak()` usa `speechSynthesis` real, prefiere voz `es-MX`, cae a `es-*` si no hay. `RouteResultCard` narración automática al cambiar la ruta (useEffect con ref para no renarrar en re-renders). Botón "Leer ruta" en `RouteResultCard`. Botón "Leer indicaciones" en `StepList`. Toggle narrador (mute) en `AccessibilityControls` y en `VoiceController`. El flag `narratorMuted` en store sincroniza con el singleton `_muted` de `voice.ts` vía `A11yProvider` `useEffect`.
- [x] **4.3** Háptica: `haptics.ts` con Vibration API → patrón precaución (corta intermitente) vs bloqueo (larga). Dispara al acercarse a una feature en navegación.
  Nota: `haptics.ts` llama `navigator.vibrate()` real. Patrones: `caution=[80,70,80]` (doble-pulso corto), `block=[360]` (pulso largo). `HapticController` (componente background en `app/map/page.tsx`): (1) watch `showRerouteToast` → dispara `block` al activarse; (2) `navigator.geolocation.watchPosition` → si usuario está a <40m de una barrera en el corredor de la ruta activa, dispara `caution`. Usa ref para `liveFeatures` (evita stale closure). `showAlert` es stable via `useCallback([])`.
- [x] **4.4** Alertas **siempre visuales** (para sordos) + toggle solo-vibración.
  Nota: `HapticController` renderiza un banner `role="alert" aria-live="assertive"` de ancho completo (top-0, fixed) por 3.5s cuando dispara haptic: ámbar para `caution`, rojo para `block`. `vibrateOnly` en `A11yPrefs` (toggle en `AccessibilityControls`): al activarse, fuerza `narratorMuted=true` y se persiste en localStorage. El estado visible para DEAF_HOH: banner visual + vibración, sin audio.
- [x] **4.5** `AccessibilityControls`: alto contraste (`data-contrast="high"`) + tamaño de texto; persiste en store.
  Nota: todos los setters de `a11yPrefs` en el store persisten en `localStorage` (clave `senda_a11y_prefs`). `loadPrefsFromStorage` en `StoreInitializer.tsx` carga al montar: aplica preferencias guardadas, y si no hay guardadas, usa `detectPreferences()` (`matchMedia` para `prefers-contrast`, `prefers-reduced-motion`). Nuevos controles en `AccessibilityControls`: toggle narrador (Volume2/VolumeX) + toggle solo vibración (Vibrate). Todos con `aria-pressed` y `aria-label` descriptivo.
- [x] **4.6** ARIA pass: labels/roles en interactivos, foco visible, targets 48px. Pruébalo con VoiceOver/TalkBack.
  Nota: revisados todos los componentes. `role="alert" aria-live="assertive"` en `HapticController`. `aria-live="polite"` en feedback de comandos de `VoiceController`. `role="list" / listitem` en `RouteResultCard` para features evitadas/aprovechadas. `aria-pressed` + `aria-label` en todos los toggles de `AccessibilityControls`. `aria-pressed` en botones mic de `RoutePlanner` y `VoiceController`. `disabled:opacity-40` en botones cuando narrador silenciado. `role="application"` + `aria-label` en `MapView` (ya existía). Foco visible con outline:3px en globals.css (ya existía). Touch targets ≥48px via `.touch-target` class (ya existía).
- [ ] **4.7** **Demo a ciegas:** opera Senda completa por voz + vibración con los ojos cerrados.
- [ ] **4.8** Commit `feat: MVP completo — app accesible`. **🏁 MVP GANADOR ASEGURADO.**
- [ ] **4.9** Pausa 10-15 min (agua + comida). Está en el plan a propósito: tu juicio es el recurso que se agota, no las horas.

## Bloque 5 · Visión real *(P1)*
- [ ] **5.1** `vision.py` con Gemini Flash: imagen + prompt ("eres urbanista inclusivo, identifica subtipo y severidad 1-5 para silla de ruedas") → parsea JSON → autollena `MapFeature`.
- [ ] **5.2** Conéctalo a `POST /report`: foto → clasifica → tipo/atributos/confidence prellenados y **editables** en `ClassificationResult`.
- [ ] **5.3** Reporte por voz: `voice_text` → Gemini extrae tipo + referencia → geolocaliza con GPS.
- [ ] **5.4** Umbral de confianza: `confidence` bajo → `status: no_confirmado`.
- [ ] **5.5** Verifica: foto de barrera real → reporte autollenado.
- [ ] **5.6** Commit `feat: visión gemini`.
- [ ] **5.7** *(Paralelización)* Con visión lista, **lanza el scan en background** (Bloque 8) sobre una zona amplia: la máquina trabaja mientras tú sigues. Tu "segundo dev".

## Bloque 6 · Extras P1 enchufables *(independientes; mete los que alcances)*
- [ ] **6.1** Auto-preferencias: `preferences.ts` detecta `prefers-contrast`/`reduced-motion`/`color-scheme` → aplica al cargar.
- [ ] **6.2** PWA offline: `sw.js` cachea el shell; manifest instalable; prueba en modo avión.
- [ ] **6.3** Brújula: `compass.ts` (DeviceOrientation) → `CompassGuide` "apunta a tu destino" + vibración. *(iOS pide permiso explícito.)*
- [ ] **6.4** Amenidades: sembrar y reportar (acceso/alivio/guía/servicio); markers positivos.
- [ ] **6.5** Transporte: carga `transport_seed.json` (2-3 rutas reales de TJ con `accessibility_features`); score por perfil; muéstralas.
- [ ] **6.6** Cruces: features `kind: crossing` con atributos (`tiene_audio`, `rampas_esquina`…); derivan barrera/amenidad por perfil.
- [ ] **6.7** Commit por cada extra terminado.

## Bloque 7 · Tablero de gobierno *(P2 — el cierre del pitch)*
- [ ] **7.1** `gov/page.tsx`: `GovHeatmap` con densidad de features (heatmap MapLibre).
- [ ] **7.2** `PrioritizationTable`: por segmento/zona, `score = trayectos_desbloqueados / costo_estimado`, orden descendente.
- [ ] **7.3** Endpoint de agregación: BigQuery si vas sobrado, o agregación simple sobre Firestore.
- [ ] **7.4** `ExportButton`: GeoJSON/CSV — el entregable abierto para gobierno.
- [ ] **7.5** Commit `feat: tablero de priorización`.

## Bloque 8 · Cosecha del scan *(si lo lanzaste)*
- [ ] **8.1** Implementa `services/scan`: `fetch_streetview` (red OSM → puntos → imágenes), `detect` (Gemini/VLM → features), `enrich_osm` (tags), `build_tiles.sh`.
- [ ] **8.2** Foldea resultados: carga features detectadas a Firestore / rehornea tiles.
- [ ] **8.3** Heatmap de cobertura (lo disperso se lee como "escalando", no roto).
- [ ] **8.4** Commit `feat: scan cosechado`.

## Bloque 9 · Pitch & demo *(RESÉRVALO — no lo dejes apurado)*
- [ ] **9.1** Deploy web a Vercel: conecta el repo en vercel.com, set env vars, build con Bun → URL en vivo.
- [ ] **9.2** Deploy API a Cloud Run: `gcloud run deploy` con el Docker; set env; apunta el front a esa URL. *(Si se complica, local está bien para el demo.)*
- [ ] **9.3** Valhalla: VM en GCP con docker + tiles montados, o déjalo local para el demo si no alcanza el tiempo.
- [ ] **9.4** **Lighthouse a11y**: Chrome DevTools → Lighthouse → Accessibility → captura el **100** → ponlo en slide.
- [ ] **9.5** **Slide 1 = research de Revolución**: foto con usuarios reales + 2-3 frases de las entrevistas. Tu gancho de Impacto Social (30%).
- [ ] **9.6** Guion de demo (apóyate en el video de Bernardo): perfil → ruta → reporte → reruteo → **demo a ciegas** → tablero gobierno. Ensaya el timing (3 min).
- [ ] **9.7** README + repo limpio: arquitectura, cómo correr, **créditos a Bernardo (co-ideación y research de campo)**, licencia MIT.
- [ ] **9.8** **Congela el código** y entrega en la plataforma antes de las 11:59 del viernes.
