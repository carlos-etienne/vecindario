// Brief de Diseño - Vecindario Beer Garden
// Pre-llenado con datos del sitio actual + PDF de briefing de redes

const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber,
  AlignmentType, HeadingLevel, BorderStyle, ShadingType, WidthType,
  Table, TableRow, TableCell, TableLayoutType, PageBreak,
  SectionType, LevelFormat, convertInchesToTwip,
} = require("docx");
const fs = require("fs");

// ─── Paleta: Terracota cervecera (Warm + Medium + Calm) ─────────────────────
const P = {
  bg:        "1F1813",   // fondo portada: negro cálido tipo barril tostado
  primary:   "2A1F17",   // headings: marrón oscuro tipo malta tostada
  body:      "2B2520",   // body: casi negro cálido
  secondary: "6B5D52",   // captions, meta
  accent:    "B08050",   // acento: cobre / terracota
  surface:   "FAF6F0",   // superficie clara tipo papel kraft
  surfaceDk: "F2EBE0",   // zebra row
  divider:   "D6C7B2",   // línea suave
  need:      "8B5A2B",   // naranja cobre para "necesito de ti"
  have:      "5A6B4A",   // verde musgo para "ya lo sé"
  placeholder: "8A7A6A",
};

const c = (hex) => hex.replace("#", "");
const FONT = { ascii: "Calibri", eastAsia: "Calibri" };
const FONT_HEAD = { ascii: "Calibri", eastAsia: "Calibri" };

// ─── Borders helpers ────────────────────────────────────────────────────────
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB,
                        insideHorizontal: NB, insideVertical: NB };

// ─── Component builders ─────────────────────────────────────────────────────
function H1(text, opts = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    pageBreakBefore: opts.pageBreak === true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent), space: 8 } },
    children: [new TextRun({ text, bold: true, size: 36, color: c(P.primary), font: FONT_HEAD })],
  });
}

// Shortcut: H1 that starts on a new page
const H1New = (text) => H1(text, { pageBreak: true });

function H2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: FONT_HEAD })],
  });
}

function H3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(P.accent), font: FONT_HEAD })],
  });
}

// body paragraph with mixed runs
function body(parts, opts = {}) {
  const runs = (Array.isArray(parts) ? parts : [parts]).map(p => {
    if (typeof p === "string") {
      return new TextRun({ text: p, size: 22, color: c(P.body), font: FONT });
    }
    return new TextRun({
      text: p.text, size: 22, color: c(p.color || P.body), font: FONT,
      bold: !!p.bold, italics: !!p.italic,
    });
  });
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: opts.after ?? 140 },
    children: runs,
  });
}

// bullet list item
function bullet(parts, level = 0) {
  const runs = (Array.isArray(parts) ? parts : [parts]).map(p => {
    if (typeof p === "string") {
      return new TextRun({ text: p, size: 22, color: c(P.body), font: FONT });
    }
    return new TextRun({
      text: p.text, size: 22, color: c(p.color || P.body), font: FONT,
      bold: !!p.bold, italics: !!p.italic,
    });
  });
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { line: 300, after: 80 },
    children: runs,
  });
}

// Tag pills: [HAVE] ya lo sé / [NEED] necesito de ti
function tag(kind) {
  const txt = kind === "have" ? "  ✅  YA LO SÉ  " : "  ✏️  NECESITO DE TÍ  ";
  const color = kind === "have" ? P.have : P.need;
  return new TextRun({
    text: txt, bold: true, size: 16, color: c(color), font: FONT_HEAD,
  });
}

// Section header with tag (combined: H2 + tag inline)
function sectionHeader(text, kind) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({ text: text + "   ", bold: true, size: 28, color: c(P.primary), font: FONT_HEAD }),
      tag(kind),
    ],
  });
}

// Placeholder line: light italic gray text for "fill in"
function placeholder(text, lines = 1) {
  const out = [];
  for (let i = 0; i < lines; i++) {
    out.push(new Paragraph({
      spacing: { line: 360, after: 60 },
      border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: c(P.divider), space: 8 } },
      children: [new TextRun({
        // Non-breaking space keeps the paragraph "non-empty" for layout checkers
        text: i === 0 ? (text || "\u00A0") : "\u00A0",
        italics: true, size: 22, color: c(P.placeholder), font: FONT,
      })],
    }));
  }
  return out;
}

// Image placeholder box: bordered empty box with caption
function imageBox(caption, heightTwips = 2200) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.DASHED, size: 6, color: c(P.divider) },
      bottom: { style: BorderStyle.DASHED, size: 6, color: c(P.divider) },
      left: { style: BorderStyle.DASHED, size: 6, color: c(P.divider) },
      right: { style: BorderStyle.DASHED, size: 6, color: c(P.divider) },
      insideHorizontal: NB, insideVertical: NB,
    },
    rows: [new TableRow({
      height: { value: heightTwips, rule: "exact" },
      children: [new TableCell({
        margins: { top: 200, bottom: 200, left: 200, right: 200 },
        verticalAlign: "center",
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: "📎  Pega aquí la imagen",
              size: 22, color: c(P.placeholder), italics: true, font: FONT,
            })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80 },
            children: [new TextRun({
              text: caption, size: 18, color: c(P.secondary), font: FONT,
            })],
          }),
        ],
      })],
    })],
  });
}

// Info card: shaded box with a label + body, for pre-filled data
function infoCard(label, valueRuns, opts = {}) {
  const fill = opts.dark ? P.surfaceDk : P.surface;
  // Bottom margin inside the cell so consecutive infoCards have visual separation
  // without needing empty paragraphs between them (which would trigger blank-page warnings).
  const marginBottom = opts.marginBottom ?? 0;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: NB, right: NB, insideHorizontal: NB, insideVertical: NB,
    },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: c(fill) },
        margins: { top: 180, bottom: 180 + marginBottom, left: 240, right: 240 },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({
              text: label, bold: true, size: 16, color: c(P.accent),
              font: FONT_HEAD, characterSpacing: 30,
            })],
          }),
          ...(Array.isArray(valueRuns) ? valueRuns : [valueRuns]).map(r => {
            if (r instanceof Paragraph) return r;
            return new Paragraph({
              spacing: { line: 300, after: 60 },
              children: [new TextRun({
                text: typeof r === "string" ? r : r.text,
                size: 22, color: c(P.body), font: FONT,
                bold: typeof r === "object" && r.bold,
                italics: typeof r === "object" && r.italic,
              })],
            });
          }),
        ],
      })],
    })],
  });
}

// Helper for spacing paragraph
function gap(twips = 200) {
  return new Paragraph({ spacing: { before: twips, after: 0 }, children: [] });
}

