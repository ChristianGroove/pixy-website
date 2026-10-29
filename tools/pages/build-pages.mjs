// Genera las páginas de la cara Spaces (spaces, pricing, features, contact, partners, space-agency)
// con el mismo sistema de la portada: encabezado y pie de index.html, fondo del login, tipografía y textos es/en.
// El contenido vive aquí (fuente única); los textos se escriben en locales/*.json bajo "pages2".
// Uso: node tools/pages/build-pages.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spacesNav, withPageEnd, consentBlock, MAILTO_NOTE } from "./chrome.mjs";

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
    // Los scripts propios de la portada (spaces-home, spaces-ai y el orbe viajero) se cambian por el de estas páginas.
    // index.html ya trae la versión (?v=) que pone version-assets: la expresión la acepta
    /    <!-- Portada de Spaces[\s\S]*?<script src="js\/(spaces-ai|orb-route)\.js(?:\?v=\w+)?"><\/script>(?![\s\S]*<script src="js\/orb-route\.js)/,
    '    <!-- Páginas de Spaces: catálogo con modelo 3D, planes, listas y formulario -->\n    <script src="js/spaces-pages.js"></script>',
  );
  if (!foot.includes("js/spaces-pages.js")) throw new Error("build-pages: no se pudo cambiar los scripts de la portada por js/spaces-pages.js");
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

// Ficha de cada Space (la de Agencias conserva su dirección)
const SPACE_FILE = { agencias: "space-agency.html", resto: "space-restaurant.html", tiendas: "space-stores.html", inmobiliaria: "space-real-estate.html", edu: "space-edu.html", saas: "space-saas.html" };

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
                    <div class="sp-actions">
                        ${t("a", `${s.id}_page`, "Planes y precios", "Plans and pricing", "sh-link", `href="${SPACE_FILE[s.id]}#planes"`)}
                        ${t("a", `${s.id}_cta`, "Quiero ver este Space", "I want to see this Space", "sh-link", `href="contact.html?space=${s.id}" data-warp-click="hop"`)}
                    </div>
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

// --- Precios: fuente única content/pricing.json (USD) ------------------------------------------------
// Las cifras salen de ese archivo; los textos, como el resto, van a locales. Las piezas compartidas (tarjetas,
// comparación, calculadora de Edu) registran sus textos una sola vez bajo pages2.plans.
const PR = JSON.parse(readFileSync(join(root, "content", "pricing.json"), "utf8"));
const L = PR.limits;
/** Número con los separadores de cada idioma: 1.000 y 9,99 en español; 1,000 y 9.99 en inglés. */
const num = (n, lang = "es") => {
  const [i, d] = String(n).split(".");
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : ".");
  return d ? `${int}${lang === "en" ? "." : ","}${d.padEnd(2, "0")}` : int;
};
/** Precio mensual equivalente del pago anual (se pagan annualMonths meses por doce). */
const yearly = (p) => Math.round((p * PR.annualMonths) / 12);
const shared = (fn) => { const prev = page; page = "plans"; const out = fn(); page = prev; return out; };

// Spaces en el orden de la página de precios, con su nombre corto
const PSPACES = [
  ["agencias", "Agencias", "Agencies"], ["tiendas", "Tiendas", "Stores"], ["inmobiliaria", "Inmobiliaria", "Real estate"],
  ["saas", "Startups (SaaS)", "Startups (SaaS)"], ["resto", "Restaurantes", "Restaurants"], ["edu", "Edu", "Edu"],
];
const LEVEL_NAMES = [["Esencial", "Essential"], ["Pro", "Pro"], ["Total", "Total"]];
const LEVEL_PHRASE = [
  ["Para negocios que arrancan a atender con IA.", "For businesses starting to serve with AI."],
  ["Para equipos que venden y atienden todos los días.", "For teams that sell and serve every day."],
  ["Para operaciones con varias sedes o equipos grandes.", "For operations with several locations or large teams."],
];
const SUPPORT = { help: ["Centro de ayuda", "Help center"], chat: ["Soporte por chat", "Chat support"], priority: ["Soporte prioritario", "Priority support"] };
// Lo que traen todos los Spaces y lo que suma cada uno (confirmar con el catálogo de producción antes de cambiarlo)
const ALL_INCLUDE = [
  ["Bandeja de WhatsApp, Instagram y Messenger con agente de IA", "WhatsApp, Instagram and Messenger inbox with an AI agent"],
  ["CRM con embudo de ventas", "CRM with a sales pipeline"],
  ["Pixy Social: responde comentarios y mensajes en redes solo", "Pixy Social: replies to comments and messages on social media by itself"],
  ["Automatizaciones", "Automations"],
  ["Centro de ayuda", "Help center"],
];
const INCLUDES = {
  agencias: [["Cotizaciones", "Quotes"], ["Facturación y cartera", "Invoicing and receivables"], ["Contratos de clientes", "Client contracts"], ["Gestión de hosting", "Hosting management"], ["Briefings", "Briefs"], ["Servicios", "Services"], ["Catálogo (opcional)", "Catalog (optional)"]],
  tiendas: [["Catálogo y pedidos de la tienda", "Store catalog and orders"], ["Varias sedes", "Multiple locations"], ["Control de asistencia del equipo", "Team attendance tracking"], ["Cartera", "Receivables"], ["Informes del CRM", "CRM reports"], ["Monitor de anuncios de Meta", "Meta ads monitor"], ["Manifiestos IMEI (opcional)", "IMEI manifests (optional)"]],
  inmobiliaria: [["Catálogo de propiedades", "Property catalog"], ["Cotizaciones", "Quotes"], ["Arriendos y liquidaciones con propietarios", "Rentals and owner settlements"], ["Varias sedes", "Multiple locations"]],
  saas: [["Tareas y proyectos", "Tasks and projects"], ["Gestión de hosting", "Hosting management"], ["Catálogo", "Catalog"], ["Monitor de anuncios de Meta", "Meta ads monitor"]],
  resto: [["Menú digital", "Digital menu"], ["Pedidos", "Orders"], ["Mesas y salones", "Tables and floors"], ["Marketing, facturación y pagos (opcionales)", "Marketing, invoicing and payments (optional)"]],
  edu: [["Gestión académica", "Academic management"], ["Asistencia", "Attendance"], ["Cobros a familias", "Family billing"]],
};
const TRIAL = [`Prueba ${PR.trialDays} días gratis`, `Try it free for ${PR.trialDays} days`];
const TRIAL_LINE = [
  `Prueba Pixy ${PR.trialDays} días gratis, sin tarjeta. Conecta tu WhatsApp y mira a la IA atender a tus clientes desde el primer día.`,
  `Try Pixy free for ${PR.trialDays} days, no card needed. Connect your WhatsApp and watch the AI serve your customers from day one.`,
];
const trialLink = (cls) => t("a", "trial", TRIAL[0], TRIAL[1], cls, `href="${PR.trialUrl}" rel="noopener"`);

