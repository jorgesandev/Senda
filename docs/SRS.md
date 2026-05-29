# SRS — Senda · v2 

**Software Requirements Specification · v2.0** *(supersede v1.0)*
Equipo Entropyc · HackFox 2026 · Track *Tijuana Sin Barreras*
Autores: Bernardo Morales ([bernardmora.github.io](https://bernardmora.github.io)) · Jorge Sandoval ([jorgesandoval.dev](https://jorgesandoval.dev))

> Define la **versión ideal final ("insana")** de Senda como meta. Cada requerimiento lleva prioridad: **P0** núcleo demoable garantizado · **P1** ideal · **P2** stretch. Sirve como especificación y mapa de priorización. No construir nada fuera de aquí sin actualizar el SRS. Convención de código: nunca comentarios de pendientes; lógica no implementada usa `NotImplementedError` (Python) o mocks tipados (TS), y el pendiente vive en `docs/IMPLEMENTATION_CHECKLIST.md`.

> **Qué cambió vs v1:** modelo de perfiles funcionales combinables, taxonomía de barreras expandida en 7 categorías, entidad unificada `MapFeature` con 4 `kind` (barrier/amenity/transport/crossing), matriz de impacto por perfil (reemplaza el COST_TABLE simple), reportes con 3 destinos, y accesibilidad de la app elevada a diferenciador central (voz, narrator, háptica, auto-preferencias).

---

## 1. Principio rector: TIPO vs EFECTO

Toda la lógica se apoya en una sola idea: **separar el TIPO (qué es, objetivo) del EFECTO (qué tan grave, por perfil).** Una barrera no sabe de discapacidades; tiene atributos físicos. Un perfil es un paquete de sensibilidades. El costo de ruteo es una función `(perfil × barrera) → efecto`. Así nunca se escribe un `if` por discapacidad: agregar un perfil es una columna, agregar un tipo es un renglón.

---

## 2. Perfiles de usuario (modelo funcional, combinable)

Se modelan **necesidades funcionales, no diagnósticos**. Un usuario selecciona **uno o varios** (ej. adulto mayor con bastón + baja visión = `REDUCED_MOB` + `LOW_VISION`).

| Dominio | Perfil | Engloba | Sensible a |
|---|---|---|---|
| Movilidad | `WHEELCHAIR` | silla de ruedas, scooter | escalón, sin/mala rampa, pendiente, ancho, superficie rota, obstrucción |
| Movilidad | `REDUCED_MOB` | bastón, muletas, andadera, adulto mayor, prótesis, **Parkinson/temblor** | pendiente, escalón alto, superficie inestable; necesita descansos y pasamanos |
| Visión | `BLIND` | ceguera total | sin podotáctil, cruce sin audio, obstáculo aéreo, obstrucción |
| Visión | `LOW_VISION` | baja visión, daltonismo | bajo contraste, mala iluminación, señalización pobre |
| Audición | `DEAF_HOH` | sordera, hipoacusia | (app-side: alertas visuales/hápticas); en transporte: avisos visuales |
| Cognición | `COGNITIVE` | TEA, discapacidad intelectual, demencia | rutas simples y predecibles, bajo caos sensorial |

**Multiplicadores situacionales** (no son discapacidad; amplían la base de impacto a casi cualquier usuario): `STROLLER` (carriola → se comporta como `WHEELCHAIR` atenuado) · `TEMP_INJURY` (lesión/yeso → como `REDUCED_MOB`). No son columnas nuevas en la matriz: se mapean a un perfil existente con un factor de atenuación.

**Regla de combinación multi-perfil (lógica de negocio crítica):** para un usuario con varios perfiles, el efecto de cada segmento es el **peor caso** entre sus perfiles — cualquier `BLOQUEO` en algún perfil bloquea; si no, se toma la penalización máxima. Default seguro para accesibilidad.

---

## 3. Features del mapa: la entidad unificada `MapFeature`

Cada elemento que vive en el mapa es un `MapFeature` con cuatro `kind`. Encapsula sin sobre-abstraer: concreto para que un ciudadano reporte "escalón", abstracto para que la matriz escale.

```
MapFeature {
  kind: "barrier" | "amenity" | "transport" | "crossing"
  categoria: string          // grupo objetivo
  subtipo: string            // específico, reconocible por el ciudadano
  atributos: object          // cuantitativo donde importa (grado_pct, ancho_cm, tiene_audio…)
}
```

### 3.1 `barrier` — 7 categorías (agrupadas por naturaleza física del problema)
La agrupación sigue las articulaciones naturales: cómo se detecta, qué atributos tiene, a quién afecta.

1. **Superficie** — `surface_broken` (cuarteada/rota), `surface_unpaved` (sin pavimentar), `surface_loose` (grava/suelta), `surface_slippery`.
2. **Cambio de nivel** — `step_curb` (escalón/borde), `stairs`, `ramp_missing` (sin rampa), `ramp_defective` (mal hecha/choca con poste).
3. **Pendiente** — `steep_grade` *(aunque esté pavimentada y con rampa)*; atributo `grado_pct`.
4. **Ancho / paso libre** — `path_narrow`; atributo `ancho_cm`.
5. **Obstrucción** — `obstruction_temporary` (carro, ladrillos, basura, puesto), `obstruction_permanent` (árbol, poste, hidrante), `aerial_obstacle` (rama/letrero bajo); atributo `altura_cm`.
6. **Guía / orientación** — `tactile_missing` (sin podotáctil), `signage_poor`, `sensory_chaos` (ruido/gentío).
7. **(Cruce → es su propio `kind`, ver 3.4)**

### 3.2 `amenity` — lo positivo, 4 grupos funcionales
- **Acceso:** `step_free_access`, `good_ramp`, `elevator`, `accessible_parking`.
- **Alivio:** `accessible_restroom`, `rest_point` (banca/descanso), `shade_water`.
- **Guía:** `tactile_present`, `audio_signal_present`.
- **Servicio:** `accessible_business` (insignia "Accesible Verificado por la Comunidad").

### 3.3 `transport` — paradas y rutas (el plus)
```
atributos.accessibility_features {
  has_ramp, low_floor, wheelchair_space,
  audio_announcements, visual_announcements,
  priority_seat, braille
}
geometry: Point (parada) | LineString (ruta)
```
Simetría elegante: `audio_announcements`→`BLIND`, `visual_announcements`→`DEAF_HOH`/`LOW_VISION`, `has_ramp`/`low_floor`/`wheelchair_space`→`WHEELCHAIR`/`REDUCED_MOB`. El **mismo** motor de scoring puntúa la usabilidad de una ruta de camión por perfil. Para el demo se siembran 2-3 rutas reales de TJ a mano.

### 3.4 `crossing` — semáforos/esquinas (kind propio)
```
atributos { tiene_audio, tiene_podotactil, tiene_conteo, rampas_esquina, semaforo_peatonal }
```
Se deriva en barrera o amenidad por perfil según sus atributos: "semáforo sin audio" no es caso especial, es `tiene_audio=false` evaluado contra `BLIND`.

---

## 4. Matriz de impacto (corazón anti-espagueti)

Tabla de **configuración, no código**. Para barreras: **B**=bloqueo · **D**=difícil · **L**=leve · **·**=nulo. Donde hay atributo cuantitativo, el efecto depende del umbral.

| Barrera / Cruce | WHEEL | REDUC | BLIND | LOWVIS | DEAF | COG |
|---|---|---|---|---|---|---|
| `surface_broken` / `surface_unpaved` | B | D | D | L | · | L |
| `surface_loose` / `surface_slippery` | D | D | D | L | · | L |
| `step_curb` / `stairs` | B | D | D | L | · | L |
| `ramp_missing` | B | L | · | · | · | · |
| `ramp_defective` | B | D | · | · | · | · |
| `steep_grade` (>8% B, 5-8% D) | B/D | D | L | · | · | L |
| `path_narrow` (<90cm B) | B | L | L | · | · | · |
| `obstruction_temporary` / `_permanent` | B | D | D | L | · | D |
| `aerial_obstacle` | · | · | B | L | · | · |
| `tactile_missing` | · | · | B | D | · | L |
| `signage_poor` | · | · | L | D | L | D |
| `sensory_chaos` | · | L | L | · | · | D |
| `crossing_unsafe` (sin semáforo peatonal) | D | D | B | D | L | D |
| `crossing` sin audio | · | · | B | L | · | L |
| `crossing` sin rampa esquina | B | L | · | · | · | · |

**Amenidades** (al revés): **CLAVE** / **ÚTIL** / **·**. Ej: `elevator`→WHEEL/REDUC CLAVE; `accessible_restroom`→WHEEL CLAVE, REDUC ÚTIL; `rest_point`→REDUC CLAVE, resto ÚTIL; `tactile_present`/`audio_signal_present`→BLIND CLAVE, LOWVIS ÚTIL; `accessible_business`→cada perfil ÚTIL.

**Traducción al motor (Valhalla):** `B`→`exclude_locations` (caliente) + tag duro tipo `wheelchair=no` (frío) · `D`→penalización alta · `L`→penalización baja · `·`→sin efecto. Amenidades restan costo (incentivan pasar por ahí). Esto es el `COST_TABLE` de v1 extendido a todas las columnas.

---

## 5. Lógica de negocio

### 5.1 Resolución de severidad
`efecto(usuario, feature) = peor_caso( impacto[perfil][subtipo, atributos] ∀ perfil ∈ usuario )`. Atributos cuantitativos resuelven por umbral (pendiente <8% pasa para silla, >12% bloquea).

### 5.2 Cadencia de ruteo (dos capas)
- **Capa viva (Firestore, tiempo real)** = el mapa vivo. Reporte → visible al instante.
- **Caliente:** features desde el último build entran como `exclude` → evasión binaria inmediata.
- **Fría:** rebuild periódico de tiles → severidad graduada por perfil completa.
- No se persigue propagación graduada en tiempo real (esfuerzo enorme, beneficio imperceptible, rompería la escala-ciudad).

### 5.3 Ciclo de vida del feature
`activo` (reportado / auto-detectado) → `confirmado` (votos comunitarios "sigue ahí") | `no_confirmado` (baja confianza, requiere revisión) → `resuelto` (reparado). Umbral de `confidence` decide si una detección auto entra directa o como `no_confirmado`.

### 5.4 Reportes: TRES destinos
1. **Comunidad (inmediato):** Valhalla esquiva al instante. Ciudadano a ciudadano.
2. **Gobierno (agregado):** mapa de calor + tablero de priorización → export a **Agencia Digital BC / Ayuntamiento** (organizadores). *"No saben dónde reparar primero; nosotros decimos qué reparación desbloquea más trayectos por peso."*
3. **Negocios (stretch):** insignia "Accesible Verificado". Inclusión = buen negocio.

### 5.5 Score de priorización de obra (P2)
`score = trayectos_accesibles_desbloqueados / costo_estimado_reparación`, ranking descendente por segmento.

### 5.6 Score de usabilidad de transporte
Una ruta/parada recibe un score por perfil derivado de sus `accessibility_features`; el planeador puede preferir paradas con `step_free_access` cercanas.

---

## 6. Accesibilidad de la app (el diferenciador — se construye para cada persona)

La cuña competitiva: **los demás equipos harán un ruteador para silla de ruedas que un ciego no puede ni abrir.** Senda se opera sin ver y sin tocar texto chico. Separar accesibilidad *de la app* (UI/UX) de datos *de ruteo* (matriz).

- **A6-1 Control por voz** (Web Speech recognition): comandos para planear, reportar y navegar.
- **A6-2 Narrator / TTS** (`speechSynthesis`): lee toda la UI + indicaciones paso a paso.
- **A6-3 Háptica** (Vibration API): en navegación, intermitente = precaución, larga = bloqueo/desvío. Sirve a `BLIND`, `REDUCED_MOB` (Parkinson) y `DEAF_HOH`.
- **A6-4 Alertas siempre visuales** (nunca solo audio) + opción de solo-vibración: para `DEAF_HOH`.
- **A6-5 Auto-preferencias:** detecta `prefers-contrast`, `prefers-reduced-motion`, `prefers-color-scheme` y presencia de lector de pantalla → la app se auto-adapta.
- **A6-6 Alto contraste conmutable + texto escalable 200% + targets ≥48×48px.**
- **A6-7 ARIA / a11y nativa** para que VoiceOver/TalkBack lea fluido (el juez lo prueba en vivo).
- **A6-8 PWA offline** (service worker): funciona a media calle sin señal.
- **A6-9 Guía por brújula** (DeviceOrientation): "apunta hacia tu destino" + vibración; navegación no-visual para `BLIND`.
- **A6-10 Reporte por voz:** "hay un carro tapando la rampa en la esquina del Oxxo" → transcript → Gemini extrae tipo → GPS geolocaliza.

---

## 7. Identidad visual y sistema de diseño

Limpio, minimalista, mucho blanco; **mapa en modo oscuro** para que los datos resalten. **El color nunca comunica solo** (siempre color + icono + texto).

**Tokens (CSS vars + Tailwind):**
`--bg #FFFFFF` · `--surface #F8FAFC` · `--text #0F172A` · `--text-muted #475569` · `--brand #2563EB` · `--map-bg #0B1220` · `--route-ok #10B981` · `--route-blocked #F43F5E` · `--sev-low #FACC15` · `--sev-med #FB923C` · `--sev-high #EF4444` · `--focus #3B82F6` · `--success #10B981` · `--warning #F59E0B` · `--danger #EF4444`.
Variante alto contraste: bloque `[data-contrast="high"]` que sobreescribe los vars.

**Tipografía:** Inter (fallback system-ui). Escala display40/h1 32/h2 24/h3 20/body16/caption14. Cuerpo mínimo 16px, escalable a 200%. **Iconografía:** Lucide; icono por subtipo de barrera y por perfil. **Espaciado:** grid 8px; radios sm8/md12/lg16. **Touch targets ≥48×48px.**

---

## 8. Pantallas

- **P-01 Onboarding / Selector de perfil** — multi-selección de perfiles (combinables) con icono+label; controles de accesibilidad (contraste, tamaño, voz); botón "Continuar".
- **P-02 Home / Mapa + Planeador** — `MapView` oscuro con features por `kind` y severidad; `RoutePlanner` (origen GPS, destino texto/voz, chips de perfil activos, micrófono, "Buscar ruta"); FAB "Reportar".
- **P-03 Ruta activa / Navegación** — ruta resaltada; `RouteResultCard` (distancia, ETA, features evitadas/aprovechadas); indicaciones paso a paso con TTS y háptica; modo no-visual (brújula).
- **P-04 Reportar feature** — selector de `kind` (barrera/amenidad/transporte/cruce); cámara o voz; ubicación editable; clasificación sugerida por visión, editable; enviar.
- **P-05 Tablero de gobierno `/gov`** (desktop) — mapa de calor; tabla de priorización (segmento, features, trayectos desbloqueados, costo, score); filtros por zona/tipo/perfil; export GeoJSON/CSV.
- **P-06 Detalle de feature `/feature/[id]`** — foto, tipo, efecto por perfil, "¿Sigue ahí?" (confirmar/resuelto), historial, upvotes.

---

## 9. Inventario de componentes
`AppHeader` · `ProfileSelector` (multi) · `ProfileChip` · `MapView` (MapLibre) · `FeatureMarker` (icono+color por kind/severidad) · `RoutePlanner` · `LocationInput` · `RouteResultCard` · `StepList` · `VoiceController` (comandos+TTS) · `HapticController` · `ReportSheet` · `KindSelector` · `CameraCapture` · `ClassificationResult` · `LiveRerouteToast` · `CompassGuide` · `BottomNav` · `Fab` · `AccessibilityControls` · `Toast` · `LoadingState` · `EmptyState` · `GovHeatmap` · `PrioritizationTable` · `ExportButton`. Componentes tipados, con estados carga/vacío/error, navegables por teclado y con ARIA.

---

## 10. Flujos lógicos
- **F1 Planear ruta (P0):** perfiles → destino (texto/voz) → geocoding → `/route` → Valhalla aplica matriz por peor-caso → ruta + features evitadas/aprovechadas.
- **F2 Voz (P0):** comando → reconoce → confirma → F1 → TTS lee indicaciones.
- **F3 Reportar (P0):** kind → foto/voz + ubicación → visión clasifica → confirma → capa viva → toast.
- **F4 Citizen Loop / re-ruteo en vivo (P0, estrella):** barrera nueva en ruta → reporte → `exclude` inmediato → segmento `--route-blocked` → ruta alterna al instante → se foldea al rebuild. *"El mapa se cura a sí mismo."*
- **F5 Auto-scan (P1, sistema):** red OSM → Street View → VLM/Gemini → tags OSM → osmium → build_tiles. Batch offline.
- **F6 Navegación no-visual (P1):** TTS + háptica + brújula; opera con ojos cerrados.
- **F7 Priorización gobierno (P2):** BigQuery agrega → score → dashboard + export.

---

## 11. Stack tecnológico
Bun (PM/runtime web) · Next.js 14 App Router + TS + Tailwind (PWA) · MapLibre GL (estilo oscuro) · Zustand · Web Speech API (voz+TTS) · Vibration API · DeviceOrientation API · Service Worker (offline) · FastAPI + pydantic v2 (dockerizado) · **Valhalla + OpenStreetMap** (ruteo, NO Google Routes) · Firestore (capa viva) · Gemini Flash / VLM auto-hospedado (visión) · Street View Static · Google geocoding + tiles · BigQuery (dashboard) · Lucide. **Auditoría:** Lighthouse/axe-core para certificar 100 en accesibilidad.
**Fallbacks:** visión→VLM propio (AMD GPU) · Street View→Mapillary · geocoding→Nominatim · tiles→MapLibre+OSM · hosting→VM. Stack 100% corrible open-source → adopción de gobierno sin lock-in.

---

## 12. Requerimientos funcionales

| ID | Requerimiento | Prio |
|---|---|---|
| FR-01 | Seleccionar y persistir **múltiples** perfiles funcionales | P0 |
| FR-02 | Mapa oscuro con features por kind y severidad | P0 |
| FR-03 | Ruta peatonal por matriz de impacto, regla peor-caso multi-perfil | P0 |
| FR-04 | Mostrar distancia, ETA, features evitadas/aprovechadas | P0 |
| FR-05 | Geocodificar destino por texto | P0 |
| FR-06 | Reportar feature (barrera) con foto + ubicación | P0 |
| FR-07 | Clasificar reporte con visión (tipo, atributos, confianza) | P0 |
| FR-08 | Reflejar reporte en el mapa en tiempo real | P0 |
| FR-09 | Re-ruteo inmediato al reportar en ruta (Citizen Loop) | P0 |
| FR-10 | Aplicar matriz B/D/L al costing de Valhalla | P0 |
| FR-11 | `GET /features` (o /barriers) como GeoJSON abierto | P0 |
| FR-12 | **Control por voz** (comandos de planeo/reporte/navegación) | P0 |
| FR-13 | **Narrator/TTS** de UI e indicaciones | P0 |
| FR-14 | **Háptica** de precaución/bloqueo en navegación | P0 |
| FR-15 | Alto contraste, texto escalable, targets ≥48px, ARIA | P0 |
| FR-16 | Auto-preferencias (contrast/motion/scheme/lector) | P1 |
| FR-17 | Reportar **amenidades** (acceso/alivio/guía/servicio) | P1 |
| FR-18 | Reportar **transporte** con accessibility_features | P1 |
| FR-19 | Reportar **cruces** con sus atributos | P1 |
| FR-20 | Score de usabilidad de transporte por perfil | P1 |
| FR-21 | Reporte por voz → Gemini extrae tipo | P1 |
| FR-22 | PWA offline (service worker) | P1 |
| FR-23 | Guía por brújula (DeviceOrientation) modo no-visual | P1 |
| FR-24 | Pipeline auto-scan Street View→visión→tiles | P1 |
| FR-25 | Conmutar visión Gemini ↔ VLM auto-hospedado | P1 |
| FR-26 | Tablero de gobierno: heatmap + priorización | P2 |
| FR-27 | Export GeoJSON/CSV del tablero | P2 |
| FR-28 | Validación comunitaria (confirmar/resuelto/upvotes) | P2 |
| FR-29 | Insignia "Accesible Verificado" para negocios | P2 |
| FR-30 | Re-ruteo continuo a mitad de trayecto | P2 |

---

## 13. Requerimientos no funcionales

**Accesibilidad (crítico):** WCAG 2.1 AA mínimo, contraste texto AAA (≥7:1) · navegación por teclado con foco visible · ARIA en cada elemento interactivo, compatible con lector de pantalla · color nunca único canal · targets ≥48px, texto a 200% · alto contraste y `prefers-reduced-motion` · operable 100% por voz · objetivo **Lighthouse a11y = 100** (mostrado en slide).
**Rendimiento:** ruta <1.5 s · clasificación <4 s (Gemini) · re-ruteo Citizen Loop percibido <1 s · carga PWA <3 s en 4G.
**Resiliencia:** cada servicio propietario con fallback abierto · degradación elegante si falla visión (guarda sin clasificar, reclasifica después) · ciudad ruteable aunque el scan no cubra.
**Privacidad:** reportes anónimos por defecto, sin PII obligatoria · consentimiento de ubicación · fotos sin metadatos sensibles, sin rostros/placas (desenfoque P2).
**Escalabilidad:** soporta toda Tijuana; ruta de migración a más municipios documentada.
**Localización:** es-MX primario (UI y voz). **Mantenibilidad:** formatos estándar (GeoJSON/OSM), monorepo tipado, sin lock-in. **Portabilidad:** stack dockerizable / auto-hospedable.

---

## 14. Modelo de datos

```
MapFeature {
  id: str
  kind: "barrier" | "amenity" | "transport" | "crossing"
  categoria: str
  subtipo: str
  atributos: dict          // grado_pct, ancho_cm, altura_cm, tiene_audio, accessibility_features…
  lat: float; lng: float
  geometry: GeoJSON | None  // LineString para rutas de transporte
  source: "auto" | "ciudadano"
  confidence: float
  photo_url: str | None
  status: "activo" | "confirmado" | "no_confirmado" | "resuelto"
  upvotes: int
  created_at: datetime
}

Profile = "WHEELCHAIR" | "REDUCED_MOB" | "BLIND" | "LOW_VISION" | "DEAF_HOH" | "COGNITIVE"
Situational = "STROLLER" | "TEMP_INJURY"   // mapean a un Profile con factor de atenuación

User { id, perfiles: Profile[], situacionales: Situational[], prefs_a11y: {...} }

IMPACT_MATRIX: dict[Profile, dict[subtipo, "B"|"D"|"L"|"·"]]   // + reglas por atributo (umbral)
AMENITY_MATRIX: dict[Profile, dict[subtipo, "CLAVE"|"UTIL"|"·"]]
```

---

## 15. APIs e integraciones
```
POST /route     { origin, destination, profiles[] }
   -> { coords[], distance_m, eta_min, features_evitadas[], features_aprovechadas[], steps[] }
POST /report    (multipart: image|voice_text, lat, lng, kind)  -> MapFeature
GET  /features  ?bbox=...&kind=...   -> GeoJSON FeatureCollection   ← entregable abierto
GET  /transport ?bbox=...            -> rutas/paradas con accessibility_features
GET  /health    -> { status }
```
Integraciones: Valhalla (HTTP), Firestore (SDK), Vertex/Gemini o VLM (HTTP), Street View Static, Google geocoding/tiles, BigQuery.

---

## 16. Despliegue
Frontend PWA → Vercel/Firebase (build con Bun) · API (FastAPI dockerizada) → Cloud Run · Valhalla (dockerizada) → VM GCP · Capa viva → Firestore · Scan → GPU AMD Developer Cloud / batch AWS.

---

## 17. Plan MVP — escalera de fallback
1. Ciudad ruteable en Valhalla, sin features → demo válido. **(P0)**
2. + features en zonas prioritarias (Revolución/Centro, clínicas, gobierno). **(P0)**
3. + Citizen Loop. **(P0)**
4. + matriz por perfil (cambiar perfil cambia la ruta). **(P0)**
5. + accesibilidad total: voz + narrator + háptica. **(P0)**
6. + amenidades/transporte/cruces + auto-preferencias + offline + brújula. **(P1)**
7. + scan de ciudad al máximo alcance. **(P1)**
8. + tablero de gobierno. **(P2)**

MVP mínimo viable y ganador = peldaños 1–5.

---

## 18. Definition of Done (demo)
- Ciudad ruteable; cambiar perfil cambia visiblemente la ruta (peor-caso multi-perfil).
- Citizen Loop en vivo (reporte → reruteo inmediato) — el momento "wow".
- **Demo a ciegas:** un juez (o Bernardo con ojos vendados) opera Senda **completa por voz + háptica + brújula**. Ningún otro equipo puede.
- `GET /features` devuelve GeoJSON válido.
- Lighthouse a11y = 100 mostrado en slide.
- Slide 1 = research de campo en Revolución (entrevistas + foto con usuarios reales).
- Repo público, README, diagrama, deploy en vivo.
- (P2) Tablero de gobierno con priorización demostrable.

---

## 19. Roadmap futuro
Auto-detección de podotáctil y semáforos sonoros desde Street View (difícil — honestamente roadmap, no prometido como hecho) · más municipios de BC · integración con sistemas municipales 311 y portal de datos abiertos · insignias de negocio funcionales · validación comunitaria gamificada · alianza Scott-Morgan Foundation / Tec de Monterrey.

---

*Documento de trabajo del equipo Entropyc.*
