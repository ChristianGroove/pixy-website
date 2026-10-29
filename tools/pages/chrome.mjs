// Encabezado y pie únicos de cada cara del sitio (Spaces y Studio). Fuente única: lo usan
// build-pages.mjs, build-studio.mjs y apply-chrome.mjs (portada, blog, artículos y legales).
// Los textos van en locales/*.json bajo "chrome".

export const CHROME_I18N = {
  es: {
    spaces: "Spaces", platform: "Plataforma", plans: "Planes", blog: "Blog", demo: "Agenda tu demo", menu: "Menú",
    packages: "Paquetes", work: "Trabajos", pixy: "Con Pixy", casting: "Abre tu casting",
    slogan_spaces: "El sistema operativo de tu negocio.", slogan_studio: "Tu marca, en portada.",
    col_product: "Producto", col_company: "Pixy", col_legal: "Legal", col_studio: "Studio",
    partners: "Partners", contact: "Contacto", studio: "Pixy Studio", spaces_site: "Pixy Spaces",
    privacy: "Privacidad", terms: "Términos", cookies: "Cookies", deletion: "Eliminación de datos", permissions: "Permisos",
    rights: "© 2026 Pixy. Todos los derechos reservados.",
    meta_tp: "Pixy es Tech Provider de Meta.", whatsapp: "WhatsApp",
  },
  en: {
    spaces: "Spaces", platform: "Platform", plans: "Plans", blog: "Blog", demo: "Book a demo", menu: "Menu",
    packages: "Packages", work: "Work", pixy: "With Pixy", casting: "Open your casting",
    slogan_spaces: "The operating system for your business.", slogan_studio: "Your brand, on the cover.",
    col_product: "Product", col_company: "Pixy", col_legal: "Legal", col_studio: "Studio",
    partners: "Partners", contact: "Contact", studio: "Pixy Studio", spaces_site: "Pixy Spaces",
    privacy: "Privacy", terms: "Terms", cookies: "Cookies", deletion: "Data deletion", permissions: "Permissions",
    rights: "© 2026 Pixy. All rights reserved.",
    meta_tp: "Pixy is a Meta Tech Provider.", whatsapp: "WhatsApp",
  },
};
const es = CHROME_I18N.es;
const i = (key) => `data-i18n="chrome.${key}"`;

const langToggle = `<button id="lang-toggle" class="btn-lang" type="button" aria-label="Idioma / Language">
                    <span id="lang-text">ES</span>
                    <span class="btn-lang-caret" aria-hidden="true">▼</span>
                </button>`;

function brand(pre, home, alt) {
  return `<a href="${pre}${home}" class="nav-brand" aria-label="${alt}">
                    <img src="${pre}assets/logos/logo-dark.svg" alt="${alt}" class="nav-logo nav-logo-dark" width="149" height="32" loading="eager" decoding="sync">
                    <img src="${pre}assets/logos/logo-light.svg" alt="${alt}" class="nav-logo nav-logo-light" width="149" height="32" loading="eager" decoding="sync">
                </a>`;
}

function switcher(pre, face) {
  return `<div class="universe-switcher" role="tablist" aria-label="Pixy">
                    <a href="${pre}agency.html" class="universe-tab${face === "studio" ? " active" : ""}" data-mode="agency">Studio</a>
                    <a href="${pre}index.html" class="universe-tab${face === "spaces" ? " active" : ""}" data-mode="spaces">Spaces</a>
                </div>`;
}

function navShell(pre, home, alt, face, links, cta) {
  return `    <nav class="nav">
        <div class="nav-content">
            <div class="nav-left-group">
                ${brand(pre, home, alt)}
                ${switcher(pre, face)}
            </div>
            <div class="nav-links" id="nav-links">
${links}
                ${cta.replace('class="btn-neon-outline nav-cta"', 'class="btn-neon nav-links-cta"')}
            </div>
            <div class="nav-actions">
                ${langToggle}
                ${cta}
                <button class="nav-menu-btn" type="button" aria-controls="nav-links" aria-expanded="false" aria-label="${es.menu}" data-i18n-aria="chrome.menu">
                    <span class="nav-menu-bar" aria-hidden="true"></span>
                    <span class="nav-menu-bar" aria-hidden="true"></span>
                </button>
            </div>
        </div>
    </nav>
`;
}

const link = (pre, href, key, active) =>
  `                <a href="${pre}${href}" class="neon-link${active ? " active" : ""}" ${i(key)}>${es[key]}</a>`;

/** Encabezado de la cara Spaces. active: spaces | platform | plans | blog | "" */
export function spacesNav(pre = "", active = "") {
  const links = [
    link(pre, "spaces.html", "spaces", active === "spaces"),
    link(pre, "features.html", "platform", active === "platform"),
    link(pre, "pricing.html", "plans", active === "plans"),
    link(pre, "blog.html", "blog", active === "blog"),
  ].join("\n");
  const cta = `<a href="${pre}contact.html" class="btn-neon-outline nav-cta" ${i("demo")}>${es.demo}</a>`;
  return navShell(pre, "index.html", "Pixy", "spaces", links, cta);
}

/** Encabezado de la cara Studio. active: packages | plans | work | "" */
export function studioNav(pre = "", active = "") {
  const links = [
    link(pre, "agency/services.html", "packages", active === "packages"),
    link(pre, "agency/plans.html", "plans", active === "plans"),
    link(pre, "agency/portfolio.html", "work", active === "work"),
    link(pre, "agency.html#con-pixy", "pixy", false),
  ].join("\n");
  const cta = `<a href="${pre}agency/contact.html" class="btn-neon-outline nav-cta" ${i("casting")}>${es.casting}</a>`;
  return navShell(pre, "agency.html", "Pixy Studio", "studio", links, cta);
}