// ─── COVER (R1 style, warm terracotta) ──────────────────────────────────────
function buildCover() {
  const padL = 1200, padR = 800;
  const titleSize = 80; // 40pt
  const titleLines = ["Brief de", "Diseño"];

  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: c(P.accent), space: 12 };
  const children = [];

  // English label with accent bottom border (top whitespace via spacing.before)
  children.push(new Paragraph({
    indent: { left: padL, right: padR }, spacing: { before: 2200, after: 500 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.accent), space: 8 } },
    children: [new TextRun({
      text: "V E C I N D A R I O   B E E R   G A R D E N",
      size: 18, color: c(P.accent), font: FONT_HEAD, characterSpacing: 40,
    })],
  }));

  // Title lines
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: {
        after: i < titleLines.length - 1 ? 100 : 300,
        line: 920, lineRule: "atLeast",
      },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: "FFFFFF", font: FONT_HEAD,
      })],
    }));
  }

  // Subtitle
  children.push(new Paragraph({
    indent: { left: padL }, spacing: { after: 800 },
    children: [new TextRun({
      text: "Cuestionario guiado para definir la identidad visual",
      size: 24, color: c(P.secondary), italics: true, font: FONT,
    })],
  }));

  // Meta info lines with left accent border
  const metaLines = [
    "Proyecto: Nuevo sitio web + panel de administración",
    "Objetivo: Reorientación como restaurante-bar · SEO local",
    "Versión: 1.0 · Pre-llenada con datos del sitio y briefing de marca",
  ];
  for (const line of metaLines) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 22, color: "C0B5A8", font: FONT,
      })],
    }));
  }

  // Bottom whitespace folded into footer's spacing.before
  // Footer
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: c(P.accent), space: 8 } },
    spacing: { before: 3800, after: 200 },
    children: [
      new TextRun({ text: "Cuernavaca, Morelos", size: 18, color: c(P.secondary), font: FONT }),
      new TextRun({ text: "                                                                            " }),
      new TextRun({ text: "2026", size: 18, color: c(P.secondary), font: FONT }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: c(P.bg) },
        borders: noBorders,
        children,
      })],
    })],
  })];
}

