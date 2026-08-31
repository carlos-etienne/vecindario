# ══════════════════════════════════════════════════════════════
# PROMPT DE CREACION WEB DESDE CERO — v1.2
# Para negocios locales de cualquier sector
# Optimizado para modelos con contexto largo (1M+)
# ══════════════════════════════════════════════════════════════
#
# CAMBIOS DESDE v1.1:
# - Soporte multipais (agnóstico al país). Nuevo campo PAIS (ISO 3166
#   alpha-2). DEFAULT = MX (Mexico). Spain (ES) ya no es el único
#   territorio soportado: locale, prefijo tel., moneda, división
#   administrativa, fuente estadística y ley de protección de datos
#   se derivan de PAIS.
# - NAP canonico: el formato de telefono visible ahora se deriva del
#   país (ej. Mexico agrupa "55 1234 5678", Espana "930 451 580").
#   Sigue habiendo UN solo formato visible + UN solo formato tel:.
# - Reutilizacion de keyword research existente: nuevo campo
#   KEYWORD_RESEARCH_EXISTENTE. Si apunta a archivos CSV de exports
#   de herramientas (Ubersuggest, Google Keyword Planner, etc.), se
#   SALTAN las fases de investigacion de keywords y se usan los datos.
#   Si el campo esta vacio pero hay CSVs en el proyecto, se pregunta
#   al usuario antes de investigar desde cero.
# - Filtro de calidad de competidores: nuevo campo COMPETIDORES_MODO
#   (investigar | saltar). En modo "investigar" se anade veredicto de
#   calidad SEO por competidor — los debiles NO se usan como referencia.
# - Nueva Fase 0.A: deteccion y carga de decisiones previas del
#   proyecto (keywords, sitemap, categorias GBP, modelo de
#   arquitectura). Lo que ya esta decidido NO se redescubre.
# - Fase 15 (Citations) reestructurada: internacionales + sectoriales
#   globales + tablas locales por país (MX y ES cubiertos; resto
#   investigable).
#
# CAMBIOS DESDE v1.0:
# - Modo GBP dual: GBP_EXISTE = si | no condiciona schema, embed de
#   Maps, seccion de resenas y AggregateRating en home.
# - Formato NAP canonico definido y obligatorio (telefono y direccion
#   con UN solo formato visible y UN solo formato schema/tel:).
# - Nueva Fase 14: GBP Strategy completa con dos modos (crear desde
#   cero / optimizar existente) + sistema de captacion de resenas.
# - Nueva Fase 15: NAP Citations con lista priorizada para Espana.
# - Embed de Google Maps con cid/place_id cuando hay GBP (sincroniza
#   web ↔ ficha y refuerza Local Pack).
# - FAQs hiperlocales obligatorias (preguntas tipo "?Hacen X en
#   [barrio]?", "?Cuanto tardan desde [zona]?").
#
# NOTA: Si todos los campos nuevos (salvo PAIS) quedan vacios, el
# comportamiento es identico a v1.1 salvo que el país por defecto es
# MX. Para reproducir exactamente v1.1, fijar PAIS = ES.
#
# INSTRUCCIONES PARA TI (HUMANO):
# 1. Crea una carpeta nueva con el nombre del proyecto
# 2. (Opcional) Si tienes capturas de webs que te inspiren, metelas en /inspiracion/
# 3. Abre la carpeta en tu editor con la herramienta de IA
# 4. Rellena SOLO la seccion <ficha-proyecto> de abajo
# 5. Copia TODO este documento y pegalo en el chat
# 6. El modelo investigara, planificara y construira la web completa desde cero
#
# ══════════════════════════════════════════════════════════════
# PEGAR EN EL CHAT DESDE AQUI ABAJO (NO TOCAR LO DE ARRIBA)
# ══════════════════════════════════════════════════════════════