/** Datos que lee js/spaces-pages.js para cambiar de Space, de forma de pago y la calculadora de Edu. */
const pricingData = () => `
    <script type="application/json" id="pixy-pricing">${JSON.stringify({
      annualMonths: PR.annualMonths,
      spaces: PR.spaces,
      names: { es: LEVEL_NAMES.map((n) => n[0]), en: LEVEL_NAMES.map((n) => n[1]) },
      calc: {
        es: { inc: "Incluye {n} estudiantes activos.", extra: "Incluye {n} estudiantes activos y {k} × 100 estudiantes más ({x} USD al mes)." },
        en: { inc: "Includes {n} active students.", extra: "Includes {n} active students and {k} × 100 more students ({x} USD a month)." },
      },
    })}</script>`;

const billingToggle = () => shared(() => `<div class="pr-seg" role="group" aria-label="Forma de pago">${t("button", "b_m", "Mensual", "Monthly", "", 'type="button" data-billing-set="m" aria-pressed="true"')}${t("button", "b_y", "Anual: dos meses gratis", "Annual: two months free", "", 'type="button" data-billing-set="y" aria-pressed="false"')}</div>`);

/** Tarjeta de un nivel con su precio; los cupos de Edu (por sede, estudiantes, docentes) se muestran solo en Edu. */
function priceCard(i, sp) {
  const s = PR.spaces[sp];
  const n = (x) => [num(x), num(x, "en")];
  const keys = [
    [`k_users${i}`, ...n(L.panelUsers[i]).map((x, l) => `${x} ${l ? "panel users" : "usuarios del panel"}`)],
    [`k_staff${i}`, ...n(L.portalStaff[i]).map((x, l) => `${x} ${l ? "team members on portals" : "personas del equipo en portales"}`), "pr-noedu"],
    [`k_teach${i}`, ...n(L.portalStaff[i]).map((x, l) => `${x} ${l ? "teachers on the teacher portal" : "docentes en el portal docente"}`), "pr-edu"],
    [`k_students${i}`, ...n(PR.spaces.edu.students[i]).map((x, l) => `${x} ${l ? "active students" : "estudiantes activos"}`), "pr-edu"],
    [`k_ai${i}`, ...n(L.aiReplies[i]).map((x, l) => `${x} ${l ? "AI replies a month" : "Respuestas de IA al mes"}`)],
    [`k_wa${i}`, ...n(L.waTemplates[i]).map((x, l) => `${x} ${l ? "WhatsApp template messages a month" : "mensajes de WhatsApp de plantilla al mes"}`)],
    [`k_social${i}`, ...n(L.socialActions[i]).map((x, l) => `${x} ${l ? "automatic social actions a month" : "acciones automáticas en redes al mes"}`)],
    ...(L.brand[i] ? [["k_brand", "Tu marca, sin «Pixy» para tus clientes", "Your brand, no “Pixy” for your customers"]] : []),
    ...(L.mode3d[i] ? [["k_3d", "Modo 3D: tu negocio como una ciudad viva", "3D Mode: your business as a living city"]] : []),
    [`k_support_${L.support[i]}`, ...SUPPORT[L.support[i]]],
  ];
  return shared(() => `
                <article class="pr-card${i === 1 ? " is-featured" : ""}" data-level="${i}">
                    ${t("h3", `l${i}`, LEVEL_NAMES[i][0], LEVEL_NAMES[i][1], "sh-h3l")}
                    ${t("p", `l${i}_p`, LEVEL_PHRASE[i][0], LEVEL_PHRASE[i][1], "sh-small")}
                    <p class="pr-price"><span class="pr-amount" data-amount="${i}">${num(s.prices[i])}</span><span class="pr-unit">${t("span", "u_m", "USD al mes", "USD a month", "pr-noedu")}${t("span", "u_site", "USD al mes por sede", "USD a month per campus", "pr-edu")}</span></p>
                    <p class="sh-small pr-bill">${t("span", "bill_m", "Pago mensual", "Billed monthly", "pr-m")}<span class="pr-y"><span data-total="${i}">${num(s.prices[i] * PR.annualMonths)}</span> ${t("span", "bill_y", "USD al año: dos meses gratis", "USD a year: two months free")}</span></p>
                    <ul class="pr-keys">${keys.map(([k, es, en, cls = ""]) => t("li", k, es, en, cls)).join("")}</ul>
                    ${trialLink(i === 1 ? "btn-neon" : "sh-link")}
                </article>`);
}

