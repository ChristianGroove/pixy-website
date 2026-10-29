// Genera las páginas de la cara Spaces (spaces, pricing, features, contact, partners, space-agency)
// con el mismo sistema de la portada: encabezado y pie de index.html, fondo del login, tipografía y textos es/en.
// El contenido vive aquí (fuente única); los textos se escriben en locales/*.json bajo "pages2".
// Uso: node tools/pages/build-pages.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spacesNav, withPageEnd } from "./chrome.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const index = readFileSync(join(root, "index.html"), "utf8");
const EOL = index.includes("\r\n") ? "\r\n" : "\n";
const between = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b));

// --- Textos: cada t() registra la clave en español e inglés --------------------------------------
const I18N = { es: {}, en: {} };
function set(obj, path, value) {
  const parts = path.split(".");
  let o = obj;
  parts.slice(0, -1).forEach((p) => (o = o[p] ??= {}));
  o[parts.at(-1)] = value;
}
let page = "";
/** Etiqueta con texto traducible. */
function t(tag, key, es, en, cls = "", attrs = "") {
  const k = `pages2.${page}.${key}`;
  set(I18N.es, k.slice(7), es);
  set(I18N.en, k.slice(7), en);
  return `<${tag}${cls ? ` class="${cls}"` : ""}${attrs ? ` ${attrs}` : ""} data-i18n="${k}">${es}</${tag}>`;
}

// --- Piezas comunes -----------------------------------------------------------------------------
const FOOT = index.slice(index.indexOf("    <!-- Footer -->"));

function shell({ file, title, description, navActive, body }) {
  const nav = spacesNav("", navActive);
  const foot = FOOT.replace(
    /    <!-- Portada de Spaces[\s\S]*?<script src="js\/spaces-ai.js"><\/script>/,
    '    <!-- Páginas de Spaces: catálogo con modelo 3D, planes, listas y formulario -->\n    <script src="js/spaces-pages.js"></script>',
  );
  const head = `<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <script>
        (function () {
            try {
                var s = localStorage.getItem('pixy-theme');
                var t = s ? s : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                document.documentElement.setAttribute('data-theme', t);
            } catch (e) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="https://pixy.com.co/${file}">
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://pixy.com.co/${file}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://pixy.com.co/assets/og/pixy.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://pixy.com.co/assets/og/pixy.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Unbounded:wght@500;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/agency-modern.css">
    <link rel="stylesheet" href="css/pages.css">
    <link rel="stylesheet" href="css/spaces-home.css">
</head>

<body class="landing-page spaces-face">
    <!-- Generado por tools/pages/build-pages.mjs: editar ahí, no aquí -->
    <div class="bg-gradient"></div>
    <div class="bg-grid"></div>
`;
  return (head + nav + body + "\n" + foot).replace(/\r?\n/g, EOL);
}

const hero = (h1, sub, actions = "") => `
    <section class="sh-section sp-hero">
        <div class="container">
            ${h1}
            ${sub}
            ${actions ? `<div class="sp-actions">${actions}</div>` : ""}
        </div>
    </section>
`;

const close = (key, esT, enT, esS, enS) => `
    <section class="sh-section sh-final">
        <div class="container">
            ${t("h2", `${key}_t`, esT, enT, "sh-h2")}
            ${t("p", `${key}_s`, esS, enS, "sh-body")}
            ${t("a", `${key}_b`, "Agenda tu demo", "Book a demo", "btn-neon", 'href="contact.html" data-warp-click="departure"')}
        </div>
    </section>
`;

/** Lista numerada con título y descripción (la misma de la portada). */
const list = (prefix, items) =>
  `<ol class="sh-list">${items
    .map(
      ([es, en, des, den], i) =>
        `<li><span class="sh-num">${String(i + 1).padStart(2, "0")}</span><div>${t("h3", `${prefix}_${i}_t`, es, en, "sh-h3")}${t(
          "p",
          `${prefix}_${i}_d`,
          des,
          den,
          "sh-body",
        )}</div></li>`,
    )
    .join("")}</ol>`;

/** Sección con título fijo a la izquierda y lista a la derecha. */
const split = (key, esT, enT, esI, enI, items, note) => `
    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", `${key}_t`, esT, enT, "sh-h2")}
                ${esI ? t("p", `${key}_i`, esI, enI, "sh-body") : ""}
                ${note ? t("p", `${key}_note`, note[0], note[1], "sh-small sp-note") : ""}
            </div>
            ${list(key, items)}
        </div>
    </section>
`;

