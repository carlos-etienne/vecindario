# Manual del agente — Vecindario Beer Garden

Este repo contiene el sitio web de Vecindario Beer Garden (restaurante-bar en Cuernavaca).
El sitio es **Astro estático** y se despliega en **Cloudflare Pages** con cada push a `main`.
El dueño (Carlos) gestiona el sitio por **Telegram** a través de este agente.

## Regla de oro de publicación

- **Cambios en `web/src/data/taps.json`** (cervezas de barril y precios) → commit directo a `main` y push. El deploy es automático (~1 min).
- **Cualquier OTRO archivo** (textos, diseño, páginas, precios de comida en el menú) → crear rama + Pull Request y mandarle a Carlos el link de vista previa. **Nunca hacer push directo a `main` con estos cambios.**
- Ante duda de si un cambio es "de cervezas" o no → tratándolo como PR.

## Editar las cervezas de barril (`web/src/data/taps.json`)

Array de 10 objetos, uno por tap. Campos:

| Campo | Tipo | Notas |
|---|---|---|
| `num` | número | 1-10, posición en la barra |
| `nombre` | string | nombre comercial de la cerveza |
| `estilo` | string | ej. "Hazy IPA", "Stout" |
| `color` | string | hex del estilo, pinta el vaso SVG ej. "#E8B96A" |
| `cerveceria` | string | ej. "Insurgente" |
| `origen` | string | ciudad/país |
| `abv` | string | ej. "6.5%" |
| `ibu` | string o número | amargor |
| `precioCh` | número | pesos MXN cerveza chica (sin $) |
| `precioG` | número | pesos MXN cerveza grande (sin $) |
| `badges` | array | ej. ["Nueva", "Local"] — vacío si ninguno |
| `disponible` | booleano | false = agotada (se muestra tachada) |
| `descripcion` | string | 1-2 frases educativas y honestas |

**Validaciones antes de commit (obligatorias):**
1. Exactamente 10 objetos, `num` correlativo 1-10.
2. `precioCh`/`precioG` numéricos (nunca strings con "$").
3. `abv` como string con "%".
4. JSON válido (json parse).
5. `cd web && npm run build` pasa sin errores.
6. Si no hay datos de un campo (ej. IBU desconocido), preguntar antes de inventar.

**Nunca inventar:** precios, grados de alcohol, cerveceras, estilos. Si Carlos no los da, preguntar en el chat.

## Otros datos

- `web/src/data/site.json` — NAP, horarios, teléfono, redes. Cualquier cambio aquí = PR.
- Menú de cocina: `web/src/pages/menu/index.astro` (array `platos`). Cambios de precios/platillos de comida = PR.

## Reglas de copy (resumen; detalle en `.claude/skills/formato-paginas-vecindario/SKILL.md`)

- Cervezas de barril: "rotación constante" — nunca "cada semana" ni explicar el mecanismo.
- Sin "la tap" con artículo; "en tap"/"de tap" sí. "Tap room" sí.
- Pizzas "estilo napolitano" (no "napolitanas"), para compartir entre dos, sin mitades.
- Hamburguesas: sin "proveedor local"/"premium"/"molida del día"; papas a la francesa.
- Sin cerveza asignada por platillo; sin "marinan" (es "maridan").
- FAQ visible y faqSchema deben llevar el MISMO texto.

## Comandos

```bash
cd web
npm run build     # validar antes de todo push/PR
npm run dev       # servidor local :4321
```

## Después de cada cambio

Confirmar a Carlos en el chat: qué se cambió exactamente (diff corto) y el estado del deploy (producción si fue taps, link de preview si fue PR). Si pide "deshacer"/"revertir": `git revert` del último commit y push.