/** Lo que traen todos los Spaces y lo que suma cada uno; en precios se muestra el Space elegido. */
const includes = (only) => shared(() => `
            <div class="pr-inc-grid">
                <div>
                    ${t("h3", "inc_all", "Todos los Spaces traen", "Every Space includes", "sh-h3")}
                    <ul class="pr-inc-list">${ALL_INCLUDE.map(([es, en], k) => t("li", `inc_all_${k}`, es, en)).join("")}</ul>
                </div>
${PSPACES.filter(([id]) => !only || id === only)
  .map(([id, es, en]) => `                <div data-includes="${id}"${!only && id !== "agencias" ? " hidden" : ""}>
                    ${t("h3", `inc_${id}_t`, `Además, en ${es}`, `Plus, in ${en}`, "sh-h3")}
                    <ul class="pr-inc-list">${INCLUDES[id].map(([des, den], k) => t("li", `inc_${id}_${k}`, des, den)).join("")}</ul>
                </div>`)
  .join(EOL)}
            </div>`);

/** Calculadora de Edu: estudiantes activos → nivel sugerido y precio por sede. */
const calcBlock = () => shared(() => `
            <div class="pr-calc pr-edu" data-calc>
                <label>${t("span", "calc_l", "¿Cuántos estudiantes activos tiene tu sede?", "How many active students does your campus have?")}<input type="number" min="1" max="100000" step="1" value="450" inputmode="numeric"></label>
                <div>
                    ${t("p", "calc_s", "Nivel sugerido", "Suggested tier", "sh-small")}
                    <p class="pr-calc-out"><strong data-calc-level>Pro</strong> · <span data-calc-price>${num(PR.spaces.edu.prices[1])}</span> ${t("span", "u_site", "USD al mes por sede", "USD a month per campus")}</p>
                    <p class="sh-small" data-calc-note>Incluye ${num(PR.spaces.edu.students[1])} estudiantes activos.</p>
                </div>
            </div>`);