const flink = (pre, href, key) => `                <a href="${pre}${href}" class="neon-link" ${i(key)}>${es[key]}</a>`;

// Único WhatsApp de contacto de Pixy (y único correo: contact@pixy.com.co)
export const WHATSAPP = "https://wa.me/573504076800";
const waLink = `                <a href="${WHATSAPP}" class="neon-link" target="_blank" rel="noopener" ${i("whatsapp")}>${es.whatsapp}</a>`;

// Perfiles oficiales de Pixy en redes: pie de todas las páginas y Organization.sameAs (tools/seo, tools/blog).
// Para sumar uno (LinkedIn, TikTok, YouTube…) se agrega aquí con su ícono y se corre tools/build-all.mjs.
export const SOCIAL = [
  { net: "instagram", label: "Instagram", url: "https://www.instagram.com/pixyspaces/",
    icon: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/>' },
  { net: "facebook", label: "Facebook", url: "https://www.facebook.com/pixyspaces",
    icon: '<path fill="currentColor" d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.09 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.38.04.76.11 1.14.2v3.32c-.22-.02-.43-.03-.65-.04-.25 0-.49-.01-.74-.01-.7 0-1.26.1-1.67.31-.29.15-.52.36-.68.62-.26.42-.38 1-.38 1.75v1.3h3.92l-.39 2.1-.28 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04 24 5.42 18.63.04 12 .04S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z"/>' },
];
const socialRow = SOCIAL.length
  ? `                <div class="footer-social">
${SOCIAL.map((s) => `                    <a href="${s.url}" target="_blank" rel="noopener me" aria-label="Pixy en ${s.label}" title="${s.label}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${s.icon}</svg></a>`).join("\n")}
                </div>
`
  : "";

function legalCol(pre) {
  return `            <nav class="footer-links" aria-label="Legal">
                <h4 ${i("col_legal")}>${es.col_legal}</h4>
${["privacy|privacy.html", "terms|terms.html", "cookies|cookies.html", "deletion|data-deletion.html", "permissions|permissions.html"]
  .map((s) => flink(pre, s.split("|")[1], s.split("|")[0]))
  .join("\n")}
            </nav>`;
}

function footShell(pre, alt, sloganKey, cols) {
  return `    <footer class="footer">
        <div class="footer-content">
            <div class="footer-brand">
                <img src="${pre}assets/logos/logo-dark.svg" alt="${alt}" class="footer-logo footer-logo-dark">
                <img src="${pre}assets/logos/logo-light.svg" alt="${alt}" class="footer-logo footer-logo-light">
                <p ${i(sloganKey)}>${es[sloganKey]}</p>
                <p class="footer-meta" ${i("meta_tp")}>${es.meta_tp}</p>
${socialRow}            </div>
${cols}
${legalCol(pre)}
        </div>
        <div class="footer-bottom">
            <p ${i("rights")}>${es.rights}</p>
        </div>
    </footer>`;
}

export function spacesFooter(pre = "") {
  const cols = `            <nav class="footer-links" aria-label="Producto">
                <h4 ${i("col_product")}>${es.col_product}</h4>
${[["spaces.html", "spaces"], ["features.html", "platform"], ["pricing.html", "plans"], ["partners.html", "partners"]].map(([h, k]) => flink(pre, h, k)).join("\n")}
            </nav>
            <nav class="footer-links" aria-label="Pixy">
                <h4 ${i("col_company")}>${es.col_company}</h4>
${[["blog.html", "blog"], ["contact.html", "contact"], ["agency.html", "studio"]].map(([h, k]) => flink(pre, h, k)).join("\n")}
${waLink}
            </nav>`;
  return footShell(pre, "Pixy", "slogan_spaces", cols);
}

export function studioFooter(pre = "") {
  const cols = `            <nav class="footer-links" aria-label="Studio">
                <h4 ${i("col_studio")}>${es.col_studio}</h4>
${[["agency/services.html", "packages"], ["agency/plans.html", "plans"], ["agency/portfolio.html", "work"], ["agency/contact.html", "casting"]].map(([h, k]) => flink(pre, h, k)).join("\n")}
            </nav>
            <nav class="footer-links" aria-label="Pixy">
                <h4 ${i("col_company")}>${es.col_company}</h4>
${[["index.html", "spaces_site"], ["blog.html", "blog"]].map(([h, k]) => flink(pre, h, k)).join("\n")}
${waLink}
            </nav>`;
  return footShell(pre, "Pixy Studio", "slogan_studio", cols);
}

/** Escribe los textos del encabezado y el pie en locales/*.json. */
export function writeChromeI18n(readFileSync, writeFileSync, join, root) {
  for (const lang of ["es", "en"]) {
    const file = join(root, "locales", `${lang}.json`);
    const raw = readFileSync(file, "utf8").replace(/^﻿/, "");
    const data = JSON.parse(raw);
    data.chrome = CHROME_I18N[lang];
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    writeFileSync(file, JSON.stringify(data, null, 2).replace(/\n/g, eol) + (raw.endsWith("\n") ? eol : ""), "utf8");
  }
}

/**
 * Transición entre páginas: el navegador no pinta la página hasta leer #pixy-end, que va después
 * de los scripts. Así llega armada (fondo con estrellas, textos traducidos, secciones visibles)
 * en vez de por partes. Idempotente.
 */
export function withPageEnd(html) {
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  if (!html.includes('rel="expect"')) html = html.replace(/(\r?\n)<\/head>/, `${eol}    <link rel="expect" href="#pixy-end" blocking="render">$1</head>`);
  if (!html.includes('id="pixy-end"')) html = html.replace(/(\r?\n)<\/body>/, `${eol}    <div id="pixy-end" hidden></div>$1</body>`);
  return html;
}
