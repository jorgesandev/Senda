Aquí tienes el documento de especificaciones de diseño y guion estructurado para el video demo de Senda. Está optimizado para capturar la atención de los jueces de HackFox 2026, destacando el "Citizen Loop" como la funcionalidad estrella, manteniendo un tono técnico pero profundamente humano.

---

# Especificaciones de Diseño de Video Demo: Senda

## 1. Visión General del Video

- **Duración Objetivo:** 1:30 a 2:00 minutos (ideal para pitch de hackathon).
- **Idioma:** Español (Voz en off e interfaz).
- **Estilo Visual:** Interfaz limpia y minimalista (estilo Next.js/Tailwind), mapas en modo oscuro con acentos de color vibrantes para las rutas y barreras.
- **Tono:** Urgente, pragmático, ingenieril. Tratamos la inaccesibilidad no como una tragedia, sino como un "bug" de sistema que Senda viene a parchear con datos abiertos.

## 2. Recomendaciones de Diseño de Activos (UI & Assets)

Dado que aún no hay pantallas finales, aquí están las directrices para maquetar (en Figma o directo en código) lo que se mostrará en el video:

- **Paleta de Colores (Alta Accesibilidad):**
- **Fondo/Base:** Blanco limpio para la UI, Modo Oscuro (GCP/Mapbox style) para el mapa base para que los datos resalten.
- **Acentos:** \* _Ruta Accesible:_ Verde esmeralda o Azul eléctrico brillante.
- _Ruta Bloqueada/Inaccesible:_ Rojo coral o Naranja.
- _Pines de Barreras:_ Iconos claros (escalón, hoyo, sin rampa) en amarillo/rojo de alerta.

- **Tipografía:** Sans-serif moderna y ultra legible (Inter, Roboto o SF Pro). Títulos grandes, mucho espacio en blanco.
- **Elementos Clave a Diseñar:**

1. Pantalla de inicio con selector de "Perfil de Movilidad" (Silla de ruedas, Bastón, Carriola).
2. Vista del mapa con el grafo de Valhalla trazando una ruta.
3. Modal de "Reportar Barrera" (Cámara + Botón de subir).
4. Dashboard oscuro de BigQuery/GCP mostrando la priorización de obras públicas.

## 3. Estructura y Guion (El "Shot List")

### Fase 1: El Bug (0:00 - 0:20)

- **Visual:** Tomas rápidas tipo B-roll de calles reales de Tijuana (banquetas rotas, postes a la mitad, falta de rampas). Texto grande superpuesto: "170,000 personas en Tijuana viven esto a diario."
- **Voz en off:** "Tijuana no fue diseñada para todos. Para miles de personas, llegar al médico o al trabajo no es un trayecto, es una pista de obstáculos. En Entropyc, no vemos esto como una fatalidad. Lo vemos como un problema de ingeniería. Un bug en nuestra ciudad. Y aquí está el parche."
- **Transición:** Corte rápido al logo de Senda.

### Fase 2: El 'Citizen Loop' (Hero Feature) (0:20 - 1:00)

- **Visual:** Pantalla dividida o mockups de teléfono. Un usuario abre la PWA de Senda y pide una ruta a la clínica del IMSS. El motor (Valhalla) traza una ruta.
- **Voz en off:** "Senda no te da la ruta más corta. Te da la ruta más transitable según tu perfil: silla de ruedas, bastón o carriola. Pero la magia está en cómo el mapa aprende en tiempo real."
- **Visual (El momento "Wow"):** El usuario va en camino y se topa con un escalón nuevo. Abre Senda, toma una foto de la barrera. Vemos la UI de Firestore actualizándose. _Al instante_, la ruta verde original se vuelve roja en ese segmento, y Senda traza inmediatamente una nueva ruta accesible esquivando la calle bloqueada.
- **Voz en off:** "Con nuestro Citizen Loop, cualquier persona reporta una barrera física. La capa viva de Firestore la procesa y el motor esquiva el bloqueo de inmediato. De ciudadano a ciudadano, el mapa se cura a sí mismo."

### Fase 3: El Músculo Técnico (1:00 - 1:30)

- **Visual:** Diagrama de arquitectura dinámico y muy visual. Iconos de OpenStreetMap, Valhalla, Gemini Flash y Firestore. Un clip corto de la visión computacional "escaneando" una imagen de Street View y detectando cajas delimitadoras (bounding boxes) alrededor de los obstáculos.
- **Voz en off:** "Para que la ciudad sea ruteable desde el día cero, Senda ingiere la red de OpenStreetMap e inyecta severidad graduada evaluando miles de imágenes de Street View con modelos de visión. Ruteo peatonal completo y escalable, sin depender de cajas negras."

### Fase 4: Gobierno y Cierre (1:30 - 2:00)

- **Visual:** La pantalla del móvil se aleja y se transforma en un dashboard de escritorio (El tablero de priorización de obra). Vemos un mapa de calor de Tijuana.
- **Voz en off:** "Pero Senda no es solo una app comunitaria. Es una base de datos abierta. Entregamos al gobierno municipal un tablero de priorización: ¿qué reparación de banqueta desbloquea más rutas accesibles por peso invertido?"
- **Visual:** Texto final: "Senda. El parche para una Baja Sin Barreras."
- **Voz en off:** "Tecnología abierta, cero lock-in. Somos el equipo Entropyc. Bienvenidos a Senda."

---

## 4. Flujo de Producción Recomendado

Para mantener la agilidad durante el fin de semana del hackathon:

1. **Grabar la Voz:** Graba el guion primero. Esto te dará el ritmo exacto ("pacing") de cuánto tiempo debe durar cada pantalla en pantalla.
2. **Maquetar y Capturar:** Diseña las pantallas clave y usa herramientas de prototipado para grabar la pantalla simulando el uso.
3. **Montaje Ágil:** Para ensamblar esto rápidamente sin perder tiempo en renderizados pesados, un editor como CapCut online será perfecto para sincronizar los recortes de pantalla, la pista de voz y añadir efectos de zoom dinámicos y sonido a las interfaces.

Una vez que tengas clara esta estructura, ¿te gustaría que escriba el _prompt_ exacto para que el generador de video comience a crear los recursos visuales de fondo (b-roll de Tijuana, las animaciones de mapas y los gráficos de visión por computadora)?
