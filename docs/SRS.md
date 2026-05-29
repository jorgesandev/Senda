# SRS — Senda

**Software Requirements Specification · v1.0**
Equipo Entropyc · HackFox 2026 · Track *Tijuana Sin Barreras*
Autores: Bernardo Morales ([bernardmora.github.io](https://bernardmora.github.io)) · Jorge Sandoval ([jorgesandoval.dev](https://jorgesandoval.dev))

> Este documento define la **versión objetivo completa ("insana hardcore")** de Senda como meta. Cada requerimiento funcional lleva prioridad: **P0** = núcleo demoable garantizado · **P1** = ideal · **P2** = insano/stretch. Sirve como especificación y como mapa de priorización: no construir nada fuera de aquí sin actualizar el SRS.

---

## 1. Introducción

### 1.1 Propósito
Senda es una PWA de **ruteo peatonal accesible para toda Tijuana**, sobre un **mapa vivo de barreras físicas** alimentado por (a) detección automática con visión computacional sobre Street View y (b) reportes ciudadanos en tiempo real. El ruteo se calcula **por perfil de movilidad** (silla de ruedas, bastón/adulto mayor, carriola) sobre el grafo peatonal real de la ciudad. Senda entrega además una **base de datos abierta** y un **tablero de priorización de obra pública** para el gobierno.

### 1.2 Alcance
- **Geográfico:** municipio de Tijuana, BC.
- **Modal:** ruteo peatonal (no transporte público ni vehicular en esta versión).
- **Salidas:** PWA ciudadana + API + export GeoJSON abierto + dashboard de gobierno.

### 1.3 Definiciones
- **Capa viva:** base de datos de barreras en tiempo real (Firestore) = el "mapa vivo".
- **Capa de ruteo:** Valhalla, consume la capa viva en caliente (exclude) y en frío (rebuild de tiles).
- **Severidad por perfil:** una barrera no tiene un número único; su costo depende del perfil del usuario.
- **Citizen Loop:** ciclo reporte → clasificación → evasión inmediata → re-horneado. Funcionalidad estrella.
- **Auto-scan:** pipeline offline que mapea barreras desde Street View con un VLM.

### 1.4 Identidad
- **Producto:** Senda — *"El parche para una Baja Sin Barreras."*
- **Tono:** la inaccesibilidad es un *bug* de ingeniería que se parchea con datos abiertos, no una fatalidad.

---

## 2. Descripción general

### 2.1 Clases de usuario
| Usuario | Necesidad | Acceso |
|---|---|---|
| Persona con discapacidad motriz | Ruta transitable en silla de ruedas | PWA |
| Adulto mayor / bastón | Ruta con bajo esfuerzo, evita escalones | PWA |
| Familia con carriola | Ruta con banquetas y rampas | PWA |
| Reportante ciudadano | Reportar barreras rápido | PWA |
| Funcionario de gobierno | Priorizar obra por impacto/costo | Dashboard web |

### 2.2 Entorno operativo
- Cliente: navegador móvil/desktop moderno, instalable como PWA. Funciona en gama media.
- Servidor: contenedores en GCP (Cloud Run para API, VM para Valhalla), Firestore administrado.
- Jobs de scan: GPUs en AMD Developer Cloud / batch en AWS.

### 2.3 Restricciones
- Ventana de construcción: hackathon de 26h → escalera de fallback obligatoria (§9).
- Cuota de Street View Static API es el cuello de botella real; verificar en la hora 1.
- Ruteo NO se hace con Google Routes API (caja negra, sin costo personalizable).

### 2.4 Supuestos
- Cobertura de Street View suficiente en zonas prioritarias de Tijuana.
- Créditos disponibles en GCP, AWS y AMD Developer Cloud; cada servicio propietario tiene fallback abierto.

---

## 3. Identidad visual y sistema de diseño

### 3.1 Principios
Limpio, minimalista, mucho espacio en blanco. UI base clara; **mapa en modo oscuro** para que los datos resalten. **El color nunca comunica solo**: siempre se acompaña de icono y/o texto (requisito de accesibilidad, §11).

### 3.2 Paleta (design tokens)
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#FFFFFF` | Superficie UI base |
| `--surface` | `#F8FAFC` | Tarjetas, paneles |
| `--text` | `#0F172A` | Texto principal |
| `--text-muted` | `#475569` | Texto secundario |
| `--brand` | `#2563EB` | Interacción/marca (azul eléctrico) |
| `--map-bg` | `#0B1220` | Fondo del mapa (modo oscuro) |
| `--route-ok` | `#10B981` | Ruta accesible (esmeralda) |
| `--route-blocked` | `#F43F5E` | Segmento bloqueado/inaccesible (coral) |
| `--sev-low` | `#FACC15` | Barrera severidad baja |
| `--sev-med` | `#FB923C` | Barrera severidad media |
| `--sev-high` | `#EF4444` | Barrera severidad alta |
| `--focus` | `#3B82F6` | Anillo de foco (alta visibilidad) |
| `--success` / `--warning` / `--danger` | `#10B981` / `#F59E0B` / `#EF4444` | Estados |

Contraste objetivo: texto ≥ 7:1 (AAA), elementos UI ≥ 4.5:1 (AA). Modo alto contraste conmutable (§11).

### 3.3 Tipografía
- Familia: **Inter** (fallback: system-ui / SF Pro / Roboto).
- Escala: `display 40` · `h1 32` · `h2 24` · `h3 20` · `body 16` · `caption 14`. Mínimo de cuerpo 16px; escalable por el usuario hasta 200% sin romper layout.

### 3.4 Iconografía
- Set: **Lucide** (open). Iconos semánticos por tipo de barrera: escalón, sin rampa, banqueta rota, obstrucción, sin banqueta, cruce inseguro, sin pavimento táctil. Cada perfil tiene icono propio (silla, bastón, carriola).

### 3.5 Espaciado y forma
- Grid base 8px. Radios: `sm 8` · `md 12` · `lg 16` · `full` (chips/FAB). Sombras suaves; el mapa lleva el peso visual.

### 3.6 Touch targets
- Mínimo 48×48px en todo control interactivo (accesibilidad motriz).

---

## 4. Arquitectura y stack tecnológico

### 4.1 Modelo de dos capas
1. **Capa viva (Firestore, tiempo real)** — el mapa vivo. Reporte → clasificación → visible al instante. Severidad guardada como *tipo + atributos*, no número único.
2. **Capa de ruteo (Valhalla)** — consume la capa viva en dos cadencias: **caliente** (`exclude_locations`/`exclude_polygons`, evasión binaria inmediata) y **fría** (rebuild periódico de tiles con severidad graduada por perfil vía tags OSM).

### 4.2 Stack
| Capa | Tecnología | Justificación |
|---|---|---|
| Package manager / runtime web | **Bun** | Rápido; `bun install`/`bun dev`/`bun run`; reemplaza npm en todo el frontend |
| Frontend | **Next.js 14 (App Router) + TypeScript + Tailwind**, PWA | Fuerte de Jorge; instalable sin tienda |
| Mapa | **MapLibre GL JS** (estilo oscuro) | Open-source, sin lock-in; tiles de Google o OSM |
| Estado | **Zustand** | Ligero; maneja ruta activa + barreras en vivo |
| Voz | **Web Speech API** | Reconocimiento + síntesis en español, gratis, sin backend ni cuota |
| Backend | **FastAPI (Python) + pydantic v2**, dockerizado | Rápido, tipado, encaja con el pipeline en Python |
| Motor de ruteo | **Valhalla + OpenStreetMap** | Purpose-built, C++, costing peatonal nativo, escala a ciudad |
| Capa viva / DB | **Firestore** | Tiempo real nativo, serverless |
| Visión | **Gemini Flash (Vertex AI)** primario · **VLM abierto** (Qwen2-VL / Llama-3.2-Vision) auto-hospedado en AMD GPU como bulk/fallback | Gemini = cero setup; VLM propio = sin cuota ni costo/llamada |
| Imágenes de calle | **Street View Static API** | Fuente del auto-scan |
| Geocoding + basemap | **Google Maps Platform** | Geocoding de destino + tiles |
| Analítica / dashboard | **BigQuery** | Agrega grafo + barreras de ciudad para el modelo de priorización |
| Cómputo | GCP · AMD Developer Cloud (GPU) · AWS | Tres bolsas de créditos; el cuello es cuota de visión, no cómputo |

### 4.3 Fallbacks (resiliencia = argumento de pitch)
Visión → VLM auto-hospedado · Street View → Mapillary · Geocoding → Nominatim · Tiles → MapLibre+OSM · Hosting → VM. El stack completo puede correr open-source → el gobierno lo adopta sin lock-in.

---

## 5. Especificación de pantallas

### P-01 Onboarding / Selector de perfil
- **Componentes:** logo Senda, título, 3 tarjetas-perfil (silla, bastón, carriola) con icono + label, botón "Continuar", toggle de alto contraste, control de tamaño de texto.
- **Estados:** sin selección (continuar deshabilitado) → selección → persiste perfil.
- **Salida:** navega a P-02 con `profile` en estado global.

### P-02 Home / Mapa + Planeador
- **Componentes:** `MapView` (MapLibre, modo oscuro, barreras como pines por severidad), `RoutePlanner` (input origen [GPS por defecto], input destino, chips de perfil, `VoiceInput`, botón "Buscar ruta"), `BottomNav`/FAB para "Reportar barrera".
- **Estados:** idle · cargando ruta · ruta encontrada (dibuja `--route-ok`, muestra `RouteResultCard`) · sin ruta accesible (mensaje + alternativa).

### P-03 Ruta activa / Navegación
- **Componentes:** mapa con ruta resaltada, `RouteResultCard` (distancia, ETA, lista `barreras_evitadas` con icono+tipo), panel de indicaciones paso a paso, botón de voz (lee indicaciones), botón "Reportar barrera aquí".
- **Estados:** navegando · **re-ruteo en vivo** (Citizen Loop, ver F4) · llegada.

### P-04 Reportar barrera (modal/flujo)
- **Componentes:** captura de cámara o subir foto, preview, ubicación autodetectada (editable arrastrando pin), resultado de clasificación (tipo + severidad sugeridos por el modelo, editable), botón "Enviar reporte".
- **Estados:** captura · clasificando (spinner) · confirmación editable · enviado (toast) · error (reintento).

### P-05 Tablero de gobierno `/gov` (desktop)
- **Componentes:** mapa de calor de barreras de Tijuana, tabla de **priorización de obra** (segmento, barreras, viajes accesibles desbloqueados, costo estimado, score impacto/costo), filtros (zona, tipo, perfil afectado), export GeoJSON/CSV.
- **Estados:** carga de agregados (BigQuery) · vista interactiva · export.

### P-06 Detalle de barrera / validación comunitaria (P2)
- Foto, tipo, severidad por perfil, "¿Sigue ahí?" (confirmar/resuelto), historial.

---

## 6. Inventario de componentes
`AppHeader` · `ProfileSelector` · `ProfileChip` · `MapView` · `BarrierMarker` (color+icono por severidad) · `RoutePlanner` · `LocationInput` (con geocoding) · `RouteResultCard` · `StepList` · `VoiceInput` (mic + transcript + síntesis) · `BarrierReportSheet` · `CameraCapture` · `ClassificationResult` · `LiveRerouteToast` · `BottomNav` · `Fab` (reportar) · `AccessibilityControls` (alto contraste, tamaño texto) · `Toast` · `LoadingState` · `EmptyState` · `GovHeatmap` · `PrioritizationTable` · `ExportButton`.

Cada componente: tipado estricto en TS, props explícitas, estados de carga/vacío/error, navegable por teclado, etiquetas ARIA.

---

## 7. Flujos lógicos

**F1 — Planear ruta accesible (P0)**
Seleccionar perfil → ingresar destino (texto/voz) → geocoding → `POST /route {origin, destination, profile}` → Valhalla rutea evitando barreras según tabla de costo del perfil → dibuja ruta + `RouteResultCard` con `barreras_evitadas`.

**F2 — Ruta por voz (P1)**
Tap micrófono → Web Speech reconoce destino en español → confirma → F1 → síntesis lee las indicaciones.

**F3 — Reporte ciudadano (P0)**
Tap "Reportar" → cámara/subir foto + ubicación → `POST /report` → visión clasifica `{tipo, atributos, confidence}` → usuario confirma/edita → Firestore (visible al instante) → toast.

**F4 — Citizen Loop / re-ruteo en vivo (P0, estrella)**
Durante navegación el usuario topa barrera nueva → reporta (F3) → la barrera entra como `exclude` en el siguiente cálculo → el segmento original se marca `--route-blocked` y Senda traza ruta alterna accesible **de inmediato** → la barrera se foldea al próximo rebuild con severidad graduada. *"El mapa se cura a sí mismo."*

**F5 — Auto-scan (P1, sistema/offline)**
Red peatonal OSM → muestreo de puntos → fetch Street View (paralelo) → VLM/Gemini detecta barreras → `enrich_osm` mapea a tags OSM → merge con osmium → `build_tiles` → Valhalla rutea con accesibilidad nativa. Corre en batch (noche del jueves), fuera de la ruta crítica del demo.

**F6 — Priorización de gobierno (P2)**
BigQuery agrega barreras + grafo → calcula por segmento *viajes accesibles desbloqueados / costo de reparación* → ranking → dashboard + export abierto.

---

## 8. Lógica de negocio

### 8.1 Modelo de severidad por perfil
La barrera guarda `tipo` + `atributos`. El costo se resuelve por perfil:
```
costo[perfil][tipo] -> { block | high | low | none }
```
Ejemplos placeholder (afinables): `wheelchair+escalon=block`, `cane+escalon=high`, `stroller+escalon=high`, `wheelchair+sin_pavimento_tactil=none`. De los **mismos datos**, cada perfil obtiene ruta distinta.

### 8.2 Traducción al motor
`block` → `exclude_locations` (caliente) + tags duros tipo `wheelchair=no` (frío). `high`/`low` → penalización en costing peatonal vía tags (`smoothness`, `kerb`, `incline`, `step_count`, `surface`).

### 8.3 Cadencia de ruteo
- **Caliente:** barreras desde el último build entran como exclude → evasión binaria inmediata.
- **Fría:** rebuild periódico de tiles → severidad graduada completa por perfil.
- No se persigue propagación graduada en tiempo real (esfuerzo enorme, beneficio imperceptible, rompería la escala-ciudad).

### 8.4 Ciclo de vida de barrera
`activo` (recién reportada / auto-detectada) → `confirmado` (validación comunitaria, P2) | `no_confirmado` (baja confianza, requiere revisión) → `resuelto` (reparada). Umbral de confianza define si una detección auto entra directo o como `no_confirmado`.

### 8.5 Score de priorización (P2)
`score = viajes_accesibles_desbloqueados / costo_estimado_reparación`, ordenado descendente. "Qué reparación rinde más por peso".

---

## 9. Plan MVP y escalera de fallback
Cada peldaño es demoable por sí solo:
1. **Ciudad ruteable en Valhalla, sin barreras** → demo válido garantizado. **(P0)**
2. **+ barreras en zonas prioritarias** (clínicas, gobierno, colonias clave). **(P0)**
3. **+ Citizen Loop** (reporte → exclude → reruteo). **(P0)**
4. **+ severidad graduada por perfil** (selector cambia la ruta). **(P0/P1)**
5. **+ voz** (F2). **(P1)**
6. **+ scan de ciudad al máximo alcance**. **(P1)**
7. **+ tablero de gobierno**. **(P2)**

El MVP mínimo viable y ganador = peldaños 1–4.

---

## 10. Requerimientos funcionales

| ID | Requerimiento | Prioridad |
|---|---|---|
| FR-01 | Seleccionar y persistir perfil de movilidad | P0 |
| FR-02 | Mostrar mapa de Tijuana en modo oscuro con barreras como pines por severidad | P0 |
| FR-03 | Calcular ruta peatonal accesible por perfil vía Valhalla | P0 |
| FR-04 | Mostrar distancia, ETA y lista de barreras evitadas | P0 |
| FR-05 | Geocodificar destino ingresado por texto | P0 |
| FR-06 | Reportar barrera con foto + ubicación | P0 |
| FR-07 | Clasificar barrera reportada con visión (tipo, atributos, confianza) | P0 |
| FR-08 | Reflejar barrera reportada en el mapa en tiempo real | P0 |
| FR-09 | Re-rutear de inmediato al reportar barrera en ruta (Citizen Loop) | P0 |
| FR-10 | Aplicar tabla de costo por perfil (block/penalty) al ruteo | P0/P1 |
| FR-11 | Exponer `GET /barriers` como GeoJSON abierto | P0 |
| FR-12 | Ingresar destino por voz y leer indicaciones (Web Speech) | P1 |
| FR-13 | Pipeline auto-scan: Street View → visión → tags OSM → tiles | P1 |
| FR-14 | Conmutar backend de visión Gemini ↔ VLM auto-hospedado | P1 |
| FR-15 | Editar tipo/severidad sugeridos antes de enviar reporte | P1 |
| FR-16 | Tablero de gobierno con mapa de calor + priorización | P2 |
| FR-17 | Export GeoJSON/CSV desde el tablero | P2 |
| FR-18 | Validación comunitaria de barreras (confirmar/resuelto) | P2 |
| FR-19 | Parseo de destino en lenguaje natural con Gemini | P2 |
| FR-20 | Re-ruteo continuo a mitad de trayecto | P2 |

---

## 11. Requerimientos no funcionales

**Accesibilidad (crítico — es una app de accesibilidad, no puede ser inaccesible):**
- NFR-A1: WCAG 2.1 nivel AA mínimo; contraste de texto objetivo AAA (≥7:1).
- NFR-A2: navegación completa por teclado; foco visible (`--focus`).
- NFR-A3: roles y etiquetas ARIA en todo componente interactivo; compatible con lector de pantalla.
- NFR-A4: el color nunca es el único canal (color + icono + texto).
- NFR-A5: touch targets ≥48×48px; texto escalable a 200% sin pérdida de función.
- NFR-A6: modo alto contraste conmutable; soporta `prefers-reduced-motion`.
- NFR-A7: interfaz operable por voz (entrada y salida).

**Rendimiento:**
- NFR-P1: cálculo de ruta < 1.5 s en zona cargada.
- NFR-P2: clasificación de reporte < 4 s (camino Gemini).
- NFR-P3: re-ruteo del Citizen Loop percibido como instantáneo (< 1 s tras confirmar).
- NFR-P4: carga inicial de la PWA < 3 s en 4G.

**Disponibilidad / resiliencia:**
- NFR-D1: cada servicio propietario tiene fallback abierto operativo (§4.3).
- NFR-D2: degradación elegante si falla visión (reporte se guarda sin clasificar, se reclasifica después).
- NFR-D3: ciudad ruteable disponible aunque el scan no tenga cobertura.

**Privacidad / seguridad:**
- NFR-S1: reportes anónimos por defecto; sin PII obligatoria.
- NFR-S2: consentimiento explícito de ubicación; uso solo para ruteo/reporte.
- NFR-S3: fotos sin metadatos sensibles; sin rostros/placas (desenfoque si aplica, P2).
- NFR-S4: CORS y validación de entrada en la API.

**Escalabilidad:** NFR-E1: arquitectura soporta toda Tijuana; ruta de migración a más municipios documentada.
**Localización:** NFR-L1: español (es-MX) como idioma primario de UI y voz.
**Mantenibilidad:** NFR-M1: datos en formatos estándar (GeoJSON, OSM); monorepo tipado; sin lock-in.
**Portabilidad:** NFR-PO1: todo dockerizable y desplegable en cualquier nube o auto-hospedado.

---

## 12. Modelo de datos

```
Barrier {
  id: string
  lat: number; lng: number
  tipo: "escalon"|"sin_rampa"|"banqueta_rota"|"obstruccion"
       |"sin_banqueta"|"cruce_inseguro"|"sin_pavimento_tactil"
  atributos: object            // detalles que alimentan el costo por perfil
  source: "auto"|"ciudadano"
  confidence: number           // 0..1
  photo_url?: string
  status: "activo"|"confirmado"|"no_confirmado"|"resuelto"
  created_at: datetime
}

Profile = "wheelchair"|"cane"|"stroller"
COST_TABLE: { [Profile]: { [tipo]: "block"|"high"|"low"|"none" } }
```

---

## 13. APIs e integraciones

```
POST /route    { origin, destination, profile } -> { coords[], distance_m, eta_min, barreras_evitadas[], steps[] }
POST /report   (multipart: image, lat, lng)      -> Barrier
GET  /barriers ?bbox=minLng,minLat,maxLng,maxLat -> GeoJSON FeatureCollection
GET  /health                                     -> { status }
```
Integraciones: Valhalla (HTTP), Firestore (SDK), Vertex/Gemini o VLM (HTTP), Street View Static, Google geocoding/tiles, BigQuery (dashboard).

---

## 14. Despliegue
- **Frontend (PWA):** Vercel o Firebase Hosting (build con Bun).
- **API (FastAPI, dockerizada):** Cloud Run.
- **Valhalla (dockerizada):** VM en GCP.
- **Capa viva:** Firestore administrado.
- **Scan:** GPU en AMD Developer Cloud / batch en AWS.

---

## 15. Definition of Done (demo)
- Ciudad ruteable; ruta cambia visiblemente al cambiar de perfil.
- Citizen Loop funciona en vivo (reporte → reruteo inmediato) — el momento "wow".
- `GET /barriers` devuelve GeoJSON válido.
- App accesible (teclado, contraste, voz operativa).
- Repo público, README, diagrama de arquitectura, deploy en vivo.
- (P2) Tablero de gobierno con priorización demostrable.

---

*Documento de trabajo del equipo Entropyc. Próximo paso: regenerar el prompt de scaffolding alineado a este SRS — con Bun y sin comentarios TODO en el código.*