// ─── BODY CONTENT ───────────────────────────────────────────────────────────
function buildBody() {
  const out = [];

  // ── Cómo usar este documento ──────────────────────────────────────────────
  out.push(H1("Cómo usar este documento"));
  out.push(body([
    "Este brief ya tiene ",
    { text: "casi todo el trabajo pesado hecho", bold: true },
    ". Tomé la información del sitio actual (vecindariobeergarden.com) y del briefing de marca que llenaron al abrir, y lo crucé con las decisiones técnicas que ya tomamos. ",
    "Tu trabajo aquí es ",
    { text: "completar las partes que solo tú sabes", bold: true },
    ": referencias visuales, fotos reales, y las decisiones de gusto personal.",
  ]));

  out.push(body("Cada sección está marcada con uno de estos dos indicadores:"));

  // Legend table
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 180, bottom: 180, left: 240, right: 240 },
            shading: { type: ShadingType.CLEAR, fill: c(P.surface) },
            children: [new Paragraph({
              children: [
                new TextRun({ text: "✅  YA LO SÉ", bold: true, size: 18, color: c(P.have), font: FONT_HEAD }),
              ],
            }), new Paragraph({
              spacing: { before: 60 },
              children: [new TextRun({
                text: "Información que ya tengo de las fuentes mencionadas. Solo revísala por si algo cambió.",
                size: 20, color: c(P.body), font: FONT,
              })],
            })],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 180, bottom: 180, left: 240, right: 240 },
            shading: { type: ShadingType.CLEAR, fill: c(P.surface) },
            children: [new Paragraph({
              children: [
                new TextRun({ text: "✏️  NECESITO DE TÍ", bold: true, size: 18, color: c(P.need), font: FONT_HEAD }),
              ],
            }), new Paragraph({
              spacing: { before: 60 },
              children: [new TextRun({
                text: "Espacios donde tienes que aportar. Tómate tu tiempo, no hay respuestas correctas o incorrectas.",
                size: 20, color: c(P.body), font: FONT,
              })],
            })],
          }),
        ],
      }),
    ],
  }));

  out.push(gap(200));
  out.push(body([
    { text: "Tip: ", bold: true, color: P.accent },
    "Si una sección no te dice nada, déjala en blanco. Es mejor ningún input que uno forzado. Podemos iterar.",
  ]));

  // ═════════════════════════════════════════════════════════════════════════
  // 1. IDENTIDAD Y ESENCIA
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1("1 · Identidad y esencia del lugar"));

  out.push(sectionHeader("Propuesta de valor", "have"));
  out.push(infoCard("Fuente: Briefing de marca", [
    { text: "“El lugar donde la comunidad cervecera se encuentra.”", italic: true },
  ], { marginBottom: 120 }));
  out.push(body([
    "Vecindario Beer Garden se distingue por ofrecer una experiencia personalizada, con cervezas de calidad, servicio experto y un ambiente relajado. Es el único lugar en Cuernavaca donde los amantes de la cerveza encuentran un ambiente acogedor y profesional, con amplia variedad de productos almacenados de forma óptima y personal capacitado para guiar la experiencia cervecera.",
  ]));

  out.push(sectionHeader("Personalidad de marca", "have"));
  out.push(body([
    { text: "Amigable, acogedor, relajado, comprometido con la calidad y la comunidad.", bold: true },
    " Vecindario busca transmitir un ambiente natural donde tanto conocedores como novatos en el mundo de la cerveza se sientan bienvenidos.",
  ]));

  out.push(sectionHeader("Valores clave", "have"));
  out.push(body("Comunidad · Calidad · Sostenibilidad · Apoyo a productores locales · Excelencia en la experiencia cervecera."));

  out.push(sectionHeader("Inspiración y origen", "have"));
  out.push(body([
    "Surge de una historia personal que mezcla la pasión por la hospitalidad (adquirida desde la infancia en un restaurante familiar) con la experiencia en el mundo de la cerveza artesanal. Vecindario busca rescatar esa esencia de comunidad y calidad que el dueño siempre quiso transmitir en su propio negocio.",
  ]));

  out.push(sectionHeader("Misión y visión", "have"));
  out.push(body([
    { text: "Misión: ", bold: true },
    "Ofrecer un espacio que conecte a productores locales de cerveza con los consumidores, brindando una experiencia sensorial única y accesible, donde la calidad y la calidez sean los pilares del servicio.",
  ]));
  out.push(body([
    { text: "Visión: ", bold: true },
    "Convertirse en el punto de referencia para amantes de la cerveza artesanal y turistas en Cuernavaca, así como un pilar de la comunidad cervecera local.",
  ]));

  out.push(sectionHeader("3-5 adjetivos que describan cómo debe SENTIRSE el sitio", "need"));
  out.push(body([
    "El briefing ya sugiere: ",
    { text: "amigable, acogedor, relajado, cálido, natural", italic: true },
    ". Confirma, ajusta o reemplaza. Piensa en adjetivos que NO se apliquen igual a cualquier bar — ¿qué palabra usarías tú para describir el lugar que nadie más usaría?",
  ], { after: 100 }));
  out.push(...placeholder("Ej: artesanal sin pretensiones, cobijante, lleno de vida pero sin ruido visual...", 2));

  // ═════════════════════════════════════════════════════════════════════════
  // 2. DATOS OPERATIVOS
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1("2 · Datos operativos (NAP)"));
  out.push(body([
    "Estos datos son ",
    { text: "críticos para SEO local", bold: true },
    " — alimentan el panel de Google Business Profile y el schema BarOrPub del sitio. Deben ser idénticos en TODOS los puntos de contacto (sitio, GBP, redes, directorios).",
  ]));

  out.push(H2("Datos pre-llenados del sitio actual"));
  out.push(infoCard("Dirección", "Av. Teopanzolco #665, Cuernavaca, Morelos", { marginBottom: 80 }));
  out.push(infoCard("Teléfono", "+52 777 497 2223", { marginBottom: 80 }));
  out.push(infoCard("WhatsApp", "wa.me/527774972223", { marginBottom: 80 }));
  out.push(infoCard("Horarios (sitio actual)", [
    "Miércoles a viernes: 17:00 – 23:30",
    "Sábado: 15:00 – 23:30",
    "Domingo: 15:00 – 22:00",
    "Lunes y martes: cerrado",
  ], { marginBottom: 80 }));
  out.push(infoCard("Horarios (PDF briefing)", [
    "Miércoles a sábado: 17:00 – 00:00",
    "Domingo: 14:30 – 20:00",
  ], { dark: true, marginBottom: 120 }));
  out.push(body([
    { text: "⚠️ Discrepancia detectada: ", bold: true, color: P.need },
    "los horarios del sitio y los del PDF briefing de marca no coinciden. ¿Cuáles son los actuales y correctos?",
  ]));
  out.push(...placeholder("Horarios actuales y correctos:", 2));

  out.push(H2("Redes sociales y enlaces"));
  out.push(infoCard("Facebook", "Facebook oficial de Vecindario Beer Garden (URL exacta abajo)", { marginBottom: 80 }));
  out.push(infoCard("Instagram", "Instagram oficial de Vecindario Beer Garden (URL exacta abajo)", { marginBottom: 80 }));
  out.push(infoCard("Google Business Profile", "URL del perfil de Google (si la conoces)", { marginBottom: 120 }));
  out.push(...placeholder("Pega aquí las URLs exactas de Facebook, Instagram, GBP y cualquier otra red:", 3));

  out.push(H2("Capacidad y servicio"));
  out.push(infoCard("Del briefing de marca", [
    "Capacidad: 60 personas, con áreas de barra, mesas al aire libre y salón.",
    "Servicio: relajado, con meseros y personal altamente capacitado.",
    "Equipo certificado: Beer Servers por Cicerone y jueces BJCP.",
  ]));

  // ═════════════════════════════════════════════════════════════════════════
  // 3. PÚBLICO
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1("3 · Público: actual vs. objetivo"));

  out.push(H2("Público actual (del briefing de marca)"));
  out.push(infoCard("Perfil", [
    "Edad: 25 a 45 años",
    "Género: mixto",
    "Nivel socioeconómico: medio y medio-alto",
    "Intereses: aficionados a la cerveza artesanal, curiosos por nuevos sabores, turistas que buscan experiencias locales, residentes de la zona que buscan un ambiente relajado y comunitario.",
    "Segmentos secundarios: aficionados al mezcal, pulque y café; interesados en gastronomía casual y de calidad.",
  ]));

  out.push(H2("Público objetivo nuevo (lo que queremos captar)"));
  out.push(body([
    "Ya están ",
    { text: "bien posicionados para cerveza artesanal", bold: true },
    " (poca competencia en la zona). El reto ahora es captar a quienes buscan ",
    { text: "comida en Cuernavaca", bold: true, color: P.accent },
    " y aún no asocian Vecindario con pizza, hamburguesas, etc.",
  ]));
  out.push(body([
    "Tu propuesta: crear ",
    { text: "hubs SEO por categoría", bold: true },
    " (pizza, hamburguesas, etc.) con página individual por plato. Esto se definirá con el KW research que proveerás aparte.",
  ]));

  out.push(sectionHeader("¿Quién es la persona que NO te conoce pero debería llegar al sitio?", "need"));
  out.push(body("Describe a este cliente ideal con la mayor especificidad posible. No digas “adultos jóvenes”; di “parejas de 30-40 años que buscan dónde cenar un sábado en Cuernavaca centro y miran Google Maps”."));
  out.push(...placeholder("Describe 1-3 perfiles específicos de clientes nuevos que quieres captar vía comida:", 4));

  // ═════════════════════════════════════════════════════════════════════════
  // 4. DECISIONES TÉCNICAS YA TOMADAS
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1("4 · Decisiones técnicas ya tomadas"));
  out.push(body([
    "Para que el diseño se haga sobre fundamentos realistas, esto es lo que ",
    { text: "ya decidimos en la conversación inicial", bold: true },
    ". No necesitas responder nada aquí, solo confirmar que sigues al tanto.",
  ]));

  const decisions = [
    ["Stack", "Astro (frontend estático) + panel admin propio (mobile-first)"],
    ["Base de datos", "Cloudflare D1 (SQLite en el edge, gratis)"],
    ["Hosting", "Cloudflare Pages (gratis, ya tienes el dominio en Cloudflare)"],
    ["Email", "Se conservan los MX de Hostinger (NO tocar; preserva los emails @vecindariobeergarden.com)"],
    ["Foco primario de uso", "Clientes escaneando QR en las mesas → velocidad móvil es prioritaria"],
    ["Foco secundario", "SEO local para captar clientes como restaurante-bar"],
    ["Reservaciones", "Solo WhatsApp/teléfono (sin sistema online)"],
    ["Idiomas", "Español primero; arquitectura preparada para i18n (inglés después)"],
    ["Editor del menú", "1 sola persona (tú) — login simple"],
    ["Edición de cervezas", "Drag-and-drop que SÍ funcione en móvil (SortableJS)"],
    ["Lanzamiento", "Por fases: MVP (sitio + menú editable) → eventos → hubs SEO"],
    ["Roadmap futuro (no MVP)", "Agente Hermes por Telegram para crear/publicar cervezas por comando en lenguaje natural. Backend se diseña desde el inicio preparado para esto (ver sección siguiente)."],
  ];

  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: c(P.divider) },
      insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [new Paragraph({
              children: [new TextRun({ text: "DECISIÓN", bold: true, size: 18, color: "FFFFFF", font: FONT_HEAD, characterSpacing: 30 })],
            })],
          }),
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [new Paragraph({
              children: [new TextRun({ text: "VALOR", bold: true, size: 18, color: "FFFFFF", font: FONT_HEAD, characterSpacing: 30 })],
            })],
          }),
        ],
      }),
      ...decisions.map(([k, v], i) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({
              children: [new TextRun({ text: k, bold: true, size: 22, color: c(P.primary), font: FONT })],
            })],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({
              children: [new TextRun({ text: v, size: 22, color: c(P.body), font: FONT })],
            })],
          }),
        ],
      })),
    ],
  }));

  // ═════════════════════════════════════════════════════════════════════════
  // 4.5 ROADMAP: AGENTE POR TELEGRAM (Hermes)
  // ═════════════════════════════════════════════════════════════════════════
  out.push(gap(360));
  out.push(H2("Roadmap futuro: agente por Telegram (Hermes)"));
  out.push(body([
    { text: "Esto no es para el MVP, pero lo documento aquí para que el backend se diseñe desde el inicio ", bold: true, color: P.accent },
    { text: "con esta capacidad en mente", bold: true },
    " — y no haya que rediseñar después.",
  ]));
  out.push(body([
    "Idea: poder dar una instrucción en lenguaje natural por Telegram, como: “",
    { text: "investiga la cerveza La Lupulosa de Insurgente, crea una descripción para el menú, llena sus datos y publícala en el tap número 2", italic: true },
    "”. El agente (Hermes) ejecuta los 4 pasos: investigar → redactar → mapear datos → publicar.",
  ]));

  out.push(H3("Implicaciones que ya quedan en el diseño del backend"));
  const agentImplications = [
    ["API programática", "El panel admin y el agente consumen la MISMA API REST/JSON. Ninguna lógica de negocio vive solo en la UI. Endpoints como POST /beers, PUT /beers/:id/publish-to-tap/:n."],
    ["Drafts + estados", "Cervezas con estado draft / published. Permite que el agente proponga y tú apruebes, o publique directo según modo configurado."],
    ["Auditoría y origen", "Campo source (manual | agent) y log mínimo de cambios (quién, qué, cuándo). Saber qué creó el agente vs qué creaste tú."],
    ["Tap number = slot fijo", "Los taps 1-10 son slots fijos (como mangas físicas), no posiciones en lista ordenada. El comando “publícala en el tap 2” requiere este modelo."],
    ["Tono de marca documentado", "Para que el agente redacte descripciones coherentes, el tono/voz debe estar escrito en un archivo que él pueda leer (style guide en el repo)."],
  ];
  for (const [k, v] of agentImplications) {
    out.push(bullet([{ text: k + ": ", bold: true }, v]));
  }

  out.push(sectionHeader("Preguntas para cuando diseñemos el agente", "need"));
  out.push(body("No las respondas ahora, pero quédalas en mente. Las retomamos cuando llegue el momento."));
  const agentQuestions = [
    "¿El agente publica automáticamente o solo propone y tú apruebas por Telegram antes de que el sitio se regenere?",
    "¿Qué tan estricto debe ser el match de “La Lupulosa de Insurgente”? ¿Puede el agente decir “no la encuentro con certeza, ¿confirmas?” o asume la más probable?",
    "¿El agente puede quitar/rotar taps también (ej: “saca la del tap 5, ponla como agotada”)?",
    "¿Puede crear eventos, o solo cervezas? Si solo cervezas al inicio, ¿cuándo abrimos eventos?",
    "¿Quién más del equipo puede dar instrucciones al bot por Telegram? ¿Solo tú, o también un socio/staff?",
    "¿El agente debe poder deshacer (undo) lo que hizo? ¿Por cuánto tiempo?",
    "¿Cómo manejar descripciones que el agente genera pero tú quieres reescribir? ¿Edita por UI o por chat?",
  ];
  for (const q of agentQuestions) {
    out.push(bullet([{ text: "• ", color: P.accent }, q]));
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 5. REFERENCIAS QUE SÍ
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("5 · Referencias visuales que SÍ te gustan"));
  out.push(sectionHeader("3 a 5 referencias", "need"));
  out.push(body([
    { text: "No tienen que ser bares.", bold: true },
    " Pueden ser una revista, una marca de café, una tienda de discos, una cervecería específica, el sitio de un restaurante que te cayó bien, lo que sea con “ese feeling”. Cuanto más variadas, mejor — me ayuda a encontrar el patrón común.",
  ]));
  out.push(body([
    "Para cada referencia, dime ",
    { text: "qué te gusta específicamente", bold: true, color: P.accent },
    " (¿la tipografía? ¿la paleta? ¿el manejo del espacio? ¿la actitud?) y ",
    { text: "qué NO copiaría", bold: true, color: P.accent },
    ". Pegar captura (o URL) + texto está perfecto.",
  ]));

  for (let i = 1; i <= 5; i++) {
    out.push(gap(120));
    out.push(H2(`Referencia ${i}`));
    out.push(imageBox(`Captura de la referencia ${i}`, 1800));
    out.push(gap(80));
    out.push(body([{ text: "URL o fuente: ", bold: true }], { after: 40 }));
    out.push(...placeholder("", 1));
    out.push(body([{ text: "¿Qué te gusta?: ", bold: true }], { after: 40 }));
    out.push(...placeholder("Ej: la tipografía serif de alto contraste, pero sin copiar la paleta porque es demasiado fría.", 2));
    out.push(body([{ text: "¿Qué NO copiar?: ", bold: true }], { after: 40 }));
    out.push(...placeholder("", 1));
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 6. REFERENCIAS QUE NO
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("6 · Referencias que NO te gustan"));
  out.push(sectionHeader("2 a 3 anti-referencias", "need"));
  out.push(body([
    "Igual de útil que lo que sí te gusta. Si hay un sitio de bar o restaurante que te da ",
    { text: "“olor a plantilla”", italic: true },
    " o que simplemente no te representa, dímelo. Define el límite.",
  ]));

  for (let i = 1; i <= 3; i++) {
    out.push(gap(120));
    out.push(H2(`Anti-referencia ${i}`));
    out.push(imageBox(`Captura o descripción ${i}`, 1500));
    out.push(gap(80));
    out.push(body([{ text: "URL, marca o descripción: ", bold: true }], { after: 40 }));
    out.push(...placeholder("", 1));
    out.push(body([{ text: "¿Qué es lo que NO quieres?: ", bold: true }], { after: 40 }));
    out.push(...placeholder("Ej: demasiado oscuro, tipografía muy moderna, se siente como cadena de franquicia.", 2));
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 7. IDENTIDAD VISUAL EXISTENTE
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("7 · Identidad visual existente"));
  out.push(body([
    "Necesito ver qué ya existe para no proponer algo que pelee con la marca que ya está en la calle, en los manteles, en las redes.",
  ]));

  out.push(sectionHeader("Logo actual (todas las versiones que tengas)", "need"));
  out.push(body("Principal, secundario, versión para fondos oscuros, ícono o isologo. Si tienes un manual de marca, mejor."));
  out.push(gap(80));
  out.push(imageBox("Logo principal", 2000));
  out.push(gap(120));
  out.push(imageBox("Logo secundario / versión alternativa / ícono", 2000));

  out.push(sectionHeader("Colores actuales de marca", "need"));
  out.push(body("Si tienen HEX definidos, perfecto. Si solo los “sientes”, describe con tus palabras (ej: “el cobre de las mangas de tap”, “un verde como de plantas de la terraza”)."));
  out.push(...placeholder("Colores actuales o sensaciones de color:", 3));

  out.push(sectionHeader("Tipografías actuales (si las hay)", "need"));
  out.push(...placeholder("Nombre(s) de fuentes usadas en logo, menú impreso, redes:", 2));

  out.push(sectionHeader("Material gráfico ya existente (opcional pero útil)", "need"));
  out.push(body("Menú impreso, cartas de cerveza, flyers de eventos, etiquetas — cualquier cosa que ya tenga identidad visual consolidada."));
  out.push(gap(80));
  out.push(imageBox("Foto del menú impreso o carta de cervezas", 2000));

  // ═════════════════════════════════════════════════════════════════════════
  // 8. FOTOGRAFÍA DEL LUGAR
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("8 · Fotografía del lugar"));
  out.push(body([
    { text: "El sitio debe sentir el lugar real, no un bar genérico.", bold: true, color: P.accent },
    " Mencionaste que tienes mezcla de fotos profesionales y caseras más recientes, y que las puedes retocar con IA. Esta es la sección donde las pegas para que yo las vea.",
  ]));

  out.push(H2("Fotos del espacio (interior, terraza, barra)"));
  out.push(body("Las fotos que mejor capturen el ambiente. Lo que la gente ve al entrar."));
  out.push(gap(80));
  out.push(imageBox("Foto del espacio 1 — vista general", 2200));
  out.push(gap(120));
  out.push(imageBox("Foto del espacio 2 — barra / área de cervezas", 2200));
  out.push(gap(120));
  out.push(imageBox("Foto del espacio 3 — terraza / exterior", 2200));

  out.push(H2("Fotos de producto (cervezas, comida)"));
  out.push(body("Cervezas en tap, las mangas, comida bien presentada. Cuanto más apetitosas, mejor para SEO de restaurante."));
  out.push(gap(80));
  out.push(imageBox("Cervezas de barril / torres / mangas", 2200));
  out.push(gap(120));
  out.push(imageBox("Platillo estrella 1 (pizza / hamburguesa / etc.)", 2200));
  out.push(gap(120));
  out.push(imageBox("Platillo estrella 2", 2200));

  out.push(H2("Fotos de ambiente y eventos"));
  out.push(body("Gente disfrutando, eventos en vivo (jazz, salsa, funk), catas — lo que muestre la energía del lugar."));
  out.push(gap(80));
  out.push(imageBox("Evento en vivo / ambiente lleno", 2200));

  out.push(H2("Notas sobre las fotos"));
  out.push(body([
    { text: "Mencionaste: ", bold: true },
    "“algunas profesionales y otras caseras más recientes, las puedo editar con IA”. Dime cuáles son las profesionales (para usarlas como heroes) y cuáles necesitan retoque.",
  ]));
  out.push(...placeholder("Notas sobre qué fotos priorizar, cuáles retocar, qué falta fotografiar:", 3));

  // ═════════════════════════════════════════════════════════════════════════
  // 9. MUNDO DEL PROYECTO
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("9 · Mundo del proyecto (semillas para la identidad)"));
  out.push(body([
    { text: "Esta es la sección más importante para evitar el “olor a IA”.", bold: true, color: P.accent },
    " Las decisiones visuales con personalidad propia no vienen de tendencias web; vienen del universo propio del lugar. Aquí van semillas concretas que resuenan con Vecindario. ",
    { text: "Elige, descarta o suma las tuyas.", bold: true },
  ]));

  out.push(H2("Semillas que propongo (del mundo cervecero y de tu contexto)"));

  const seeds = [
    {
      t: "Cobre, latón y acero de barriles",
      d: "Los materiales reales del mundo cervecero: el cobre de las pailas, el acero inoxidable de los kegs, el latón de las mangas de tap. Paleta metálica pero cálida, no fría.",
    },
    {
      t: "Maltas tostadas y cáscara de cebada",
      d: "Tonos tierra tostados: ámbar, ámbar oscuro, marrón rojizo, negro cálido (no negro puro). Es la paleta natural de la cerveza y del pan.",
    },
    {
      t: "El pizarrón de tiza",
      d: "El menú cambia cada semana — igual que un pizarrón de bar. Tipografía manuscrita o de pizarrón para el menú rotativo transmite honestidad sobre lo efímero de la oferta.",
    },
    {
      t: "Etiqueta serigrafiada de cervecería artesanal",
      d: "Las etiquetas de cerveza indie tienen una estética propia: tinta de un solo color sobre papel kraft, tipografía robusta con personalidad, ilustración de línea. Es un lenguaje visual que tu público reconoce.",
    },
    {
      t: "“Vecindario”: la vecindad mexicana",
      d: "El concepto del nombre. En México, “vecindad” evoca comunidad, calidez, puerta abierta. Hay una arquitectura visual (azulejos, patios centrales, puertas de madera) que puede inspirar sin caer en clichés folklóricos.",
    },
    {
      t: "Cuernavaca, la eterna primavera",
      d: "El clima cálido y la vegetación de Cuernavaca piden estar afuera. El diseño puede evocar jardín, terraza, sombra — no el interior de un bar oscuro. Verde follaje (musgo, no neón) como acento opcional.",
    },
    {
      t: "El formato “carta de cervezas”",
      d: "Una carta de cervezas tiene una estructura editorial específica: estilo, ABV, IBU, origen, descripción corta. Honrar esa estructura tipográfica en el sitio da autoridad y conecta con el público conocedor.",
    },
    {
      t: "Música en vivo y comunidad",
      d: "Hacen jazz, salsa, funk, catas. Hay una estética de cartel de evento en vivo (tipografía display, alto contraste) que puede aparecer en la sección de eventos sin dominar el sitio.",
    },
  ];

  for (const s of seeds) {
    out.push(H3(s.t));
    out.push(body(s.d));
    out.push(...placeholder("¿Te late (sí/no/adjust)? Si quieres añadir contexto propio, escríbelo aquí:", 1));
    out.push(gap(80));
  }

  out.push(sectionHeader("Tus propias semillas", "need"));
  out.push(body("¿Qué del lugar, del barrio, de la historia personal, del equipo, de los clientes, NO aparece arriba y debería informar el diseño?"));
  out.push(...placeholder("Añade tus propias semillas/detalles/objetos/colores que para ti significan Vecindario:", 4));

  // ═════════════════════════════════════════════════════════════════════════
  // 10. ANTIPATRONES A EVITAR
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("10 · Antipatrones a evitar (defaults “AI-generated”)"));
  out.push(body([
    "Estos tres looks aparecen en cualquier sitio generado por IA sin importar el tema. ",
    { text: "Son legítimos cuando el brief los pide explícitamente, pero son defaults, no elecciones.", bold: true },
    " Voy a evitarlos salvo que tú los pidas o que de verdad sean la mejor opción para Vecindario.",
  ]));

  const antipatterns = [
    {
      t: "01 · Fondo crema (#F4F1EA) + serif de alto contraste + acento terracota",
      why: "Es EL look por defecto de cualquier sitio de café/bar/restaurante generado por IA. Tu briefing SÍ pide paleta cálida y terrenales, así que el riesgo de caer aquí sin querer es alto. Hay que darle un giro específico (¿texturas de papel kraft? ¿acentos de cobre real? ¿tipografía que no sea Playfair?) para que no se lea como default.",
    },
    {
      t: "02 · Negro casi puro + verde ácido o bermellón",
      why: "El “dark mode genérico de bar moderno”. No esVecindario: tu briefing pide cálido, relajado, natural, no tecnoide ni nocturno. Descartado salvo que lo pidas.",
    },
    {
      t: "03 · Layout tipo broadsheet: reglas finas, sin border-radius, columnas densas",
      why: "Parece editorial pero se siente a plantilla. Funciona para revistas y marcas minimalistas; no para un beer garden comunitario.",
    },
  ];

  for (const a of antipatterns) {
    out.push(H2(a.t));
    out.push(body(a.why));
  }

  out.push(H2("Otros defaults que voy a evitar"));
  const others = [
    "Iconos genéricos de línea (lucide/feather) sin contexto. Si hay iconos, que sean dibujados para Vecindario o que vengan del mundo cervecero.",
    "Gradientes genéricos de azul-violeta (#667eea → #764ba4).",
    "Cards con sombra suave en grid de 3 columnas idénticas. Si hay cards, que tengan razón de existir.",
    "Tipografías Inter/Geist/Plus Jakarta Sans como única familia. Sin identidad propia.",
    "Contadores animados de números, parallax decorativo y motion que no comunica nada.",
    "Microcopy en inglés (“Get started”, “Learn more”) cuando el sitio es 100% en español.",
  ];
  for (const o of others) {
    out.push(bullet([{ text: "✗  ", bold: true, color: P.need }, o]));
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 11. FIRMA MEMORABLE
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("11 · Firma memorable (el signature element)"));
  out.push(body([
    { text: "El diseño necesita UN elemento memorable", bold: true, color: P.accent },
    " — la cosa por la que el sitio se recuerda y que nadie más tiene. El resto del sitio se queda disciplinado alrededor de esta firma. ",
    { text: "Gastamos el carácter en un solo lugar, no en toda la página.", italic: true },
  ]));

  out.push(body("Ejemplos para hacerte una idea (no son propuestas finales, son ilustrativos):"));

  const sigExamples = [
    {
      t: "El menú como pizarrón vivo",
      d: "La sección de cervezas en tap se renderiza como un pizarrón de bar real, con tipografía manuscrita y la sensación de tiza. Refleja honestamente que el menú cambia — la interfaz misma lo dice. Ningún otro bar de Cuernavaca lo hace.",
    },
    {
      t: "Numeración estilo carta de cervezas",
      d: "Cada cerveza en tap tiene su número (#01 a #10) tipográficamente enorme, como las mangas de tap físicas. El orden importa y se hace visible.",
    },
    {
      t: "Marca de barril en el hero",
      d: "Un elemento visual en el hero inspirado en las marcas/mangas de tap físicas: estampado, textura metálica, número de línea. Ancla el sitio al mundo real del bar.",
    },
    {
      t: "Calendario de eventos como cartelera",
      d: "La sección de eventos con estética de cartel de música en vivo (tipografía display, alto contraste), NO como un feed genérico de cards.",
    },
  ];

  for (const s of sigExamples) {
    out.push(H2(s.t));
    out.push(body(s.d));
    out.push(...placeholder("¿Te late como firma? (sí/no/adjust)", 1));
    out.push(gap(80));
  }

  out.push(sectionHeader("Tu propia idea de firma", "need"));
  out.push(body("¿Hay algo del lugar, un detalle, un gesto, que siempre has querido que se vea online y nunca ha podido? Esta es tu oportunidad."));
  out.push(...placeholder("Describe tu idea (no tiene que ser realista todavía):", 3));

  // ═════════════════════════════════════════════════════════════════════════
  // 12. ALCANCE Y PRIORIDADES
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("12 · Alcance y prioridades de páginas"));

  out.push(H2("Páginas del MVP (Fase 1)"));

  const pages = [
    ["Home", "Hero + pilares + preview de cervezas en tap + CTAs a WhatsApp. Primera impresión del sitio."],
    ["Menú principal", "/menu/ — índice de todo el menú, indexable para SEO."],
    ["Cervezas de barril", "/menu/cervezas-de-barril/ — las 10 líneas con todos sus datos. Actualizables desde el panel admin."],
    ["Alimentos y Pizzas", "Secciones del menú actual (migración). Estructura preparada para convertirse en hubs SEO en Fase 3."],
    ["Contacto", "NAP, mapa embebido, horarios, WhatsApp. Hoy son 404 — se pierde pillar page local."],
    ["Legales", "Aviso de privacidad + términos y condiciones (migración)."],
  ];
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: c(P.divider) },
      insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: "PÁGINA", bold: true, size: 18, color: "FFFFFF", font: FONT_HEAD, characterSpacing: 30 })] })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: "FUNCIÓN", bold: true, size: 18, color: "FFFFFF", font: FONT_HEAD, characterSpacing: 30 })] })],
          }),
        ],
      }),
      ...pages.map(([k, v], i) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 22, color: c(P.primary), font: FONT })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: v, size: 22, color: c(P.body), font: FONT })] })],
          }),
        ],
      })),
    ],
  }));

  out.push(gap(200));
  out.push(H2("Fases 2 y 3 (post-MVP)"));
  out.push(bullet([{ text: "Fase 2: ", bold: true }, "Migrar 20 eventos existentes + schema Event + editor de eventos en el panel admin."]));
  out.push(bullet([{ text: "Fase 3: ", bold: true }, "Hubs SEO por categoría de comida (pizza, hamburguesa, etc.) con página individual por plato. Necesito el KW research."]));
  out.push(bullet([{ text: "Fase 4: ", bold: true }, "Pulido (i18n inglés, analítica, integración con GBP, modo “especial del día”)."]));

  out.push(sectionHeader("¿Cuál es la PRIMERA impresión que el sitio debe dar?", "need"));
  out.push(body("Si un cliente abre el sitio por primera vez (por QR o por Google) y en 3 segundos decide si se queda o se va — ¿qué quieres que sienta/piense?"));
  out.push(...placeholder("Ej: “qué lugar tan cool”, “esto no es un bar de cadena”, “tengo que ir a probar esa pizza”...", 2));

  // ═════════════════════════════════════════════════════════════════════════
  // 13. RESTRICCIONES
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1("13 · Restricciones y requisitos no negociables"));
  const constraints = [
    ["Mobile-first absoluto", "El uso principal es QR en mesas con señal variable. Velocidad y legibilidad en móvil importan más que desktop."],
    ["Velocidad de carga < 1s en móvil", "Astro estático + edge CDN. Cero JavaScript que no sea esencial."],
    ["Accesibilidad AA", "Contraste WCAG, navegación por teclado, alt en imágenes, foco visible."],
    ["SEO local fuerte", "Schema BarOrPub/Restaurant, Menu, Event en cada página relevante. Datos NAP idénticos en todas partes."],
    ["i18n-ready", "Arquitectura preparada para añadir inglés sin reescribir el sitio."],
    ["Accesibilidad de edición", "El panel admin debe ser usable desde un celular promedio con mala señal."],
    ["Preservación de URLs", "Las URLs actuales (/menu/, /eventos/[slug]/, etc.) se mantienen para no perder indexación."],
    ["Email no se rompe", "Los MX de Hostinger NO se tocan. El correo @vecindariobeergarden.com sigue funcionando."],
  ];

  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: c(P.divider) },
      insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [new TableCell({
          columnSpan: 2,
          shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [new Paragraph({ children: [new TextRun({ text: "RESTRICCIÓN", bold: true, size: 18, color: "FFFFFF", font: FONT_HEAD, characterSpacing: 30 })] })],
        })],
      }),
      ...constraints.map(([k, v], i) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 22, color: c(P.primary), font: FONT })] })],
          }),
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: v, size: 22, color: c(P.body), font: FONT })] })],
          }),
        ],
      })),
    ],
  }));

  // ═════════════════════════════════════════════════════════════════════════
  // 14. PRÓXIMOS PASOS
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("14 · Próximos pasos"));

  out.push(H2("Lo que necesito de ti para empezar"));
  const next = [
    ["Este brief lleno", "Especialmente las secciones marcadas como ✏️. Lo demás revísalo por si algo cambió."],
    ["KW research", "Para definir los hubs SEO de comida (pizza, hamburguesa, etc.). Lo proveerás aparte."],
    ["Logo en alta resolución", "Si tienes archivos vectoriales (.svg, .ai, .eps), mejor que .png."],
    ["Fotos organizadas", "Profesionales por un lado, caseras por otro, marcadas las que se pueden retocar."],
    ["Acceso a Cloudflare", "Para crear el subdominio de prueba (nuevo.vecindariobeergarden.com) sin tocar producción."],
  ];
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: c(P.divider) },
      insideVertical: NB,
    },
    rows: [
      ...next.map(([k, v], i) => new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 22, color: c(P.primary), font: FONT })] })],
          }),
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            children: [new Paragraph({ children: [new TextRun({ text: v, size: 22, color: c(P.body), font: FONT })] })],
          }),
        ],
      })),
    ],
  }));

  out.push(gap(240));
  out.push(H2("Lo que yo entregaré cuando reciba el brief"));
  const deliverables = [
    "Compact design system (paleta de 4-6 colores con HEX nombrados, 2 tipografías con rol, concepto de layout con wireframes ASCII comparando opciones).",
    "Una propuesta de firma memorable.",
    "Crítica mía de la propuesta contra el brief y contra los antipatrones (qué cambié y por qué).",
    "Iteración hasta aprobación. Recién ahí construyo.",
  ];
  for (const d of deliverables) out.push(bullet(d));

  // ═════════════════════════════════════════════════════════════════════════
  // 15. ROADMAP FUTURO: DASHBOARD OPERACIONAL
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("15 · Roadmap futuro: dashboard operacional"));
  out.push(body([
    { text: "Esto no es para el MVP, pero lo documento aquí para que el backend se diseñe desde el inicio ", bold: true, color: P.accent },
    { text: "con esta capacidad en mente", bold: true },
    " — y no haya que rediseñar después.",
  ]));
  out.push(body([
    "La idea: extender el panel admin hasta convertirlo en un ",
    { text: "centro de operaciones del bar", bold: true },
    ". Las funciones siguen el patrón ",
    { text: "capturar dato (desde donde sea) → guardarlo en D1 → verlo en dashboard / notificar", italic: true },
    ". Cada función nueva es agregar un comando más al mismo sistema, no construir algo aparte.",
  ]));

  out.push(H2("Perfiles de usuario previstos"));
  out.push(body("El dashboard pasa de 1 solo usuario a varios perfiles. Esto fuerza que la autenticación se diseñe multi-usuario con roles desde el inicio (aunque al principio solo exista tu cuenta)."));

  const profiles = [
    ["Tú", "Todo (admin, configuración, todos los módulos)", "Dashboard + Telegram"],
    ["Socio", "Gastos, ver reportes (vistas limitadas)", "Dashboard + Telegram"],
    ["Encargado barra", "Marcar barril terminado, registrar limpieza de líneas", "Solo Telegram (sin dashboard)"],
    ["Encargado cocina", "Lista de compras, reportar faltantes de insumos", "Solo Telegram (sin dashboard)"],
  ];
  out.push(buildSimpleTable(["Perfil", "Qué puede hacer", "Cómo accede"], profiles, [3.5, 8.5, 4.5]));
  out.push(gap(80));

  out.push(H2("Funciones futuras previstas"));
  const futureFns = [
    ["Operacional", "Marcar barril terminado (Telegram)", "Conecta directo con el menú: el tap se marca como agotado automáticamente."],
    ["Operacional", "Calendario de limpieza de líneas", "Regla configurable (ej: 14 días). Cron diario notifica si una línea no se ha limpiado."],
    ["Planificación", "Calendario de eventos y festividades cerveceras", "Cron semanal investiga festividades relevantes (LLM + web search). Estado 'sugerida' → apruebas/editas/rechazas por Telegram."],
    ["Planificación", "Calendario de ausencias de personal", "Vacaciones, días libres. Notificaciones para planear cuberturas."],
    ["Administrativa", "Lista de compras", "Encargado de cocina agrega insumos por Telegram (texto). Vista consolidada en dashboard."],
    ["Administrativa", "Gastos por Telegram (texto/voz/foto)", "Socio reporta gastos. Voz → transcripción (Whisper). Foto de ticket → LLM extrae monto/concepto. Categorización configurable."],
    ["Administrativa", "Reportes de gastos", "Tabla + totales por mes/categoría. Exportable."],
  ];
  out.push(buildSimpleTable(["Tipo", "Función", "Notas"], futureFns, [3.0, 6.0, 7.5]));
  out.push(gap(120));

  out.push(H2("Lo sencillo vs. lo que tiene miga"));
  out.push(H3("Sencillo (mismo esfuerzo que Hermes)"));
  ["Marcar barril terminado por Telegram",
   "Lista de compras por texto",
   "Gasto por texto con categoría",
   "Reportes básicos (tabla + gráfico de totales por mes/categoría)"].forEach(t => out.push(bullet(t)));
  out.push(gap(80));
  out.push(H3("Con miga (no imposible, pero requiere iteración de calidad)"));
  out.push(bullet([
    { text: "Voz → texto: ", bold: true },
    "transcripción (Whisper o similar). Funciona bien pero a veces equivoca nombres de cervezas o montos. Requiere confirmación antes de guardar.",
  ]));
  out.push(bullet([
    { text: "Foto de ticket → gasto estructurado: ", bold: true },
    "visión LLM lee el ticket y extrae monto, fecha, concepto. Funciona en el 80-90% de los casos; los tickets oscuros/arrugados fallan. El flujo debe incluir revisión/edición antes de confirmar.",
  ]));
  out.push(bullet([
    { text: "Categorización automática: ", bold: true },
    "hay que definir un catálogo de categorías contables con ustedes (no adivinarlo). Es un mini trabajo de setup, no técnico.",
  ]));
  out.push(body("Nada de esto es bloqueante. Solo que las funciones de voz/foto no son 'magia que siempre sale perfecta' — son 'magia que a veces requiere confirmación', y eso se diseña así desde el inicio."));
  out.push(gap(120));

  out.push(H2("Orden de prioridades interno sugerido"));
  out.push(body("El dashboard crece en alcance. Cada sub-fase entrega valor de uso inmediato. No se construye todo de golpe."));
  [
    "4a. Multi-usuario con roles (fundación; todo depende de esto)",
    "4b. Marcar barril terminado (conecta directo con el menú, alto valor, simple)",
    "4c. Calendario de eventos + festividades (conecta con sitio público)",
    "4d. Limpieza de líneas con notificaciones",
    "4e. Lista de compras",
    "4f. Gastos por Telegram (texto primero, voz/foto después)",
    "4g. Reportes de gastos",
  ].forEach(t => out.push(bullet(t)));

  // ═════════════════════════════════════════════════════════════════════════
  // 16. ESTRATEGIA DE PRODUCTO: INSTANCIAS PERSONALIZABLES
  // ═════════════════════════════════════════════════════════════════════════
  out.push(H1New("16 · Estrategia de producto: instancias personalizables"));
  out.push(body([
    { text: "Decisión: ", bold: true },
    "producto base + instancias independientes por cliente (",
    { text: "no multi-tenant", bold: true, color: P.accent },
    "). La intención a futuro es ofrecer sistemas similares a otros negocios (bares, cafeterías, restaurantes) partiendo de la base de Vecindario, adaptando módulos comunes y agregando particularidades.",
  ]));
  out.push(body("Vecindario es la primera instancia y, al mismo tiempo, la fundación del producto base."));

  out.push(H2("Organización del código: 2 repos"));
  out.push(body("Desde el inicio se trabaja con dos repositorios Git separados:"));
  out.push(bullet([
    { text: "producto-base: ", bold: true, color: P.accent },
    "módulos comunes reusables (panel admin, auth+roles, dashboard, bot Telegram, API REST, módulos comunes como gastos/calendario/compras). Configurable pero no específico a un negocio.",
  ]));
  out.push(bullet([
    { text: "vecindario: ", bold: true, color: P.accent },
    "instancia que usa el producto base + sus particularidades (módulos específicos de bar de cerveza: limpieza líneas, rotación taps, festividades cerveceras). Configuración propia (nombre, logo, colores, dominio).",
  ]));
  out.push(body("Cuando llegue un cliente nuevo: se clona producto-base, se configura, se seleccionan módulos, se agregan particularidades, se despliega como proyecto separado."));
  out.push(gap(120));

  out.push(H2("Diferencia con multi-tenant (lo que NO estamos haciendo)"));
  const mt = [
    ["Bases de datos", "1 compartida", "1 por cliente"],
    ["Logins", "Compartidos entre negocios", "Independientes por negocio"],
    ["Actualización de módulos comunes", "Afecta a todos a la vez", "Hay que mergear el cambio a cada instancia"],
    ["Personalización", "Limitada", "Total"],
    ["Esfuerzo inicial", "Alto", "Bajo"],
    ["Mantenimiento N clientes", "Centralizado", "Distribuido (N instancias)"],
  ];
  out.push(buildSimpleTable(["", "Multi-tenant", "Producto base + instancias (este proyecto)"], mt, [4.5, 6.0, 6.0]));
  out.push(gap(120));

  out.push(H2("Reglas de organización del código desde el inicio"));
  out.push(body("Estas reglas son básicamente buenas prácticas de desarrollo; cuestan prácticamente lo mismo que desarrollar sin pensar en reutilizar, pero te ahorran dolores de cabeza cuando clones."));
  out.push(bullet([
    { text: "Configuración en archivos, no hardcodeada: ", bold: true },
    "el nombre 'Vecindario', los colores, el logo, el WhatsApp, los horarios, etc. viven en un archivo de config. Cuando clonas para la cafetería, cambias ese archivo y casi todo se adapta.",
  ]));
  out.push(bullet([
    { text: "/modules con cada función separada: ", bold: true },
    "el código del dashboard organizado en carpetas por función (/modules/barriles, /modules/gastos, /modules/calendario). Para la cafetería, borras /modules/barriles y no afecta al resto.",
  ]));
  out.push(bullet([
    { text: "Nada de suposiciones del negocio embebidas: ", bold: true },
    "por ejemplo, no asumir 'siempre hay 10 taps'. Ese '10' debería ser configurable, porque la cafetería no tiene taps, y otro bar puede tener 6.",
  ]));
  out.push(bullet([
    { text: "Cada módulo marcado como 'común' o 'específico de bar de cerveza': ", bold: true },
    "cuando desarrollas una función para Vecindario, te preguntas: ¿esto es común a cualquier negocio similar, o es específico de un bar de cerveza? Los comunes van al producto base limpios y documentados.",
  ]));
  out.push(gap(120));

  out.push(H2("El coste del modelo (y cuándo reconsiderar)"));
  out.push(body([
    { text: "El 'costo' de este modelo: ", bold: true },
    "cuando arreglas un bug en un módulo común (ej: el módulo de gastos), tienes que mergear ese cambio a cada instancia. Con ",
    { text: "pocos clientes (3-5) es manejable", bold: true },
    ". Con ",
    { text: "muchos (50+) se vuelve un problema", bold: true },
    " — pero para cuando tengas 50 clientes, ya sabrás bien qué modelo te conviene y puedes migrar a multi-tenant si vale la pena.",
  ]));
  out.push(body([
    { text: "Conclusión: ", bold: true },
    "no se construye multi-tenancy ahora. Se construye Vecindario bien, con código modular y configurable, y se evalúa la migración a multi-tenant solo cuando el volumen de clientes lo justifique.",
  ]));

  // Closing paragraph
  out.push(gap(300));
  out.push(new Paragraph({
    spacing: { before: 400, after: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: c(P.accent), space: 12 } },
    children: [new TextRun({
      text: "Tómate tu tiempo. Este documento es el punto de partida — cuando vuelvas con esto y el KW research, armamos el design system y empezamos.",
      italics: true, size: 22, color: c(P.secondary), font: FONT,
    })],
  }));

  return out;
}