// --- Datos de los Spaces --------------------------------------------------------------------------
const SPACES = [
  {
    id: "resto", model: "resto", accent: "#FF6A2B", name: "Space Resto",
    p: ["De la mesa a la cocina y a la caja, sin un papel.", "From table to kitchen to checkout, paper-free."],
    mods: [
      ["Menú digital", "Digital menu", "Categorías, modificadores, etiquetas y platos agotados con un toque.", "Categories, modifiers, tags and sold-out dishes in one tap."],
      ["Pedido desde la mesa", "Table ordering", "Con QR y seguimiento en vivo.", "By QR, with live tracking."],
      ["Cocina", "Kitchen", "Gestor de pedidos y pantalla de cocina con sonidos.", "Order manager and kitchen display with sounds."],
      ["Equipo por rol", "Team by role", "Mesero, caja, barra, cocina y anfitrión con PIN. El mesero cobra en mesa si su rol lo permite.", "Waiter, cashier, bar, kitchen and host with a PIN. Waiters take payment at the table if their role allows it."],
      ["Gemelo del salón", "Floor twin", "Plano 3D o 2D con zonas, mesas, QR por mesa y estado en vivo.", "3D or 2D floor plan with zones, tables, a QR per table and live status."],
    ],
  },
  {
    id: "agencias", model: "agencias", accent: "#8B5CF6", name: "Space Agencias",
    p: ["Clientes, proyectos, cobros y resultados, conectados.", "Clients, projects, billing and results, connected."],
    mods: [
      ["Proyectos y tareas", "Projects and tasks", "Tablero, calendario, reuniones y ritmo semanal.", "Board, calendar, meetings and a weekly rhythm."],
      ["Portal del cliente", "Client portal", "Facturas pagables, cotizaciones, servicios y briefings.", "Payable invoices, quotes, services and briefs."],
      ["Servicios recurrentes", "Recurring services", "Facturación y cobro automático.", "Automatic invoicing and billing."],
      ["Contratos y briefings", "Contracts and briefs", "Generador de contratos y briefings con enlace público.", "Contract generator and briefs with a public link."],
      ["Marca blanca", "White label", "Tu marca en toda la plataforma y un panel para revender.", "Your brand across the platform and a panel to resell."],
    ],
  },
  {
    id: "tiendas", model: "tiendas", accent: "#2E7BFF", name: "Space Tiendas",
    p: ["Tu tienda en línea lista hoy y cada comentario convertido en venta.", "Your online store ready today and every comment turned into a sale."],
    mods: [
      ["Catálogo", "Catalog", "Productos, variantes, colecciones y servicios, con textos e imágenes asistidos por IA.", "Products, variants, collections and services, with AI-assisted copy and images."],
      ["Tienda generada", "Generated store", "Siete estilos, carrito, pago por pasos, cupones y envío.", "Seven styles, cart, step-by-step checkout, coupons and shipping."],
      ["Tres formas de comprar", "Three ways to buy", "Pago en línea, pedido por WhatsApp o solicitud de cotización.", "Online payment, WhatsApp order or quote request."],
      ["Comentarios que venden", "Comments that sell", "Pixy Social responde a quien comenta y le envía el link de pago.", "Pixy Social replies to whoever comments and sends the payment link."],
      ["Dominio propio", "Custom domain", "Tu tienda con tu dirección web.", "Your store at your own web address."],
    ],
  },
  {
    id: "inmobiliaria", model: "inmobiliaria", accent: "#10D9A0", name: "Space Inmobiliaria",
    p: ["Tu inventario publicado con tu marca y tus arriendos liquidados en un clic.", "Your listings published under your brand and your rentals settled in one click."],
    mods: [
      ["Propiedades", "Properties", "Inventario con editor por pasos y categorías listas.", "Inventory with a step-by-step editor and ready-made categories."],
      ["Portal inmobiliario", "Real estate portal", "Generado desde tu inventario, con estilos a elegir y contacto directo al CRM.", "Generated from your inventory, with styles to choose from and direct contact into the CRM."],
      ["Arriendos", "Rentals", "Contratos con codeudor, garantía, canon y administración, y recaudo mensual.", "Contracts with co-signer, deposit, rent and fees, and monthly collection."],
      ["Liquidación al propietario", "Owner settlements", "Comisión, impuestos y deducciones calculados, con avisos por WhatsApp.", "Commission, taxes and deductions calculated, with WhatsApp notices."],
    ],
  },
  {
    id: "edu", model: "edu", accent: "#FFC233", name: "Pixy Edu",
    p: ["El colegio entero en una plataforma: académico, familias, convivencia y pensiones.", "The whole school on one platform: academics, families, conduct and tuition."],
    mods: [
      ["Académico", "Academics", "Calendario, grados, plan de estudios, notas por periodo, asistencia con alerta temprana y horarios.", "Calendar, grades, curriculum, term grades, attendance with early alerts and schedules."],
      ["Bienestar", "Wellbeing", "Observador con firmas y ruta de convivencia.", "Student record with signatures and a conduct pathway."],
      ["Documentos", "Documents", "Boletines, carnets con QR y certificados verificables en línea.", "Report cards, QR student IDs and certificates verifiable online."],
      ["Pensiones", "Tuition", "Cartera, emisión masiva y pago en línea desde el portal de familias.", "Receivables, bulk billing and online payment from the family portal."],
      ["Portales", "Portals", "Portal de familias y portal docente, circulares con confirmación de lectura y admisiones en línea.", "Family and teacher portals, notices with read receipts and online admissions."],
    ],
  },
  {
    id: "saas", model: "saas", accent: "#00E0FF", name: "Space SaaS",
    p: ["Usuarios, planes, cobro recurrente y soporte, conectados.", "Users, plans, recurring billing and support, connected."],
    mods: [
      ["Usuarios y planes", "Users and plans", "Cada cliente con su plan, su historial y sus pagos.", "Every customer with their plan, history and payments."],
      ["Suscripciones", "Subscriptions", "Cobro recurrente con links de pago y recordatorios escalonados.", "Recurring billing with payment links and staged reminders."],
      ["Tickets de soporte", "Support tickets", "Estados, responsables y prioridades.", "Statuses, owners and priorities."],
      ["Sprints y tareas", "Sprints and tasks", "Tablero, calendario y ritmo semanal para el equipo de producto.", "Board, calendar and weekly rhythm for the product team."],
      ["CRM y automatizaciones", "CRM and automations", "Onboarding, renovaciones y seguimiento.", "Onboarding, renewals and follow-up."],
    ],
  },
];

