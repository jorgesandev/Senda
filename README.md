# Senda — Baja Sin Barreras

**Project Brief · HackFox 2026**
Track: *Tijuana Sin Barreras* — Accesibilidad multimodal para servicios públicos

|                     |                                                                                                                                           |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
|**Equipo**           |Entropyc *(entropy + anthropic)*                                                                                                           |
|**Autores**          |Bernardo Morales — [bernardmora.github.io](https://bernardmora.github.io) · Jorge Sandoval — [jorgesandoval.dev](https://jorgesandoval.dev)|
|**Evento**           |BUILD WITH AI · HackFox 2026 · Pixeland Arcade, Tijuana BC · 28–29 mayo 2026                                                               |
|**Nombre de trabajo**|Senda                                                                                                                                      |
|**Estado**           |Brief — pendiente de plan de ejecución                                                                                                     |

-----

## 1. Qué es

Senda es una plataforma de **ruteo peatonal accesible para toda Tijuana**, construida sobre un **mapa vivo de barreras físicas** que combina dos fuentes: detección automática por visión computacional sobre Google Street View, y reportes ciudadanos en tiempo real. El ruteo no entrega “la ruta más corta”, sino **la ruta más transitable según el perfil de movilidad** de cada persona — silla de ruedas, bastón/adulto mayor, carriola — calculada sobre el grafo peatonal real de la ciudad.

El entregable no es solo una app: es una **base tecnológica abierta** (datos de accesibilidad en formato estándar + motor de ruteo + tablero de priorización de obra) que el gobierno municipal o estatal puede adoptar y escalar sin lock-in ni costo perpetuo de inferencia.

## 2. Por qué nace

Tijuana no fue diseñada pensando en todos. Cerca de **170,000 personas** con discapacidad motriz, además de adultos mayores y familias, enfrentan banquetas destruidas, cruces inseguros y transporte inaccesible. Llegar a una clínica del IMSS puede ser una odisea de dos horas — o simplemente imposible.

El proyecto se alinea con la filosofía de la **Scott-Morgan Foundation** (presente en el Foro Internacional de Transformación Digital ligado al evento): *las barreras de la discapacidad son problemas de ingeniería que se pueden resolver*, y la tecnología asistiva debe **democratizarse rompiendo silos y monopolios**, en ecosistemas abiertos e interconectados. Senda es esa convicción aplicada a la infraestructura urbana de Baja California: no aceptamos la ciudad inaccesible como un hecho — la tratamos como un bug de ingeniería y la corregimos con datos.

## 3. Público beneficiado

- **Primario:** personas con discapacidad motriz (usuarios de silla de ruedas), adultos mayores con movilidad reducida, familias con carriola y cuidadores.
- **Secundario:** gobierno municipal/estatal, como adoptante de la base abierta y usuario del tablero de priorización de obra pública.
- **Roadmap:** personas con discapacidad visual (requiere detección de pavimento táctil y señalización sonora — ver §11).

## 4. Alcance y delimitación

- **Geográfico:** todo el municipio de **Tijuana, Baja California**.
- **Modal:** ruteo **peatonal** exclusivamente (no transporte público ni vehicular en esta fase).
- **Cobertura de accesibilidad:** ciudad 100% ruteable desde el inicio; el enriquecimiento de accesibilidad (barreras) escala con el alcance del scan — denso en zonas prioritarias (clínicas, dependencias de gobierno, colonias clave), best-effort en el resto. La cobertura es un **dial, no un pass/fail**: el MVP es válido a cualquier nivel de cobertura.

## 5. Arquitectura: el modelo de dos capas

El concepto central que resuelve la tensión entre “mapa vivo en tiempo real” y “ciudad completa ruteable”:

**Capa viva (datos, tiempo real) — Firestore.** *Es el mapa vivo.* Un ciudadano reporta una barrera (foto + ubicación) → se clasifica → aparece en el mapa al instante con su tipo, atributos y timestamp. Barata, central, es literalmente lo que pide el reto. La severidad se modela aquí como **tipo + atributos observados**, no como un número universal.

**Capa de ruteo (Valhalla) — consume la capa viva en dos cadencias:**

- **En caliente (instantáneo):** las barreras nuevas desde el último build entran como `exclude_locations` / `exclude_polygons` en cada request → la ruta las esquiva de inmediato (bloqueo binario).
- **En frío (periódico):** se re-hornean los tiles para foldear las barreras acumuladas con **severidad graduada por perfil** completa.

Lo que el usuario percibe es siempre instantáneo (visibilidad en el mapa + evasión como bloqueo). El refinamiento graduado por segmento viaja en el horneado periódico — invisible para quien camina, y por eso **no perseguimos propagación graduada en tiempo real** (sería enorme esfuerzo por cero beneficio perceptible, y rompería la escala-ciudad de Valhalla).

## 6. Severidad graduada por perfil

La misma barrera física afecta distinto a cada persona: un escalón bloquea una silla de ruedas, molesta a un bastón, y es irrelevante para otros perfiles. Por eso la severidad **no es un escalar único**, sino una **tabla de costo por perfil**:

```
costo[perfil][tipo_barrera] -> { bloqueo | penalización_alta | penalización_baja | sin_efecto }
```

De los **mismos datos**, cada usuario obtiene una ruta distinta. La tabla vive en la capa API (control total, agnóstica al motor) y se expresa a Valhalla vía `exclude` (bloqueos) + parámetros de costing peatonal por perfil + tags de OSM horneados. Perfiles MVP: **silla de ruedas, bastón/adulto mayor, carriola**.

## 7. Tech stack y justificación

|Componente           |Tecnología                                                                                                                                    |Por qué                                                                                                                                                                                                  |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Frontend             |**Next.js 14 + TypeScript + Tailwind**, como PWA                                                                                              |Fuerte de Jorge; PWA = instalable sin tienda de apps, ideal para alcance ciudadano                                                                                                                       |
|Voz                  |**Web Speech API** (navegador)                                                                                                                |Reconocimiento + síntesis en español nativo, gratis, cero backend, cero cuota — elimina el mayor riesgo de la voz                                                                                        |
|Backend              |**FastAPI (Python)**, dockerizado                                                                                                             |Rápido de escribir, tipado con pydantic, encaja con el pipeline de datos en Python                                                                                                                       |
|Motor de ruteo       |**Valhalla + OpenStreetMap**                                                                                                                  |Purpose-built para ruteo geoespacial, backend en C++, **costing peatonal nativo**, escala a ciudad completa. Supera a Routes API (caja negra, sin costo personalizable) y a networkx (no escala a ciudad)|
|Capa viva / DB       |**Firestore**                                                                                                                                 |Tiempo real nativo = el mapa vivo; serverless, sin operación                                                                                                                                             |
|Visión / detección   |**Gemini Flash (Vertex AI)** primario · **VLM abierto auto-hospedado** (Qwen2-VL / Llama-3.2-Vision) en AMD Developer Cloud como bulk/fallback|Gemini = cero setup para validar; VLM propio = sin cuota ni costo por llamada para volumen-ciudad, y alineado con la ética de tech abierta                                                               |
|Imágenes de calle    |**Google Street View Static API**                                                                                                             |Cobertura urbana de Tijuana; fuente del auto-mapeo                                                                                                                                                       |
|Geocoding + basemap  |**Google Maps Platform**                                                                                                                      |Geocoding de destinos + tiles del mapa base                                                                                                                                                              |
|Analítica / dashboard|**BigQuery**                                                                                                                                  |Agrega el grafo + barreras de toda la ciudad para el modelo de priorización de obra                                                                                                                      |
|Cómputo              |**GCP** (hosting, Street View, Gemini) · **AMD Developer Cloud** (GPUs para VLM bulk) · **AWS** (respaldo / paralelizar fetch)                |Tres bolsas de créditos gratuitos; el cuello de botella real es **cuota de API de visión**, no cómputo — por eso el VLM propio en GPU es la palanca                                                      |

**El router nunca fue el riesgo; el scan sí.** El límite real es cuántas imágenes de Street View pasan por visión bajo cuota de API — se ataca con diseño de pipeline y VLM auto-hospedado, no con más cómputo. Verificar cuotas en la **hora 1**.

## 8. Modelo de base de datos

**Colección `barriers` (Firestore):**

```
{
  id: string,
  lat: number, lng: number,
  tipo: "escalon" | "sin_rampa" | "banqueta_rota" | "obstruccion" |
        "sin_banqueta" | "cruce_inseguro" | "sin_pavimento_tactil",
  atributos: { ... },          // detalles observados que alimentan el costo por perfil
  source: "auto" | "ciudadano",
  confidence: number,          // 0–1, del modelo de visión
  photo_url?: string,
  status: "activo" | "resuelto" | "no_confirmado",
  created_at: timestamp
}
```

**Tabla de perfiles (en API):** mapeo `perfil → {tipo → costo}`.

**Export abierto:** endpoint `GET /barriers?bbox=...` → **GeoJSON FeatureCollection** estándar. Este es el entregable que el gobierno posee y escala.

## 9. Pipelines y procesamiento de datos

**Build del grafo (una vez):** extract OSM de Tijuana (PBF) → `valhalla_build_tiles` → ciudad 100% ruteable en minutos, sin barreras. *Esto nunca falla — es el piso garantizado del demo.*

**Pipeline de scan (offline, batch — la noche del jueves):**

```
red peatonal OSM → muestreo de puntos → fetch Street View (paralelo)
   → VLM/Gemini detecta barreras {tipo, atributos, confidence}
   → enrich_osm: mapea barreras a tags OSM (wheelchair, kerb, step_count,
     incline, surface, smoothness) → merge con osmium → PBF enriquecido
   → rebuild de tiles → Valhalla rutea con accesibilidad nativa
```

**Loop ciudadano (en vivo):** reporte → Firestore (visible al instante) → entra como `exclude` en requests de ruta (evasión inmediata) → se foldea al siguiente rebuild de tiles (severidad graduada completa).

## 10. APIs, herramientas y fallbacks

Cada dependencia propietaria tiene una ruta abierta — esto es **resiliencia operativa y, a la vez, argumento de pitch**: el stack completo puede correr open-source, así que el gobierno lo adopta sin pagar inferencia ni quedar en lock-in (alineación directa con Scott-Morgan).

|Función          |Primario                 |Fallback (si se acaban créditos / falla)                                |
|-----------------|-------------------------|------------------------------------------------------------------------|
|Visión           |Gemini Flash (Vertex)    |**VLM abierto auto-hospedado** en AMD GPU — sin cuota, sin costo/llamada|
|Imágenes de calle|Street View Static       |**Mapillary** (imágenes abiertas)                                       |
|Geocoding        |Google Maps              |**Nominatim** (OSM)                                                     |
|Basemap tiles    |Google Maps              |**MapLibre + tiles OSM**                                                |
|Hosting backend  |Cloud Run                |VM en AWS / GCP                                                         |
|Ruteo            |Valhalla (auto-hospedado)|— *(ya es open-source y propio)*                                        |

## 11. Despliegue

- **Frontend (Next.js PWA):** Vercel (zero-config, conocido por Jorge) o Firebase Hosting.
- **Backend (FastAPI, dockerizado):** Cloud Run.
- **Valhalla (dockerizado):** VM en GCP (los tiles requieren memoria/almacenamiento; una VM da más control que Cloud Run para el serving del grafo).
- **Capa viva:** Firestore (managed).
- **Jobs de scan:** instancias GPU en AMD Developer Cloud / batch en AWS.

## 12. Plan del MVP — escalera de fallback

Cada peldaño es entregable y demoable por sí solo. Si el scan se complica, bajamos de nivel y seguimos teniendo un proyecto ganador.

1. **Ciudad ruteable en Valhalla, sin barreras** → demo válido garantizado.
2. **+ barreras mapeadas en zonas prioritarias** (clínicas, gobierno, colonias clave).
3. **+ loop ciudadano** (foto → clasificación → exclude → reruteo).
4. **+ severidad graduada por perfil** (selector de perfil cambia la ruta).
5. **+ cobertura de ciudad al máximo que alcance el scan.**

**El MVP mínimo viable y ganador = peldaños 1–4 sobre zonas prioritarias.** El peldaño 5 es cobertura incremental que no bloquea la entrega.

## 13. Stretch (si sobra tiempo, en orden de impacto)

1. **Tablero de priorización de obra pública** (el módulo de mayor punch): con datos de ciudad completa responde *”¿qué reparación desbloquea más viajes accesibles por peso invertido?”* — ranking de fixes ordenado por impacto/costo. Convierte una app ciudadana en herramienta de planeación de gobierno.
2. **Scan denso de ciudad completa** (correr más el batch con VLM propio).
3. **Re-ruteo en vivo a mitad de trayecto.**
4. **Parseo de destino en lenguaje natural** con Gemini (“llévame al IMSS más cercano accesible”).

## 14. Roadmap futuro

- Extensión a **Mexicali, Rosarito, Ensenada** (todo BC).
- **Perfil de discapacidad visual** con detección de pavimento táctil y señalización sonora.
- Integración con **transporte público** (rutas de camión accesibles).
- **Modo offline** para zonas sin cobertura.
- Integración con sistemas municipales de reporte (311) y portal oficial de **datos abiertos**.
- **Validación comunitaria** de reportes (confirmación cruzada, gamificación).
- Alianza con la **Scott-Morgan Foundation / Tec de Monterrey** para investigación de impacto.

## 15. Criterios de evaluación — alineación

|Criterio             |Peso|Cómo lo atacamos                                                                                    |
|---------------------|----|----------------------------------------------------------------------------------------------------|
|Impacto social       |30% |170k personas; severidad por perfil; tablero que prioriza obra por impacto medible                  |
|Funcionalidad técnica|25% |Ciudad ruteable garantizada + demo en vivo con escalera de fallback                                 |
|Innovación           |20% |Auto-mapeo por visión sobre Street View (resuelve el cold-start que todos sufren)                   |
|Calidad del código   |15% |Monorepo limpio, este brief, diagrama de arquitectura, repo público, deploy real                    |
|Pitch                |10% |Narrativa Scott-Morgan: “la ciudad inaccesible es un bug; aquí está la base abierta para corregirlo”|

-----

*Documento de trabajo del equipo Entropyc. Pendiente: plan de ejecución y división de tareas.*