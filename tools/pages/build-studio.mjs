// Genera la cara Studio (la agencia creativa de Pixy) con el sistema de la cara Spaces.
// Fuente del contenido y la voz: docs/comercial/studio/ (servicios.md, identidad.md, sitio.md) del repositorio de Pixy.
// Reglas: sin precios publicados, sin cifras ni casos inventados, nunca «Pixy Agency».
// Uso: node tools/pages/build-studio.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { studioNav, studioFooter, withPageEnd, consentBlock, FORM_NOTE } from "./chrome.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const EOL = readFileSync(join(root, "index.html"), "utf8").includes("\r\n") ? "\r\n" : "\n";

// --- Textos ---------------------------------------------------------------------------------------
const I18N = { es: {}, en: {} };
const set = (obj, path, value) => {
  const parts = path.split(".");
  let o = obj;
  parts.slice(0, -1).forEach((p) => (o = o[p] ??= {}));
  o[parts.at(-1)] = value;
};
let page = "";
function t(tag, key, es, en, cls = "", attrs = "") {
  const k = `${page}.${key}`;
  set(I18N.es, k, es);
  set(I18N.en, k, en);
  return `<${tag}${cls ? ` class="${cls}"` : ""}${attrs ? ` ${attrs}` : ""} data-i18n="studio2.${k}">${es}</${tag}>`;
}

// --- Paquetes (docs/comercial/studio/servicios.md) ------------------------------------------------------
const P = [
  {
    id: "rayos-x", img: "rayos", act: ["Crea", "Create"], name: "Rayos X",
    hook: ["Te decimos qué frena a tu marca. En cinco días.", "We tell you what's holding your brand back. In five days."],
    who: ["Para marcas que sienten que algo no funciona y no saben por dónde empezar.", "For brands that feel something isn't working and don't know where to start."],
    get: [
      ["Revisión de tu marca, redes, web y tienda, del anuncio al pago.", "A review of your brand, social, website and store, from ad to payment."],
      ["Una compra fantasma: te escribimos como cliente y medimos qué pasa.", "A mystery purchase: we message you as a customer and see what happens."],
      ["Un video con el diagnóstico narrado y un plan de 90 días en una página.", "A narrated diagnosis video and a one-page 90-day plan."],
    ],
    time: ["5 días hábiles", "5 business days"],
  },
  {
    id: "debut", img: "debut", act: ["Crea", "Create"], name: "Debut",
    hook: ["Una marca que se ve grande desde el día uno.", "A brand that looks big from day one."],
    who: ["Para marcas que nacen, que lanzan algo nuevo o que se ven viejas (Debut Glow Up).", "For brands being born, launching something new or looking dated (Debut Glow Up)."],
    get: [
      ["Estrategia, personalidad y voz de tu marca.", "Your brand's strategy, personality and voice."],
      ["Logo y sistema visual completo, con renders 3D de tu marca.", "Logo and a full visual system, with 3D renders of your brand."],
      ["Manual de marca, kit de redes y kit de lanzamiento.", "Brand guidelines, a social kit and a launch kit."],
    ],
    time: ["4 a 6 semanas", "4 to 6 weeks"],
  },
  {
    id: "portada", img: "portada", act: ["Muéstrate", "Show up"], name: "Portada",
    hook: ["Una web que la gente comparte. Y que convierte.", "A website people share. And that converts."],
    who: ["Para marcas cuya web es un folleto viejo, una plantilla o todavía no existe.", "For brands whose website is an old brochure, a template, or doesn't exist yet."],
    get: [
      ["Recorrido y textos pensados para vender: escribimos, no solo diseñamos.", "A journey and copy built to sell: we write, not just design."],
      ["Diseño a la medida con animaciones al bajar y rápida en el celular.", "Custom design with scroll animations, fast on mobile."],
      ["Contactos directo a tu WhatsApp y 30 días de ajustes tras el lanzamiento.", "Leads straight to your WhatsApp and 30 days of tweaks after launch."],
    ],
    time: ["Landing 2 a 3 semanas · sitio completo 5 a 8", "Landing 2 to 3 weeks · full site 5 to 8"],
  },
  {
    id: "tienda-lista", img: "tienda", act: ["Muéstrate", "Show up"], name: "Tienda Lista",
    hook: ["Tu tienda abierta y vendiendo. Con lanzamiento incluido.", "Your store open and selling. Launch included."],
    who: ["Para marcas que venden por mensaje y quieren una tienda de verdad.", "For brands selling through DMs that want a real store."],
    get: [
      ["Tu tienda montada con tu marca y el catálogo cargado con textos que venden.", "Your store set up under your brand, with the catalog loaded and copy that sells."],
      ["Fotos de producto en estudio o con dirección de arte.", "Product photos in studio or with art direction."],
      ["Campaña de apertura: piezas, reel y dos semanas de pauta.", "An opening campaign: posts, a reel and two weeks of ads."],
    ],
    time: ["2 a 3 semanas", "2 to 3 weeks"],
  },
  {
    id: "temporada", img: "temporada", act: ["Muéstrate", "Show up"], name: "Temporada",
    hook: ["Cada mes, una colección de contenido que vende.", "Every month, a content collection that sells."],
    who: ["Para marcas que saben que deben publicar y no tienen tiempo, equipo ni estética constante.", "For brands that know they should post and lack the time, team or consistent look."],
    get: [
      ["Un concepto por mes, como una colección de moda.", "One concept a month, like a fashion collection."],
      ["Reels, carruseles e historias producidos, escritos y publicados.", "Reels, carousels and stories produced, written and published."],
      ["Un informe mensual con lo que funcionó y lo que cambia.", "A monthly report with what worked and what changes."],
    ],
    time: ["Mensual, en tallas S, M y L", "Monthly, in sizes S, M and L"],
  },
  {
    id: "ignicion", img: "ignicion", act: ["Crece", "Grow"], name: "Ignición",
    hook: ["Pauta que se enciende con creativos de verdad.", "Ads that ignite with real creative."],
    who: ["Para marcas con producto validado que quieren vender más en Meta, Google o TikTok.", "For brands with a proven product that want to sell more on Meta, Google or TikTok."],
    get: [
      ["Estrategia y lotes de creativos hechos para cada plataforma.", "Strategy and batches of creative made for each platform."],
      ["Optimización semanal: apagamos lo que no funciona y escalamos lo que sí.", "Weekly optimization: we switch off what doesn't work and scale what does."],
      ["Un informe quincenal en lenguaje claro.", "A plain-language report every two weeks."],
    ],
    time: ["Mensual, en ciclos de 3 meses", "Monthly, in 3-month cycles"],
  },
  {
    id: "front-row", img: "frontrow", act: ["Crece", "Grow"], name: "Front Row",
    hook: ["Tu equipo creativo, en primera fila. Por suscripción.", "Your creative team, front row. By subscription."],
    who: ["Para empresas y agencias que producen piezas todo el tiempo y no quieren contratar un equipo.", "For companies and agencies producing assets all the time without hiring a team."],
    get: [
      ["Un director de arte y diseñadores que ya conocen tu marca.", "An art director and designers who already know your brand."],
      ["Pides en tu portal y trabajamos por prioridad.", "You request in your portal and we work by priority."],
      ["Pausas cuando no tienes trabajo.", "Pause whenever you have no work."],
    ],
    time: ["Mensual, en tallas S, M y L", "Monthly, in sizes S, M and L"],
  },
  {
    id: "laboratorio", img: "laboratorio", act: ["Crece", "Grow"], name: "Laboratorio",
    hook: ["Tu idea, convertida en producto digital.", "Your idea, turned into a digital product."],
    who: ["Para empresas que necesitan una herramienta propia o fundadores con una idea de producto.", "For companies that need their own tool, or founders with a product idea."],
    get: [
      ["Descubrimiento: prototipo navegable y plan de construcción.", "Discovery: a clickable prototype and a build plan."],
      ["Primera versión diseñada, desarrollada y publicada.", "A first version designed, built and launched."],
      ["Evolución mensual con mejoras y nuevas funciones.", "Monthly evolution with improvements and new features."],
    ],
    time: ["Por fases · 10 a 14 semanas a la primera versión", "In phases · 10 to 14 weeks to the first version"],
  },
];