const CORE = [
  ["Bandeja omnicanal", "Omnichannel inbox", "WhatsApp con la conexión oficial, Instagram y Messenger en una bandeja compartida por tu equipo.", "WhatsApp through the official connection, Instagram and Messenger in an inbox your team shares."],
  ["IA que atiende y califica", "AI that serves and qualifies", "Responde con la información real de tu negocio y califica a cada cliente con la frase que lo demuestra.", "Replies with your business's real information and qualifies every customer with the sentence that proves it."],
  ["Pipeline vivo", "Live pipeline", "Te dice a quién responder hoy y qué trato se está enfriando.", "Tells you who to answer today and which deal is cooling down."],
  ["Cotizaciones, facturas y links de pago", "Quotes, invoices and payment links", "Se envían por WhatsApp y el cliente paga en línea.", "Sent over WhatsApp, and the customer pays online."],
  ["Portal del cliente", "Client portal", "Tu cliente ve sus servicios, facturas y cotizaciones, y paga, con tu marca.", "Your customer sees their services, invoices and quotes, and pays, under your brand."],
  ["Modo 3D", "3D Mode", "Tu sede como una ciudad en miniatura con lo que está pasando ahora.", "Your location as a miniature city showing what is happening right now."],
];

// --- Páginas ----------------------------------------------------------------------------------------
const pages = [];

// spaces.html: catálogo con el modelo 3D fijo que cambia con cada Space
page = "spaces";
pages.push({
  file: "spaces.html",
  title: "Spaces | Pixy",
  description: "Un Space para cada industria: restaurantes, agencias, tiendas, inmobiliarias, colegios y software, sobre el mismo núcleo de Pixy.",
  navActive: "spaces",
  body:
    hero(
      t("h1", "h1", "Un Space para <span class=\"sh-accent\">cada industria.</span>", "A Space for <span class=\"sh-accent\">every industry.</span>", "sh-h1"),
      t("p", "sub", "Cada Space trae los módulos, el lenguaje y los flujos de tu industria, sobre el mismo núcleo de Pixy.", "Each Space brings your industry's modules, language and workflows, on the same Pixy core.", "sh-body sp-sub"),
      t("a", "cta", "Agenda tu demo", "Book a demo", "btn-neon", 'href="contact.html" data-warp-click="hop"') +
        t("a", "cta2", "Ver planes", "See plans", "sh-link", 'href="pricing.html"'),
    ) +
    `
    <section class="sh-section sp-catalog" data-no-reveal>
        <div class="container sp-catalog-grid">
            <div class="sp-blocks">
${SPACES.map(
  (s) => `                <article class="sp-block" id="${s.id}" data-model="${s.model}" data-accent="${s.accent}" style="--a:${s.accent}">
                    <h2 class="sh-display">${s.name}</h2>
                    ${t("p", `${s.id}_p`, s.p[0], s.p[1], "sh-body sv-promise")}
                    <dl class="sp-mods">${s.mods
                      .map(([es, en, des, den], i) => `<div>${t("dt", `${s.id}_m${i}`, es, en)}${t("dd", `${s.id}_m${i}_d`, des, den)}</div>`)
                      .join("")}</dl>
                    ${t("a", `${s.id}_cta`, "Quiero ver este Space", "I want to see this Space", "sh-link", `href="contact.html?space=${s.id}" data-warp-click="hop"`)}
                </article>`,
).join(EOL)}
            </div>
            <div class="sp-model-col" aria-hidden="true"><div class="sp-model"></div></div>
        </div>
    </section>
` +
    split("core", "Lo que todos los Spaces comparten.", "What every Space shares.", "Cada Space le cambia las palabras al núcleo y le suma sus módulos propios.", "Each Space adapts the core's language and adds its own modules.", CORE) +
    close("close", "Tu Space, <span class=\"sh-accent\">listo para tu negocio.</span>", "Your Space, <span class=\"sh-accent\">ready for your business.</span>", "Te lo mostramos con los flujos de tu industria en una demo guiada.", "We'll show it to you with your industry's workflows in a guided demo."),
});