// Comparación: una fila por cupo; la columna Empresa va a la medida
const CUSTOM = ["A la medida", "Custom"];
const per = (x) => [`${num(x)} USD/mes`, `${num(x, "en")} USD/mo`];
const nums = (arr) => arr.map((x) => [num(x), num(x, "en")]);
const COMPARE = [
  ["r_users", ["Usuarios del panel", "Panel users"], nums(L.panelUsers), CUSTOM],
  ["r_staff", ["Equipo en portales", "Team on portals"], nums(L.portalStaff), CUSTOM, "pr-noedu"],
  ["r_teach", ["Docentes en el portal docente", "Teachers on the teacher portal"], nums(L.portalStaff), CUSTOM, "pr-edu"],
  ["r_students", ["Estudiantes activos incluidos", "Active students included"], nums(PR.spaces.edu.students), CUSTOM, "pr-edu"],
  ["r_families", ["Familias", "Families"], [0, 1, 2].map(() => ["Sin límite", "Unlimited"]), ["Sin límite", "Unlimited"], "pr-edu"],
  ["r_ai", ["Respuestas de IA al mes", "AI replies a month"], nums(L.aiReplies), CUSTOM],
  ["r_wa", ["Mensajes de WhatsApp de plantilla al mes", "WhatsApp template messages a month"], nums(L.waTemplates), CUSTOM],
  ["r_social", ["Acciones automáticas en redes al mes", "Automatic social actions a month"], nums(L.socialActions), CUSTOM],
  ["r_brand", ["Tu marca (logo y colores, sin «Pixy» para tus clientes)", "Your brand (logo and colors, no “Pixy” for your customers)"], L.brand.map((b) => (b ? ["Incluida", "Included"] : ["—", "—"])), ["Incluida", "Included"]],
  ["r_3d", ["Modo 3D (tu negocio como una ciudad viva)", "3D Mode (your business as a living city)"], L.mode3d.map((b) => (b ? ["Incluido", "Included"] : ["—", "—"])), ["Incluido", "Included"]],
  ["r_support", ["Soporte", "Support"], L.support.map((s) => SUPPORT[s]), ["Dedicado, con tiempos de respuesta garantizados", "Dedicated, with guaranteed response times"]],
  ["r_extra_user", ["Usuario adicional del panel", "Extra panel user"], [0, 1, 2].map(() => per(PR.extraPanelUser)), CUSTOM],
  ["r_extra_staff", ["10 personas más en portales", "10 more people on portals"], [0, 1, 2].map(() => per(PR.extraPortal10)), CUSTOM, "pr-noedu"],
  ["r_extra_students", ["100 estudiantes más", "100 more students"], [0, 1, 2].map(() => per(PR.spaces.edu.extraStudents100)), CUSTOM, "pr-edu"],
  ["r_impl", ["Implementación (opcional, pago único)", "Setup (optional, one-time)"], PR.implementation.map((x) => [`${num(x)} USD`, `${num(x, "en")} USD`]), CUSTOM],
];
const cell = (k, [es, en]) => (es === en ? `<td>${es}</td>` : `<td>${t("span", k, es, en)}</td>`);
const ADDON_NAMES = {
  portal10: ["10 personas más en portales", "10 more people on portals"],
  students100: ["100 estudiantes más (Edu)", "100 more students (Edu)"],
  ai1000: ["1.000 Respuestas de IA", "1,000 AI replies"],
  ai5000: ["5.000 Respuestas de IA", "5,000 AI replies"],
  wa1000: ["1.000 mensajes de WhatsApp de plantilla", "1,000 WhatsApp template messages"],
  social500: ["500 acciones automáticas en redes", "500 automatic social actions"],
  contracts: ["Generador de contratos", "Contract generator"],
  imei: ["Manifiestos IMEI", "IMEI manifests"],
  adsMonitor: ["Monitor de anuncios de Meta", "Meta ads monitor"],
  email: ["Motor de correos", "Email engine"],
  whitelabel: ["Marca blanca total (cero Pixy, tu dominio)", "Full white label (zero Pixy, your domain)"],
};
const ADDONS = [{ id: "panelUser", price: PR.extraPanelUser }, ...PR.addons];
ADDON_NAMES.panelUser = ["Usuario adicional del panel", "Extra panel user"];
const FAQ = [
  ["¿Qué es una Respuesta de IA?", "What is an AI reply?", "Cada vez que la IA responde o redacta algo cuenta 1. Un audio cuenta 1 por minuto, una imagen creada cuenta 5 y un contrato completo cuenta 3. La ayuda de Pixy no cuenta, y cuando la IA decide que un mensaje no necesita respuesta, tampoco.", "Every time the AI replies or drafts something counts as 1. Audio counts 1 per minute, a generated image counts 5 and a full contract counts 3. Pixy's help doesn't count, and neither does a message the AI decides needs no reply."],
  ["¿Qué pasa si se acaba mi bolsa?", "What happens if I run out?", "Te avisamos al 80 % y al 100 %. Puedes sumar un paquete de Respuestas de IA o subir de nivel cuando quieras. Si se acaba la bolsa de IA, lo último que se apaga es el agente que atiende a tus clientes.", "We let you know at 80% and at 100%. You can add an AI reply pack or move up a tier whenever you want. If your AI allowance runs out, the agent that serves your customers is the last thing to switch off."],
  ["¿Cómo funciona la prueba gratis?", "How does the free trial work?", `Son ${PR.trialDays} días gratis, sin tarjeta, con todo el nivel Pro. Para que la IA responda a tus clientes reales te pedimos una tarjeta, sin cobrar nada hasta el día ${PR.trialDays + 1}. Si conectas tu WhatsApp y cargas la información de tu negocio, ganas 7 días más.`, `It's ${PR.trialDays} days free, no card needed, with the full Pro tier. For the AI to reply to your real customers we ask for a card, with no charge until day ${PR.trialDays + 1}. If you connect your WhatsApp and load your business information, you get 7 more days.`],
  ["¿Puedo cambiar de nivel?", "Can I change tiers?", "Sí. Subes o bajas de nivel con un clic desde tu cuenta, cuando lo necesites.", "Yes. Move up or down a tier in one click from your account, whenever you need to."],
  ["¿Cómo funciona el pago anual?", "How does annual billing work?", `Pagas ${PR.annualMonths} meses y usas 12: dos meses gratis.`, `You pay for ${PR.annualMonths} months and use 12: two months free.`],
  ["¿WhatsApp cobra aparte?", "Does WhatsApp charge separately?", "Sí. WhatsApp cobra aparte su tarifa por conversación. En tu plan solo cuentan los mensajes de plantilla que tu negocio inicia, como campañas y recordatorios; responder a un cliente que te escribió no cuenta.", "Yes. WhatsApp charges its own per-conversation fee. Your plan only counts the template messages your business starts, such as campaigns and reminders; replying to a customer who wrote to you doesn't count."],
];

