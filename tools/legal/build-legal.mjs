// PÁGINAS LEGALES: publica en el sitio los textos legales de Pixy (fuente única: docs/legal de la plataforma,
// rama de la sesión legal). Dictamen: docs/legal/sitio-web-produccion.md.
// - Copia los documentos publicables a content/legal/ (el sitio guarda su propia copia).
// - privacy.html (02), terms.html (01), cookies.html (05) y data-deletion.html (06) conservan su URL, porque
//   Meta, Google y TikTok las tienen registradas; el resto va en legal/<slug>.html, con índice en legal/index.html.
// - Solo publica un documento con «estado: Vigente» y sin ningún [COMPLETAR]; si no, deja la página anterior.
// - En inglés: nota de que rige el español y resúmenes para revisores en privacy y data-deletion.
// Uso: node tools/legal/build-legal.mjs   (lo corre tools/build-all.mjs)
//      PIXY_LEGAL_DIR=<carpeta docs/legal> para leer de otra copia de la plataforma.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spacesNav, withPageEnd } from "../pages/chrome.mjs";
import { head, tail, markdown, esc } from "../blog/build-blog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://pixy.com.co";
const SOURCE = process.env.PIXY_LEGAL_DIR || "G:/Pixy/agency-manager-legal/docs/legal";
const EOL = "\r\n";

// Documento -> página del sitio. footer: va en el pie; short: nombre corto en el índice y los enlaces.
export const LEGAL = [
  { file: "02-politica-tratamiento-datos.md", page: "privacy.html", es: "Privacidad", en: "Privacy" },
  { file: "01-terminos-y-condiciones.md", page: "terms.html", es: "Términos", en: "Terms" },
  { file: "05-politica-de-cookies.md", page: "cookies.html", es: "Cookies", en: "Cookies" },
  { file: "06-eliminacion-de-datos.md", page: "data-deletion.html", es: "Eliminación de datos", en: "Data deletion" },
  { file: "07-uso-aceptable-y-mensajeria.md", page: "legal/uso-aceptable.html", es: "Uso aceptable", en: "Acceptable use" },
  { file: "04-acuerdo-encargo-tratamiento.md", page: "legal/encargo-de-tratamiento.html", es: "Encargo de tratamiento", en: "Data processing agreement" },
  { file: "anexo-subencargados.md", page: "legal/subencargados.html", es: "Subencargados", en: "Subprocessors" },
  { file: "09-terminos-pixy-studio.md", page: "legal/terminos-pixy-studio.html", es: "Términos de Pixy Studio", en: "Pixy Studio terms" },
  { file: "10-terminos-tiendas-y-menus.md", page: "legal/tiendas-y-menus.html", es: "Tiendas, menús y portales", en: "Stores, menus and portals" },
  { file: "08-anexo-menores-pixy-edu.md", page: "legal/menores-pixy-edu.html", es: "Menores en Pixy Edu", en: "Minors in Pixy Edu" },
];
const PAGE_OF = Object.fromEntries(LEGAL.map((d) => [d.file, d.page]));

// Resúmenes en inglés para revisores de Meta, Google y TikTok (dictamen §6); solo se ven en inglés
const SUMMARY_EN = {
  "privacy.html": `<p><em>Summary for reference only. The Spanish text below governs.</em></p>
<p>{OWNER}, operating under the Pixy brand ("Pixy"), is the data controller for the people who use Pixy on behalf of a business, our prospects, partners and website visitors. For the people our customers serve (their clients, students, guardians and anyone who messages them), the customer business is the controller and Pixy processes that data on its behalf.</p>
<p>We use personal data to provide and secure the service, bill, give support and, only with your consent, send marketing. We do not sell personal data. We use third-party AI models (mainly Anthropic and Google) through their commercial APIs, which do not train on the data we send. When you message Pixy on WhatsApp, an AI assistant may reply automatically using only what you write in that chat and our knowledge base; you can ask for a person at any time. AI never makes decisions about you, such as granting or denying access: a person does.</p>
<p>When you connect Facebook, Instagram, WhatsApp or TikTok, we receive only what you authorize and use it only for the features you turn on. Access tokens are stored encrypted.</p>
<p>Pixy's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
<p>Some providers process data outside Colombia, mainly in the United States and the European Union. You can access, correct, delete your data and withdraw consent by writing to <a href="mailto:contact@pixy.com.co">contact@pixy.com.co</a>; we answer within the deadlines of Colombian law (Law 1581 of 2012).</p>`,
  "data-deletion.html": `<p><em>Summary for reference only. The Spanish text below governs.</em></p>
<p><strong>If you connected Facebook, Instagram or WhatsApp to Pixy:</strong> to remove access right away, disconnect the channel in Pixy's channel settings or remove the Pixy app in Facebook under <strong>Settings &amp; privacy → Settings → Business integrations</strong> (or <strong>Apps and websites</strong>). To also have us delete the data we received from Meta (page and account IDs, access tokens, synced messages and comments), email <a href="mailto:contact@pixy.com.co">contact@pixy.com.co</a> with the subject <strong>"Meta data deletion"</strong>, naming the page, Instagram account or WhatsApp number.</p>
<p><strong>If you have a Pixy account:</strong> email us from your login address with the subject <strong>"Data deletion"</strong> and tell us whether to delete only your user or the whole company account (company admins only).</p>
<p><strong>If a business that uses Pixy has your data:</strong> ask that business first; if it doesn't answer, write to us and we will forward your request within two business days.</p>
<p>We acknowledge requests within two business days and complete them within fifteen business days, then confirm what was deleted and anything we must keep by law (for example, accounting records).</p>`,
};

