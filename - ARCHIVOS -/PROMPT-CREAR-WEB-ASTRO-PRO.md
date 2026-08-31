# PROMPT CREAR WEB ASTRO PRO

Para construir una web profesional de negocio local desde este starter. Funciona como instrucción para agentes de código capaces de leer y editar el proyecto, como Claude Code, Codex u otros equivalentes.

Un sistema creado por [La Tribu Local](https://latribulocal.com), la comunidad en español para aprender SEO local y automatizaciones.

## Uso humano

1. Abre la carpeta descargada de `local-business-astro-pro` en Codex o Claude Code.
2. Escribe `Empezar`.
3. Responde en un solo mensaje la ficha que te mostrará el agente.
4. El agente creará una copia independiente y continuará dentro de ella.

Como alternativa manual, completa `FICHA-INICIAL.md` y pide al agente que lea este prompt. Adjunta materiales reales del negocio en `inputs/` dentro de la copia si existen.

El agente debe investigar, presentar decisiones, construir y verificar. No debe desplegar ni crear cuentas externas sin permiso explícito.

---

# Instrucción para el agente

Actúa como estratega, diseñador, redactor y desarrollador senior especializado en webs Astro para negocios locales. Trabajas sobre el starter incluido en esta carpeta. Tu objetivo no es producir muchas URLs: es entregar la mejor web posible con la información demostrable del negocio y una arquitectura mantenible.

El archivo `business.yaml` es la fuente única de verdad compartida. Piensa en él como la ficha del negocio: una persona modifica allí teléfono, país, servicios o colores y el sistema los propaga. Las colecciones Markdown guardan el contenido particular de cada servicio, zona, combinación y artículo. Los componentes y rutas quedan detrás y se reutilizan.

## Fase -2 — Proteger la plantilla maestra

Antes de editar, lee `AGENTS.md`. Si no existe `project-origin.json` y `package.json` todavía se llama `local-business-astro-pro`, estás en la plantilla maestra: recoge la ficha única, solicita las autorizaciones y crea la copia mediante `node scripts/create-project.mjs --name "Nombre del proyecto" --json`. Guarda la respuesta en `intake/initial-response.md` y continúa exclusivamente en la ruta creada.

Si existe `project-origin.json`, ya estás en la copia del cliente. No generes otra y no repitas la ficha si `intake/initial-response.md` contiene la respuesta inicial.

## Resultado obligatorio

Entrega una web Astro estática, responsive, accesible y visualmente propia que incluya solo las páginas justificadas. Debe tener metadatos, canonical, navegación, sitemap, robots, datos estructurados coherentes, legales marcados para revisión, formulario configurado o claramente desactivado, y un `npm run quality` final en PASS.

No consideres el trabajo terminado por haber generado código. Revisa visualmente varias rutas a 390, 768 y 1440 px, prueba navegación y corrige los problemas encontrados.

## Principios que mandan

1. Nunca inventes hechos, reseñas, personas, credenciales, clientes, proyectos, garantías, precios, tiempos, años, ubicaciones o resultados.
2. Investigar no equivale a confirmar. Registra la fuente y conserva el estado `researched` hasta que corresponda.
3. Si falta un dato, omite la afirmación o conserva la página en `draft`; no rellenes para completar un diseño.
4. No generes el producto servicios × ciudades. Las combinaciones servicio-zona son manuales.
5. Diseña para el negocio, no para parecer diferente mediante aleatoriedad.
6. No prometas rankings ni describas la web como “optimizada al 100 %”.
7. Mantén el starter en `noindex` hasta cumplir todas las condiciones de producción.
8. No sobrescribas cambios del usuario ni realices acciones externas o destructivas sin autorización.

## Fase -1 — Preflight de skills y ficha única

Esta fase es obligatoria y ocurre antes de investigar, diseñar o construir.

### 1. Detectar capacidades

Lee `config/required-skills.yaml`. Si el entorno permite comandos y faltan dependencias, ejecuta primero `npm install`. Después ejecuta:

```bash
npm run skills:check
```

Contrasta el resultado con el catálogo de skills anunciado por el propio entorno. No confundas encontrar una carpeta con haber utilizado una skill.

Las skills requeridas son:

- `frontend-design`
- `ui-ux-pro-max`
- `web-design-guidelines`

### 2. Primera y única ficha de entrada

Lee `business.yaml` y `FICHA-INICIAL.md`. En tu primer mensaje operativo muestra una sola ficha adaptada: omite los campos que ya estén completos con datos no demostrativos y excluye la sección de clonación. Incluye en esa misma respuesta la autorización para instalar las skills ausentes.

El usuario debe poder responder todo en un único mensaje. Los campos esenciales marcados con `★` son el modo Express; los opcionales permiten el modo Completo sin pedir que el usuario elija primero un modo. Acepta texto libre, `No tengo`, `Investigar`, `Pendiente` y `Propón tú`.

No preguntes teléfono, WhatsApp, dirección, logo, servicios o zonas en mensajes separados. Tras normalizar la respuesta en `business.yaml`, agrupa cualquier duda normal en una única segunda tanda. Solo un conflicto material de identidad, seguridad, legalidad o autorización permite rondas adicionales.

### 3. Instalar solo después del permiso

Si falta alguna skill, muestra nombre, proveedor, fuente y si contiene scripts. Pregunta una sola vez dentro de la ficha: “¿Autorizas instalar dentro de esta copia del proyecto las skills de diseño que faltan?”.

Si la respuesta es afirmativa:

1. Revisa la fuente declarada y cualquier script ejecutable.
2. Utiliza un instalador de Agent Skills compatible con el agente actual.
3. Instala con alcance de proyecto, nunca global.
4. No uses opciones que omitan el consentimiento antes de recibirlo.
5. Repite `npm run skills:check`.
6. Si el catálogo no se recarga, pide reiniciar la sesión y continúa después.

Si el usuario no autoriza o el entorno no permite instalar, lee completamente `knowledge/design-core-fallback.md` y registra `integrated-fallback`. Si tampoco puedes leer el fallback, bloquea la construcción visual y explica el motivo.

### 4. Registrar y exigir el uso

Copia `templates/skills-preflight.md` a `reports/skills-preflight.md` y completa estados sin incluir rutas personales o secretos. La disponibilidad no basta:

- Aplica `frontend-design` antes del código para la dirección estética y después para la crítica visual. Guarda evidencia en `reports/design-direction.md`.
- Aplica `ui-ux-pro-max` para el sistema visual, UX, responsive y accesibilidad. Guarda evidencia en `reports/ui-ux-system.md`.
- Aplica `web-design-guidelines` después de construir para auditar archivos y líneas. Guarda evidencia en `reports/web-design-audit.md`.

Cuando una skill no exista, produce el mismo tipo de entregable mediante `design-core-fallback.md`, indicando claramente que es respaldo integrado. No avances a la Fase 0 hasta completar preflight, ficha y registro.

## Fase 0 — Comprender el proyecto

Antes de editar:

1. Lee completamente `business.yaml`, `config/business.schema.ts`, el preset de `config/countries/` indicado por `project.country` y `README.md`.
2. Inspecciona `inputs/`, la web actual y los materiales proporcionados, si existen.
3. Lee solo los módulos necesarios de `knowledge/`. Para una creación completa son obligatorios:
   - `research.md`
   - `local-seo.md`
   - `content-quality.md`
   - `page-strategy.md`
   - `design-direction.md`
   - `structured-data.md`
   - `images.md`
   - `forms-and-privacy.md`
   - `quality-gates.md`
4. Ejecuta `npm install` si faltan dependencias y `npm run validate` para conocer el estado inicial.
5. No edites todavía contenido en volumen.

## Fase 1 — Investigación con fuentes

Cuando el entorno permita buscar en internet y el encargo incluya investigación, verifica información actual mediante fuentes primarias. Recoge:

- identidad exacta y tipo de negocio;
- teléfono, email, dirección pública o condición de área de servicio;
- horarios y canales activos;
- servicios realmente ofrecidos y sus límites;
- cobertura real;
- perfil empresarial y redes existentes;
- equipo, licencias y asociaciones confirmables;
- preguntas, objeciones y vocabulario del público;
- páginas y enfoques de competidores visibles;
- requisitos legales o sectoriales que necesiten revisión profesional.

Crea `research/source-log.md` con fecha, URL, dato y estado. No copies prosa de competidores. Si no puedes navegar, trabaja con los materiales locales y declara qué queda por comprobar.

## Fase 2 — Ficha y decisiones para aprobación

Actualiza un borrador de `business.yaml`, sin activar producción. Presenta al usuario un resumen compacto con:

- hechos confirmados;
- información investigada pendiente;
- contradicciones;
- propuesta de público y posicionamiento;
- mapa de páginas: publicar, borrador o descartar;
- combinaciones servicio-zona justificadas individualmente;
- dirección visual propuesta;
- campos que todavía bloquean publicación.

Solicita aprobación antes de producir más de una muestra de cada tipo de página. Si el usuario ya aprobó explícitamente estas decisiones en la conversación, registra la aprobación y continúa.

## Fase 3 — Configuración internacional

Configura `project.country` y `project.language`. Usa el preset existente o crea uno nuevo siguiendo la estructura de `config/countries/generic.yaml`. No fuerces terminología española a otro mercado.

Revisa especialmente:

- locale y moneda;
- formato visible y E.164 del teléfono;
- orden de dirección y divisiones administrativas;
- vocabulario de CTA;
- privacidad y consentimiento aplicables;
- plataformas y directorios locales relevantes.

España puede mantenerse como valor predeterminado si el país sigue sin confirmarse, pero debe quedar señalado como supuesto y nunca pasar a producción de ese modo.

## Fase 4 — Arquitectura y contenido piloto

Implementa primero:

1. Home.
2. Hub de servicios y un servicio representativo.
3. Hub de zonas y una zona representativa, si la cobertura lo justifica.
4. Una combinación servicio-zona únicamente si existe evidencia exclusiva.
5. Contacto y sobre nosotros con datos reales.

Cada Markdown publicado necesita `status: publish` y `factsStatus: verified`. Los borradores usan `draft` y `needs-review` hasta que sus hechos estén listos.

Para cada página define internamente: intención, respuesta principal, hechos, objeciones, CTA, enlaces entrantes/salientes y razón de existencia. Redacta desde esos elementos. No hagas spinning, no cambies únicamente topónimos y no impongas una longitud fija.

## Fase 5 — Dirección visual

Lee el resultado del preflight. Utiliza aquí `frontend-design` y `ui-ux-pro-max`, o sus secciones equivalentes del fallback. Escribe los dos entregables de evidencia antes de retocar componentes o CSS.

Antes de retocar CSS, declara una dirección visual en una frase y justifica:

- familia de diseño;
- combinación tipográfica;
- paleta y contraste;
- variante de hero, servicios y proceso;
- tratamiento de imágenes e iconografía;
- un rasgo de composición memorable.

Configura `branding` y adapta componentes cuando el sector lo necesite. La base técnica puede repetirse entre clientes; la expresión visual debe surgir de la identidad y el contenido. Evita gradientes genéricos, grids interminables de tarjetas, iconos sin criterio y fotografía de stock intercambiable.

Si existen referencias visuales, extrae principios —ritmo, contraste, escala, densidad— sin copiar marca, texto, código o activos.

## Fase 6 — Construcción completa

Tras aprobar el piloto:

- completa servicios y zonas justificadas;
- crea combinaciones manuales con dos o más evidencias exclusivas;
- añade recursos solo cuando resuelvan una pregunta útil;
- conserva rutas y componentes simples;
- utiliza HTML semántico y JavaScript solo para interacciones reales;
- centraliza datos compartidos en `business.yaml`;
- usa contenido Markdown para información propia de una URL;
- añade imágenes optimizadas con licencia y procedencia;
- mantiene CTAs, teléfono, email y cobertura coherentes;
- no publiques una sección vacía ni la rellenes con ficción.

## Fase 7 — SEO técnico y datos estructurados

Comprueba por ruta:

- title descriptivo y singular;
- meta description útil y singular;
- un H1 y jerarquía lógica;
- canonical absoluto al dominio final;
- locale y hreflang coherentes;
- Open Graph básico;
- enlaces internos que ayuden a navegar;
- indexabilidad según estado;
- inclusión correcta en sitemap;
- schema sustentado por contenido visible.

El subtipo de negocio se configura en `seo.schemaType`. No actives reseñas o `AggregateRating` sin datos confirmados y coherentes. No actives FAQ schema por rutina. Valida las políticas actuales antes de usar resultados enriquecidos.

## Fase 8 — Conversión, formularios y privacidad

Adapta CTA y canal principal al negocio. Si activas formulario:

1. Usa un endpoint exclusivo.
2. No introduzcas secretos en el repositorio.
3. Solicita únicamente datos necesarios.
4. Enlaza la información de privacidad adecuada.
5. Prueba validación, éxito, fallo y recepción real.

Mapas, chat, analítica, vídeos y otros embeds requieren justificación y revisión de privacidad. Las páginas legales son borradores hasta que una persona competente las adapte. Mantén `legalNeedsReview: true` mientras eso no ocurra.

## Fase 9 — Producción y QA

Antes del quality gate, utiliza `web-design-guidelines` sobre las páginas, componentes y estilos modificados. Obtén sus reglas actuales desde la fuente indicada por la propia skill, corrige los hallazgos y guarda la auditoría en `reports/web-design-audit.md`. Si la skill no está disponible, ejecuta la auditoría equivalente de `design-core-fallback.md` y registra esa limitación.

Ejecuta:

```bash
npm run quality
```

Corrige errores y evalúa todas las advertencias. Después levanta el sitio localmente y revisa como mínimo:

- home;
- hub y detalle de servicio;
- hub y detalle de zona;
- contacto;
- blog o recurso;
- legales y 404;
- navegación móvil, teclado y estados de foco;
- textos largos, enlaces, teléfonos, email y formulario;
- anchos 390, 768 y 1440 px.

Comprueba que no haya desbordes horizontales, saltos de layout, contraste insuficiente, componentes vacíos, datos demo, residuos de instrucciones ni afirmaciones sin respaldo.

## Fase 10 — Activación de producción

No cambies estos valores hasta haber terminado la revisión:

```yaml
project:
  mode: production
publishing:
  productionReady: true
  showDemoNotice: false
```

Antes, sustituye dominio y contacto demo, confirma país, revisa legales, prueba formulario, elimina borradores visibles y vuelve a ejecutar `npm run quality`.

No despliegues, cambies DNS, crees perfiles ni envíes la web a indexación salvo que el usuario lo autorice expresamente. Si lo autoriza, lee `knowledge/deployment.md` y documenta URL, plataforma, variables, verificaciones y procedimiento de reversión.

## Entrega al usuario

Resume:

- páginas publicadas, en borrador y descartadas;
- datos confirmados y pendientes;
- dirección visual elegida;
- integraciones activas/inactivas;
- resultado de build y quality gate;
- rutas revisadas visualmente y tamaños usados;
- trabajo humano pendiente, especialmente legales, formulario, perfil empresarial y deploy.

Incluye enlaces a `business.yaml`, contenidos clave y README. No digas “listo para publicar” si el modo sigue siendo starter, hay datos demo o permanece un bloqueo.
