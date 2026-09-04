# Brief — Dashboard Vecindario Beer Garden

Documento de arranque para el proyecto del dashboard. Escrito por el asistente del
proyecto del sitio web (sep 2026) para transferir todo el contexto necesario.

## El negocio

- **Vecindario Beer Garden** — restaurante-bar con cerveza artesanal en Cuernavaca, Morelos.
- Av. Teopanzolco 665, Zona 1, Reforma, 62260 Cuernavaca. Tel/WhatsApp: 777 497 2223.
- Horarios: miér–vier 17:00–23:30, sáb–dom 15:00–23:30/22:00. Lunes y martes cerrado.
- Dueño: Carlos Etienne. Hay un socio. Personal de piso (meseros) sin acceso a sistemas.
- Google Business Profile: 4.8★, ~252 reseñas. IG/FB: @vecindariobeergarden.

## Infraestructura ya montada (importante: reutilizar, no duplicar)

| Pieza | Detalle |
|---|---|
| Sitio web | Astro estático, repo GitHub `carlos-etienne/vecindario`, deploy Cloudflare Pages en **vecindariobeergarden.com** (lanzado 3-sep-2026) |
| Bot de Telegram | "Asistente Carlos" (@asistente_cgev_bot) corriendo **Hermes Agent** en VPS de Hostinger (Docker). Modelo: DeepSeek v4 Flash. Gestiona el sitio: cervezas directo a producción, otros cambios por PR con aprobación. Allowlist: Carlos (user ID 424962406) |
| Datos del sitio | `web/src/data/` — `taps.json` (10 cervezas en barra), `cervezas-repertorio.json` (106 fichas históricas), `site.json` (NAP/horarios/redes), `eventos.json` |
| POS | **Loyverse** — hay export CSV histórico (`- ARCHIVOS -/export_items.csv`): handle, REF, nombre, categoría, precios, inventario, modificadores |
| Cuentas | Cloudflare (login por GitHub — preguntar a Carlos el correo), GitHub, DeepSeek API, Google Business Profile, Search Console ya configurado |

Decisiones de gestión platicadas:
- El **personal** NO usa el bot principal. Para lista de compras/pendientes: grupo de
  Telegram del equipo + kanban de Hermes, o flujos **n8n** (repetitivos) — el bot
  general queda para Carlos (y el socio si se agrega a la allowlist).
- n8n se contempla para automatizaciones fijas (reportes semanales, etc.) — puede
  convivir en el mismo VPS como otro contenedor.

## Lo que el dashboard debería cubrir (deseado, sin afinar)

Platicado con Carlos (afinar alcance en la primera sesión del proyecto):
- **Ventas** — desde Loyverse (su API o exports) por día/semana/categoría/cerveza.
- **Pendientes y lista de compras** — capturados por el personal (Telegram/kanban de Hermes).
- **Estado de la barra** — las 10 taps y su rotación (fuente: taps.json / el bot).
- Posiblemente: métricas SEO (ya hay keyword research en `- ARCHIVOS -/KWR/`).

## Módulo de barriles conectado a Loyverse (PRIORIDAD de Carlos)

Platicado con el socio y explorado con ChatGPT (sep 2026). Es lo primero a implementar;
más adelante algo similar para cocina. Lo esencial:

**Dato estructural clave del POS**: en Loyverse las cervezas de barril se venden como
producto genérico a $0 (ej. "Ayinger") + **modificadores** con precio
("Celebrator chico $75", "Celebrator grande $110", "Brauweisse chica"...).
El API de receipts devuelve los `line_modifiers` con `modifier_option_id` y precio,
filtrable por rango de fechas. También hay webhooks (`receipts.update`,
`inventory_levels.update`) para recibir ventas en tiempo real. Conviene construir un
catálogo propio cerveza↔modifier_id↔tamaño↔volumen (chico ~355 ml, grande ~500 ml —
verificar vasos reales).

**El flujo deseado (por Telegram con Hermes)**:
- "Conectamos un barril de Celebrator de 30 L, costó $2,450" → registra barril
  (cerveza, capacidad, fecha, costo).
- El sistema acumula litros vendidos = Σ(cantidad × volumen del vaso) desde receipts.
- Consultas: "¿cuánto queda del Celebrator?" → % consumido, restante estimado,
  ingreso generado, costo proporcional, margen bruto.
- "Ya se acabó el barril" → cierra y compara teórico vs real.
- Reportes automáticos (ej. lunes: ventas, top cervezas/platillos, recomendación de compra).

**Merma es un concepto central del diseño**: teórico (ventas) vs esperado
(~8% por espuma, purga, líneas, derrames) vs real al cerrar barril. Merma alta por
cerveza = alerta de servicio/calibración/líneas.

**Principios acordados en esa plática** (vale la pena respetar):
- Loyverse = fuente de ventas; NO base histórica. Telegram = interfaz; NO base de datos.
- Los cálculos (litros, márgenes, merma) van en **código determinístico**; la IA solo
  interpreta la pregunta y llama funciones (ej. `get_top_beers()`), nunca hace las
  matemáticas críticas.
- Empezar SOLO-LECTURA hacia Loyverse; que Hermes escriba en Loyverse (precios, items)
  queda para mucho después y con confirmación explícita.
- Fases: (1) Loyverse→BD en solo lectura, (2) consultas por Telegram,
  (3) reportes automáticos, (4) módulo de barriles, (5) dashboard visual AL FINAL —
  cuando semanas de uso real digan qué mostrar.
- Desarrollo en el desktop con ZCode; Hermes queda como operación en el VPS.
- BD propuesta en esa plática: PostgreSQL en el VPS (evaluar en el proyecto si arrancar
  con algo más ligero tipo SQLite y migrar después).

**Primer objetivo concreto propuesto**: poder preguntarle a Hermes por Telegram
"¿cuánto vendimos ayer?" y que la respuesta salga de datos reales de Loyverse.

## Dudas de negocio abiertas (decisiones de Carlos)

- Cervezas de lata/botella: hay **cámara fría** (exhibición) + **bodega** (stock al tiempo).
  Decisión previa: la web NO refleja inventario fino de lata/botella (mucho mantenimiento);
  el catálogo público quedó pendiente. El dashboard podría resolver esto internamente
  (qué está frío vs bodega) sin publicarlo.

## Diseño (coherencia con la marca)

- Colores: negro #141210, verde #4a7a3c / verde claro #6da05d, ámbar #c4721e,
  fondos crema #f5f0e6 / claro #ede5d5. Tipografías: Anton (títulos), Poppins (texto),
  JetBrains Mono (datos).
- Existe `design-system.html` en la raíz del proyecto del sitio como referencia visual.
- Mobile-first absoluto (el uso real es por celular).

## Cómo empezar (recomendación)

1. Proyecto nuevo, carpeta propia (p.ej. `Vecindario Dashboard`), repo propio.
2. Primera sesión: definir alcance MVP con Carlos (¿qué ve primero cada mañana?) y
   decidir stack (candidato: Astro + islas de React, datos desde Loyverse, auth sencilla;
   o app separada en el mismo VPS/Cloudflare).
3. Integración con Hermes/Telegram después de tener el core andando.

## Reglas de trabajo con Carlos (aprendidas)

- Copy honesto: nunca inventar datos, precios, cifras — preguntar.
- Él decide negocio; el asistente recomienda y ejecuta.
- Cambios de diseño se revisan con screenshots (le importa el resultado visual).
- Espaciados generosos: títulos nunca pegados al contenido (error repetido).
- Todo enlace externo abre en pestaña nueva.