// pricing.html: niveles con selector, comparación, complementos y Partner
page = "pricing";
const LEVELS = [
  { name: ["Esencial", "Essential"], users: ["Hasta 3 usuarios", "Up to 3 users"], phrase: ["Todo tu negocio, ordenado.", "Your whole business, organized."], for: ["Para negocios que arrancan a ordenarse.", "For businesses getting organized."] },
  { name: ["Pro", "Pro"], users: ["Hasta 10 usuarios", "Up to 10 users"], phrase: ["Tu negocio, en piloto automático.", "Your business, on autopilot."], for: ["Para equipos que venden y atienden todos los días.", "For teams that sell and serve every day."] },
  { name: ["Total", "Total"], users: ["Hasta 20 usuarios", "Up to 20 users"], phrase: ["Tu operación completa, en cada sede.", "Your full operation, at every location."], for: ["Para operaciones con varias sedes o equipos grandes.", "For operations with several locations or large teams."] },
];
const YES = ["Sí", "Yes"], NO = ["—", "—"];
const ROWS = [
  [["Usuarios", "Users"], [["Hasta 3", "Up to 3"], ["Hasta 10", "Up to 10"], ["Hasta 20", "Up to 20"]]],
  [["Bandeja de WhatsApp, Instagram y Messenger", "WhatsApp, Instagram and Messenger inbox"], [YES, YES, YES]],
  [["IA que responde y califica", "AI that replies and qualifies"], [["Uso inicial", "Starter usage"], ["Uso ampliado", "Extended usage"], ["Uso alto", "High usage"]]],
  [["Pipeline vivo y contactos", "Live pipeline and contacts"], [YES, YES, YES]],
  [["Los módulos de tu Space", "Your Space's modules"], [YES, YES, YES]],
  [["Cotizaciones, facturas y links de pago", "Quotes, invoices and payment links"], [YES, YES, YES]],
  [["Portal del cliente", "Client portal"], [YES, YES, YES]],
  [["Tienda, menú o portal generado", "Generated store, menu or portal"], [YES, YES, YES]],
  [["Modo 3D", "3D Mode"], [YES, YES, YES]],
  [["Pixy Social", "Pixy Social"], [NO, YES, YES]],
  [["Campañas masivas de WhatsApp y email", "Bulk WhatsApp and email campaigns"], [NO, YES, YES]],
  [["Automatizaciones", "Automations"], [["Básicas", "Basic"], ["Completas", "Full"], ["Completas", "Full"]]],
  [["Varias sedes", "Multiple locations"], [NO, ["Hasta un límite", "Up to a limit"], ["Sin límite", "Unlimited"]]],
  [["Roles a la medida", "Custom roles"], [NO, YES, YES]],
  [["Acompañamiento", "Support"], [["Guías y Pixy Help", "Guides and Pixy Help"], ["Prioritario", "Priority"], ["Dedicado", "Dedicated"]]],
];
const ADDONS = [
  ["Marca blanca", "White label", "Tu logo, tus colores y tu dominio en toda la plataforma y los portales.", "Your logo, colors and domain across the platform and portals."],
  ["Dominio propio", "Custom domain", "Tu tienda, tu menú o tu portal con tu dirección web.", "Your store, menu or portal at your own web address."],
  ["Paquete de IA", "AI pack", "Más uso de IA cuando tu nivel se queda corto.", "More AI usage when your tier falls short."],
  ["Tu propia llave de IA", "Your own AI key", "Conecta tu cuenta de proveedor de IA y paga tu consumo directo.", "Connect your AI provider account and pay for your usage directly."],
];
pages.push({
  file: "pricing.html",
  title: "Planes | Pixy",
  description: "Eliges tu industria, eliges tu ritmo: Esencial, Pro y Total, más complementos. Cada empresa paga en su moneda.",
  navActive: "plans",
  body:
    hero(
      t("h1", "h1", "Eliges tu industria. <span class=\"sh-accent\">Eliges tu ritmo.</span>", "Choose your industry. <span class=\"sh-accent\">Choose your pace.</span>", "sh-h1"),
      t("p", "sub", "Un plan es tu Space, un nivel y solo los complementos que necesitas. Cada empresa paga en su moneda.", "A plan is your Space, a tier and only the add-ons you need. Every company pays in its own currency.", "sh-body sp-sub"),
    ) +
    `
    <section class="sh-section sp-levels">
        <div class="container">
            <div class="sh-plans" role="tablist" aria-label="Niveles">
${LEVELS.map(
  (l, i) => `                <button type="button" class="sh-plan${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-level="${i}">
                    ${t("span", `l${i}`, l.name[0], l.name[1], "sh-h3l")}
                    ${t("span", `l${i}_u`, l.users[0], l.users[1], "sh-small")}
                    ${t("span", `l${i}_p`, l.phrase[0], l.phrase[1], "sh-body")}
                    ${t("span", `l${i}_f`, l.for[0], l.for[1], "sh-small sp-level-for")}
                </button>`,
).join(EOL)}
            </div>
            <div class="sp-table-wrap">
                <table class="sp-table" data-level="0">
                    <thead><tr><th></th>${LEVELS.map((l, i) => `<th>${t("span", `th${i}`, l.name[0], l.name[1])}</th>`).join("")}</tr></thead>
                    <tbody>
${ROWS.map(
  ([label, cells], r) =>
    `                        <tr>${t("th", `r${r}`, label[0], label[1], "", 'scope="row"')}${cells
      .map((c, i) => (c === YES || c === NO ? `<td>${c[0]}</td>` : `<td>${t("span", `r${r}_${i}`, c[0], c[1])}</td>`))
      .join("")}</tr>`,
).join(EOL)}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
` +
    split("addons", "Suma solo lo que necesitas.", "Add only what you need.", "Te mostramos el valor exacto para tu Space, tu nivel y tu moneda en la demo.", "We'll show you the exact price for your Space, tier and currency in the demo.", ADDONS) +
    `
    <section class="sh-section">
        <div class="container sh-split">
            <div>${t("h2", "partner_t", "¿Tienes una agencia? Vende Pixy con tu marca.", "Run an agency? Sell Pixy under your brand.", "sh-h2")}</div>
            <div>
                ${t("p", "partner_d", "Marca blanca, un panel para crear y administrar las empresas de tus clientes, y el cobro a cada una desde tu cuenta.", "White label, a panel to create and manage your clients' companies, and billing each of them from your account.", "sh-body sh-lead")}
                ${t("a", "partner_l", "Conocer el plan Partner", "Explore the Partner plan", "sh-link", 'href="partners.html"')}
            </div>
        </div>
    </section>
` +
    close("close", "Tu plan exacto, <span class=\"sh-accent\">en una demo.</span>", "Your exact plan, <span class=\"sh-accent\">in a demo.</span>", "Te mostramos tu Space y el nivel que le sirve a tu negocio.", "We'll show you your Space and the tier that fits your business."),
});