<!--
╔═══════════════════════════════════════════════════════════════╗
║  RELLENA SOLO ESTOS CAMPOS                                    ║
║                                                               ║
║  Datos basicos del negocio:                                   ║
║   - NOMBRE_EMPRESA                                            ║
║   - SECTOR (actividad clara: clinica dental, fontaneria...)   ║
║   - DOMINIO (sin https:// ni www)                             ║
║   - TELEFONO (fijo/movil de la empresa)                       ║
║   - DIRECCION_COMPLETA (calle, numero, CP, ciudad)            ║
║   - SERVICIOS_PRINCIPALES (3-8 separados por |)               ║
║   - DIFERENCIADOR (1-2 frases de propuesta de valor)          ║
║                                                               ║
║  PAIS (default MX):                                           ║
║   - PAIS = codigo ISO 3166 alpha-2 (MX, ES, AR, CO, CL...)    ║
║   - Si vacio, se asume MX. Deriva locale, prefijo tel.,       ║
║     moneda, division administrativa, ley proteccion datos.    ║
║                                                               ║
║  Google Business Profile (CLAVE para Local SEO):              ║
║   - GBP_EXISTE = si | no                                      ║
║                                                               ║
║   Si GBP_EXISTE = si, rellena TAMBIEN:                        ║
║     - GBP_URL (URL completa de la ficha en Google Maps)       ║
║     - GBP_NOMBRE (nombre EXACTO tal como aparece en GBP —     ║
║       debe coincidir con NOMBRE_EMPRESA, sin keyword stuffing)║
║     - GBP_RATING (opcional: nota media, ej: 4.8)              ║
║     - GBP_REVIEW_COUNT (opcional: numero total de resenas)    ║
║                                                               ║
║   Si GBP_EXISTE = no:                                         ║
║     - Deja GBP_URL/NOMBRE/RATING/REVIEW_COUNT vacios          ║
║     - La web se construye en "modo pre-GBP" (sin embed de     ║
║       resenas, sin AggregateRating, sin sameAs a Maps).       ║
║     - En la Fase 14 se crea la ficha desde cero y luego se    ║
║       actualiza la web con todo lo que faltaba.               ║
║                                                               ║
║  Investigacion previa (para NO redescubrir lo ya decidido):   ║
║                                                               ║
║   - KEYWORD_RESEARCH_EXISTENTE (ruta a archivo/carpeta con    ║
║     exports de keyword research: Ubersuggest, Google Keyword   ║
║     Planner, Semrush, etc.). Si tiene valor, la Fase 0.3 SALTA║
║     la investigacion de keywords y usa estos datos. Si vacio  ║
║     pero hay CSVs en el proyecto, el modelo pregunta antes de ║
║     investigar desde cero.                                    ║
║                                                               ║
║   - COMPETIDORES_MODO = investigar | saltar (default:         ║
║     investigar). "saltar" omite el analisis de competidores   ║
║     locales. "investigar" los analiza PERO solo imita a los   ║
║     que pasen un veredicto de calidad SEO (los debiles NO se  ║
║     usan como referencia).                                    ║
║                                                               ║
║   - DECISIONES_PREVIAS_EXISTENTES (ruta a archivo md/json/txt ║
║     o carpeta con documentacion de estrategia del proyecto:   ║
║     sitemap aprobado, categorias GBP, modelo de arquitectu-   ║
║     ra, etc.). Lo que ya este decidido NO se redescubre.      ║
║     Alternativamente puede ir inline en un bloque             ║
║     <decisiones-previas>...</decisiones-previas> pegado justo ║
║     despues de </ficha-proyecto> (ver ejemplo mas abajo).     ║
║                                                               ║
║  Opcionales:                                                  ║
║   - SIGLAS_MARCA (si vacio, el modelo lo deriva)               ║
║   - PUBLICO_OBJETIVO (familias, empresas, profesionales...)   ║
║   - WHATSAPP_NUMERO (formato internacional sin + ni espacios, ║
║     ej: 525512345678 para MX, 34930451580 para ES)            ║
║   - INSPIRACION_DISPONIBLE (si/no — capturas en /inspiracion/)║
║                                                               ║
║  Email: se deriva del dominio (info@{DOMINIO}) y se           ║
║  configura con Cloudflare Email Routing en la Fase 13.        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

DATOS QUE EL MODELO AUTOCOMPLETA INVESTIGANDO (Fase 0):
- PERFIL_PAIS: bloque derivado de PAIS (locale, prefijo tel., moneda,
  division administrativa, fuente estadistica, ley proteccion datos).
  Ver tabla en Fase 0.0. Cobertura confirmada: MX, ES. Otros paises:
  derivar valores + investigar directorios/citas locales equivalentes.
- MUNICIPIO, CODIGO_POSTAL, {DIVISION_ADMIN} (estado/provincia/...),
  {DIVISION_SUB} (region/comarca/delegacion/...)
- LATITUD / LONGITUD del municipio
- POBLACION_APROX (fuente: {PAIS_ESTADISTICA})
- ZONAS_SERVICIO: 5+ municipios cercanos (<10 km), priorizando los de
  mayor poblacion. NO incluir el municipio principal.
- BARRIOS_PRINCIPALES: 4-6 barrios reales del municipio principal
- BARRIOS_ZONAS: 2-3 barrios reales de cada zona satelite
- CONTEXTO_LOCAL: tipologia de viviendas/clientela tipica de la zona
- HITOS_LOCALES: 2-4 puntos de referencia cerca del local (estacion,
  plaza, centro comercial, hospital) para usar en pagina contacto
- KEYWORDS_SECTOR: keywords clave del sector + variantes locales
  (de Fase 0.3: investigadas, leidas de CSV existente, o ya cargadas
  como decision previa — segun corresponda)
- TIPO_SCHEMA: subtipo de LocalBusiness adecuado al sector
  (Dentist, LegalService, RestaurantOrCafe, AutoRepair, etc.)
- Si GBP_EXISTE = si: extraer GBP_PLACE_ID de GBP_URL (cadena que
  empieza por "ChIJ..." dentro del parametro data= o !1s de la URL).
  Si no se puede extraer automaticamente, pedirlo al usuario.

EJEMPLO DE BLOQUE <decisiones-previas> INLINE (opcional, pegar justo
despues de </ficha-proyecto> cuando ya hay estrategia previa). Solo
incluir los campos que apliquen — los omitidos se derivan normalmente:

<decisiones-previas>
- PAIS = MX
- KEYWORD_RESEARCH_EXISTENTE = ./
- COMPETIDORES_MODO = saltar
- Sitemap ya aprobado: [pegar aqui, o referenciar archivo]
- Categorias GBP: [pegar tabla primaria + secundarias]
- Modelo de arquitectura: [ej: hub-spoke, anti-canalizacion]
- Decisiones de copy/tono: [si las hay]
Trata esto como salida ya validada de las fases correspondientes.
No redescubrir lo que ya esta decidido; solo complementar lo que falte.
</decisiones-previas>
-->

<ficha-proyecto>
NOMBRE_EMPRESA               =
SIGLAS_MARCA                 =
SECTOR                       =
DOMINIO                      =
TELEFONO                     =
DIRECCION_COMPLETA           =
SERVICIOS_PRINCIPALES        =
DIFERENCIADOR                =
PUBLICO_OBJETIVO             =
WHATSAPP_NUMERO              =

PAIS                         =

GBP_EXISTE                   =
GBP_URL                      =
GBP_NOMBRE                   =
GBP_RATING                   =
GBP_REVIEW_COUNT             =

KEYWORD_RESEARCH_EXISTENTE   =
COMPETIDORES_MODO            =
DECISIONES_PREVIAS_EXISTENTES=

INSPIRACION_DISPONIBLE       =
</ficha-proyecto>


Eres un experto en Local SEO, copywriting y desarrollo web frontend. Tu tarea es construir una web estatica completa, profesional y optimizada para Local SEO, partiendo de cero, para el negocio descrito en la <ficha-proyecto>.

<contexto>
La carpeta actual esta vacia (o casi). Vas a crear desde cero:
- Estructura de archivos completa
- Diseno visual (paleta, tipografia, layout)
- Contenido textual 100% original
- Imagenes optimizadas
- SEO tecnico y on-page
- Schema JSON-LD adecuado al sector
- Blog informativo (3 posts) sin canibalizar
- Paginas legales y 404
- Configuracion de despliegue (Cloudflare Pages + Email Routing)

La web debe parecer hecha por una agencia profesional, NO un sitio generado por IA.
Eso significa: contenido especifico al sector, diseno con personalidad, datos locales reales,
microcopy variado, sin frases genericas tipo "ofrecemos los mejores servicios".
</contexto>

<restricciones-criticas>
- Trabaja directamente sobre los archivos. NO muestres bloques largos de codigo en el chat.
- Crea cada archivo in situ. Edita lo creado, no enumeres todo en chat.
- Usa agentes en paralelo siempre que sea posible para maximizar velocidad.
- Stack: HTML5 estatico + CSS3 + JS vanilla. SIN frameworks, SIN build step.
- Hosting objetivo: Cloudflare Pages (despliegue Fase 13).
- Email: se configura con Cloudflare Email Routing (NO Zoho ni otros).
- WhatsApp: si {WHATSAPP_NUMERO} esta vacio, NO incluir botones de WhatsApp en la web.
  Si tiene valor, todos los enlaces wa.me/ apuntan a https://wa.me/{WHATSAPP_NUMERO}.
- Email visible en la web: info@{DOMINIO} (derivado automaticamente).
- Antes de generar contenido masivo, presenta el plan al usuario y espera OK.

NAP CANONICO (formato fijo, OBLIGATORIO en TODA la web — esto es Local SEO 101):
- PAIS = {PAIS} (default MX). Derivar PERFIL_PAIS en Fase 0.0. Los formatos de
  abajo se adaptan al país; si PAIS no esta cubierto en la tabla, investigar
  el formato local de telefono y usar un patron coherente.
- TELEFONO_VISIBLE: formato legible para el usuario, DERIVADO DE PAIS:
  - MX: "XX XXXX XXXX" (10 digitos, agrupacion 2-4-4, ej: "55 1234 5678")
    Para ladas distintas al del D.F./Edo. Mex.: "XXX XXX XXXX" (3-3-4)
  - ES: "XXX XX XX XX" (9 digitos, agrupacion 3-2-2, ej: "930 451 580")
  - Otros paises: investigar formato local. Mantener UN solo patron en toda la web.
  → usar en todo el texto visible de la web (topbar, footer, contacto, hero)
- TELEFONO_TEL: formato internacional sin espacios "{PAIS_PREFIJO_TEL}{NUMERO_COMPLETO}"
  (ej: "+525512345678" para MX, "+34930451580" para ES)
  → usar en href="tel:..." y en el campo telephone del schema JSON-LD
- DIRECCION_VISIBLE: "{CALLE_CORTA}, {CODIGO_POSTAL} {MUNICIPIO}"
  → usar en todo el texto visible (footer, contacto, hero si aplica)
- DIRECCION_SCHEMA: streetAddress = {CALLE_FORMAL}, addressLocality = {MUNICIPIO},
  postalCode = {CODIGO_POSTAL}, addressRegion = {DIVISION_ADMIN},
  addressCountry = "{PAIS_CODIGO}"
- Estos formatos DEBEN ser identicos a los que se usaran luego en GBP y citations
  (Fases 14 y 15). Cualquier variacion = perdida de NAP consistency = penalizacion.
- NUNCA mezclar formatos: si en topbar pone "55 1234 5678", en el footer NO puede
  poner "5512345678" ni "+52 55 1234 5678". Mismo formato en toda la web.

GBP DUAL MODE (afecta a varias fases):
- Si GBP_EXISTE = si: la web incluye seccion de resenas, AggregateRating en schema,
  embed de Maps con place_id, sameAs con GBP_URL, hasMap apuntando a la ficha,
  boton "Dejanos una resena" con link directo write-review.
- Si GBP_EXISTE = no: la web se hace en "modo pre-GBP". CERO de lo anterior. La
  ficha se crea en Fase 14 y luego se actualiza la web (queda comentado en HTML
  con marcadores `<!-- GBP-PENDING: ... -->` para localizarlo facil con grep).
</restricciones-criticas>


## FASE 0: Investigacion y autocompletado de datos

ANTES de tocar codigo, investiga y completa los datos faltantes de la ficha.

### 0.A Deteccion y carga de decisiones previas (PRIMER paso de la Fase 0)

Antes de investigar nada, comprueba si el proyecto ya tiene decisiones tomadas
(keywords, sitemap, categorias GBP, modelo de arquitectura, tono de copy).
Reutilizar lo decidido AHORRA tiempo y EVITA redescubrir / contradecir lo
validado en sesiones anteriores.

Flujo de deteccion (por orden de prioridad):

1. **Bloque inline `<decisiones-previas>...</decisiones-previas>`** pegado en
   el prompt despues de </ficha-proyecto>. Es lo MAS explicito → maxima
   prioridad. Si existe, parsear su contenido.

2. **Campo `DECISIONES_PREVIAS_EXISTENTES`** con ruta a archivo o carpeta.
   Cargarlo: leer markdown/json/txt y extraer artefactos de estrategia.

3. **Deteccion automatica en la raiz del proyecto.** Buscar archivos por
   nombre (`arquitectura*.md`, `sitemap*.md`, `estrategia*.md`, `seo*.md`,
   `handoff*.md`, `decisiones*.md`) o por contenido (documentos que
   mencionen "sitemap", "categorias GBP", "anti-canalizacion", "cluster
   de intencion"). Si se encuentran varios, listarlos y preguntar al
   usuario cual cargar.

4. **Si no hay nada de lo anterior** → Fase 0 corre normal (investigar todo).

Que aceptar como decision previa y a que fase equivalente reemplaza:

| Artefacto previo detectado | Reemplaza / satura | Si falta algo, el prompt lo completa |
|---------------------------|--------------------|---------------------------------------|
| Keywords (archivo CSV, campo KEYWORD_RESEARCH_EXISTENTE o inline) | Fase 0.3 (solo keywords) | Long-tail no listadas → derivar de las principales |
| Sitemap aprobado | Fases 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 | Slugs no especificados → derivar |
| Categorias GBP (primaria + secundarias) | parte de Fase 0.3 (TIPO_SCHEMA) y Fase 14.A.2 | Categoria secundaria ausente → investigar |
| Modelo de arquitectura (hub-spoke, anti-canalizacion, etc.) | Fase 9 (anti-canalizacion) — respetar el modelo previo | — |
| Decisiones de copy (tono, intencion por pagina) | Fase 4 | Paginas sin copy planificado → redactar |

Reglas de fusion:
- **Las decisiones previas tienen PRIORIDAD.** Si el prompt generico y el
  artefacto previo dicen cosas distintas (ej: prompt sugiere hub de
  servicios, pero el proyecto decidio servicios centralizados sin hub),
  gana el artefacto previo. Reportar la divergencia y respetarla.
- **Solo se complementa lo que falta.** No regenerar keywords ya listadas,
  no redisenar el sitemap, no reabrir decisiones cerradas.
- **Verificacion de integridad.** Antes de avanzar, listar al usuario:
  "Decisiones previas cargadas: [lista]. Decisiones que faltan y voy a
  derivar: [lista]. Continuo desde Fase X." Esperar OK.
- **Continuar desde donde toque.** Si las previas cubren Fase 0 + Fase 1,
  arrancar en Fase 2 (esqueleto HTML) tras la confirmacion.

### 0.0 Perfil del pais (default MX)

Derivar el bloque PERFIL_PAIS a partir de PAIS. Si PAIS esta vacio, asumir MX.
Cobertura confirmada:

| Variable | MX (default) | ES | Otros paises |
|---|---|---|---|
| PAIS_CODIGO | MX | ES | codigo ISO alpha-2 |
| PAIS_LOCALE | es_MX | es_ES | es_XX del pais |
| PAIS_PREFIJO_TEL | +52 | +34 | prefijo internacional |
| PAIS_MONEDA | MXN | EUR | moneda local |
| PAIS_MONEDA_SIMBOLO | $ | € | simbolo |
| PAIS_DIVISION_ADMIN | estado | provincia | nivel admin 1 |
| PAIS_DIVISION_SUB | municipio / alcaldia (CDMX) | comarca | subdivision |
| PAIS_ESTADISTICA | INEGI | INE | instituto de estadistica local |
| PAIS_LEY_PROTECCION_DATOS | LFPDPPP | RGPD/LOPDGDD | ley local equivalente |

Si PAIS no esta en la tabla (ej: AR, CO, CL, PE...): investigar y derivar
cada valor. Documentar el bloque PERFIL_PAIS resultante para que el resto
de fases lo use de forma consistente.

Estas variables se usan en: NAP canonico, og:locale, hreflang, schema
(addressCountry, currenciesAccepted, priceRange), ley de privacidad del
checkbox de formularios, y directorios locales de la Fase 15.

### 0.1 Datos derivados de la direccion

- MUNICIPIO: extraer de DIRECCION_COMPLETA
- CODIGO_POSTAL: extraer de DIRECCION_COMPLETA
- DIVISION_ADMIN (= estado / provincia / region): investigar (Fase 0.2)
- CALLE: formato formal completo (ej: "Calle de Ejemplo, 10") — para schema JSON-LD
- CALLE_CORTA: formato corto (ej: "C/ Ejemplo, 10") — para footer y texto visible
- EMAIL: info@{DOMINIO}

### 0.2 Datos a investigar (busca en internet)

- {DIVISION_ADMIN} y {DIVISION_SUB} del municipio (ej MX: "estado de Morelos";
  ej ES: "provincia de Barcelona, comarca del Bages")
- LATITUD / LONGITUD (Google Maps)
- POBLACION_APROX ({PAIS_ESTADISTICA} / Wikipedia)
- ZONAS_SERVICIO: minimo 5 municipios cercanos (<10 km), por orden de poblacion
  descendente, EXCLUYENDO el municipio principal.
- BARRIOS_PRINCIPALES: 4-6 barrios reales del municipio principal
- BARRIOS_ZONAS: 2-3 barrios reales por cada zona satelite
- CONTEXTO_LOCAL: tipologia de vivienda/clientela predominante
  (ej: "ciudad dormitorio con familias jovenes", "casco antiguo con
  edificios historicos", "zona residencial de alto poder adquisitivo")

### 0.3 Investigacion del sector (keywords + competidores + schema)

Esta seccion tiene GATES. Antes de investigar, revisa Fase 0.A: si las
keywords o el modelo de arquitectura ya estan cargados como decision
previa, NO redescubrirlos.

#### 0.3.a KEYWORDS — tres modos

Modo 1 — KEYWORD_RESEARCH_EXISTENTE tiene valor (ruta a archivo/carpeta):
- NO investigar keywords desde cero.
- Leer el/los archivo(s) indicados. Tipicos: exports de Ubersuggest, Google
  Keyword Planner, Semrush. Extraer:
  - KEYWORDS_PRINCIPALES: las 3-5 con mas volumen + intencion comercial/local
    relevantes al sector + ciudad. Priorizar intencion L (local) y C (comercial).
  - KEYWORDS_LARGA_COLA: 5-10 long-tail con volumen menor pero intencion clara.
- Reportar al usuario: "Keywords extraidas de [archivo] (N filas). Top: [lista]."
- Si el archivo no trae long-tail suficientes, derivarlas de las principales.

Modo 2 — KEYWORD_RESEARCH_EXISTENTE vacio, pero hay CSVs en la raiz:
- Escanear *.csv en busca de cabeceras que parezcan exports de keyword
  research: "Keyword" / "Palabra clave", "Volume" / "Vol. de busqueda",
  "Difficulty" / "Dificultad", "CPC".
- Si se encuentran, PREGUNTAR al usuario antes de investigar:
  "Detecte estos CSVs que parecen investigacion de keywords:
  [lista]. Usarlos o investigar desde cero?".
- Si el usuario confirma un archivo, comportarse como Modo 1 con esa ruta.
- Si el usuario dice "investigar desde cero", ir al Modo 3.

Modo 3 — Sin CSVs ni campo (o usuario rechazo usarlos):
- Investigar como en v1.1: las 3-5 keywords mas buscadas del sector + ciudad,
  5-10 long-tail menos competidas.

En cualquiera de los 3 modos, KEYWORDS_SECTOR queda disponible para Fases
3.12 (aplicar keywords en H1/H2/alt/parrafos) y 8.3 (elegir temas de blog).

#### 0.3.b COMPETIDORES_TOP — gate por COMPETIDORES_MODO

Modo "saltar" (COMPETIDORES_MODO = saltar):
- Omitir todo el analisis de competidores locales. Las decisiones de titles,
  CTAs, estructura y copy se toman SOLO con las mejores practicas SEO
  embebidas en este prompt. No se imita a nadie.

Modo "investigar" (default, o vacio):
- Analiza los 5 primeros resultados de Google para "{servicio principal}
  {ciudad}". Por cada uno evalua CALIDAD SEO (veredicto obligatorio):
  - Title/H1: estructurados, con keyword + ciudad, longitud correcta.
  - Schema LocalBusiness presente y valido.
  - Contenido especifico (datos, marcas, plazos) vs generico de IA.
  - NAP consistente y visible.
  - On-page basico: meta description, alt text, enlaces internos.
- Emitir veredicto por competidor:
  - "De referencia" (cumple 4/5 o mas) → imitar patrones (titles, CTAs).
  - "Debil" (cumple <4/5) → NO usar como referencia.
- Si NINGUNO pasa el umbral: reportar "Competidores locales con SEO pobre —
  no se usaran como referencia. Se aplican mejores practicas del prompt." y
  proceder como si COMPETIDORES_MODO = saltar.

#### 0.3.c TIPO_SCHEMA — siempre se investiga (no es keyword research)

- Subtipo de LocalBusiness mas especifico que aplique. Ejemplos:
  - Clinica dental → Dentist
  - Abogados → LegalService / Attorney
  - Restaurante → Restaurant / CafeOrCoffeeShop
  - Fontaneria/electricista → Plumber / Electrician / HomeAndConstructionBusiness
  - Taller mecanico → AutoRepair
  - Gimnasio → ExerciseGym / SportsActivityLocation
  - Peluqueria → BeautySalon / HairSalon
  - Academia → EducationalOrganization
  - Veterinario → VeterinaryCare
  - Inmobiliaria → RealEstateAgent
  - Asesoria → AccountingService / FinancialService
  - Empresa de energia solar → SolarEnergyCompany / HomeAndConstructionBusiness
  - Si no encajas exacto, usa LocalBusiness + tipo mas cercano en array.
- NOTA: si las categorias GBP ya vienen como decision previa (Fase 0.A),
  usarlas como base para TIPO_SCHEMA y no contradecirlas.

### 0.4 GBP — extraccion de Place ID (solo si GBP_EXISTE = si)

Si GBP_EXISTE = si:
1. Verificar que GBP_URL es valido (debe contener "google.com/maps" o ser un
   shortlink "maps.app.goo.gl/..."). Si es shortlink, expandirlo.
2. Extraer GBP_PLACE_ID de la URL. El Place ID:
   - Empieza por "ChIJ..." (formato moderno) o por un hash hex (formato antiguo)
   - En URLs largas suele estar despues de "!1s0x" o en el parametro "data="
   - Si no se puede extraer automaticamente, pedirlo al usuario (puede sacarlo
     en https://developers.google.com/maps/documentation/places/web-service/place-id)
3. Verificar que GBP_NOMBRE coincide con NOMBRE_EMPRESA. Si NO coinciden:
   - Avisar al usuario de la divergencia
   - Decision por defecto: usar GBP_NOMBRE en la web (Google premia consistencia
     web↔ficha sobre cualquier otra cosa). El usuario puede sobreescribir.
4. Construir GBP_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid={GBP_PLACE_ID}`
   → este link se usa en el boton "Dejanos una resena" de la web.

Si GBP_EXISTE = no: saltar este paso. Se hace en Fase 14.

### 0.5 (Opcional) Analizar inspiracion visual

Si INSPIRACION_DISPONIBLE = si, lee las imagenes de la carpeta /inspiracion/.
Anota: paleta dominante, tipografia aparente (serif/sans/display), estilo
(minimalist/maximalist/editorial/brutalist), densidad de contenido, jerarquia.
Esto guiara la Fase 5 (diseno visual).

### 0.6 Presentar al usuario y esperar OK

Muestra al usuario:
1. **Decisiones previas cargadas** (si las hubo, Fase 0.A): lista de artefactos
   reutilizados (keywords, sitemap, categorias GBP, modelo de arquitectura).
   Indicar desde que fase se continua.
2. **Perfil del pais** (Fase 0.0): PAIS, locale, prefijo tel., moneda,
   division admin, ley proteccion datos.
3. Datos autocompletados (ubicacion, zonas, barrios, hitos locales, contexto)
4. Investigacion del sector:
   - Keywords (de donde provienen: CSV existente / investigadas / previas)
   - Competidores (saltados / analizados + veredicto de calidad por cada uno)
   - Tipo schema
5. NAP canonico definitivo: TELEFONO_VISIBLE, TELEFONO_TEL, DIRECCION_VISIBLE,
   DIRECCION_SCHEMA. Estos formatos NO se cambian despues — si hay GBP, deben
   coincidir EXACTO con la ficha; si no hay GBP, se usaran al crearla en Fase 14.
6. GBP status: si existe, Place ID extraido + write-review URL. Si no existe,
   confirmar que la web se hace en modo pre-GBP.
7. Plan de paginas (Fase 1.1 — preview, o ya bloqueado por sitemap previo)
8. Decisiones de diseno preliminares (Fase 5 — preview)

NO empezar la siguiente fase hasta que el usuario apruebe o corrija.


## FASE 1: Plan estructural

### 1.1 Estructura de archivos

Crea esta estructura (adapta nombres al sector si procede):

```
/
├── index.html                          # Home
├── sobre-nosotros.html                 # Quien somos
├── contacto.html                       # Contacto + formulario + mapa
├── 404.html                            # Error 404 (noindex)
├── aviso-legal.html                    # Legal (noindex)
├── politica-privacidad.html            # Legal (noindex)
├── politica-cookies.html               # Legal (noindex)
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── _redirects                          # Cloudflare Pages redirects
├── favicon.svg
├── favicon.ico
├── apple-touch-icon.png
├── servicios/
│   ├── index.html                      # Hub de servicios (opcional, ver 1.2)
│   └── [slug-servicio-1].html          # Una por cada servicio principal
├── zonas/
│   ├── index.html                      # Hub de zonas
│   └── [slug-zona].html                # Una por cada ZONA_SERVICIO (NO la principal)
├── blog/
│   ├── index.html                      # Hub del blog
│   └── [slug-post].html                # 3 posts
├── css/
│   └── styles.css                      # CSS global (lo no critico)
├── js/
│   └── main.js                         # JS para nav, formulario, FAQ accordion
└── assets/
    └── img/                            # Todas las imagenes (WebP)
```

### 1.2 Decision: hub de servicios

- Si SERVICIOS_PRINCIPALES tiene 4+ servicios → crear /servicios/index.html como hub
- Si tiene 3 → no crear hub, listar los 3 directamente desde la home

### 1.3 Decision: paginas de servicio

Una pagina por servicio principal en /servicios/[slug].html.
Slug = servicio en kebab-case ASCII (ej: "Implantes dentales" → "implantes-dentales").

### 1.4 Decision: paginas de zona

Una por cada ZONA_SERVICIO. Patron: /zonas/{sector-slug}-{zona-slug}.html
Ej para fontaneria en Sant Cugat: /zonas/fontanero-sant-cugat.html
NUNCA crear zona para el MUNICIPIO principal (canibalizaria la home).

### 1.5 Decision: nav principal

Navegacion top, simple, max 6 items:
`Inicio | Servicios | Zonas | Blog | Sobre Nosotros | Contacto`

Si solo hay 1-2 zonas, "Zonas" puede no estar en nav (queda en footer).
Si solo hay 3 servicios, "Servicios" lleva a un anchor de la home (#servicios) en vez de hub.

### 1.6 Presentar plan completo y esperar OK

**SI hay sitemap aprobado como decision previa (Fase 0.A):** esta fase ya esta
cubierta. Confirmar al usuario que se respeta el sitemap previo y saltar a
Fase 2. No replantear estructura de paginas, slugs ni hubs.

**Si no hay sitemap previo**, lista al usuario:
- Numero exacto de paginas a crear
- Slugs definitivos
- Estructura de nav
- Decisiones de hubs (servicios/zonas)

Espera OK antes de la Fase 2.


## FASE 2: Esqueleto HTML + CSS base

### 2.1 Crear todos los archivos HTML con scaffold completo

Cada archivo HTML debe nacer con TODOS estos elementos en su sitio (aunque
los textos sean placeholders temporales que se llenan en Fase 4):

```
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[Title — Fase 3]</title>
  <meta name="description" content="[Fase 3]">
  <link rel="canonical" href="[Fase 3]">
  <link rel="alternate" hreflang="{PAIS_LOCALE con guion}" href="[Fase 3]">
  <link rel="alternate" hreflang="x-default" href="[Fase 3]">

  <!-- Open Graph (TODAS las paginas, incluidas legal y 404) -->
  <meta property="og:type" content="website">
  <meta property="og:locale" content="{PAIS_LOCALE con _}">
  <meta property="og:site_name" content="{NOMBRE_EMPRESA}">
  <meta property="og:title" content="">
  <meta property="og:description" content="">
  <meta property="og:url" content="">
  <meta property="og:image" content="">

  <!-- Twitter Card (TODAS las paginas) -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="">
  <meta name="twitter:description" content="">
  <meta name="twitter:image" content="">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="alternate icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- Preconnect Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?[Fase 5]">

  <!-- CSS critico inline (Fase 11) -->
  <style>/* ... */</style>

  <!-- CSS no critico -->
  <link rel="stylesheet" href="/css/styles.css">

  <!-- Schema JSON-LD (Fase 7) -->
  <script type="application/ld+json">{}</script>
</head>
<body>
  <header role="banner">
    <!-- Topbar con telefono/email -->
    <!-- Nav principal -->
  </header>

  <main>
    <!-- Contenido propio de la pagina -->
  </main>

  <footer role="contentinfo">
    <!-- 4 columnas: marca | servicios | zonas | contacto -->
  </footer>

  <script src="/js/main.js" defer></script>
</body>
</html>
```

Notas:
- Paginas legales y 404 llevan `<meta name="robots" content="noindex,nofollow">`
- TODAS llevan `<main>` envolviendo el contenido (entre header y footer)
- TODAS llevan OG y Twitter Card completos
- TODAS llevan canonical + hreflang del pais ({PAIS_LOCALE con guion}) + x-default

### 2.2 Header y footer comunes

Definir estructura HEADER y FOOTER comun y usarla literal en cada pagina.
Como es estatico (sin includes), se duplica el HTML; verifica que es identico.

Header:
- Topbar fina con telefono (tel:), email (mailto:), horario corto
- Logo + nombre marca a la izquierda
- Nav a la derecha (max 6 items)
- Boton CTA destacado (telefono o "Pedir cita")
- Mobile: menu hamburguesa (controlado por main.js)

Footer (4 columnas):
- Col 1: Logo, marca, parrafo breve, redes sociales (placeholders #)
- Col 2: Servicios (lista de los principales con anchor text descriptivo)
- Col 3: Zonas (lista de zonas + "Reformas/Servicio en {MUNICIPIO}" → href="/")
- Col 4: Contacto (telefono, email, direccion, horario)
- Sub-footer: copyright + links legales + "Diseno web por..."

### 2.3 CSS base (css/styles.css)

Crear un sistema con:
- `:root` con custom properties (colores, fuentes, spacing, radii)
- Reset minimo (no Normalize completo, solo lo necesario)
- Tipografia escalada (clamp para H1-H6, body)
- Layout helpers (.container, .grid, .flex)
- Componentes: .btn, .card, .badge, .form-input, .accordion
- Mobile-first con breakpoints en 640, 768, 1024, 1280
- Modo oscuro: NO por defecto (decision: no anadirlo salvo que el sector lo pida)

### 2.4 JS base (js/main.js)

Funciones minimas:
- Toggle menu hamburguesa mobile
- Acordeon de FAQ (toggle abierto/cerrado, solo uno abierto a la vez)
- Validacion formulario hero/contacto basica (cliente, no anti-bot)
- Smooth scroll a anchors

NO incluir librerias externas. Vanilla JS puro.


## FASE 3: SEO on-page

### 3.1 Title tags

Cada pagina debe tener un <title> unico, 30-60 caracteres.

Reglas:
- NO repetir la ciudad si ya esta en la marca
- Separador principal: `|`. Subdivisiones: `·`
- Adapta las formulas al sector. Patron general:

| Pagina | Formula |
|--------|---------|
| Home | [Servicio principal] en {MUNICIPIO} · [Diferenciador corto] \| {SIGLAS_MARCA} |
| Hub servicios | Servicios de [Sector] en {MUNICIPIO} \| {SIGLAS_MARCA} |
| Servicio | [Servicio] en {MUNICIPIO} \| {SIGLAS_MARCA} |
| Zona | [Sector/Servicio] en [Zona] \| {SIGLAS_MARCA} |
| Contacto | Contacto y [Pedir cita / Presupuesto] \| {NOMBRE_EMPRESA} |
| Sobre nosotros | Sobre Nosotros \| {NOMBRE_EMPRESA} |
| Blog hub | Blog de [Sector] en {MUNICIPIO} \| {SIGLAS_MARCA} |
| Blog post | [Titulo del post] \| {SIGLAS_MARCA} |
| Legal | [Pagina legal] · {NOMBRE_EMPRESA} |
| 404 | Pagina no encontrada \| {NOMBRE_EMPRESA} |

Verifica longitud despues de escribir cada title (30-60 chars).

### 3.2 Meta descriptions

120-160 caracteres en paginas indexables. 100+ en noindex.

Reglas:
- Cada pagina tiene una description UNICA (NUNCA copiar entre paginas)
- Incluir: municipio, servicio principal, CTA, diferenciador
- Variar la estructura entre paginas (no usar siempre la misma plantilla)
- meta description = og:description = twitter:description (deben coincidir)

Despues de escribir todas, CONTAR caracteres. Si hay alguna fuera de rango, ajustar.

### 3.3 H1 — Diferente al title

H1 unico por pagina, semanticamente diferente al title.

Patrones por tipo:
- Home: H1 con la propuesta de valor + ciudad. Ej:
  "Tu [sector] de confianza <br>en <span>{MUNICIPIO}</span>"
- Hub servicios: "Servicios de [sector] en {MUNICIPIO}"
- Servicio: usar formulacion DISTINTA al title.
  Title: "[Servicio] en {MUNICIPIO} | {SIGLAS}"
  H1: "Especialistas en [servicio]: [beneficio principal]"
  o: "[Servicio] en {MUNICIPIO}: [propuesta concreta]"
- Zona: "[Sector/Servicio] en [Zona] — [diferenciador corto]"
- Contacto: "Contacta con {NOMBRE_EMPRESA}"
- Blog hub: "Blog — Guias y consejos sobre [sector]"
- Blog post: titulo descriptivo del articulo

### 3.4 Hero visual de la home

El H1 de la home no es texto plano. Diseno con impacto:

```html
<span class="hero-badge"><i class="..."></i> [Claim corto, ej: "20 anos en {MUNICIPIO}"]</span>
<h1>[Linea principal] <br>en <span>{MUNICIPIO}</span></h1>
<p class="hero-services">[Servicio 1] · [Servicio 2] · [Servicio 3]</p>
<p class="hero-subtitle">[Propuesta de valor en 1-2 frases]</p>
<div class="hero-ctas">
  <a class="btn btn-primary" href="...">CTA principal</a>
  <a class="btn btn-secondary" href="tel:...">Llamar ahora</a>
</div>
```

CSS necesario:
- `.hero-badge`: pill translucida con borde accent, font pequena, icono + texto
- `.hero h1 span`: color accent (resalta la ciudad)
- `.hero-services`: uppercase, letter-spacing amplio, semitransparente
- `.hero h1`: line-height ~1.15, font-size con clamp() responsive

### 3.5 Open Graph (TODAS las paginas)

Las 7 etiquetas obligatorias en TODAS, incluidas legal y 404:
- og:type ("website" / "article" en blog posts)
- og:locale = "{PAIS_LOCALE}" (ej: "es_MX", "es_ES")
- og:site_name = {NOMBRE_EMPRESA}
- og:title = mismo que <title>
- og:description = mismo que meta description
- og:url = URL canonica completa
- og:image = imagen principal de la pagina (hero como fallback)

### 3.6 Twitter Card (TODAS las paginas)

- twitter:card = "summary_large_image"
- twitter:title = mismo que <title>
- twitter:description = mismo que meta description
- twitter:image = mismo que og:image

### 3.7 Canonical + Hreflang (TODAS las paginas)

```html
<link rel="canonical" href="https://{DOMINIO}/[ruta]">
<link rel="alternate" hreflang="{PAIS_LOCALE con guion}" href="https://{DOMINIO}/[ruta]">
<link rel="alternate" hreflang="x-default" href="https://{DOMINIO}/[ruta]">
```

Solo el hreflang del pais (ej: "es-MX", "es-ES") y x-default.
NO hreflang="es" suelto (redundante).

### 3.8 Jerarquia de headings

- 1 unico H1 por pagina
- H2 para secciones principales, sin repetir el mismo H2 dos veces en la misma pagina
- H3 para subsecciones. NO sobreoptimizar (no meter ciudad en cada H3)
- NUNCA saltar niveles (H1 → H3 sin H2)

### 3.9 Eliminar meta keywords

NO incluir `<meta name="keywords">` en ninguna pagina (obsoleta y senal de spam).

### 3.10 HTML semantico

- `<header role="banner">` (uno por pagina)
- `<nav role="navigation" aria-label="...">`
- `<main>` envolviendo TODO el contenido propio (entre header y footer)
- `<footer role="contentinfo">`
- `<article>` para posts del blog
- `<section>` con aria-labelledby para secciones grandes
- Formularios: cada input con `<label>` asociado o aria-label

### 3.11 Enlaces internos

- Anchor text descriptivo, NO "Ver mas" / "Click aqui"
- Cada servicio enlaza a 2-3 zonas (en su pagina)
- Cada zona enlaza a 2-3 servicios (en su pagina)
- Footer "Reformas/Servicio en {MUNICIPIO}" → href="/" (la HOME es la del municipio)
- Blog post enlaza a servicios relevantes (1-2 enlaces contextuales)
- Sobre nosotros enlaza a contacto y servicios

### 3.12 Aplicacion de keywords (de Fase 0.3)

Aplica los hallazgos de Fase 0.3, vengan de donde vengan (CSV existente,
investigacion en vivo o decision previa):
- Si COMPETIDORES_MODO = investigar y hubo competidores marcados como
  "de referencia", usar sus patrones de title como base. Si todos fueron
  "debiles" o COMPETIDORES_MODO = saltar, usar las mejores practicas del
  prompt (separador "|", formulas de la tabla 3.1) sin imitar a nadie.
- Usa las keywords principales en H1, H2, primer parrafo, alt text
- Long-tail keywords en blog posts (no competir con la home)


## FASE 4: Contenido — Original, especifico, no generico

Todo el copy de la web debe ser ORIGINAL, ESPECIFICO al sector y NATURAL.
La web NO debe parecer generada por IA. Eso significa:

### 4.1 Reglas de oro del copy

1. **Especifico > generico.** Mal: "ofrecemos los mejores servicios". Bien:
   "instalamos calderas de condensacion Vaillant y Junkers con garantia de 5 anos".

2. **Datos concretos.** Numeros, anos, marcas, materiales, garantias, plazos,
   procesos. Cuanto mas concreto, menos genera-IA suena.

3. **Terminologia del sector.** Usa la jerga real (con sentido). En odontologia:
   "implante de carga inmediata", no "puesta rapida del diente". En fontaneria:
   "purgar radiadores", no "limpiar la calefaccion".

4. **Datos locales reales.** Menciona barrios reales del municipio, comarca,
   tipologia de vivienda/clientela. Esto ancla el contenido a la zona.

5. **Variedad de microcopy.** No uses siempre los mismos labels, placeholders,
   CTAs. Variarlos pagina a pagina.

6. **Sin frases robadas.** No copies parrafos de la competencia. Inspirate en
   estructura, no en redaccion.

7. **Tono coherente con el sector.** Clinica medica → cercano y tranquilizador.
   Despacho de abogados → formal y solido. Restaurante → emocional y sensorial.
   Fontaneria de urgencias → directo y eficiente.

### 4.2 CTAs — Variar segun pagina

NO usar siempre el mismo. Lista de variantes a rotar:
- "Pide tu primera visita gratis" / "Reserva tu cita" / "Agendar consulta"
- "Solicitar presupuesto" / "Pedir valoracion" / "Recibir info detallada"
- "Llamar ahora" / "Hablar con un especialista" / "Te asesoramos por telefono"
- "Conoce el servicio" / "Ver detalles" / "Descubrir mas"

### 4.3 Microcopy — Variar entre paginas

Labels, placeholders, ayudas, notas:
- "Tu nombre *" / "Como te llamas *" / "Nombre completo *"
- "Cuentanos en que podemos ayudarte" / "Describe brevemente tu caso" / "?Que necesitas?"
- "Te respondemos en 24h." / "Contacto en menos de 1 dia laborable." / "Sin compromiso, te llamamos pronto."

### 4.4 Estructura sugerida HOME

Adapta segun sector. Estructura tipica:

1. Hero (3.4): badge + H1 + servicios chips + subtitle + CTAs + form/imagen
2. Servicios destacados: 3-6 tarjetas con icono, titulo, 2-3 lineas, CTA
3. Diferenciadores ("Por que elegirnos"): 3-4 cards con beneficios concretos
4. Proceso de trabajo: 4-5 pasos numerados
5. Zonas que cubrimos: DOS bloques —
   a) Barrios del MUNICIPIO principal (4-6 chips o lista con BARRIOS_PRINCIPALES,
      sin links — solo refuerzan la senal local en la home)
   b) Zonas satelite (lista clickable con anchor "Servicio en {Zona}" → enlaza
      a /zonas/[slug])
6. Testimonios: 2-4 testimonios reales o realistas con nombre + barrio + caso
   - Si GBP_EXISTE = si: anadir BLOQUE DE RESENAS REALES de Google Reviews
     (ver 4.4.bis abajo). Los testimonios de la web y las resenas de Google
     pueden coexistir o sustituirse — decidir segun cantidad/calidad de cada uno.
7. FAQ: 6-8 preguntas. OBLIGATORIO incluir al menos 3 hiperlocales tipo:
   - "?Trabajais en [BARRIO_PRINCIPAL]?" / "?Cubris [BARRIO]?"
   - "?Cuanto tardais en venir desde [ZONA_SATELITE]?"
   - "?Atendeis urgencias en {MUNICIPIO} y zona de {COMARCA}?" (si aplica al sector)
   - "?Donde estais ubicados exactamente?" (responder con CALLE_CORTA + hito local)
   El resto pueden ser preguntas genericas del sector — pero que NO esten ya
   tratadas en posts del blog (anti-canibalizacion).
8. Pricing/info de presupuesto (si aplica al sector)
9. CTA final + datos de contacto + mapa o ubicacion

### 4.4.bis Seccion de resenas (SOLO si GBP_EXISTE = si)

Anadir entre testimonios y FAQ una seccion "Opiniones de nuestros clientes" o
"Lo que dicen en Google":

```html
<section class="reviews" aria-labelledby="reviews-heading">
  <h2 id="reviews-heading">Lo que dicen nuestros clientes en Google</h2>
  <div class="reviews-summary">
    <span class="rating-stars">★★★★★</span>
    <strong>{GBP_RATING}/5</strong> en {GBP_REVIEW_COUNT} resenas
  </div>
  <div class="reviews-grid">
    <!-- 3-4 cards con resenas reales mas valoradas (texto + nombre + estrellas) -->
    <!-- Estas resenas se obtienen manualmente del GBP y se transcriben aqui -->
    <!-- Cada card lleva schema Review (ver Fase 7.9) -->
  </div>
  <div class="reviews-cta">
    <a href="{GBP_WRITE_REVIEW_URL}" target="_blank" rel="noopener" class="btn btn-secondary">
      Dejanos tu opinion en Google
    </a>
    <a href="{GBP_URL}" target="_blank" rel="noopener" class="btn btn-link">
      Ver todas las resenas
    </a>
  </div>
</section>
```

Si GBP_EXISTE = no: dejar marcador HTML para localizar despues:
```html
<!-- GBP-PENDING: anadir aqui seccion de resenas cuando la ficha de Google
     Business Profile este creada y tenga al menos 5 resenas. Ver Fase 4.4.bis
     del prompt original. -->
```

### 4.4.ter Boton "Dejanos una resena" (SOLO si GBP_EXISTE = si)

Independientemente de la seccion de resenas, anadir un boton flotante o un CTA
en el footer / pagina contacto con el link directo:
```html
<a href="{GBP_WRITE_REVIEW_URL}" target="_blank" rel="noopener">
  Dejanos una resena en Google
</a>
```
Esto facilita la captacion de resenas nuevas (Fase 14).
Si GBP_EXISTE = no: anadir comentario `<!-- GBP-PENDING: boton write-review -->`
en footer y contacto para localizarlo y rellenarlo cuando exista la ficha.

### 4.5 Pagina Sobre Nosotros

100% texto original, NO generico:
- Historia/origen real o coherente (anos, fundador, motivacion)
- Equipo (si aplica al sector): nombres + rol + experiencia
- Valores: 3-4 valores con CASO concreto que los ilustra
- Datos locales: relacion con el municipio, anos sirviendo a la comarca, barrios donde se ha trabajado
- Certificaciones, colegiaciones, garantias (segun sector)

### 4.6 Paginas de servicio

Cada servicio es una pagina con:
1. Hero corto: H1 + 1-2 lineas de subtitle + CTA
2. Que es / en que consiste el servicio (1-2 parrafos especificos)
3. Cuando lo necesitas / sintomas / casos tipicos (lista con beneficios reales)
4. Como trabajamos: proceso paso a paso
5. Materiales/marcas/tecnicas concretas (depende del sector)
6. Plazos y precios (rangos orientativos si aplica)
7. FAQs especificas del servicio (3-5)
8. Zonas en las que prestamos este servicio (cross-link a zonas)
9. CTA final

### 4.7 Paginas de zona — Evitar doorway pages

Cada pagina de zona debe ser UNICA:
1. Parrafo introductorio especifico de esa zona (caracteristicas reales)
2. Distancia y tiempo de desplazamiento desde {MUNICIPIO} (REAL, no inventado)
3. Poblacion de la zona y barrios principales
4. Que servicios destacamos en esa zona (cuales tienen mas demanda alli)
5. Caso concreto o testimonio de un cliente de esa zona (puede ser ficticio realista)
6. Al menos 1 FAQ EXCLUSIVA de esa zona
7. Minimo 30% de contenido exclusivo respecto al resto de zonas

NO es valido cambiar solo el nombre de la ciudad. Reescribe parrafos completos.

### 4.8 Pagina de contacto

Datos visibles:
- Telefono clickable: texto en TELEFONO_VISIBLE, href en TELEFONO_TEL
- Email mailto:info@{DOMINIO}
- Direccion en DIRECCION_VISIBLE
- Horario detallado (cada dia, variable segun sector). Si hay festivos/horarios
  especiales, mencionarlos.
- WhatsApp boton si {WHATSAPP_NUMERO} existe (apunta a wa.me/{WHATSAPP_NUMERO})
- Si GBP_EXISTE = si: boton "Ver ficha en Google" → GBP_URL + boton "Dejanos
  una resena" → GBP_WRITE_REVIEW_URL

Mapa embebido — DOS variantes segun GBP_EXISTE:

**Variante A (GBP_EXISTE = si) — RECOMENDADA, refuerza Local Pack:**
```html
<iframe
  src="https://www.google.com/maps/embed/v1/place?key=NO_KEY_NEEDED_FOR_PLACE_ID&q=place_id:{GBP_PLACE_ID}"
  width="100%" height="400" style="border:0;"
  allowfullscreen="" loading="lazy"
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```
Alternativa sin API key (URL de embed publica):
```html
<iframe src="https://maps.google.com/maps?q={LATITUD},{LONGITUD}&z=16&output=embed&iwloc=near"
        width="100%" height="400" loading="lazy"></iframe>
```
Si tienes shortlink de la ficha (`https://maps.app.goo.gl/...`), tambien puedes
usar el embed generado desde "Compartir → Insertar un mapa" en la propia ficha
GBP — es la opcion que MAS senaliza la conexion web↔ficha.

**Variante B (GBP_EXISTE = no) — embed por coordenadas:**
```html
<iframe src="https://maps.google.com/maps?q={LATITUD},{LONGITUD}&z=16&output=embed"
        width="100%" height="400" loading="lazy"></iframe>
<!-- GBP-PENDING: sustituir este embed por el de la ficha GBP cuando este creada (Fase 14). -->
```

Seccion "Como llegar" — anclar geograficamente con HITOS_LOCALES:
- "Estamos a X minutos a pie de [HITO_LOCAL_1]"
- "A [N] minutos en coche desde el centro de {MUNICIPIO}"
- "Aparcamiento publico/privado mas cercano: [referencia real]"
- "Parada de bus / estacion mas cercana: [referencia real]"
- Indicaciones desde 2-3 puntos de las ZONAS_SERVICIO ("desde [Zona] por la
  carretera [X], unos [N] minutos")

Estos detalles son senales locales potentes — no las saltes aunque parezcan
relleno. Para Google son contexto geografico real.

Formulario completo con checkbox de privacidad (Fase 10).

### 4.9 Paginas legales

Aviso legal, politica de privacidad y politica de cookies adaptadas a:
- Empresa real (NIF si lo tienes; si no, dejar [NIF pendiente])
- Direccion real del negocio
- Email real (info@{DOMINIO})
- Hostinger: Cloudflare Pages
- Sin trackers complejos por defecto. Si se anade GA, actualizar cookies policy.

### 4.10 404

- Mensaje amable, no tecnico
- Buscador (si aplica) o lista de paginas mas visitadas (home, servicios, contacto)
- meta robots noindex,nofollow
- meta description >100 chars


## FASE 5: Diseno visual

### 5.1 Eleccion de paleta

Elige UNA paleta coherente con el sector. Variables CSS en :root.

Lista de inspiracion (escoge UNA, adapta los hex):

| Sector | Paleta sugerida |
|--------|-----------------|
| Clinica medica/dental | primary #1A3A52, accent #4FB6A8, sage #E8F4F2, warm-bg #FAFCFD |
| Abogados/asesoria | primary #1F2937, accent #B8924C, sage #E5E7EB, warm-bg #F9FAFB |
| Restaurante/cafe | primary #2C1810, accent #C65D3E, sage #8B6F4E, warm-bg #FAF6F1 |
| Fontaneria/electricista | primary #0F2A44, accent #F4A03A, sage #5E8C61, warm-bg #F7F3EE |
| Belleza/peluqueria | primary #2D1F2D, accent #D4847A, sage #A89B92, warm-bg #FAF6F4 |
| Gimnasio/fitness | primary #1A1A1A, accent #E94E1B, sage #4A4A4A, warm-bg #F5F5F5 |
| Inmobiliaria | primary #14213D, accent #FCA311, sage #E5E5E5, warm-bg #FAFAFA |
| Veterinario | primary #2A4A3F, accent #F4A261, sage #A8C5BB, warm-bg #F4F1ED |

Si tienes inspiracion (Fase 0.4), priorizar la paleta dominante de las capturas.

```css
:root {
  --primary: #...;
  --accent: #...;
  --accent-hover: #...;   /* derivar: oscurecer el accent un 10% */
  --sage: #...;
  --warm-bg: #...;
  --text: #1A1A1A;
  --text-muted: #6B7280;
  --border: #E5E7EB;
  --white: #FFFFFF;
}
```

### 5.2 Tipografia

Escoge UN par heading + body de Google Fonts coherente con el sector:

| Tono | Heading | Body |
|------|---------|------|
| Profesional/limpio | Plus Jakarta Sans | Inter |
| Editorial/serio | Fraunces | Source Sans 3 |
| Moderno/tech | Sora | DM Sans |
| Cercano/humano | Manrope | Nunito Sans |
| Lujo/premium | Cormorant Garamond | Karla |
| Energico/joven | Bricolage Grotesque | Rubik |
| Salud/calmo | Outfit | Work Sans |

Cargar con `display=swap` y solo los pesos necesarios (400, 500, 700).

### 5.3 Estilo general

Decisiones:
- Border-radius: 8-12px (no 0, no 24px+ excepto pills)
- Espaciado: sistema 8pt (8/16/24/32/48/64/96)
- Sombras: max 2 niveles. Suaves, no marcadas.
- Animaciones: solo hover sutiles (transform, opacity), max 200ms
- Iconos: Font Awesome 6 free (CDN) o SVG inline

### 5.4 Layout

- Container: max-width 1200-1280px, padding 16-24px lateral
- Grid de servicios: 3 columnas desktop, 2 tablet, 1 mobile
- Hero: dos columnas (texto izq + imagen/form der) o columna unica con imagen fondo
- Footer: 4 columnas desktop, 2 tablet, 1 mobile

### 5.5 Estado al final de la fase

Despues de Fase 5 deberias tener:
- styles.css con :root, reset, layout helpers, componentes
- CSS critico inline definido (Fase 11 lo afina)
- Paleta y tipografia coherentes en TODA la web


## FASE 6: Imagenes

### 6.1 REGLA CRITICA: solo caracteres ASCII en nombres de archivo

NUNCA usar n con tilde, acentos ni caracteres especiales en nombres de archivo de imagen.
Equivalentes ASCII: tilde n → n, vocales con acento → vocal sin acento.

Motivo: causan errores 404 en Cloudflare Pages/Nginx/Apache por encoding UTF-8 vs Latin-1.

Antes de terminar la fase, verificar que CERO archivos tienen caracteres no-ASCII.

### 6.2 Buscar imagenes (Pexels / Unsplash, licencia libre)

Para cada hueco de imagen, buscar 3-5 candidatas, comparar visualmente, elegir 1.
Sectores y palabras clave:
- Clinica dental → "modern dental clinic", "dentist patient smile"
- Abogados → "law office modern", "lawyer documents"
- Restaurante → fotografia gastronomica del estilo de cocina + ambiente
- Fontaneria → "plumber working", "modern bathroom"
- Etc.

CRITERIOS:
- Hero: minimo 1600px de ancho, horizontal, alta calidad
- Tarjetas servicio: minimo 800px, vertical o cuadrada
- Blog: minimo 1200px, horizontal
- Optimo profesional, NO stock obvio

### 6.3 Optimizacion

- Convertir TODO a WebP, quality 80-85 (hero/principales) o 75-78 (thumbs)
- Crear DOS versiones de imagenes que aparecen en grids/cards:
  - `[nombre].webp` — full res (~1200-1600px)
  - `[nombre]-thumb.webp` — thumb (~400-600px)
- Usar srcset y sizes en `<img>` para servir el tamano adecuado

### 6.4 Naming

Patron: `[seccion]-[descripcion-corta].webp`
Ej: `hero-clinica-dental-recepcion.webp`, `servicio-implantes-detalle.webp`,
`zona-{slug}-vista-general.webp`, `blog-tendencias-2026.webp`.

Todo minuscula, ASCII, guiones, max 60 caracteres.

### 6.5 Hero — Preload

Anadir en el <head> de index.html:
```html
<link rel="preload" as="image" href="/assets/img/[hero].webp" type="image/webp">
```
Y en el <img>: `fetchpriority="high"` y NO `loading="lazy"`.

### 6.6 Eliminar metadata EXIF

Orden de preferencia:
1. exiftool: `exiftool -all= -overwrite_original -r ./assets/img/`
2. ImageMagick: `find ./assets -type f -name "*.webp" -exec mogrify -strip {} \;`
3. NO usar Pillow para WebP (corrompe archivos).

Si no hay herramientas, informar al usuario y dejar pendiente.

### 6.7 Alt text

- Cada imagen con alt unico, descriptivo, max 125 caracteres
- Incluir {MUNICIPIO} y servicio cuando tenga sentido contextual
- NO empezar con "Imagen de..." o "Foto de..."
- Variar redaccion entre imagenes

### 6.8 Atributos de rendimiento

- `loading="lazy"` en TODAS excepto hero y logo
- `decoding="async"` en TODAS excepto hero
- `width` y `height` explicitos (evitar layout shift)
- Hero: `fetchpriority="high"` + preload en `<head>`

### 6.9 Verificacion de integridad (BLOQUEANTE)

Antes de pasar a Fase 7, verificar:

1. Extraer TODAS las rutas de imagen referenciadas en HTML/CSS/JSON:
   ```
   grep -roh "assets/img/[^\"' )\}]*" *.html servicios/*.html zonas/*.html blog/*.html css/*.css
   ```

2. Listar archivos reales: `ls assets/img/`

3. Comparar: cada referencia DEBE tener archivo. Cero referencias huerfanas.

4. Verificar CERO nombres con caracteres no-ASCII.

NO avanzar a Fase 7 si esta verificacion no pasa al 100%.


## FASE 7: Schema JSON-LD

### 7.1 LocalBusiness (en home, dentro de @graph)

```json
{
  "@type": ["{TIPO_SCHEMA}", "LocalBusiness"],
  "@id": "https://{DOMINIO}/#business",
  "name": "{NOMBRE_EMPRESA}",
  "url": "https://{DOMINIO}/",
  "telephone": "{TELEFONO_TEL}",
  "email": "info@{DOMINIO}",
  "image": "https://{DOMINIO}/assets/img/[hero].webp",
  "logo": "https://{DOMINIO}/assets/img/[logo].webp",
  "description": "[Descripcion unica de 2-3 frases con sector + ciudad + diferenciador]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{CALLE_FORMAL}",
    "postalCode": "{CODIGO_POSTAL}",
    "addressLocality": "{MUNICIPIO}",
    "addressRegion": "{DIVISION_ADMIN}",
    "addressCountry": "{PAIS_CODIGO}"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": {LATITUD},
    "longitude": {LONGITUD}
  },
  "areaServed": [
    {"@type": "City", "name": "{MUNICIPIO}"},
    ...una entry por cada {ZONAS_SERVICIO}
  ],
  "openingHoursSpecification": [
    {"@type": "OpeningHoursSpecification",
     "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
     "opens": "09:00", "closes": "19:00"}
  ],
  "priceRange": "{PAIS_MONEDA_SIMBOLO}-{PAIS_MONEDA_SIMBOLO}-{PAIS_MONEDA_SIMBOLO}",
  "currenciesAccepted": "{PAIS_MONEDA}",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer",
  "hasOfferCatalog": {...lista de servicios...}

  // Si GBP_EXISTE = si, anadir tambien:
  ,"hasMap": "{GBP_URL}"
  ,"identifier": {
    "@type": "PropertyValue",
    "propertyID": "google_place_id",
    "value": "{GBP_PLACE_ID}"
  }
  ,"aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{GBP_RATING}",
    "reviewCount": "{GBP_REVIEW_COUNT}",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

CRITICO:
- `telephone` usa TELEFONO_TEL (formato {PAIS_PREFIJO_TEL}+numero, ej:
  "+525512345678" para MX, "+34930451580" para ES), NO TELEFONO_VISIBLE.
- `streetAddress` usa CALLE_FORMAL (formato largo), NO CALLE_CORTA.
- Si GBP_EXISTE = no: NO incluir hasMap, identifier ni aggregateRating.
  Google penaliza ratings inventados. Estos campos se anaden en Fase 14 cuando
  exista la ficha y tenga al menos 5 resenas reales.
- `image` y `logo` deben apuntar a archivos que EXISTAN (verificar). NO inventar rutas.
- TIPO_SCHEMA en array junto a LocalBusiness para maxima compatibilidad.

### 7.2 Organization

```json
{
  "@type": "Organization",
  "@id": "https://{DOMINIO}/#organization",
  "name": "{NOMBRE_EMPRESA}",
  "url": "https://{DOMINIO}/",
  "logo": "https://{DOMINIO}/assets/img/[logo].webp",
  "sameAs": [
    // Si GBP_EXISTE = si: incluir GBP_URL aqui
    // Anadir tambien Facebook/Instagram/etc. si el usuario los tiene
  ]
}
```

`sameAs`:
- Si GBP_EXISTE = si: incluir GBP_URL como primer elemento
- Si GBP_EXISTE = no: array vacio + comentario `<!-- GBP-PENDING: anadir GBP_URL en sameAs -->`
- NUNCA inventar URLs de redes sociales que no existen.

### 7.3 WebSite

```json
{
  "@type": "WebSite",
  "@id": "https://{DOMINIO}/#website",
  "url": "https://{DOMINIO}/",
  "name": "{NOMBRE_EMPRESA}",
  "publisher": {"@id": "https://{DOMINIO}/#organization"}
}
```

NO anadir SearchAction si la web no tiene buscador interno.

### 7.4 BreadcrumbList

- En paginas interiores: SI (con todos los niveles)
- En home: NO si solo tendria un item ("Inicio")

### 7.5 FAQPage

En home y en cada pagina de servicio que tenga FAQs:
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Pregunta?",
     "acceptedAnswer": {"@type": "Answer", "text": "Respuesta unica."}},
    ...
  ]
}
```

### 7.6 Service Schema (en cada pagina de servicio)

```json
{
  "@type": "Service",
  "@id": "https://{DOMINIO}/servicios/[slug]#service",
  "name": "[Servicio] en {MUNICIPIO}",
  "description": "[1-2 frases unicas]",
  "provider": {"@id": "https://{DOMINIO}/#business"},
  "areaServed": [
    {"@type": "City", "name": "{MUNICIPIO}"},
    // Anadir tambien los BARRIOS_PRINCIPALES como subareas:
    {"@type": "Place", "name": "[BARRIO] ({MUNICIPIO})"},
    // Y las ZONAS_SERVICIO satelite:
    {"@type": "City", "name": "[ZONA_SATELITE]"}
  ],
  "serviceType": "[Tipo de servicio segun sector]"
}
```

`areaServed` ampliado a barrios + zonas refuerza la senal geografica
("hago este servicio EN estos sitios concretos") sin canibalizar URLs.

### 7.7 Article Schema (en cada blog post)

```json
{
  "@type": "Article",
  "headline": "[Titulo]",
  "datePublished": "{FECHA_HOY}",
  "dateModified": "{FECHA_HOY}",
  "author": {"@type": "Organization", "name": "{NOMBRE_EMPRESA}"},
  "publisher": {"@id": "https://{DOMINIO}/#organization"},
  "image": "https://{DOMINIO}/assets/img/[imagen-post].webp"
}
```

### 7.8 AggregateRating — ya integrado en 7.1

(Movido a Fase 7.1 dentro del LocalBusiness. Ver alli para condiciones.)

### 7.9 Review individual — SOLO si GBP_EXISTE = si y tienes resenas reales

Por cada resena que muestres en la seccion 4.4.bis, anadir un Review schema
DENTRO del array `review` de LocalBusiness:

```json
"review": [
  {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "author": {"@type": "Person", "name": "Nombre del cliente"},
    "datePublished": "2024-XX-XX",
    "reviewBody": "Texto literal de la resena de Google (transcrito)."
  },
  ...
]
```

Reglas:
- Solo transcribir resenas REALES de Google. Nada inventado.
- Mostrar solo iniciales o primer nombre + inicial del apellido (proteccion de
  datos: aunque Google las muestra publicas, en tu web evita el apellido completo).
- Maximo 4-6 reviews destacadas (las mejor valoradas y mas descriptivas).
- Estas reviews refuerzan el AggregateRating de 7.1 con datos individuales que
  Google puede mostrar como rich snippets.


## FASE 8: Blog — Anti-canibalizacion CRITICA

### 8.1 Principio: el blog INFORMA, no VENDE

Las paginas comerciales (home, servicios, zonas) atacan keywords transaccionales:
"[servicio] en [ciudad]", "presupuesto [servicio]", "[servicio] cerca de mi".

El blog DEBE atacar keywords INFORMACIONALES, NO repetir las comerciales:
- Preguntas: "?Cuanto cuesta...?", "?Cuanto dura...?", "?Como elegir...?"
- Comparativas: "[Opcion A] vs [Opcion B]: cual elegir"
- Guias: "Guia para...", "Senales de que necesitas..."
- Tendencias: "Tendencias [ano]"
- Tutoriales: "Como mantener...", "Que hacer si..."

NUNCA crear un post titulado "[Servicio] en {MUNICIPIO}" — eso ya es la pagina de servicio.

### 8.2 Estructura

- `/blog/index.html` — hub con titulo, intro corta, lista de posts (cards)
- 3 posts iniciales

### 8.3 Eleccion de los 3 temas

Parte de las keywords informacionales del sector (de Fase 0.3, vengan de
CSV existente, investigacion en vivo o decision previa). Si no hay
suficientes con intencion informacional, filtra las preguntas tipo "People
Also Ask" del sector. Elige 3 que:
- NO compitan con titles de home/servicios/zonas
- Tengan volumen de busqueda (long-tail con intencion clara)
- Aporten valor genuino al lector (no relleno SEO)

Ejemplos por sector:
- Dental: "?Cuanto duran los implantes dentales?", "Ortodoncia invisible vs brackets",
  "Senales de que necesitas una limpieza profesional"
- Abogados: "Como reclamar una clausula suelo", "Diferencia entre divorcio express y contencioso",
  "Pasos para crear una empresa en {DIVISION_ADMIN}"
- Fontaneria: "?Por que se atasca el desague? Causas y soluciones",
  "Calderas de gas vs calderas de condensacion: comparativa", "Como purgar radiadores paso a paso"

### 8.4 Estructura de cada post

- ~700-900 palabras
- H1 (titulo del post)
- Intro: gancho + que va a aprender el lector
- 4-6 H2 con secciones claras
- H3 dentro si aplica
- Listas, tablas si aporta
- Imagen destacada + 1-2 imagenes en el cuerpo
- CTA suave al final ("?Tienes dudas? Contactanos") — NO agresivo
- Schema Article + BreadcrumbList

### 8.5 Integracion

- "Blog" en nav principal de TODAS las paginas
- Seccion "Blog" en footer con enlaces a los 3 posts
- Hub /blog/ en sitemap.xml (priority 0.7)
- Posts en sitemap.xml (priority 0.6)
- Cada post enlaza a 1-2 servicios relevantes (anchor descriptivo)


## FASE 9: Anti-canibalizacion (regla critica)

### 9.1 NO crear pagina de zona para el municipio principal

NUNCA crear `/zonas/{slug-sector}-{slug-municipio-principal}.html`.
Esto canibalizaria la HOME, que es la pagina del municipio principal.

### 9.2 Contenido hiper-local va en la HOME

Datos del municipio principal (barrios, contexto, ayuntamiento) → en la home,
no en una pagina de zona separada:
- En las FAQs de la home
- En la seccion "Sobre nosotros" o "Por que elegirnos"
- En testimonios (mencionar barrios reales del municipio)

### 9.3 Footer y zonas

- Link "Servicio en {MUNICIPIO}" del footer → href="/" (la HOME)
- Hub /zonas/ solo lista zonas SATELITE, NO el municipio principal
- Paginas de zona solo se crean para municipios DIFERENTES al principal

### 9.4 Blog vs servicios

- Blog post NO debe tener title con la formula "[Servicio] en {MUNICIPIO}"
  (eso lo cubre la pagina de servicio)
- Si un post necesita mencionar la ciudad, hacerlo en parrafos, no en title/H1


## FASE 10: Formularios + consentimiento de privacidad

La ley de proteccion de datos aplicable es {PAIS_LEY_PROTECCION_DATOS}
(ej: MX → LFPDPPP; ES → RGPD/LOPDGDD). La pagina de politica de
privacidad y el checkbox deben citarla por su nombre correcto.

Cada formulario (hero, contacto) debe incluir:

```html
<label class="form-check">
  <input type="checkbox" required>
  <span>He leido y acepto la <a href="/politica-privacidad" target="_blank" rel="noopener">Politica de Privacidad</a> *</span>
</label>
```

Validacion cliente en main.js:
- Required fields no vacios
- Email con formato valido
- Telefono solo numeros + min 9 digitos
- Checkbox marcado

Sin backend en esta fase. El formulario puede:
- Apuntar a un endpoint de Cloudflare Workers (Fase 13)
- Usar Formspree/Web3Forms (servicio externo gratuito)
- Solo abrir mailto: como fallback inicial

Decision por defecto: usar Web3Forms (gratis, no requiere cuenta para empezar).
Configurar la action y access_key en main.js.


## FASE 11: CSS critico inline

En el `<head>` de index.html (la home es la mas critica para LCP):

```html
<style>
  /* CSS critico — solo lo above-the-fold */
  :root { /* custom properties — copia de styles.css */ }

  /* Reset minimo */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ...; }

  /* Topbar y header */
  .topbar { ... }
  header { ... }
  nav { ... }

  /* Hero */
  .hero { ... }
  .hero-badge { ... }
  .hero h1 { ... }
  .hero h1 span { color: var(--accent); }
  .hero-services { ... }
  .hero-subtitle { ... }
  .hero-ctas { ... }
  .btn-primary { ... }

  /* Mobile breakpoint para above-the-fold */
  @media (max-width: 768px) { ... }
</style>
```

Copia los estilos a paginas interiores SOLO los necesarios para su above-the-fold.
NO duplicar TODO el CSS inline en cada pagina (perderias el cache).

Verifica que CSS critico inline + styles.css NO se contradicen (mismas variables, mismas fuentes).


## FASE 12: Verificacion final (BLOQUEANTE antes de Fase 13)

### 12.1 Validacion de meta tags

En CADA pagina HTML:
- `<title>`: 30-60 chars, unico, sin placeholders
- `<meta description>`: 120-160 chars (indexables) / 100+ (noindex)
- `meta description == og:description == twitter:description`
- NO `<meta name="keywords">`
- 7 OG tags completos
- 4 Twitter Card tags completos
- canonical apunta a `https://{DOMINIO}/[ruta]`
- hreflang: SOLO el del pais ({PAIS_LOCALE con guion}) + `x-default`

### 12.2 Headings

- 1 H1 unico por pagina
- H1 ≠ title (especialmente en servicios)
- Sin saltos de nivel
- H2 no repetidos en la misma pagina

### 12.3 HTML semantico

- TODAS las paginas con `<main>` envolviendo el contenido
- TODAS con `<header role="banner">`, `<nav>`, `<footer role="contentinfo">`
- Inputs con label asociado o aria-label

### 12.4 Schema

- LocalBusiness, Organization, WebSite en home
- BreadcrumbList NO en home (si solo tiene 1 item)
- BreadcrumbList SI en interiores
- Service schema en cada `/servicios/`
- Article schema en cada `/blog/[post]`
- `image` y `logo` apuntan a archivos que EXISTEN
- `areaServed` con todas las zonas
- `sameAs` sin URLs inventadas

### 12.5 Imagenes

- CERO archivos con caracteres no-ASCII
- TODAS las referencias HTML/CSS/JSON apuntan a archivos existentes
- Alt text unicos y descriptivos
- `loading="lazy"` + `width`/`height` en todas (excepto hero/logo)
- Hero: `fetchpriority="high"` + preload en `<head>`

### 12.6 Archivos tecnicos

- `sitemap.xml`: TODAS las paginas indexables, fechas de hoy, CERO paginas noindex
- `robots.txt`: Sitemap correcto, bloqueo de crawlers solo-training si quieres
  (CCBot, anthropic-ai, Google-Extended, Bytespider). NO bloquear GPTBot/ChatGPT-User
  (ChatGPT Search) ni FacebookBot (previews).
- `site.webmanifest`: name, short_name, theme_color actualizados
- `favicon.svg`: con la inicial/iniciales correctas y color accent
- `404.html`: noindex, mensaje amable

### 12.7 NAP canonico (Name, Address, Phone) — CRITICO

NAP identico en TODA la web. Ejecutar greps de verificacion:

**Telefono visible** (TELEFONO_VISIBLE, formato del pais — ej MX "55 1234 5678", ES "930 451 580"):
- Aparece literal en topbar, footer, contacto, hero (si aplica)
- Hacer grep del numero en TODOS los formatos posibles (adaptar patron al pais):
  ```
  # Ejemplo para ES (9 digitos, patron 3-2-2-2):
  grep -roE "9[0-9]{2}[ .-]?[0-9]{2}[ .-]?[0-9]{2}[ .-]?[0-9]{2}" *.html
  # Para MX (10 digitos) ajustar el patron a la agrupacion usada (2-4-4 o 3-3-4)
  ```
- TODOS los matches deben ser EL MISMO formato (TELEFONO_VISIBLE)
- CERO variantes del patron elegido

**Telefono tel:/schema** (TELEFONO_TEL, ej "+525512345678" MX, "+34930451580" ES):
- Aparece literal en `href="tel:..."` y en `"telephone"` del schema
- TODOS los `tel:` apuntan a TELEFONO_TEL (con {PAIS_PREFIJO_TEL}, sin espacios)

**Direccion visible** (DIRECCION_VISIBLE):
- Identica en topbar, footer, contacto, hero
- CERO variantes de la calle ("C/" vs "Calle", "08241" vs "08241 Manresa")

**Direccion schema** (DIRECCION_SCHEMA):
- streetAddress = CALLE_FORMAL en TODOS los JSON-LD
- addressLocality = MUNICIPIO sin variaciones

Estos formatos DEBEN ser identicos a los que se usaran en GBP (Fase 14) y
citations (Fase 15). Cualquier divergencia rompe NAP consistency.

### 12.7.bis Verificacion GBP (si GBP_EXISTE = si)

- AggregateRating presente en LocalBusiness con GBP_RATING y GBP_REVIEW_COUNT
- hasMap presente con GBP_URL
- identifier con GBP_PLACE_ID
- sameAs incluye GBP_URL como primer elemento
- Embed de Maps en contacto usa place_id o el embed oficial de la ficha
- Boton "Dejanos una resena" presente con GBP_WRITE_REVIEW_URL
- Seccion 4.4.bis presente con resenas reales transcritas + Review schema
- NOMBRE_EMPRESA en la web coincide EXACTO con GBP_NOMBRE

### 12.7.ter Verificacion modo pre-GBP (si GBP_EXISTE = no)

- NO hay AggregateRating en schema (Google penaliza ratings inventados)
- NO hay hasMap ni identifier en schema
- sameAs es array vacio
- Embed de Maps usa coordenadas (lat/lng), no place_id
- NO hay seccion de resenas reales en home
- Marcadores `<!-- GBP-PENDING: ... -->` presentes en:
  - Home (donde iria seccion resenas)
  - Footer (donde iria boton write-review)
  - Contacto (boton write-review + cambio de embed)
  - Schema JSON-LD (sameAs, hasMap, identifier, aggregateRating)
- Verificar con: `grep -rn "GBP-PENDING" .`
  Estos marcadores se sustituyen en Fase 14 cuando se cree la ficha.

### 12.8 WhatsApp (si aplica)

Si {WHATSAPP_NUMERO} existe, todos los `wa.me/` apuntan a ese numero. CERO placeholders.
Si NO existe, CERO botones de WhatsApp en la web.

### 12.9 Anti-canibalizacion

- NO existe `/zonas/[slug-municipio-principal]`
- Footer "Servicio en {MUNICIPIO}" → href="/"
- Hub `/zonas/` solo zonas SATELITE
- Blog NO tiene posts con title "[Servicio] en {MUNICIPIO}"

### 12.10 Calidad del copy

Comprueba que el copy NO suena a IA:
- NO frases genericas ("ofrecemos los mejores servicios", "calidad y profesionalidad")
- NO listas vacias ("excelencia, compromiso, dedicacion")
- SI datos concretos (anos, marcas, materiales, plazos, precios orientativos)
- SI terminologia del sector
- SI menciones a barrios y datos locales

### 12.11 Performance basico

- Total CSS inline + styles.css < 50KB
- Imagenes WebP, hero < 200KB, otras < 100KB
- No CSS/JS de terceros excepto Google Fonts y Font Awesome (CDN)
- Probar la home en mobile (DevTools throttling Slow 4G): LCP < 2.5s

### 12.12 Funcionalidad JS

- Menu hamburguesa abre/cierra en mobile
- Acordeon FAQ funciona (toggle, solo uno abierto)
- Formulario valida campos
- Smooth scroll a anchors


## FASE 13: Despliegue — GitHub + Cloudflare Pages + Email Routing

### 13.1 Credenciales

Las credenciales estan en un archivo local (NO incluir en commits ni en el prompt).
Ruta por defecto: `./.cloudflare-credentials` (raiz del proyecto). Si el usuario
usa otra ubicacion, leer la que indique.

```
Contiene: CF_EMAIL, CF_API_KEY, CF_ACCOUNT_ID, GITHUB_USER, GITHUB_TOKEN
```

Orden de busqueda:
1. Ruta indicada por el usuario (si la da).
2. `./.cloudflare-credentials` en la raiz del proyecto.
3. Directorio padre o carpeta compartida de credenciales.

Lee este archivo al inicio de la fase. Si no existe en ninguna de las rutas
buscadas, pedirle al usuario la ruta antes de continuar.

### 13.2 Init Git + GitHub

1. `git init`
2. Crear `.gitignore`:
   ```
   .cloudflare-credentials
   .env
   .DS_Store
   Thumbs.db
   /node_modules/
   /_backup/
   ```
3. `git add .` + commit inicial
4. Crear repo en GitHub con la API:
   - Repo privado o publico (preguntar al usuario)
   - Nombre: derivar del dominio
5. `git remote add origin ...` + `git push -u origin main`

### 13.3 Cloudflare Pages

1. Conectar el repo de GitHub a Cloudflare Pages via API
2. Configurar build:
   - Build command: (vacio, es estatico)
   - Build output directory: `/`
3. Esperar primer deploy
4. Verificar que la web carga en `[proyecto].pages.dev`

### 13.4 DNS — Dominio custom

1. Anadir el dominio custom en CF Pages
2. Si el dominio esta en Cloudflare, los DNS records se anaden automaticamente
3. Si no, dar al usuario los registros (CNAME) para que los anada en su registrador
4. Verificar que `https://{DOMINIO}/` responde y redirige bien

### 13.5 Cloudflare Email Routing

1. En el panel de Cloudflare > el dominio > Email > Email Routing
2. Activar Email Routing (anade automaticamente registros MX y TXT en el DNS)
3. Crear ruta:
   - From: `info@{DOMINIO}`
   - Action: Send to → email personal del usuario (preguntar cual)
4. Verificar el email destino (Cloudflare envia un email de confirmacion)
5. Probar enviando un email a `info@{DOMINIO}` y comprobando que llega

NOTA: Cloudflare Email Routing solo PERMITE RECIBIR. Para ENVIAR desde
`info@{DOMINIO}` se necesita un servicio externo (MailerSend, Resend, etc.).
De momento, recibir es suficiente; el formulario web envia via Web3Forms.

### 13.6 Comprobaciones post-deploy

- [ ] `https://{DOMINIO}/` carga correctamente
- [ ] `https://{DOMINIO}/sitemap.xml` accesible
- [ ] `https://{DOMINIO}/robots.txt` accesible
- [ ] Todas las paginas responden 200 (probar 5-10 al azar)
- [ ] 404.html responde para rutas inexistentes
- [ ] Imagenes cargan (no 404)
- [ ] Email a `info@{DOMINIO}` llega al inbox del usuario
- [ ] Formulario web envia (probar uno real)
- [ ] Mobile: menu hamburguesa, formulario, FAQs funcionan
- [ ] Lighthouse mobile: Performance > 80, SEO > 95, Accesibilidad > 90

### 13.7 Pasos posteriores (guiados por el modelo en Fases 14 y 15)

Cuando la web este desplegada y operativa, continuar con:

- **Fase 14 — GBP Strategy:** crear (o auditar) la ficha de Google Business
  Profile y, si se ha creado nueva, actualizar la web sustituyendo todos los
  marcadores `<!-- GBP-PENDING: ... -->` con datos reales.
- **Fase 15 — NAP Citations:** dar de alta el negocio en directorios
  fundamentales, sectoriales y locales con NAP canonico identico al de la web.

Pasos rapidos comunes (informarle al usuario, ejecutables en cualquier momento):
- Anadir dominio en Google Search Console + enviar sitemap.xml
- Anadir dominio en Bing Webmaster Tools + enviar sitemap.xml
- Crear cuentas de redes sociales (si quiere) y actualizar `sameAs` en schema


## FASE 14: GBP Strategy — el factor #1 de Local Pack ranking

Esta fase se ejecuta DESPUES del despliegue (Fase 13). Tiene dos modos segun
GBP_EXISTE:

### MODO A — GBP_EXISTE = no: crear la ficha desde cero

#### 14.A.1 Pre-requisitos
- Cuenta Google del negocio (NO la personal del usuario, salvo que sea autonomo
  unipersonal). Si hay que crearla, hacerlo con email del dominio (info@{DOMINIO})
  → otra senal de coherencia.
- Telefono operativo: TELEFONO_VISIBLE / TELEFONO_TEL (Google llamara para verificar
  en algunos casos).
- Acceso fisico al local en {DIRECCION_COMPLETA}: Google puede pedir verificacion
  por video en directo o por postal (5-14 dias).

#### 14.A.2 Crear la ficha
Ir a https://business.google.com/create

Datos que rellenar (obligatorio que coincidan EXACTO con la web):
- **Nombre del negocio:** NOMBRE_EMPRESA EXACTO. NO meter keywords del tipo
  "Reformas Manresa - Mejor Empresa de Reformas Bages". Solo el nombre real.
  Google lo penaliza con suspension de la ficha.
- **Categoria primaria:** la mas especifica posible (de TIPO_SCHEMA — Fase 0.3).
  Es el factor de RELEVANCIA mas importante.
- **Categorias secundarias:** hasta 9. Anadir TODAS las que apliquen al sector.
  Investigar cuales usan los competidores top de tu zona.
- **Direccion:** DIRECCION_VISIBLE EXACTA. Si la calle se llama oficialmente
  "Carrer de Canyelles" en Catalunya, usar ese nombre, no "Calle de Canyelles".
- **Area de servicio:** anadir MUNICIPIO + ZONAS_SERVICIO + algunos BARRIOS_PRINCIPALES.
- **Telefono:** TELEFONO_VISIBLE (Google lo formatea).
- **Web:** https://{DOMINIO}
- **Horario:** mismo que en pagina contacto, dia a dia. Anadir horarios especiales
  de festivos.

#### 14.A.3 Verificar la ficha
Seguir el metodo que Google ofrezca (postal, video, llamada, email). Sin verificar
no apareces en Local Pack.

#### 14.A.4 Optimizar la ficha (despues de verificar)
- **Descripcion:** 750 chars. Mencionar SECTOR + servicios + MUNICIPIO + COMARCA +
  diferenciador. Sin keyword stuffing. Tono natural.
- **Logo:** PNG cuadrado, minimo 720x720
- **Foto de portada:** 1080x608 px minimo, fachada o interior representativo
- **Galeria de fotos:** minimo 10 fotos. Tipos:
  - Exterior (fachada desde calle)
  - Interior (recepcion, sala principal)
  - Equipo (fotos del personal trabajando)
  - Servicio/producto (resultados de trabajos, platos, productos)
  - Identidad (logo, materiales)
- **Video** (opcional): max 30 segundos, mostrando local o servicio
- **Servicios/productos:** listar TODOS los SERVICIOS_PRINCIPALES con descripcion
  + precio (si aplica). Coincidir con las paginas /servicios/.
- **Atributos:** los que apliquen ("Aparcamiento gratuito", "Acceso silla de
  ruedas", "WiFi gratis", "Pago con tarjeta", etc.)
- **Mensajes (Messaging):** activar SOLO si alguien va a responder en <12h.
- **Q&A:** sembrar 5-10 preguntas frecuentes con sus respuestas. Tu mismo (con
  otra cuenta personal) puedes preguntar y luego responder como negocio. Las
  preguntas DEBEN ser las mismas o parecidas que las FAQs de la web.

#### 14.A.5 Google Posts — calendario inicial
Programar al menos 4 posts iniciales con tipos variados:
- "Novedad" — algo del negocio (nueva linea de servicios, persona del equipo)
- "Oferta" (si aplica) — promocion temporal con CTA
- "Evento" (si aplica) — jornada de puertas abiertas, charla
- "Producto/servicio" — descripcion de un servicio destacado

Calendario recurrente: 1 post nuevo por semana minimo (los posts caducan a los 7 dias en visibilidad).

#### 14.A.6 Capturar Place ID y URL
Una vez creada y verificada:
- Sacar GBP_URL del enlace "Compartir" de la ficha
- Extraer GBP_PLACE_ID (ver Fase 0.4)
- Construir GBP_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid={GBP_PLACE_ID}`

#### 14.A.7 ACTUALIZAR LA WEB con los datos de GBP
Buscar TODOS los marcadores en el codigo: `grep -rn "GBP-PENDING" .`

Sustituir cada uno:
- Schema LocalBusiness: anadir `hasMap`, `identifier`, (opcional `aggregateRating`
  cuando haya 5+ resenas), array `review` cuando se transcriban resenas reales
- `sameAs` en Organization: anadir GBP_URL
- Embed de Maps en contacto: cambiar de coordenadas a place_id (4.8 Variante A)
- Anadir seccion 4.4.bis en home (resenas + boton write-review)
- Anadir boton "Dejanos una resena" en footer y contacto

Verificar que CERO `GBP-PENDING` quedan en el codigo: `grep -rn "GBP-PENDING" .`
debe devolver vacio.

Commit + push: la web esta ahora plenamente sincronizada con GBP.

### MODO B — GBP_EXISTE = si: auditar y optimizar

#### 14.B.1 Auditoria de completeness
Pasar checklist:
- [ ] Nombre EXACTO sin keyword stuffing (NOMBRE_EMPRESA = GBP_NOMBRE)
- [ ] Categoria primaria correcta y especifica
- [ ] Categorias secundarias: hasta 9 relevantes
- [ ] NAP coincide EXACTO con la web (DIRECCION_VISIBLE, TELEFONO_VISIBLE)
- [ ] Web apunta a https://{DOMINIO} (sin /www, sin barra final salvo si tu canonical la lleva)
- [ ] Horario al dia
- [ ] Descripcion 750 chars optimizada
- [ ] Minimo 10 fotos, actualizadas en los ultimos 3 meses
- [ ] Servicios/productos listados con descripciones
- [ ] Q&A monitorizado
- [ ] Atributos relevantes activados
- [ ] Posts publicados al menos cada 2 semanas

Para cada item NO marcado, listar accion concreta.

#### 14.B.2 Auditoria de resenas
- Cantidad: numero total
- Velocidad: resenas en los ultimos 3 meses (objetivo: 2-5/mes constante)
- Rating medio: si <4.3, accion correctiva (mejorar servicio, responder)
- % respondidas: deberia ser 100%
- Resenas negativas sin responder: prioridad alta

### 14.C Sistema de captacion de resenas (ambos modos)

Una vez la ficha existe y esta operativa:

#### 14.C.1 Link de write-review
Tener GBP_WRITE_REVIEW_URL siempre a mano:
`https://search.google.com/local/writereview?placeid={GBP_PLACE_ID}`

Este link DEBE estar:
- En la web (boton en home, contacto, footer)
- En la firma de email del negocio
- En tarjetas de visita (QR)
- En tickets/facturas (QR)
- En WhatsApp Business (mensaje automatico tras servicio)
- En Instagram bio

#### 14.C.2 Generar QR para imprimir
Usar https://qr.io o similar con GBP_WRITE_REVIEW_URL. Imprimir y poner:
- En recepcion / mostrador
- En la factura (QR + texto "?Que tal te hemos atendido? Dejanos tu opinion")
- En el coche/furgoneta de empresa (si aplica al sector)

#### 14.C.3 Email/SMS post-servicio (template)
Pedir al usuario que envie tras cada servicio:
```
Hola [NOMBRE],

Gracias por confiar en {NOMBRE_EMPRESA}. Esperamos que [servicio prestado] haya
ido genial.

Si has quedado satisfecho/a, nos ayudaria mucho que dejaras tu opinion en Google:
{GBP_WRITE_REVIEW_URL}

Te lleva 30 segundos y nos ayuda muchisimo a seguir creciendo.

Cualquier cosa, aqui estamos.
```

#### 14.C.4 Responder TODAS las resenas
- **Positivas** (24-72h): personalizadas, mencionar algo concreto que dijeron
- **Neutras** (24h): agradecer + preguntar como mejorar
- **Negativas** (12-24h): reconocer especifico + mover offline + sin defenderse
  publicamente. Nunca borrar resenas (no se puede). Si es falsa, reportar a
  Google y responder factual.

Templates en el skill rank-local del repositorio de la herramienta.

#### 14.C.5 Velocidad sana
- Objetivo: 2-5 resenas/mes constantes
- EVITAR picos de 20 resenas en 1 semana → senal artificial
- EVITAR meses con 0 resenas → senal de inactividad

---

## FASE 15: NAP Citations — directorios por pais

Las citations son menciones del NAP en directorios externos. Refuerzan PROMINENCIA
(uno de los 3 factores de Local Pack ranking). Calidad > cantidad: 30 citations
buenas baten a 200 malas.

Esta fase esta estructurada en 4 capas: internacionales (15.2, validas en
cualquier pais), sectoriales globales (15.3), locales por pais (15.4, tablas
para MX y ES; resto del mundo investigable) y refuerzo geografico (15.5).

### 15.1 NAP exacto (tomar de Fase 0.6)
Antes de empezar, copia y mantiene a mano:
- Nombre: NOMBRE_EMPRESA (EXACTO, igual que en GBP)
- Direccion visible: DIRECCION_VISIBLE
- Telefono visible: TELEFONO_VISIBLE
- Web: https://{DOMINIO}/
- Email: info@{DOMINIO}
- Categoria/sector descriptivo: SECTOR
- Descripcion corta: una frase de 150 chars
- Descripcion larga: 500-750 chars
- Horario: mismo que GBP
- Logo + 5-10 fotos representativas

USAR ESTOS DATOS LITERALES en TODOS los directorios. Ni una coma diferente.

### 15.2 Citations fundamentales INTERNACIONALES (PRIORIDAD 1) — 1 semana

Validas en cualquier pais. Dar de alta estas SIEMPRE, sin importar PAIS:

| # | Directorio | URL | Notas |
|---|-----------|-----|-------|
| 1 | Google Business Profile | business.google.com | (Fase 14) |
| 2 | Apple Business Connect | businessconnect.apple.com | Fundamental para Apple Maps/Siri |
| 3 | Bing Places | www.bingplaces.com | Importante para ChatGPT Search y Bing |
| 4 | Facebook Business Page | facebook.com/business | Aunque no se use activamente |
| 5 | Instagram | instagram.com | Cuenta Business con info NAP en bio |
| 6 | Foursquare / City Guide | foursquare.com | Alimenta a varios servicios |
| 7 | Yelp | yelp.com (sucursal del pais) | Si aplica al sector |
| 8 | WhatsApp Business | whatsapp.com/business | Si hay WHATSAPP_NUMERO |

### 15.3 Citations sectoriales GLOBALES (PRIORIDAD 2) — segun SECTOR

Directorios internacionales con presencia multi-pais. Verificar cobertura en
PAIS antes de dar de alta; si no operan en el pais, buscar equivalente local.

| Sector | Directorios globales |
|--------|---------------------|
| Sanidad/clinicas | Doctoralia, TopDoctors |
| Belleza/peluqueria | Booksy, Treatwell (donde operen) |
| Restauracion | TripAdvisor, TheFork/ElTenedor, OpenTable |
| Hosteleria/turismo | Booking, TripAdvisor |
| Servicios hogar | Houzz, Fixly (donde operen) |
| Reformas/construccion | Houzz, equivalentes locales (ver 15.4) |
| Inmobiliarias | Idealista (ES), Mercado Libre Inmuebles (MX/LatAm) |
| Automotriz | equivalentes locales por pais |
| Veterinarios | equivalentes locales |
| Educacion | Emagister |
| Gimnasios | Mindbody, ClassPass (donde operen) |

NOTA: muchas de estas marcas no operan en todos los paises. Por cada una,
verificar y, si no aplica, buscar el directorio local equivalente.

### 15.4 Citaciones LOCALES por pais (PRIORIDAD 2 complementaria)

Tablas por PAIS. Cobertura confirmada: MX y ES. Otros paises: investigar los
directorios de referencia del territorio y documentarlos.

**MX — Mexico:**

| Directorio | URL | Notas |
|-----------|-----|-------|
| Seccion Amarilla | seccionamarilla.com | Directorio historico de Mexico |
| Guia MX | guiamexico.com | Directorio de empresas |
| Mercado Libre | mercado libre.com.mx | Vendedores con perfil empresa |
| Canaco / Coparmex | canaco.mx, coparmex.org.mx | Si el negocio es comercio |
| Camara de Comercio | (camara local del estado) |Registro de empresas |
| CIDI / registro estatal | (segun estado) | Padron estatal de contribuyentes |
| Google Maps reviews | maps.google.com | (via GBP, Fase 14) |

**ES — Espana:**

| Directorio | URL | Notas |
|-----------|-----|-------|
| Paginas Amarillas | paginasamarillas.es | Directorio de referencia en ES |
| QDQ | qdq.com | Directorio espanol historico |
| Habitissimo | habitissimo.es | Servicios del hogar y reformas |
| Cronoshare | cronoshare.com | Servicios del hogar y reformas |
| Camara de Comercio | camara.es (camara provincial) | Si aplica |
| Directorios autonómicos | empresas-{provincia}.es | Refuerzo provincial |

**Otros paises (AR, CO, CL, PE, US...):**
- Investigar 3-5 directorios de referencia del territorio.
- Buscar el equivalente local de "paginas amarillas" + camara de comercio.
- Documentar los hallazgos en `citations.md` (Fase 15.6) para trazabilidad.

### 15.5 Citaciones locales de refuerzo geografico (PRIORIDAD 3)

Independientes del pais — son sobre geografia, no directorios:

- Camara de Comercio / registro mercantil de {DIVISION_ADMIN}
- Ayuntamiento / gobierno municipal de {MUNICIPIO} — directorio de empresas
  locales (consultar web oficial del municipio)
- Asociacion de comerciantes de {MUNICIPIO} (si existe)
- Diario local / periodico comarcal — articulo o ficha de empresa
- Eventos locales / patrocinios (paginas con NAP del patrocinador)

### 15.5 Backlinks locales (bonus)

- Colaboraciones con asociaciones locales
- Patrocinio de equipos deportivos/eventos comunitarios → backlink desde sus webs
- Articulos de prensa local
- Casos de estudio en publicaciones del sector
- Si hay blog: guest posts en blogs locales o sectoriales (con backlink)

### 15.6 Tracking de citations

Crear un archivo `citations.md` en la raiz del proyecto (sin commitear):
```
| Directorio | URL del perfil | Estado | Fecha alta | Notas |
|-----------|----------------|--------|------------|-------|
| GBP       | maps.app.goo.gl/...| Activo | 2026-XX-XX | Verificado |
| Apple     | ...            | Activo | ...       | |
| ...       | ...            | Pendiente | -      | |
```

Mantenerlo actualizado. Si en el futuro la empresa cambia de telefono o
direccion, este archivo te dice DONDE tienes que actualizar el NAP.

### 15.7 Verificacion final NAP global

Despues de dar de alta minimo 10 citations, hacer estas busquedas en Google:
- `"{NOMBRE_EMPRESA}" "{MUNICIPIO}"`
- `"{TELEFONO_VISIBLE}"`
- `"{DIRECCION_VISIBLE}"`

Revisar TODOS los resultados de las primeras 3 paginas. Si hay alguna ficha con
datos diferentes (calle mal escrita, telefono diferente, nombre con variantes),
solicitar correccion al directorio.

---

## RESUMEN PARA TI (MODELO)

Trabaja por fases en orden. NO saltes la verificacion final. NO subas a Cloudflare
sin pasar la Fase 12. Antes de empezar fases con mucho impacto (Fase 1, Fase 5,
Fase 13, Fase 14), espera OK del usuario.

Fases 14 y 15 son post-deploy y se hacen en sesiones separadas. La Fase 14 es
critica si GBP_EXISTE = no — sin ficha verificada NO hay Local Pack.

Actualiza un TODO con el progreso. Reporta cambios significativos en chat con
una linea, no parrafos. Los detalles van en los archivos.
