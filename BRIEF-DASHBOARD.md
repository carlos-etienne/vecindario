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