// features.html: la plataforma por pilares (docs/comercial/01-ecosistema/nucleo.md; solo lo disponible)
page = "features";
pages.push({
  file: "features.html",
  title: "Plataforma | Pixy",
  description: "Atiende, vende, opera y cobra: bandeja omnicanal, IA, pipeline, tareas, cobros y portal del cliente en una sola plataforma.",
  navActive: "platform",
  body:
    hero(
      t("h1", "h1", "Todo tu negocio, <span class=\"sh-accent\">conectado.</span>", "Your whole business, <span class=\"sh-accent\">connected.</span>", "sh-h1"),
      t("p", "sub", "Tus canales, tus ventas, tu operación y tus cobros dejan de vivir en cinco herramientas distintas.", "Your channels, sales, operations and billing stop living in five different tools.", "sh-body sp-sub"),
      t("a", "cta", "Agenda tu demo", "Book a demo", "btn-neon", 'href="contact.html" data-warp-click="hop"'),
    ) +
    split("serve", "Atiende", "Serve", "Ningún mensaje se queda sin respuesta.", "No message goes unanswered.", [
      ["Bandeja omnicanal", "Omnichannel inbox", "WhatsApp con la conexión oficial de Meta, Instagram y Messenger, con asignación por turnos y traspasos con un clic.", "WhatsApp through Meta's official connection, Instagram and Messenger, with round-robin assignment and one-click handoffs."],
      ["IA que responde", "AI that replies", "Atiende de día y de noche con lo que cargaste en Conocimiento, escucha notas de voz y entiende imágenes.", "Serves day and night with what you loaded into Knowledge, listens to voice notes and understands images."],
      ["Tú decides cuándo actúa", "You decide when it acts", "En todos los chats o solo en los que llegan por anuncios. Si un asesor escribe, la IA se aparta.", "On every chat or only those coming from ads. If an agent writes, the AI steps aside."],
      ["Pixy Social", "Pixy Social", "Quien comenta «precio» recibe respuesta, mensaje directo y link de pago, y ves cuánto vendió cada publicación.", "Whoever comments \"price\" gets a reply, a direct message and a payment link, and you see how much each post sold."],
    ], ["Pixy es Tech Provider de Meta: conecta WhatsApp Business con la API oficial de Meta.", "Pixy is a Meta Tech Provider: it connects WhatsApp Business through Meta's official API."]) +
    split("sell", "Vende", "Sell", "Sabes a quién llamar hoy.", "You know who to call today.", [
      ["Calificación con IA", "AI qualification", "Cada conversación queda fría, tibia o caliente, con las frases del cliente como evidencia.", "Every conversation is marked cold, warm or hot, with the customer's own words as evidence."],
      ["Pipeline vivo", "Live pipeline", "Cola de hoy, salud de cada trato y tiempo máximo por etapa. La IA sugiere; tu equipo decide.", "Today's queue, deal health and maximum time per stage. The AI suggests; your team decides."],
      ["Contactos 360", "Contacts 360", "Una ficha por cliente con mensajes, etapas, cotizaciones, facturas e historial.", "One record per customer with messages, stages, quotes, invoices and history."],
      ["Campañas masivas", "Bulk campaigns", "WhatsApp con plantillas aprobadas y email desde tu dominio verificado, con bajas automáticas.", "WhatsApp with approved templates and email from your verified domain, with automatic unsubscribes."],
      ["Cotizaciones", "Quotes", "Se crean desde la conversación y se convierten en venta y factura cuando el cliente acepta.", "Created from the conversation and turned into a sale and invoice when the customer accepts."],
    ]) +
    split("operate", "Opera", "Operate", "Tu operación, sin papeles.", "Your operation, paper-free.", [
      ["Tareas y proyectos", "Tasks and projects", "Tablero, lista y calendario, reuniones y ritmo semanal, con portal para colaboradores externos.", "Board, list and calendar, meetings and a weekly rhythm, with a portal for external collaborators."],
      ["Formularios y briefings", "Forms and briefs", "Constructor con plantillas y un enlace público para que el cliente responda.", "A builder with templates and a public link for the customer to answer."],
      ["Asistencia y sedes", "Attendance and locations", "Marcación con geocerca por sede y foto, con horario y zona horaria por sede.", "Geofenced clock-in per location with a photo, and hours and time zone per location."],
      ["Automatizaciones", "Automations", "Flujos visuales sin código con mensajes, condiciones, IA y acciones en el CRM, con simulador.", "No-code visual flows with messages, conditions, AI and CRM actions, with a simulator."],
    ]) +
    split("bill", "Cobra", "Get paid", "Cobras sin perseguir a nadie.", "You get paid without chasing anyone.", [
      ["Facturas y links de pago", "Invoices and payment links", "Enviados por WhatsApp o email, con cobros recurrentes y recordatorios escalonados.", "Sent over WhatsApp or email, with recurring billing and staged reminders."],
      ["Portal del cliente", "Client portal", "Tu cliente ve sus servicios, facturas, cotizaciones y briefings, y paga en línea, con tu marca.", "Your customer sees their services, invoices, quotes and briefs, and pays online, under your brand."],
      ["Cada empresa en su moneda", "Each company in its currency", "Pixy trabaja en la moneda de tu negocio.", "Pixy works in your business's currency."],
    ]) +
    split("control", "Inteligencia y control", "Intelligence and control", "Una sola IA y la seguridad de una plataforma empresarial.", "One AI and the security of an enterprise platform.", [
      ["Conocimiento", "Knowledge", "Le enseñas tu negocio una vez: perfil, servicios, preguntas frecuentes, horario, documentos y tono de marca.", "Teach it your business once: profile, services, FAQs, hours, documents and brand voice."],
      ["IA incluida", "AI included", "Sin configurar nada y con control de gasto, o con tu propia llave si lo prefieres.", "Nothing to configure and with spend control, or with your own key if you prefer."],
      ["Roles y permisos", "Roles and permissions", "Cada persona ve solo lo que le toca.", "Everyone sees only what they need."],
      ["Seguridad", "Security", "Datos aislados por empresa, acceso con passkeys y verificación en dos pasos.", "Data isolated per company, passkey sign-in and two-step verification."],
      ["Español e inglés", "Spanish and English", "La app y los portales en los dos idiomas.", "The app and portals in both languages."],
    ]) +
    close("close", "Míralo <span class=\"sh-accent\">funcionando</span> con tu negocio.", "See it <span class=\"sh-accent\">working</span> with your business.", "Te mostramos la plataforma con los flujos de tu industria.", "We'll show you the platform with your industry's workflows."),
});