// --- Piezas comunes -----------------------------------------------------------------------------------
// Encabezado único de Studio (tools/pages/chrome.mjs); active es la página de la cara
const ACTIVE = { "agency/services.html": "packages", "agency/plans.html": "plans", "agency/portfolio.html": "work" };
const nav = (pre, active) => studioNav(pre, ACTIVE[active] || "");

function footer(pre) {
  return `
${studioFooter(pre)}

    <button class="theme-toggle" onclick="toggleTheme()" title="Cambiar tema">
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="${pre}js/space-bg.js"></script>
    <script src="${pre}js/smooth-scroll.js"></script>
    <script src="${pre}js/i18n.js"></script>
    <script src="${pre}js/main.js"></script>
    <script src="${pre}js/spaces-pages.js"></script>
    <script src="${pre}js/studio.js"></script>
</body>

</html>
`;
}

function shell({ file, pre, title, description, active, body }) {
  return `<!DOCTYPE html>
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
    <link rel="icon" type="image/png" href="${pre}assets/favicon.png">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://pixy.com.co/${file}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://pixy.com.co/assets/og/studio.png">
    <meta name="twitter:card" content="summary_large_image">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Unbounded:wght@500;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="${pre}css/style.css">
    <link rel="stylesheet" href="${pre}css/components.css">
    <link rel="stylesheet" href="${pre}css/agency-modern.css">
    <link rel="stylesheet" href="${pre}css/pages.css">
    <link rel="stylesheet" href="${pre}css/spaces-home.css">
    <link rel="stylesheet" href="${pre}css/studio.css">
</head>

<body class="landing-page spaces-face studio-face">
    <!-- Generado por tools/pages/build-studio.mjs: editar ahí, no aquí -->
    <div class="bg-gradient"></div>
    <div class="bg-grid"></div>
${nav(pre, active)}${body}${footer(pre)}`.replace(/\r?\n/g, EOL);
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
const closeSec = (pre, key, esT, enT) => `
    <section class="sh-section sh-final">
        <div class="container">
            ${t("h2", `${key}_t`, esT, enT, "sh-h2")}
            ${t("a", `${key}_b`, "Abre tu casting", "Open your casting", "btn-neon", `href="${pre}agency/contact.html" data-warp-click="departure"`)}
            <p class="sh-small st-close-note">${t("span", `${key}_n`, "¿No sabes por dónde empezar?", "Not sure where to start?")} <a class="sh-link" href="${pre}agency/contact.html?paquete=rayos-x">${t("span", `${key}_r`, "Pide tus Rayos X", "Ask for your X-Ray")}</a></p>
        </div>
    </section>
`;
const list = (prefix, items) =>
  `<ol class="sh-list">${items
    .map(
      ([es, en, des, den], i) =>
        `<li><span class="sh-num">${String(i + 1).padStart(2, "0")}</span><div>${t("h3", `${prefix}_${i}_t`, es, en, "sh-h3")}${t("p", `${prefix}_${i}_d`, des, den, "sh-body")}</div></li>`,
    )
    .join("")}</ol>`;
const split = (key, esT, enT, esI, enI, items, extra = "") => `
    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", `${key}_t`, esT, enT, "sh-h2")}
                ${esI ? t("p", `${key}_i`, esI, enI, "sh-body") : ""}
                ${extra}
            </div>
            ${list(key, items)}
        </div>
    </section>
`;

const MODES = [
  ["Paquetes", "Packages", "Proyectos y planes mensuales con nombre propio: sabes qué te llevas, en cuánto tiempo y qué sigue.", "Projects and monthly plans with their own name: you know what you get, how long it takes and what comes next."],
  ["Equipo dedicado", "Dedicated team", "Front Row: un director de arte y diseñadores para tu marca, por suscripción y sin nómina.", "Front Row: an art director and designers for your brand, by subscription and without payroll."],
  ["A la medida", "Custom", "Productos digitales, lanzamientos y proyectos especiales que no caben en un paquete.", "Digital products, launches and special projects that don't fit in a package."],
];
const STEPS = [
  ["Casting", "Casting", "Veinte minutos para entender tu marca, tu meta y tu momento.", "Twenty minutes to understand your brand, your goal and your moment."],
  ["Moodboard", "Moodboard", "Ves tu look antes de que produzcamos nada.", "You see your look before we produce anything."],
  ["Producción", "Production", "Avances que comentas y apruebas en tu portal, no en cadenas de correo.", "Progress you comment on and approve in your portal, not in email chains."],
  ["Estreno", "Premiere", "Lanzamos, te entregamos todo editable y medimos.", "We launch, hand everything over editable and measure."],
];
const FAQ = [
  ["¿Cuánto cuesta?", "How much does it cost?", "Depende del paquete y la talla. Abre tu casting y te enviamos una propuesta con el valor exacto.", "It depends on the package and size. Open your casting and we'll send you a proposal with the exact price."],
  ["¿Puedo pedir solo una parte?", "Can I order just one part?", "Sí. Cada paquete se compra solo; Rayos X es la forma más rápida de empezar.", "Yes. Every package can be bought on its own; X-Ray is the fastest way to start."],
  ["¿Qué diferencia hay entre Pixy Studio y Pixy Spaces?", "What's the difference between Pixy Studio and Pixy Spaces?", "Studio es nuestro estudio creativo: marca, contenido, webs y pauta. Spaces es nuestra plataforma de software. Puedes usar uno, el otro o ambos.", "Studio is our creative studio: brand, content, websites and ads. Spaces is our software platform. Use one, the other or both."],
  ["¿Necesito usar Pixy para trabajar con Studio?", "Do I need Pixy to work with Studio?", "No. Pero si lo usas, lo que creamos queda conectado a tus ventas.", "No. But if you do, what we create stays connected to your sales."],
  ["¿Cómo apruebo y sigo el avance?", "How do I approve and follow progress?", "En tu portal de cliente: ves avances, comentas, apruebas y descargas.", "In your client portal: see progress, comment, approve and download."],
];

const pages = [];

// --- agency.html: portada de Studio ---------------------------------------------------------------------
page = "home";
{
  const pre = "";
  const looks = P.map(
    (p, i) => `            <article class="st-look-page" data-look="${i}">
                <p class="st-look-name" aria-hidden="true">${p.name}</p>
                <img class="st-look-img" src="assets/studio/${p.img}.webp" alt="" loading="lazy" decoding="async">
                <div class="st-look-copy">
                    <p class="st-folio">LOOK ${String(i + 1).padStart(2, "0")} / ${String(P.length).padStart(2, "0")} · ${t("span", `look_${i}_act`, p.act[0].toUpperCase(), p.act[1].toUpperCase())}</p>
                    <h3 class="sh-display">${p.name}</h3>
                    ${t("p", `look_${i}_hook`, p.hook[0], p.hook[1], "sh-body sv-promise")}
                    ${t("p", `look_${i}_time`, p.time[0], p.time[1], "sh-small")}
                    <div class="st-look-links">
                        ${t("a", `look_${i}_see`, "Ver el paquete", "See the package", "sh-link", `href="agency/services.html#${p.id}"`)}
                        ${t("a", `look_${i}_want`, "Lo quiero", "I want it", "sh-link", `href="agency/contact.html?paquete=${p.id}" data-warp-click="hop"`)}
                    </div>
                </div>
            </article>`,
  ).join(EOL);
  pages.push({
    file: "agency.html", pre, active: "agency.html",
    title: "Pixy Studio · Tu marca, en portada",
    description: "Marca, contenido, webs, tiendas y pauta con dirección de arte de revista. Y conectado a un sistema que vende.",
    body: `
    <!-- 1. Portada: la cabecera STUDIO detrás de la protagonista; con el scroll ella avanza y la cabecera retrocede -->
    <section class="st-hero" data-no-reveal>
        <div class="st-hero-stage">
            <p class="st-mast" aria-hidden="true">STUDIO</p>
            <img class="st-hero-subject" src="assets/studio/hero.webp" alt="" fetchpriority="high" decoding="async">
            <div class="container st-hero-copy">
                <h1 class="sh-h1">${t("span", "h1a", "Tu marca,", "Your brand,")} <em class="st-serif">${t("span", "h1b", "en portada.", "on the cover.")}</em></h1>
                ${t("p", "sub", "Marca, contenido, webs, tiendas y pauta con dirección de arte de revista. Y conectado a un sistema que vende.", "Brand, content, websites, stores and ads with magazine-grade art direction. Connected to a system that sells.", "sh-body st-hero-sub")}
                <div class="sp-actions">
                    ${t("a", "cta", "Abre tu casting", "Open your casting", "btn-neon", 'href="agency/contact.html" data-warp-click="hop"')}
                    ${t("a", "cta2", "Ver la colección", "See the collection", "sh-link", 'href="#coleccion" data-warp-click="nudge"')}
                </div>
            </div>
        </div>
    </section>

    <!-- 2. Manifiesto: las palabras se rellenan con el scroll -->
    <section class="st-manifesto" data-no-reveal>
        <div class="container">
            <p class="st-fill" data-fill>${t("span", "m1", "Hay marcas que se ven.", "Some brands are seen.")} <br>${t("span", "m2", "Y marcas que se", "And some brands get")} <em class="st-serif">${t("span", "m3", "notan.", "noticed.")}</em> <br>${t("span", "m4", "Nosotros hacemos las segundas.", "We make the second kind.")}</p>
            ${t("p", "m5", "Identidad, contenido, webs y pauta con la misma dirección de arte. Un solo equipo. Un solo look.", "Identity, content, websites and ads with the same art direction. One team. One look.", "sh-body st-manifesto-sub")}
        </div>
    </section>

    <!-- 3. La colección: lookbook horizontal, una página por paquete -->
    <section class="st-look" id="coleccion" data-no-reveal data-warp="2">
        <div class="st-look-pin">
            <div class="container st-look-head">
                ${t("h2", "col_t", "La <em class=\"st-serif\">colección.</em>", "The <em class=\"st-serif\">collection.</em>", "sh-h2")}
                <span class="sv-meter" aria-hidden="true"><span class="sv-count"><b>01</b> / ${String(P.length).padStart(2, "0")}</span><span class="sv-track"><i></i></span></span>
            </div>
            <div class="st-look-track">
${looks}
            </div>
        </div>
    </section>
` +
      split("modes", "Tres formas de trabajar <em class=\"st-serif\">con Studio.</em>", "Three ways to work <em class=\"st-serif\">with Studio.</em>", "Elige un paquete, suma un equipo dedicado o diseñemos algo a tu medida.", "Pick a package, add a dedicated team or let's design something custom.", MODES, t("a", "modes_l", "Ver planes", "See plans", "sh-link", 'href="agency/plans.html"')) +
      split("steps", "Backstage.", "Backstage.", "Así trabajamos cada proyecto, del primer llamado al estreno.", "This is how we work every project, from the first call to the premiere.", STEPS) +
      `
    <!-- Con Pixy: el único capítulo donde aparece la plataforma -->
    <section class="sh-section" id="con-pixy">
        <div class="container sp-catalog-grid st-pixy">
            <div>
                ${t("h2", "pixy_t", "Nosotros lo hacemos brillar. <em class=\"st-serif\">Pixy lo pone a vender.</em>", "We make it shine. <em class=\"st-serif\">Pixy makes it sell.</em>", "sh-h2")}
                ${t("p", "pixy_d", "Somos parte de Pixy, la plataforma que junta ventas, atención con IA y cobros. Si quieres, te la montamos y la operamos.", "We're part of Pixy, the platform that brings together sales, AI-powered service and billing. If you want, we set it up and run it for you.", "sh-body sp-sub")}
                <dl class="sp-mods">
                    <div>${t("dt", "pixy_1", "Despegue Pixy", "Pixy Liftoff")}${t("dd", "pixy_1d", "Montamos tu Pixy con tu marca, tus datos y tu IA entrenada. Tú solo empiezas a vender.", "We set up your Pixy with your brand, your data and your trained AI. You just start selling.")}</div>
                    <div>${t("dt", "pixy_2", "Piloto Pixy", "Pixy Pilot")}${t("dd", "pixy_2d", "Operamos tu Pixy cada mes: contenido que vende, campañas e informes.", "We run your Pixy every month: content that sells, campaigns and reports.")}</div>
                </dl>
                <div class="sp-actions">
                    ${t("a", "pixy_c", "Quiero que monten mi Pixy", "Set up my Pixy", "btn-neon", 'href="agency/contact.html?paquete=despegue-pixy" data-warp-click="hop"')}
                    ${t("a", "pixy_s", "Conoce Pixy Spaces", "Discover Pixy Spaces", "sh-link", 'href="index.html" data-warp-click="departure"')}
                </div>
            </div>
            <div class="st-pixy-art" aria-hidden="true"><img src="assets/studio/pixy.webp" alt="" loading="lazy" decoding="async"></div>
        </div>
    </section>

    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">${t("h2", "faq_t", "Preguntas.", "Questions.", "sh-h2")}</div>
            <div class="st-faq">${FAQ.map(([q, qe, a, ae], i) => `<details>${t("summary", `faq_${i}`, q, qe)}${t("p", `faq_${i}_a`, a, ae, "sh-body")}</details>`).join("")}</div>
        </div>
    </section>
` +
      closeSec(pre, "close", "¿Lista tu marca <em class=\"st-serif\">para la portada?</em>", "Is your brand ready <em class=\"st-serif\">for the cover?</em>"),
  });
}

// --- agency/services.html: los paquetes --------------------------------------------------------------------
page = "packages";
{
  const pre = "../";
  pages.push({
    file: "agency/services.html", pre, active: "agency/services.html",
    title: "Paquetes | Pixy Studio",
    description: "Rayos X, Debut, Portada, Tienda Lista, Temporada, Ignición, Front Row y Laboratorio: paquetes con nombre propio.",
    body:
      hero(
        `<h1 class="sh-h1">${t("span", "h1", "La <em class=\"st-serif\">colección.</em>", "The <em class=\"st-serif\">collection.</em>")}</h1>`,
        t("p", "sub", "Paquetes con nombre propio: sabes qué te llevas, en cuánto tiempo y qué sigue.", "Packages with their own name: you know what you get, how long it takes and what comes next.", "sh-body sp-sub"),
        t("a", "cta", "Abre tu casting", "Open your casting", "btn-neon", 'href="contact.html" data-warp-click="hop"') + t("a", "cta2", "Ver planes", "See plans", "sh-link", 'href="plans.html"'),
      ) +
      `
    <section class="sh-section sp-catalog" data-no-reveal>
        <div class="container sp-catalog-grid">
            <div class="sp-blocks">
${P.map(
  (p, i) => `                <article class="sp-block st-pack" id="${p.id}" data-img="${p.img}">
                    <p class="st-folio">${String(i + 1).padStart(2, "0")} · ${t("span", `act_${i}`, p.act[0].toUpperCase(), p.act[1].toUpperCase())}</p>
                    <h2 class="sh-display">${p.name}</h2>
                    ${t("p", `hook_${i}`, p.hook[0], p.hook[1], "sh-body sv-promise")}
                    ${t("p", `who_${i}`, p.who[0], p.who[1], "sh-body")}
                    <ul class="st-gets">${p.get.map(([es, en], k) => t("li", `get_${i}_${k}`, es, en)).join("")}</ul>
                    ${t("p", `time_${i}`, p.time[0], p.time[1], "sh-small")}
                    ${t("a", `want_${i}`, "Lo quiero", "I want it", "sh-link", `href="contact.html?paquete=${p.id}" data-warp-click="hop"`)}
                </article>`,
).join(EOL)}
            </div>
            <div class="sp-model-col st-subjects" aria-hidden="true">
${P.map((p, i) => `                <img src="../assets/studio/${p.img}.webp" alt="" loading="lazy" decoding="async" data-img="${p.img}"${i === 0 ? ' class="is-on"' : ""}>`).join(EOL)}
            </div>
        </div>
    </section>
` +
      closeSec(pre, "close", "¿Cuál es <em class=\"st-serif\">el look</em> de tu marca?", "What's your brand's <em class=\"st-serif\">look?</em>"),
  });
}

// --- agency/plans.html: paquetes, equipo dedicado y a la medida ---------------------------------------------
page = "plans";
{
  const pre = "../";
  const YES = "Sí", NO = "—";
  const row = (key, es, en, cells) =>
    `<tr>${t("th", key, es, en, "", 'scope="row"')}${cells.map((c, i) => (Array.isArray(c) ? `<td>${t("span", `${key}_${i}`, c[0], c[1])}</td>` : `<td>${c}</td>`)).join("")}</tr>`;
  const sizes = `<thead><tr><th></th><th>S</th><th>M</th><th>L</th></tr></thead>`;
  pages.push({
    file: "agency/plans.html", pre, active: "agency/plans.html",
    title: "Planes | Pixy Studio",
    description: "Paquetes predefinidos, equipo creativo dedicado y proyectos a la medida. Te enviamos la propuesta con el valor exacto.",
    body:
      hero(
        `<h1 class="sh-h1">${t("span", "h1", "Tres formas de trabajar <em class=\"st-serif\">con Studio.</em>", "Three ways to work <em class=\"st-serif\">with Studio.</em>")}</h1>`,
        t("p", "sub", "Elige un paquete cerrado, suma un equipo dedicado o diseñemos algo a tu medida. Te enviamos la propuesta con el valor exacto.", "Pick a closed package, add a dedicated team or let's design something custom. We'll send you a proposal with the exact price.", "sh-body sp-sub"),
      ) +
      `
    <section class="sh-section st-levels">
        <div class="container">
            <div class="sh-plans st-modes" role="tablist" aria-label="Formas de trabajar">
${MODES.map(
  (m, i) => `                <button type="button" class="sh-plan${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-mode="${i}">
                    ${t("span", `mode_${i}`, m[0], m[1], "sh-h3l")}
                    ${t("span", `mode_${i}_d`, m[2], m[3], "sh-body")}
                </button>`,
).join(EOL)}
            </div>

            <div class="st-mode-panel is-on" data-panel="0">
                <div class="sh-split">
                    <div>${t("h2", "p0_t", "Paquetes", "Packages", "sh-h2")}${t("p", "p0_i", "Proyectos con inicio y fin, y planes mensuales para mantener el ritmo.", "Projects with a start and an end, and monthly plans to keep the pace.", "sh-body")}</div>
                    <dl class="sp-mods st-plan-list">
                        <div>${t("dt", "p0_projects", "Proyectos", "Projects")}<dd><span data-i18n="studio2.plans.p0_projects_d">Rayos X · Debut · Portada · Tienda Lista · Gran Estreno</span></dd></div>
                        <div>${t("dt", "p0_monthly", "Mensuales", "Monthly")}<dd><span data-i18n="studio2.plans.p0_monthly_d">Temporada · Ignición · Siempre On</span></dd></div>
                        <div>${t("dt", "p0_combo", "Gran Estreno", "Grand Premiere")}${t("dd", "p0_combo_d", "Marca, web, contenido y pauta en un solo lanzamiento: Debut, Portada Landing, tres meses de Temporada e Ignición en el mes del estreno.", "Brand, website, content and ads in a single launch: Debut, Portada Landing, three months of Temporada and Ignición in launch month.")}</div>
                        <div>${t("dt", "p0_on", "Siempre On", "Always On")}${t("dd", "p0_on_d", "Tu web siempre arriba, rápida y al día: alojamiento, copias, monitoreo y cambios menores cada mes.", "Your website always up, fast and current: hosting, backups, monitoring and minor changes every month.")}</div>
                    </dl>
                </div>
                <div class="st-size">
                    ${t("h3", "temp_t", "Temporada, por tallas", "Temporada, by size", "sh-h3l")}
                    <div class="sp-table-wrap"><table class="sp-table">${sizes}<tbody>
                        ${row("temp_r0", "Concepto y parrilla del mes", "Monthly concept and grid", [YES, YES, YES])}
                        ${row("temp_r1", "Reels editados con subtítulos", "Edited reels with captions", ["4", "8", "12"])}
                        ${row("temp_r2", "Carruseles y piezas", "Carousels and posts", ["6", "10", "16"])}
                        ${row("temp_r3", "Historias", "Stories", ["8", "16", "30"])}
                        ${row("temp_r4", "Producción", "Production", [["Imágenes con IA dirigida", "Art-directed AI images"], ["1 sesión corta", "1 short shoot"], ["2 sesiones", "2 shoots"]])}
                        ${row("temp_r5", "Textos, programación e informe mensual", "Copy, scheduling and monthly report", [YES, YES, YES])}
                    </tbody></table></div>
                </div>
            </div>

            <div class="st-mode-panel" data-panel="1">
                <div class="sh-split">
                    <div>${t("h2", "p1_t", "Front Row, tu equipo dedicado", "Front Row, your dedicated team", "sh-h2")}${t("p", "p1_i", "Un director de arte y diseñadores que ya conocen tu marca. Pides en tu portal, trabajamos por prioridad y pausas cuando no tienes trabajo.", "An art director and designers who already know your brand. Request in your portal, we work by priority, and you pause when there's no work.", "sh-body")}</div>
                    <div class="sp-table-wrap"><table class="sp-table">${sizes}<tbody>
                        ${row("fr_r0", "Solicitudes activas a la vez", "Active requests at a time", ["1", "2", "4"])}
                        ${row("fr_r1", "Tiempo típico por pieza", "Typical time per asset", [["2 a 3 días", "2 to 3 days"], ["1 a 2 días", "1 to 2 days"], ["Mismo día a 2 días", "Same day to 2 days"]])}
                        ${row("fr_r2", "Piezas para redes y anuncios", "Social and ad assets", [YES, YES, YES])}
                        ${row("fr_r3", "Landings y presentaciones", "Landing pages and decks", [YES, YES, YES])}
                        ${row("fr_r4", "Sistemas de marca y renders 3D", "Brand systems and 3D renders", [NO, YES, YES])}
                        ${row("fr_r5", "Motion y video", "Motion and video", [NO, NO, YES])}
                        ${row("fr_r6", "Canal directo por WhatsApp", "Direct WhatsApp channel", [NO, YES, YES])}
                        ${row("fr_r7", "Sesión mensual de dirección creativa", "Monthly creative direction session", [NO, NO, YES])}
                    </tbody></table></div>
                </div>
            </div>

            <div class="st-mode-panel" data-panel="2">
                <div class="sh-split">
                    <div>${t("h2", "p2_t", "A la medida", "Custom", "sh-h2")}${t("p", "p2_i", "Para lo que no cabe en un paquete. Antes de construir, revisamos si un Space de Pixy ya lo resuelve: si sí, te lo decimos.", "For what doesn't fit in a package. Before building, we check whether a Pixy Space already solves it: if it does, we'll tell you.", "sh-body")}</div>
                    ${list("lab", [
                      ["Descubrimiento", "Discovery", "Dos semanas: entrevistas, mapa del producto, prototipo navegable y presupuesto de construcción.", "Two weeks: interviews, a product map, a clickable prototype and a build budget."],
                      ["Primera versión", "First version", "De ocho a doce semanas: diseño, desarrollo y publicación de lo esencial.", "Eight to twelve weeks: design, development and launch of the essentials."],
                      ["Evolución", "Evolution", "Cada mes: mejoras, soporte y nuevas funciones.", "Every month: improvements, support and new features."],
                      ["Proyectos especiales", "Special projects", "Lanzamientos, campañas y experiencias que necesitan su propio equipo y cronograma.", "Launches, campaigns and experiences that need their own team and timeline."],
                    ])}
                </div>
            </div>
        </div>
    </section>
` +
      split("always", "Siempre incluido.", "Always included.", "", "", [
        ["Rondas de ajuste definidas", "Defined revision rounds", "Sabes desde la propuesta cuántas vueltas tiene cada entrega.", "You know from the proposal how many rounds each deliverable has."],
        ["Archivos editables", "Editable files", "Todo lo que hacemos es tuyo y te lo entregamos editable.", "Everything we make is yours and handed over editable."],
        ["Fechas por escrito", "Dates in writing", "Cada hito con su fecha, desde el primer día.", "Every milestone with its date, from day one."],
        ["Tu portal de cliente", "Your client portal", "Avances, aprobaciones, facturas y descargas en un solo lugar.", "Progress, approvals, invoices and downloads all in one place."],
      ]) +
      closeSec(pre, "close", "Cuéntanos de <em class=\"st-serif\">tu marca.</em>", "Tell us about <em class=\"st-serif\">your brand.</em>"),
  });
}

// --- agency/portfolio.html: trabajos (solo lo real) ------------------------------------------------------------
page = "work";
{
  const pre = "../";
  pages.push({
    file: "agency/portfolio.html", pre, active: "agency/portfolio.html",
    title: "Trabajos | Pixy Studio",
    description: "En portada: el trabajo de Pixy Studio. Caso 00, Pixy.",
    body:
      hero(`<h1 class="sh-h1">${t("span", "h1", "En <em class=\"st-serif\">portada.</em>", "On the <em class=\"st-serif\">cover.</em>")}</h1>`, t("p", "sub", "Mostramos el trabajo, no adjetivos. Los casos de clientes llegan con su permiso y sus datos reales.", "We show the work, not adjectives. Client cases come with their permission and real data.", "sh-body sp-sub")) +
      `
    <section class="sh-section">
        <div class="container sp-catalog-grid st-pixy">
            <div>
                <p class="st-folio">${t("span", "case_f", "CASO 00", "CASE 00")}</p>
                <h2 class="sh-display">Pixy</h2>
                ${t("p", "case_d", "La marca, este sitio, el sistema visual y el contenido de lanzamiento de Pixy los hicimos nosotros. Es nuestro trabajo más grande, y lo puedes recorrer ahora mismo.", "Pixy's brand, this website, the visual system and the launch content were made by us. It's our biggest work, and you can explore it right now.", "sh-body sv-promise")}
                <ul class="st-gets">${[
                  ["Identidad y renders de marca", "Identity and brand renders"],
                  ["Sitio con scroll de cine", "Website with cinematic scroll"],
                  ["Contenido de lanzamiento", "Launch content"],
                ].map(([es, en], k) => t("li", `case_${k}`, es, en)).join("")}</ul>
                ${t("a", "case_l", "Recorrer Pixy Spaces", "Explore Pixy Spaces", "sh-link", 'href="../index.html" data-warp-click="departure"')}
            </div>
            <div class="st-pixy-art" aria-hidden="true"><img src="../assets/studio/hero.webp" alt="" loading="lazy" decoding="async"></div>
        </div>
    </section>
` +
      closeSec(pre, "close", "Tu marca puede ser <em class=\"st-serif\">la próxima portada.</em>", "Your brand could be <em class=\"st-serif\">the next cover.</em>"),
  });
}

// --- agency/contact.html: el casting (abre el correo con las respuestas) ----------------------------------
page = "casting";
{
  const pre = "../";
  const opt = (key, items) => items.map(([v, es, en]) => t("option", `${key}_${v}`, es, en, "", `value="${v}"`)).join("");
  pages.push({
    file: "agency/contact.html", pre, active: "agency/contact.html",
    title: "Abre tu casting | Pixy Studio",
    description: "Cuéntanos de tu marca y te enviamos una propuesta con el paquete que le queda.",
    body:
      hero(`<h1 class="sh-h1">${t("span", "h1", "Abre tu <em class=\"st-serif\">casting.</em>", "Open your <em class=\"st-serif\">casting.</em>")}</h1>`, t("p", "sub", "Cuéntanos de tu marca y te enviamos una propuesta con el paquete que le queda.", "Tell us about your brand and we'll send you a proposal with the package that fits.", "sh-body sp-sub")) +
      `
    <section class="sh-section">
        <div class="container sh-split">
            <div class="sh-sticky">
                ${t("h2", "mail_t", "Escríbenos", "Write to us", "sh-h3l")}
                <p class="sh-body"><a class="sh-link" href="mailto:contact@pixy.com.co">contact@pixy.com.co</a></p>
                <p class="sh-body"><a class="sh-link" href="https://wa.me/573504076800?text=Hola%2C%20quiero%20hablar%20con%20Pixy%20Studio" target="_blank" rel="noopener">WhatsApp +57 350 407 6800</a></p>
            </div>
            <form class="sp-form" data-mailto="contact@pixy.com.co" data-subject-es="Casting de Pixy Studio" data-subject-en="Pixy Studio casting" data-form-es="Pixy Studio" data-form-en="Pixy Studio" data-news-wa>
                <label>${t("span", "f_name", "Nombre", "Name")}<input name="nombre" required autocomplete="name"></label>
                <label>${t("span", "f_brand", "Tu marca", "Your brand")}<input name="marca" required autocomplete="organization"></label>
                <label>${t("span", "f_email", "Email", "Email")}<input name="email" type="email" required autocomplete="email"></label>
                <label>${t("span", "f_phone", "WhatsApp", "WhatsApp")}<input name="whatsapp" type="tel" autocomplete="tel"></label>
                <label>${t("span", "f_pack", "¿Qué necesita tu marca?", "What does your brand need?")}<select name="paquete">
                    ${P.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}
                    ${t("option", "f_pack_pixy", "Despegue Pixy", "Pixy Liftoff", "", 'value="despegue-pixy"')}
                    ${t("option", "f_pack_combo", "Gran Estreno", "Grand Premiere", "", 'value="gran-estreno"')}
                    ${t("option", "f_pack_help", "No sé, ayúdenme", "Not sure, help me", "", 'value="no-se"')}
                </select></label>
                <label>${t("span", "f_moment", "¿En qué momento está?", "Where is it at?")}<select name="momento">${opt("f_moment", [
                  ["nace", "Está naciendo", "It's being born"],
                  ["vieja", "Existe, pero se ve vieja", "It exists, but looks dated"],
                  ["crece", "Crece y necesita más", "It's growing and needs more"],
                  ["lanza", "Lanza algo nuevo", "It's launching something new"],
                ])}</select></label>
                <label>${t("span", "f_when", "¿Cuándo quieres el estreno?", "When do you want the premiere?")}<select name="estreno">${opt("f_when", [
                  ["mes", "Este mes", "This month"],
                  ["trimestre", "En 1 a 3 meses", "In 1 to 3 months"],
                  ["sin-fecha", "Sin fecha", "No date yet"],
                ])}</select></label>
                <label>${t("span", "f_link", "Instagram o web (opcional)", "Instagram or website (optional)")}<input name="enlace" type="url"></label>
                <label class="sp-wide">${t("span", "f_msg", "Cuéntanos más", "Tell us more")}<textarea name="mensaje" rows="5"></textarea></label>
                ${consentBlock(t, { pre: "../", studio: true, purposeEs: "preparar tu propuesta, responderte y hacerle seguimiento", purposeEn: "prepare your proposal, reply to you and follow up", dataEs: "tu nombre, correo, WhatsApp, marca, enlaces y mensaje", dataEn: "your name, email, WhatsApp number, brand, links and message" })}
                ${t("button", "f_send", "Enviar mi casting", "Send my casting", "btn-neon sp-wide", 'type="submit"')}
                ${t("p", "f_note", FORM_NOTE[0], FORM_NOTE[1], "sh-small sp-wide")}
            </form>
        </div>
    </section>
`,
  });
}

// --- Escritura ---------------------------------------------------------------------------------------------
mkdirSync(join(root, "agency"), { recursive: true });
for (const p of pages) {
  writeFileSync(join(root, p.file), withPageEnd(shell(p)), "utf8");
  console.log(`página: ${p.file}`);
}
// Direcciones anteriores que siguen enlazadas: llevan a la página nueva
const redirect = (to) => `<!DOCTYPE html>${EOL}<html lang="es">${EOL}<head>${EOL}    <meta charset="UTF-8">${EOL}    <meta http-equiv="refresh" content="0; url=${to}">${EOL}    <link rel="canonical" href="https://pixy.com.co/${to.replace("../", "")}">${EOL}    <title>Pixy Studio</title>${EOL}</head>${EOL}<body><a href="${to}">Pixy Studio</a></body>${EOL}</html>${EOL}`;
writeFileSync(join(root, "agency/index.html"), redirect("../agency.html"), "utf8");
writeFileSync(join(root, "contact-agency.html"), redirect("agency/contact.html"), "utf8");
console.log("redirecciones: agency/index.html, contact-agency.html");

for (const lang of ["es", "en"]) {
  const file = join(root, "locales", `${lang}.json`);
  const raw = readFileSync(file, "utf8").replace(/^﻿/, "");
  const data = JSON.parse(raw);
  data.studio2 = I18N[lang];
  // Las listas de proyectos y mensuales se muestran igual en ambos idiomas (son nombres propios)
  data.studio2.plans.p0_projects_d = "Rayos X · Debut · Portada · Tienda Lista · Gran Estreno";
  data.studio2.plans.p0_monthly_d = lang === "es" ? "Temporada · Ignición · Siempre On" : "Temporada · Ignición · Always On";
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  writeFileSync(file, JSON.stringify(data, null, 2).replace(/\n/g, eol) + (raw.endsWith("\n") ? eol : ""), "utf8");
  console.log(`${lang}: studio2 con ${Object.keys(data.studio2).length} grupos`);
}