const I18N = {
  es: { version: "Versión", since: "Vigente desde el", contents: "Contenido", all: "Todos los documentos legales", note: "", summary: "", index_t: "Documentos legales", index_s: "Las reglas con las que Pixy trabaja: datos personales, términos, cookies y uso aceptable. El texto en español es el que rige." },
  en: { version: "Version", since: "In force since", contents: "Contents", all: "All legal documents", note: "This document is available in Spanish, which is the governing version. Pixy is operated under Colombian law. If you need help understanding it, write to <a href=\"mailto:contact@pixy.com.co\">contact@pixy.com.co</a>.", summary: "", index_t: "Legal documents", index_s: "The rules Pixy works by: personal data, terms, cookies and acceptable use. The Spanish text is the governing version." },
};
const i = (k) => `data-i18n="legal2.${k}"`;

function frontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  const data = {};
  if (m) for (const line of m[1].split(/\r?\n/)) { const kv = /^([a-z_]+):\s*(.*)$/.exec(line); if (kv) data[kv[1]] = kv[2].trim(); }
  return { data, body: m ? src.slice(m[0].length) : src };
}

const fmtDate = (d) => {
  const M = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, day] = d.split("-").map(Number);
  return `${day} de ${M[m - 1]} de ${y}`;
};

/**
 * Enlaces entre documentos (NN-nombre.md#ancla) -> página del sitio, relativa a la página actual.
 * Si el documento enlazado todavía no se publica, el enlace va al índice de documentos legales.
 */
function relink(md, pre, published) {
  return md.replace(/\]\(([0-9a-z-]+\.md)(#[^)]+)?\)/g, (all, file, hash = "") => {
    if (!PAGE_OF[file]) return all;
    return published.has(file) ? `](${pre}${PAGE_OF[file]}${hash})` : `](${pre}legal/index.html)`;
  });
}

function loadDocs() {
  mkdirSync(join(root, "content/legal"), { recursive: true });
  return LEGAL.map((d) => {
    const src = join(SOURCE, d.file), copy = join(root, "content/legal", d.file);
    if (existsSync(src)) copyFileSync(src, copy);
    if (!existsSync(copy)) return { ...d, ok: false, why: "no existe" };
    const { data, body } = frontMatter(readFileSync(copy, "utf8"));
    const pending = (body.match(/\[COMPLETAR[^\]]*\]/g) || []).length;
    // PIXY_LEGAL_PREVIEW=1: muestra también borradores, solo para revisar en local (no se publica así)
    const ok = process.env.PIXY_LEGAL_PREVIEW === "1" || (/^vigente$/i.test(data.estado || "") && !pending);
    return { ...d, data, body, ok, why: ok ? "" : `${data.estado || "sin estado"}${pending ? `, ${pending} [COMPLETAR]` : ""}` };
  });
}