// contact.html: el formulario arma un correo (el sitio no tiene servidor para formularios)
page = "contact";
pages.push({
  file: "contact.html",
  title: "Contacto | Pixy",
  description: "Agenda tu demo de Pixy: te mostramos tu Space con los flujos de tu industria.",
  navActive: "",
  body:
    hero(
      t("h1", "h1", "Hablemos de <span class=\"sh-accent\">tu negocio.</span>", "Let's talk about <span class=\"sh-accent\">your business.</span>", "sh-h1"),
      t("p", "sub", "Te mostramos tu Space en una demo guiada y resolvemos tus dudas.", "We'll show you your Space in a guided demo and answer your questions.", "sh-body sp-sub"),
    ) +
    `
    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", "mail_t", "Escríbenos", "Write to us", "sh-h3l")}
                <p class="sh-body"><a class="sh-link" href="mailto:contact@pixy.com.co">contact@pixy.com.co</a></p>
                <p class="sh-body"><a class="sh-link" href="https://wa.me/573504076800?text=Hola%2C%20quiero%20conocer%20Pixy" target="_blank" rel="noopener">WhatsApp +57 350 407 6800</a></p>
            </div>
            <form class="sp-form" data-mailto="contact@pixy.com.co" data-subject-es="Demo de Pixy" data-subject-en="Pixy demo">
                <label>${t("span", "f_name", "Nombre", "Name")}<input name="name" required autocomplete="name"></label>
                <label>${t("span", "f_company", "Empresa", "Company")}<input name="company" autocomplete="organization"></label>
                <label>${t("span", "f_email", "Email", "Email")}<input name="email" type="email" required autocomplete="email"></label>
                <label>${t("span", "f_space", "Tu industria", "Your industry")}<select name="space">
                    ${SPACES.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}
                    ${t("option", "f_other", "Otra", "Other", "", 'value="otra"')}
                </select></label>
                <label class="sp-wide">${t("span", "f_msg", "Cuéntanos de tu negocio", "Tell us about your business")}<textarea name="message" rows="5"></textarea></label>
                ${t("button", "f_send", "Agendar mi demo", "Book my demo", "btn-neon sp-wide", 'type="submit"')}
                ${t("p", "f_note", "Al enviar se abre tu correo con el mensaje listo.", "Sending opens your email app with the message ready.", "sh-small sp-wide")}
            </form>
        </div>
    </section>
`,
});