// pricing.html: Space, forma de pago, niveles, comparación, consumo, implementación, complementos y preguntas
page = "pricing";
pages.push({
  file: "pricing.html",
  title: "Planes | Pixy",
  description: "Esencial, Pro y Total para cada Space, con IA incluida y 14 días gratis.",
  navActive: "plans",
  body:
    `
    <div class="pr-scope" data-space="agencias" data-billing="m">` +
    hero(
      t("h1", "h1", "Atender con IA no debería costar lo mismo que <span class=\"sh-accent\">contratar a otra persona.</span>", "Serving with AI shouldn't cost the same as <span class=\"sh-accent\">hiring another person.</span>", "sh-h1"),
      `<p class="sh-body sp-sub">${t("span", "from", "Pixy desde", "Pixy from")} <span data-amount="0">${num(PR.spaces.agencias.prices[0])}</span> ${t("span", "from_u", "USD al mes.", "USD a month.")} ${t("span", "trial_l", TRIAL_LINE[0], TRIAL_LINE[1])}</p>`,
    ) +
    `
    <section class="sh-section pr-levels" data-no-reveal>
        <div class="container">
            <div class="pr-controls">
                <div class="pr-seg pr-spaces" role="group" aria-label="Space">${PSPACES.map(([id, es, en]) => t("button", `s_${id}`, es, en, "", `type="button" data-space-set="${id}" aria-pressed="${id === "agencias"}"`)).join("")}</div>
                ${billingToggle()}
            </div>
            <div class="pr-cards">${[0, 1, 2].map((i) => priceCard(i, "agencias")).join("")}
                <article class="pr-card" data-level="3">
                    ${t("h3", "e", "Empresa", "Enterprise", "sh-h3l")}
                    ${t("p", "e_p", "Para empresas con varias sedes y mucho volumen.", "For companies with several locations and high volume.", "sh-small")}
                    <p class="pr-price">${t("span", "e_talk", "Hablemos", "Let's talk", "pr-amount pr-talk")}</p>
                    ${t("p", "e_bill", "A la medida de tu operación", "Shaped around your operation", "sh-small pr-bill")}
                    <ul class="pr-keys">${[
                      ["Usuarios y bolsas a la medida", "Custom users and allowances"],
                      ["Acompañamiento dedicado", "Dedicated guidance"],
                      ["Tiempos de respuesta garantizados", "Guaranteed response times"],
                      ["Varias sedes", "Multiple locations"],
                    ].map(([es, en], k) => t("li", `e_k${k}`, es, en)).join("")}</ul>
                    ${t("a", "e_cta", "Hablemos", "Let's talk", "sh-link", 'href="contact.html?plan=empresa" data-warp-click="hop"')}
                </article>
            </div>
${calcBlock()}
${includes()}
        </div>
    </section>

    <section class="sh-section">
        <div class="container">
            <div class="sh-head">
                ${t("h2", "cmp_t", "Compara los niveles.", "Compare the tiers.", "sh-h2")}
                ${t("p", "cmp_i", "Los mismos cupos en todos los Spaces. En Edu, el precio es por sede e incluye estudiantes activos.", "The same allowances in every Space. In Edu, the price is per campus and includes active students.", "sh-body")}
            </div>
            <div class="pr-seg pr-table-tabs" role="group" aria-label="Nivel">${[...LEVEL_NAMES, ["Empresa", "Enterprise"]].map(([es, en], i) => t("button", `tab${i}`, es, en, "", `type="button" data-level-set="${i}" aria-pressed="${i === 1}"`)).join("")}</div>
            <div class="sp-table-wrap">
                <table class="sp-table pr-table" data-level="1">
                    <thead><tr><th></th>${[...LEVEL_NAMES, ["Empresa", "Enterprise"]].map(([es, en], i) => `<th>${t("span", `th${i}`, es, en)}</th>`).join("")}</tr></thead>
                    <tbody>
${COMPARE.map(
  ([k, label, cells, ent, cls]) =>
    `                        <tr${cls ? ` class="${cls}"` : ""}>${t("th", k, label[0], label[1], "", 'scope="row"')}${cells.map((c, i) => cell(`${k}_${i}`, c)).join("")}${cell(`${k}_e`, ent)}</tr>`,
).join(EOL)}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
` +
    split("who", "Quién cuenta como usuario.", "Who counts as a user.", "Tus clientes nunca se cobran.", "Your customers are never charged for.", [
      ["Usuarios del panel", "Panel users", "Quienes administran el negocio en Pixy con su correo: dueño, administradores y asesores.", "The people who run the business in Pixy with their email: owner, admins and agents."],
      ["Equipo en portales", "Team on portals", "Quienes entran con un enlace o un PIN a una vista sencilla para su trabajo: meseros, cajeros, colaboradores de tareas, personal que marca asistencia y docentes. Tienen su propio cupo, mucho más amplio.", "The people who sign in with a link or PIN to a simple view for their work: waiters, cashiers, task collaborators, staff who clock in and teachers. They have their own, much larger allowance."],
      ["Tus clientes", "Your customers", "Contactos, clientes, estudiantes, familias o comensales nunca cuentan como usuarios.", "Contacts, customers, students, families or diners never count as users."],
    ]) +
    split("use", "Qué se consume.", "What gets used.", "Cada nivel trae una bolsa mensual. Te avisamos al 80 % y al 100 %.", "Each tier comes with a monthly allowance. We let you know at 80% and at 100%.", [
      ["Respuestas de IA", "AI replies", "Cada vez que la IA responde o redacta algo cuenta 1. Un audio cuenta 1 por minuto, una imagen creada 5 y un contrato completo 3. La ayuda de Pixy no cuenta, ni los mensajes que la IA decide no responder.", "Every time the AI replies or drafts something counts as 1. Audio counts 1 per minute, a generated image 5 and a full contract 3. Pixy's help doesn't count, nor do messages the AI decides not to answer."],
      ["WhatsApp de plantilla", "WhatsApp templates", "Cada mensaje que tu negocio inicia, como campañas y recordatorios. Responder a un cliente que te escribió no cuenta. WhatsApp cobra aparte su tarifa por conversación.", "Every message your business starts, such as campaigns and reminders. Replying to a customer who wrote to you doesn't count. WhatsApp charges its own per-conversation fee."],
      ["Acciones automáticas en redes", "Automatic social actions", "Cada respuesta, mensaje privado, cotización, pedido o enlace de pago que Pixy Social hace solo.", "Every reply, private message, quote, order or payment link Pixy Social sends by itself."],
      ["Si se acaba la bolsa", "If the allowance runs out", "Lo último que se apaga es el agente que atiende a tus clientes. Puedes sumar un paquete o subir de nivel cuando quieras.", "The agent that serves your customers is the last thing to switch off. You can add a pack or move up a tier whenever you want."],
    ]) +
    split("impl", "Te lo dejamos funcionando.", "We leave it up and running.", "Pago único y opcional: conectamos tus canales, cargamos la información de tu negocio para la IA, configuramos tu embudo y capacitamos a tu equipo.", "Optional one-time payment: we connect your channels, load your business information for the AI, set up your pipeline and train your team.", PR.implementation.map((x, i) => [LEVEL_NAMES[i][0], LEVEL_NAMES[i][1], `${num(x)} USD, pago único.`, `${num(x, "en")} USD, one-time.`])) +
    `
    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", "addons_t", "Suma solo lo que necesitas.", "Add only what you need.", "sh-h2")}
                ${t("p", "addons_i", "Complementos mensuales para cualquier nivel.", "Monthly add-ons for any tier.", "sh-body")}
            </div>
            <dl class="pr-addons">${ADDONS.map((a) => `<div>${t("dt", `a_${a.id}`, ADDON_NAMES[a.id][0], ADDON_NAMES[a.id][1])}${t("dd", `a_${a.id}_p`, `${num(a.price)} USD al mes`, `${num(a.price, "en")} USD a month`)}</div>`).join("")}</dl>
        </div>
    </section>

    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">${t("h2", "faq_t", "Preguntas frecuentes.", "Frequently asked questions.", "sh-h2")}</div>
            <div class="pr-faq">${FAQ.map(([q, qe, a, ae], i) => `<details class="pr-faq-item">${t("summary", `faq_q${i}`, q, qe)}${t("p", `faq_a${i}`, a, ae, "sh-body")}</details>`).join("")}</div>
        </div>
    </section>

    <section class="sh-section">
        <div class="container sh-split">
            <div>${t("h2", "partner_t", "¿Tienes una agencia? Vende IA con tu marca.", "Run an agency? Sell AI under your brand.", "sh-h2")}</div>
            <div>
                ${t("p", "partner_d", "Con el programa de partners ofreces Pixy a tus clientes con tu marca, a tu precio y con tu implementación.", "With the partner program you offer Pixy to your clients under your brand, at your price and with your own setup.", "sh-body sh-lead")}
                ${t("a", "partner_l", "Conocer el programa de partners", "Explore the partner program", "sh-link", 'href="partners.html"')}
            </div>
        </div>
    </section>

    <section class="sh-section sh-final">
        <div class="container">
            ${t("h2", "close_t", "Empieza hoy. <span class=\"sh-accent\">La IA atiende desde el primer día.</span>", "Start today. <span class=\"sh-accent\">The AI serves from day one.</span>", "sh-h2")}
            ${t("p", "close_s", `${PR.trialDays} días gratis, sin tarjeta.`, `${PR.trialDays} days free, no card needed.`, "sh-body")}
            <div class="sp-actions pr-final-actions">${trialLink("btn-neon")}${t("a", "close_demo", "Agenda tu demo", "Book a demo", "sh-link", 'href="contact.html" data-warp-click="departure"')}</div>
        </div>
    </section>
    </div>` +
    pricingData(),
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
      ["IA incluida", "AI included", "Sin configurar nada, con una bolsa mensual y avisos al 80 % y al 100 %.", "Nothing to configure, with a monthly allowance and alerts at 80% and 100%."],
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
            <form class="sp-form" data-mailto="contact@pixy.com.co" data-subject-es="Demo de Pixy" data-subject-en="Pixy demo" data-form-es="Demo" data-form-en="Demo">
                <label>${t("span", "f_name", "Nombre", "Name")}<input name="name" required autocomplete="name"></label>
                <label>${t("span", "f_company", "Empresa", "Company")}<input name="company" autocomplete="organization"></label>
                <label>${t("span", "f_email", "Email", "Email")}<input name="email" type="email" required autocomplete="email"></label>
                <label>${t("span", "f_space", "Tu industria", "Your industry")}<select name="space">
                    ${SPACES.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}
                    ${t("option", "f_other", "Otra", "Other", "", 'value="otra"')}
                </select></label>
                <input type="hidden" name="plan">
                <label class="sp-wide">${t("span", "f_msg", "Cuéntanos de tu negocio", "Tell us about your business")}<textarea name="message" rows="5"></textarea></label>
                ${consentBlock(t, { purposeEs: "responder tu solicitud, agendar la demo y hacerle seguimiento", purposeEn: "answer your request, schedule the demo and follow up", dataEs: "tu nombre, correo, empresa y mensaje", dataEn: "your name, email, company and message" })}
                ${t("button", "f_send", "Agendar mi demo", "Book my demo", "btn-neon sp-wide", 'type="submit"')}
                ${t("p", "f_note", MAILTO_NOTE[0], MAILTO_NOTE[1], "sh-small sp-wide")}
            </form>
        </div>
    </section>
`,
});

// partners.html: programa de partners. Sin precios, porcentajes ni cifras: las condiciones van en privado
page = "partners";
pages.push({
  file: "partners.html",
  title: "Partners | Pixy",
  description: "Vende IA para atender clientes con tu marca, a tu precio y con tu implementación.",
  navActive: "plans",
  body:
    hero(
      t("h1", "h1", "Vende IA para atender clientes <span class=\"sh-accent\">con tu marca.</span>", "Sell AI that serves customers <span class=\"sh-accent\">under your brand.</span>", "sh-h1"),
      t("p", "sub", "A tu precio y con tu implementación. El programa de partners de Pixy es para agencias y consultores que quieren ofrecer Pixy a sus clientes como propio.", "At your price and with your own setup. Pixy's partner program is for agencies and consultants who want to offer Pixy to their clients as their own.", "sh-body sp-sub"),
      t("a", "cta", "Quiero ser partner", "I want to be a partner", "btn-neon", 'href="#partner-form" data-warp-click="nudge"'),
    ) +
    split("what", "Lo que recibes.", "What you get.", "", "", [
      ["Pixy con tu marca", "Pixy under your brand", "Sin rastro de Pixy y con tu dominio: tus clientes ven tu marca en la plataforma y en los portales.", "No trace of Pixy and on your domain: your clients see your brand in the platform and portals."],
      ["Panel para tus clientes", "A panel for your clients", "Creas y manejas las cuentas de tus clientes desde tu propio panel.", "Create and manage your clients' accounts from your own panel."],
      ["Cuentas de demostración", "Demo accounts", "Para mostrar Pixy funcionando antes de cerrar cada venta.", "To show Pixy working before you close each sale."],
      ["Soporte prioritario", "Priority support", "Te respondemos primero, a ti y a tu equipo.", "We answer you and your team first."],
    ]) +
    split("earn", "Dos formas de ganar.", "Two ways to earn.", "Eliges la que le sirve a tu negocio.", "Choose the one that suits your business.", [
      ["Recomendar", "Refer", "Recomiendas Pixy, nosotros le cobramos a tu cliente y tú ganas una comisión cada mes.", "You recommend Pixy, we bill your client and you earn a commission every month."],
      ["Revender", "Resell", "Compras con precio preferencial, pones tu propio precio y le cobras a tu cliente con tu marca.", "You buy at a preferred price, set your own price and bill your client under your brand."],
    ]) +
    split("how", "Cómo entrar.", "How to join.", "", "", [
      ["Aplica", "Apply", "Cuéntanos de tu empresa con el formulario.", "Tell us about your company with the form."],
      ["Revisamos tu solicitud", "We review your application", "Te escribimos para conocer tu negocio y tus clientes.", "We reach out to learn about your business and your clients."],
      ["Recibes las condiciones", "You get the terms", "Cada partner aprobado recibe sus condiciones en privado.", "Each approved partner receives their terms privately."],
    ]) +
    `
    <section class="sh-section" id="partner-form">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", "form_t", "Quiero ser <span class=\"sh-accent\">partner.</span>", "I want to be a <span class=\"sh-accent\">partner.</span>", "sh-h2")}
                ${t("p", "form_i", "Te respondemos con los siguientes pasos.", "We'll reply with the next steps.", "sh-body")}
            </div>
            <form class="sp-form" data-mailto="contact@pixy.com.co" data-subject-es="Programa de partners de Pixy" data-subject-en="Pixy partner program" data-form-es="Partners" data-form-en="Partners">
                <label>${t("span", "f_name", "Nombre", "Name")}<input name="name" required autocomplete="name"></label>
                <label>${t("span", "f_company", "Empresa", "Company")}<input name="company" required autocomplete="organization"></label>
                <label>${t("span", "f_email", "Email", "Email")}<input name="email" type="email" required autocomplete="email"></label>
                <label>${t("span", "f_country", "País", "Country")}<input name="country" required autocomplete="country-name"></label>
                <label>${t("span", "f_clients", "¿Cuántos clientes atiendes?", "How many clients do you serve?")}<input name="clients" type="number" min="0" step="1" inputmode="numeric"></label>
                <label>${t("span", "f_web", "Sitio web", "Website")}<input name="website" type="url" placeholder="https://"></label>
                ${consentBlock(t, { purposeEs: "evaluar tu solicitud al programa de partners, responderte y hacerle seguimiento", purposeEn: "review your partner program application, reply to you and follow up", dataEs: "tu nombre, correo, empresa, país, número de clientes y sitio web", dataEn: "your name, email, company, country, number of clients and website" })}
                ${t("button", "f_send", "Quiero ser partner", "I want to be a partner", "btn-neon sp-wide", 'type="submit"')}
                ${t("p", "f_note", MAILTO_NOTE[0], MAILTO_NOTE[1], "sh-small sp-wide")}
            </form>
        </div>
    </section>
