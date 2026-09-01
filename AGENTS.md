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
| `ibu` | string o número | opcional — `""` si no se tiene; no esperarlo de Carlos |
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
6. IBU: no esperarlo de Carlos — omitir (dejar `""`) salvo que él lo proporcione o que el agente tenga el dato confirmado de fuente oficial al investigar una cerveza nueva. Para CUALQUIER otro campo sin datos, preguntar antes de inventar.

**Nunca inventar:** precios, grados de alcohol, cerveceras, estilos ni IBU. Si Carlos no da precios/grados/cerveceras/estilos, preguntar en el chat (el IBU se omite, ver punto 6).

## Repertorio de cervezas (`web/src/data/cervezas-repertorio.json`)

Biblioteca con la ficha completa de TODAS las cervezas conectadas alguna vez (mismo schema que taps.json, sin `num` ni `disponible`).

1. **Siempre antes de editar**: `git pull origin main` en el repo (hay otros escritores además de ti).
2. **Al desconectar una cerveza**: guardar su ficha en el repertorio (si no está) antes de sacarla de taps.json.
3. **Al reconectar una recurrente**: copiar su ficha del repertorio a taps.json con el `num` que le asigne Carlos — no pedir datos de nuevo.
4. **Cerveza nueva con datos incompletos**: buscarlos en la web (Untappd, sitio de la cervecera, Google) y proponerle a Carlos la ficha completa + una `descripcion` de 1-2 frases educativas al estilo del sitio. **Esperar su confirmación antes de publicar.**
5. **Color del vaso**: si la cerveza está en el repertorio, conservar su color guardado. Si es nueva, asignarlo de este mapa por estilo e incluirlo en la propuesta:

| Estilo (contiene) | Color |
|---|---|
| Kölsch, Pilsner, Lager, Helles | #f2d94f |
| Hefeweizen, Wheat | #f0e6c0 |
| Saison | #f0e3a6 |
| IPA (West Coast, American) | #d9951e |
| NEIPA, Hazy, Milkshake | #f0c95a |
| DIPA, Triple IPA | #e0a234 |
| Belgian, Tripel, Golden | #edc65b |
| Rye, Red, Amber, APA | #c0561f |
| Dunkel, Vienna, Märzen, Bock, Doppelbock | #8a4d1e |
| Porter | #452916 |
| Stout, Barrel Aged | #2e1b10 |
| Fruit, Sour, otra frutal | preguntar a Carlos |

Si el estilo no encaja en el mapa, o la etiqueta de la cerveza tiene un color icónico obvio, proponerle 2 opciones a Carlos.

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
