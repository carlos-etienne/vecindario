---
name: formato-paginas-vecindario
description: Convenciones de formato y honestidad de copy para páginas del sitio web de Vecindario Beer Garden (web/src/pages/). Usar al crear o modificar cualquier página .astro del sitio — hubs, menú, contacto, legales.
---

# Formato de páginas — Vecindario Beer Garden

Reglas aprendidas del feedback de Carlos. Aplican a TODAS las páginas del sitio.

## Estructura de sección

- `section { padding: 4.5rem 0 }` — generoso, nada pegado
- Después de un hero oscuro, la primera sección clara lleva `padding-top: 4.5rem` mínimo
- Antes de un CTA final oscuro, respetar el padding de la sección anterior (nunca pegados)
- `.section-head { margin-bottom: 2rem }` con `SectionLabel` + `h2.section-title` + `.section-sub` opcional
- **Entre bloques DENTRO de una misma sección** (split → cards → outro): mínimo `margin-top: 2.5-3rem` en cada bloque siguiente. ESTO SE HA OLVIDADO VARIAS VECES — verificar siempre que ningún bloque quede pegado al anterior
- Título dentro de un split: `margin-bottom: 1.2rem` antes del texto
- Cards con icono arriba (40px, verde `--vbg-verde`), título h3 y texto — patrón diferenciadores de la home

## Componentes compartidos (usar SIEMPRE, no reimplementar)

- `SectionLabel.astro` — label con línea decorativa
- `FAQ.astro` — recibe `items=[{q, a}]`, estilo idéntico en todo el sitio (toggle ámbar, h3)
- `TapWall.astro` — variant="compact" (home) o "full" (hub/menú)
- `Header.astro` / `Footer.astro` — vía BaseLayout
- Los estilos de componentes compartidos NO se duplican en las páginas

## Anti text-wall

- Bloques editoriales: máximo 2-3 párrafos cortos seguidos
- Si hay más contenido, dividir en cards (`.cards-grid` con 3 `.card` estilo home)
- Patrón: párrafo intro (con borde izquierdo verde) → grid de cards → párrafo de cierre corto

## Botones

- `.btn-primary` — fondo verde claro, hover #578a4a (global.css)
- `.btn-wa` — contorno translúcido sobre fondos oscuros
- Gap entre botones en fila: 1.2rem mínimo

## Honestidad del copy (decisiones cerradas de Carlos — NO inventar)

- Cervezas de barril: "rotación constante" — NUNCA decir "cada semana" ni explicar el mecanismo de reemplazo de barriles
- Pizzas: "estilo napolitano" — NO "napolitanas", no hay horno de piedra (horno de gas)
- Pizzas: son PARA COMPARTIR (idealmente dos personas), NO individuales; sin mitades combinadas porque el tamaño no lo permite
- Hamburguesas: sin método de cocción (no "a la parrilla"); la carne es de Costco — NO decir "proveedor local", "premium" ni "molida del día"
- Hamburguesas van acompañadas de papas a la francesa (NO gajo); la Vegetariana es de falafel empanizado (NO portobello)
- "Maridar" (acompañar) ≠ "marinar" (remojar) — usar siempre "maridan" en preguntas de cerveza + comida
- "En tap" / "de tap" / "tap room" SÍ se usan; NUNCA "la tap" con artículo femenino (decir "la cerveza"). Al recomendar cerveza sin presentación específica, usar "la cerveza"
- NO asignar cerveza específica por platillo — hablar de afinidades generales y la recomendación del personal; NUNCA señalar explícitamente que "no hay maridaje fijo" (ese contexto no va al copy)
- En hubs de comida SOLO el nicho de la página: no mencionar otros platillos del menú (torta de suadero, pulled pork viven solo en /menu/)
- Sin "Salsa San Marzano", sin "fior di latte" — usar "salsa de tomate, mozzarella"
- Cámara fría: "temperatura constante" — SIN número específico (no mostrar grados)
- Sin cifras de inventario de lata/botella (el 1150 de Loyverse son etiquetas históricas, no disponibles)
- Sin credenciales BJCP/Cicerone (solo Carlos las tiene y no atiende) — decir "personal capacitado"
- Equipo huella/barril: usar los SVG aprobados en la home
- Ya no manejan pulque — no mencionarlo

## SEO por página

- Toda página con FAQ visible: añadir también faqSchema FAQPage en frontmatter (preguntas en h3), con el MISMO texto en ambos
- Sin breadcrumbs (eliminados por decisión de Carlos) ni su schema BreadcrumbList
- Preguntas FAQ cortas y naturales (ej. "¿Son pet friendly?", no keywords-forzadas); las keywords van en respuestas
- Anchor texts descriptivos: "Conoce nuestra selección de cerveza artesanal →", "Ver nuestras hamburguesas →"

## Móvil

- Nav hamburguesa <900px (en Header.astro)
- TapWall compact: carrusel con snap + flechas + dots <700px
- Verificar que ningún grid quede cortado: si no cabe, 1 columna con layout vertical