`,
});

// Ficha de cada Space: modelo en cromo, módulos, planes con precio y, en Edu, la calculadora por estudiantes
const SPACE_PAGES = {
  agencias: {
    page: "agency", title: "Space Agencias | Pixy", description: "Clientes, proyectos, cobros y resultados, conectados. El Space para agencias y servicios profesionales.",
    h2: ["Todo lo de tu agencia, en un Space.", "Everything your agency runs, in one Space."],
    mods: [
      ["Proyectos y tareas", "Projects and tasks", "Tablero, calendario, reuniones y ritmo semanal.", "Board, calendar, meetings and a weekly rhythm."],
      ["Portal de colaboradores", "Collaborator portal", "Tus freelancers trabajan con su PIN, sin ver lo que no les toca.", "Your freelancers work with their PIN, without seeing what isn't theirs."],
      ["Briefings", "Briefs", "Con un enlace público para que el cliente responda.", "With a public link for the client to answer."],
      ["Servicios recurrentes", "Recurring services", "Facturación y cobro automático cada mes.", "Automatic invoicing and billing every month."],
      ["Contratos", "Contracts", "Generador de contratos para cada cliente.", "A contract generator for every client."],
      ["Hosting web", "Web hosting", "Cuentas, dominios y renovaciones de tus clientes.", "Your clients' accounts, domains and renewals."],
      ["Portal del cliente", "Client portal", "Facturas pagables, cotizaciones, servicios y briefings, con tu marca.", "Payable invoices, quotes, services and briefs, under your brand."],
      ["Informe de Pixy Social", "Pixy Social report", "Muestra a cada cliente cuánto vendieron sus publicaciones.", "Show each client how much their posts sold."],
    ],
    close: ["Tu agencia, <span class=\"sh-accent\">en piloto automático.</span>", "Your agency, <span class=\"sh-accent\">on autopilot.</span>"],
    partner: true,
  },
  resto: {
    page: "space_resto", title: "Space Resto | Pixy", description: "Menú digital, pedidos desde la mesa, cocina y caja conectados, con IA que atiende por WhatsApp.",
    h2: ["Tu restaurante, de la mesa a la caja.", "Your restaurant, from table to checkout."],
    close: ["Tu restaurante, <span class=\"sh-accent\">sin comandas perdidas.</span>", "Your restaurant, <span class=\"sh-accent\">with no lost orders.</span>"],
  },
  tiendas: {
    page: "space_tiendas", title: "Space Tiendas | Pixy", description: "Tu tienda en línea desde tu catálogo y cada comentario convertido en venta, con IA que atiende.",
    h2: ["Tu tienda, del comentario al pago.", "Your store, from comment to payment."],
    close: ["Tu tienda, <span class=\"sh-accent\">vendiendo mientras duermes.</span>", "Your store, <span class=\"sh-accent\">selling while you sleep.</span>"],
  },
  inmobiliaria: {
    page: "space_inmobiliaria", title: "Space Inmobiliaria | Pixy", description: "Inventario publicado con tu marca, arriendos y liquidaciones a propietarios, con IA que atiende.",
    h2: ["Tu inmobiliaria, del inventario a la liquidación.", "Your brokerage, from listings to settlements."],
    close: ["Tus arriendos, <span class=\"sh-accent\">liquidados en un clic.</span>", "Your rentals, <span class=\"sh-accent\">settled in one click.</span>"],
  },
  edu: {
    page: "space_edu", title: "Pixy Edu | Pixy", description: "Académico, familias, convivencia y pensiones en una plataforma para tu colegio, con precio por sede.",
    h2: ["Tu colegio, de la matrícula al boletín.", "Your school, from enrollment to report card."],
    close: ["Tu colegio, <span class=\"sh-accent\">conectado con cada familia.</span>", "Your school, <span class=\"sh-accent\">connected with every family.</span>"],
  },
  saas: {
    page: "space_saas", title: "Space SaaS | Pixy", description: "Usuarios, planes, cobro recurrente y soporte de tu software, conectados y atendidos con IA.",
    h2: ["Tu software, del registro a la renovación.", "Your software, from sign-up to renewal."],
    close: ["Tu software, <span class=\"sh-accent\">con soporte que no duerme.</span>", "Your software, <span class=\"sh-accent\">with support that never sleeps.</span>"],
  },
};

for (const s of SPACES) {
  const sp = SPACE_PAGES[s.id];
  page = sp.page;
  pages.push({
    file: SPACE_FILE[s.id],
    title: sp.title,
    description: sp.description,
    navActive: "spaces",
    body: `
    <section class="sh-section sp-hero sp-space-hero" data-no-reveal>
        <div class="container sp-catalog-grid">
            <div>
                <h1 class="sh-h1">${s.name}</h1>
                ${t("p", "sub", s.p[0], s.p[1], "sh-body sp-sub")}
                <div class="sp-actions">
                    ${t("a", "cta", "Quiero ver este Space", "I want to see this Space", "btn-neon", `href="contact.html?space=${s.id}" data-warp-click="hop"`)}
                    ${t("a", "cta2", "Ver planes", "See plans", "sh-link", 'href="#planes"')}
                </div>
            </div>
            <div class="sp-model-col" aria-hidden="true"><div class="sp-model" data-model="${s.model}" data-accent="${s.accent}"></div></div>
        </div>
    </section>