// partners.html: plan Partner (sin prometer pago automático de comisiones)
page = "partners";
pages.push({
  file: "partners.html",
  title: "Plan Partner | Pixy",
  description: "Vende Pixy con tu marca: marca blanca, panel de organizaciones y cobro a tus clientes.",
  navActive: "plans",
  body:
    hero(
      t("h1", "h1", "Vende Pixy <span class=\"sh-accent\">con tu marca.</span>", "Sell Pixy <span class=\"sh-accent\">under your brand.</span>", "sh-h1"),
      t("p", "sub", "El plan Partner es para agencias que quieren ofrecer Pixy a sus clientes como propio.", "The Partner plan is for agencies that want to offer Pixy to their clients as their own.", "sh-body sp-sub"),
      t("a", "cta", "Quiero ser partner", "I want to be a partner", "btn-neon", 'href="#partner-form" data-warp-click="nudge"'),
    ) +
    split("what", "Lo que incluye", "What's included", "", "", [
      ["Marca blanca", "White label", "Tu logo, tus colores y tu dominio en toda la plataforma y los portales.", "Your logo, colors and domain across the platform and portals."],
      ["Panel de organizaciones", "Organizations panel", "Creas y administras las empresas de tus clientes desde un solo lugar de control.", "You create and manage your clients' companies from a single control panel."],
      ["Cobro a tus clientes", "Billing your clients", "Cada cliente paga su plan desde tu cuenta.", "Each client pays for their plan through your account."],
      ["Informe de Pixy Social", "Pixy Social report", "Muestras a cada cliente cuánto vendieron sus publicaciones.", "You show each client how much their posts sold."],
    ]) +
    `
    <section class="sh-section" id="partner-form">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", "form_t", "Hablemos de <span class=\"sh-accent\">tu agencia.</span>", "Let's talk about <span class=\"sh-accent\">your agency.</span>", "sh-h2")}
                ${t("p", "form_i", "Te contamos cómo funciona y armamos el plan para tu cartera de clientes.", "We'll walk you through it and shape the plan around your client portfolio.", "sh-body")}
            </div>
            <form class="sp-form" data-mailto="contact@pixy.com.co" data-subject-es="Plan Partner de Pixy" data-subject-en="Pixy Partner plan">
                <label>${t("span", "f_name", "Nombre", "Name")}<input name="name" required autocomplete="name"></label>
                <label>${t("span", "f_company", "Agencia", "Agency")}<input name="company" autocomplete="organization"></label>
                <label>${t("span", "f_email", "Email", "Email")}<input name="email" type="email" required autocomplete="email"></label>
                <label>${t("span", "f_web", "Sitio web", "Website")}<input name="website" type="url"></label>
                <label class="sp-wide">${t("span", "f_msg", "¿Cuántos clientes manejas y qué les ofreces?", "How many clients do you manage and what do you offer them?")}<textarea name="message" rows="5"></textarea></label>
                ${t("button", "f_send", "Enviar", "Send", "btn-neon sp-wide", 'type="submit"')}
                ${t("p", "f_note", "Al enviar se abre tu correo con el mensaje listo.", "Sending opens your email app with the message ready.", "sh-small sp-wide")}
            </form>
        </div>
    </section>
`,
});