// ─── Helper: simple styled table (for sections 15-16) ───────────────────────
function buildSimpleTable(headers, rows, _colWidths) {
  // Reuses the same table styling pattern as the rest of the document
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.accent) },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: c(P.divider) },
      insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(h => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 18, color: "FFFFFF", font: FONT_HEAD, characterSpacing: 30 })],
          })],
        })),
      }),
      ...rows.map((row, i) => new TableRow({
        cantSplit: true,
        children: row.map((cellText, ci) => new TableCell({
          shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? c(P.surface) : "FFFFFF" },
          margins: { top: 140, bottom: 140, left: 200, right: 200 },
          children: [new Paragraph({
            children: [new TextRun({
              text: cellText, size: 22,
              color: ci === 0 ? c(P.primary) : c(P.body),
              bold: ci === 0, font: FONT,
            })],
          })],
        })),
      })),
    ],
  });
}

// ─── ASSEMBLE DOCUMENT ──────────────────────────────────────────────────────
const doc = new Document({
  creator: "Vecindario Beer Garden",
  title: "Brief de Diseño - Vecindario Beer Garden",
  description: "Cuestionario guiado para definir la identidad visual del nuevo sitio",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 22, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FONT_HEAD, size: 36, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 480, after: 200 } },
      },
      heading2: {
        run: { font: FONT_HEAD, size: 28, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 320, after: 140 } },
      },
      heading3: {
        run: { font: FONT_HEAD, size: 24, bold: true, color: c(P.accent) },
        paragraph: { spacing: { before: 240, after: 100 } },
      },
    },
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ],
    }],
  },
  sections: [
    // Cover section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCover(),
    },
    // Body section
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.divider), space: 4 } },
            children: [new TextRun({
              text: "Brief de Diseño · Vecindario Beer Garden",
              size: 16, color: c(P.secondary), italics: true, font: FONT,
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "— ", size: 18, color: c(P.secondary), font: FONT }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary), font: FONT }),
              new TextRun({ text: " —", size: 18, color: c(P.secondary), font: FONT }),
            ],
          })],
        }),
      },
      children: buildBody(),
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  const outPath = "C:/Users/Carlos/Desktop/Chamba/- Proyectos -/Vecindario Beer Garden/brief-diseno-vecindario.docx";
  fs.writeFileSync(outPath, buf);
  console.log("✓ Generado:", outPath);
  console.log("  Tamaño:", (buf.length / 1024).toFixed(1), "KB");
}).catch(err => {
  console.error("✗ Error:", err);
  process.exit(1);
});