function page(doc, docs) {
  const pre = doc.page.startsWith("legal/") ? "../" : "";
  // Sin el título del Markdown (va en el encabezado de la página) ni notas editoriales internas
  const published = new Set(docs.filter((x) => x.ok).map((x) => x.file));
  const md = relink(doc.body.replace(/^#\s+.*\r?\n/m, "").replace(/^> (Texto sugerido|Texto corto)[^\n]*\n(>[^\n]*\n)*/gm, ""), pre, published);
  const { html, toc } = markdown(md);
  const url = `${SITE}/${doc.page}`;
  const title = doc.data.titulo;
  const summary = SUMMARY_EN[doc.page];
  const others = docs.filter((x) => x.ok && x.page !== doc.page);
  return withPageEnd(head(pre, {
    title: `${title} | Pixy`, description: title, canonical: url, image: "assets/og/pixy.png",
  }) + `<body class="legal-page spaces-face bp-page lg-page">
    <div class="bp-progress" aria-hidden="true"><i></i></div>
${spacesNav(pre, "")}
    <main class="bp-article" data-no-reveal>
        <header class="bp-hero container lg-hero">
            <nav class="bp-crumbs" aria-label="Ruta"><a href="${pre}index.html">Inicio</a><span>/</span><a href="${pre}legal/index.html" ${i("index_t")}>Documentos legales</a></nav>
            <h1 class="bp-title lg-title">${esc(title)}</h1>
            <p class="bp-meta"><span ${i("version")}>Versión</span> ${esc(doc.data.version)} · <span ${i("since")}>Vigente desde el</span> <time datetime="${doc.data.vigencia}">${fmtDate(doc.data.vigencia)}</time></p>
            <p class="bp-lang-note lg-note" ${i("note")}></p>
        </header>
        <div class="bp-layout container lg-layout">
            <aside class="bp-rail lg-toc" aria-label="Contenido">
                <p class="lg-toc-title" ${i("contents")}>Contenido</p>
                <ol>
${toc.map((t) => `                    <li><a href="#${t.id}">${esc(t.t.replace(/^\d+\.\s*/, ""))}</a></li>`).join("\n")}
                </ol>
            </aside>
            <article class="bp-body lg-body">
${summary ? `                <div class="lg-summary" ${i(`summary_${doc.page.replace(/\W/g, "_")}`)}></div>` : ""}
${html}
            </article>
        </div>
        <section class="bp-related container lg-others" aria-labelledby="otros">
            <h2 id="otros" class="bp-section-title" ${i("all")}>Todos los documentos legales</h2>
            <ul class="lg-list">
${others.map((o) => `                <li><a href="${pre}${o.page}">${esc(o.data.titulo)}</a></li>`).join("\n")}
            </ul>
        </section>
    </main>
` + tail(pre)).replace(/\n/g, EOL);
}

function indexPage(docs) {
  const pre = "../";
  return withPageEnd(head(pre, {
    title: "Documentos legales | Pixy", description: I18N.es.index_s, canonical: `${SITE}/legal/index.html`, image: "assets/og/pixy.png",
  }) + `<body class="legal-page spaces-face bp-page lg-page">
${spacesNav(pre, "")}
    <main class="bp-index" data-no-reveal>
        <header class="bp-index-hero container">
            <h1 class="bp-index-title" ${i("index_t")}>Documentos legales</h1>
            <p class="bp-index-sub" ${i("index_s")}>${I18N.es.index_s}</p>
        </header>
        <section class="container">
            <ul class="lg-cards">
${docs.filter((d) => d.ok).map((d) => `                <li><a class="lg-card" href="${pre}${d.page}"><span class="lg-card-title">${esc(d.data.titulo)}</span><span class="bp-meta"><span ${i("version")}>Versión</span> ${esc(d.data.version)} · <span ${i("since")}>Vigente desde el</span> ${fmtDate(d.data.vigencia)}</span></a></li>`).join("\n")}
            </ul>
        </section>
    </main>
` + tail(pre)).replace(/\n/g, EOL);
}

export async function buildLegal() {
  const docs = loadDocs();
  const ready = docs.filter((d) => d.ok);
  for (const d of docs.filter((x) => !x.ok)) console.warn(`  legal sin publicar: ${d.file} (${d.why})`);
  if (!ready.length) { console.log("Legales: ningún documento vigente; quedan las páginas actuales"); return []; }
  mkdirSync(join(root, "legal"), { recursive: true });
  for (const d of ready) writeFileSync(join(root, d.page), page(d, docs), "utf8");
  writeFileSync(join(root, "legal/index.html"), indexPage(docs), "utf8");

  // Textos de la interfaz y resúmenes en inglés (el titular sale del documento 02)
  // Titular: la primera negrita de la sección 1 de la política (el nombre o la razón social)
  const owner = (/^##\s*1\.[^\n]*\n+\*\*([^*]+)\*\*/m.exec(docs.find((d) => d.page === "privacy.html")?.body || "") || [])[1] || "The owner of Pixy";
  for (const lang of ["es", "en"]) {
    const file = join(root, "locales", `${lang}.json`);
    const raw = readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    const t = { ...I18N[lang] };
    for (const [pg, html] of Object.entries(SUMMARY_EN)) t[`summary_${pg.replace(/\W/g, "_")}`] = lang === "en" ? html.replace("{OWNER}", owner) : "";
    data.legal2 = t;
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    writeFileSync(file, JSON.stringify(data, null, 2).replace(/\n/g, eol) + (raw.endsWith("\n") ? eol : ""), "utf8");
  }
  console.log(`Legales: ${ready.length} documentos publicados${docs.length > ready.length ? `, ${docs.length - ready.length} pendientes` : ""}`);
  return ready;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await buildLegal();