// space-agency.html: ficha del Space Agencias con su modelo en cromo
page = "agency";
const AG = SPACES[1];
pages.push({
  file: "space-agency.html",
  title: "Space Agencias | Pixy",
  description: "Clientes, proyectos, cobros y resultados, conectados. El Space para agencias y servicios profesionales.",
  navActive: "spaces",
  body: `
    <section class="sh-section sp-hero sp-space-hero" data-no-reveal>
        <div class="container sp-catalog-grid">
            <div>
                <h1 class="sh-h1">Space Agencias</h1>
                ${t("p", "sub", AG.p[0], AG.p[1], "sh-body sp-sub")}
                <div class="sp-actions">
                    ${t("a", "cta", "Quiero ver este Space", "I want to see this Space", "btn-neon", 'href="contact.html?space=agencias" data-warp-click="hop"')}
                    ${t("a", "cta2", "Ver planes", "See plans", "sh-link", 'href="pricing.html"')}
                </div>
            </div>
            <div class="sp-model-col" aria-hidden="true"><div class="sp-model" data-model="agencias" data-accent="${AG.accent}"></div></div>
        </div>
    </section>
` +
    split("mods", "Todo lo de tu agencia, en un Space.", "Everything your agency runs, in one Space.", "Además del núcleo de Pixy: bandeja, IA, pipeline y cobros.", "On top of the Pixy core: inbox, AI, pipeline and billing.", [
      ["Proyectos y tareas", "Projects and tasks", "Tablero, calendario, reuniones y ritmo semanal.", "Board, calendar, meetings and a weekly rhythm."],
      ["Portal de colaboradores", "Collaborator portal", "Tus freelancers trabajan con su PIN, sin ver lo que no les toca.", "Your freelancers work with their PIN, without seeing what isn't theirs."],
      ["Briefings", "Briefs", "Con un enlace público para que el cliente responda.", "With a public link for the client to answer."],
      ["Servicios recurrentes", "Recurring services", "Facturación y cobro automático cada mes.", "Automatic invoicing and billing every month."],
      ["Contratos", "Contracts", "Generador de contratos para cada cliente.", "A contract generator for every client."],
      ["Hosting web", "Web hosting", "Cuentas, dominios y renovaciones de tus clientes.", "Your clients' accounts, domains and renewals."],
      ["Portal del cliente", "Client portal", "Facturas pagables, cotizaciones, servicios y briefings, con tu marca.", "Payable invoices, quotes, services and briefs, under your brand."],
      ["Informe de Pixy Social", "Pixy Social report", "Muestra a cada cliente cuánto vendieron sus publicaciones.", "Show each client how much their posts sold."],
    ]) +
    `
    <section class="sh-section">
        <div class="container sh-split">
            <div>${t("h2", "partner_t", "Y si quieres, con tu marca.", "And, if you want, under your brand.", "sh-h2")}</div>
            <div>
                ${t("p", "partner_d", "Con el plan Partner vendes Pixy como propio: marca blanca y un panel para administrar las empresas de tus clientes.", "With the Partner plan you sell Pixy as your own: white label and a panel to manage your clients' companies.", "sh-body sh-lead")}
                ${t("a", "partner_l", "Conocer el plan Partner", "Explore the Partner plan", "sh-link", 'href="partners.html"')}
            </div>
        </div>
    </section>
` +
    close("close", "Tu agencia, <span class=\"sh-accent\">en piloto automático.</span>", "Your agency, <span class=\"sh-accent\">on autopilot.</span>", "Te mostramos Space Agencias con los flujos de tu agencia.", "We'll show you Space Agencias with your agency's workflows."),
});

// --- Escritura -------------------------------------------------------------------------------------
for (const p of pages) {
  writeFileSync(join(root, p.file), withPageEnd(shell(p)), "utf8");
  console.log(`página: ${p.file}`);
}
for (const lang of ["es", "en"]) {
  const file = join(root, "locales", `${lang}.json`);
  const raw = readFileSync(file, "utf8").replace(/^﻿/, "");
  const data = JSON.parse(raw);
  data.pages2 = I18N[lang].pages2 ?? I18N[lang];
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  writeFileSync(file, JSON.stringify(data, null, 2).replace(/\n/g, eol) + (raw.endsWith("\n") ? eol : ""), "utf8");
  console.log(`${lang}: pages2 con ${Object.keys(data.pages2).length} páginas`);
}