` +
      split("mods", sp.h2[0], sp.h2[1], "Además del núcleo de Pixy: bandeja, IA, pipeline y cobros.", "On top of the Pixy core: inbox, AI, pipeline and billing.", sp.mods ?? s.mods) +
      `
    <section class="sh-section pr-scope" id="planes" data-space="${s.id}" data-billing="m" data-fixed>
        <div class="container">
            <div class="pr-head">
                <div>
                    ${t("h2", "plans_t", `Planes de ${s.name}`, `${s.name} plans`, "sh-h2")}
                    ${shared(() => t("p", "trial_l", TRIAL_LINE[0], TRIAL_LINE[1], "sh-body"))}
                </div>
                ${billingToggle()}
            </div>
            <div class="pr-cards pr-cards-3">${[0, 1, 2].map((i) => priceCard(i, s.id)).join("")}
            </div>
${s.id === "edu" ? calcBlock() : ""}
${includes(s.id)}
            <div class="sp-actions">
                ${shared(() => t("a", "compare", "Comparar niveles y complementos", "Compare tiers and add-ons", "sh-link", `href="pricing.html?space=${s.id}"`))}
                ${shared(() => t("a", "e_more", "¿Varias sedes y mucho volumen? Plan Empresa", "Several locations and high volume? Enterprise plan", "sh-link", 'href="contact.html?plan=empresa"'))}
            </div>
        </div>
    </section>
` +
      (sp.partner
        ? `
    <section class="sh-section">
        <div class="container sh-split">
            <div>${t("h2", "partner_t", "Y si quieres, con tu marca.", "And, if you want, under your brand.", "sh-h2")}</div>
            <div>
                ${t("p", "partner_d", "Con el programa de partners vendes IA para atender clientes con tu marca, a tu precio y con tu implementación.", "With the partner program you sell AI that serves customers under your brand, at your price and with your own setup.", "sh-body sh-lead")}
                ${t("a", "partner_l", "Conocer el programa de partners", "Explore the partner program", "sh-link", 'href="partners.html"')}
            </div>
        </div>
    </section>
`
        : "") +
      close("close", sp.close[0], sp.close[1], `Te mostramos ${s.name} con los flujos de tu negocio.`, `We'll show you ${s.name} with your business's workflows.`) +
      pricingData(),
  });
}

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
