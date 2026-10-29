// BLOG DE PIXY: genera el blog desde content/blog/*.md (ver BLOG.md, la regla para alimentarlo).
// - blog/<slug>.html por artículo: portada, cuerpo, preguntas frecuentes, compartir, relacionados y datos
//   estructurados (BlogPosting, BreadcrumbList y FAQPage).
// - blog.html: índice con destacado, filtro por tema y tarjetas.
// - blog/feed.xml: RSS.
// - Portadas: tools/blog/covers-raw/<slug>.png -> assets/blog/<slug>.webp (página) y <slug>-og.jpg (redes).
// - article-*.html viejos: redirección al artículo nuevo equivalente o al blog.
// Uso: node tools/blog/build-blog.mjs   (o node tools/build-all.mjs, que corre todo el sitio en orden)
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spacesNav, spacesFooter, withPageEnd } from "../pages/chrome.mjs";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://pixy.com.co";
const EOL = "\r\n";

// --- Temas del blog: nombre y acento (los acentos de los Spaces y de la IA) ---------------------------
export const CATEGORIES = {
  atencion: { es: "Atención", en: "Customer care", accent: "#f205e2" },
  ventas: { es: "Ventas", en: "Sales", accent: "#38bdf8" },
  cobros: { es: "Cobros", en: "Billing", accent: "#FFC233" },
  operacion: { es: "Operación", en: "Operations", accent: "#00E0FF" },
  resto: { es: "Restaurantes", en: "Restaurants", accent: "#FF6A2B" },
  inmobiliaria: { es: "Inmobiliarias", en: "Real estate", accent: "#10D9A0" },
  tiendas: { es: "Tiendas", en: "Stores", accent: "#2E7BFF" },
  agencias: { es: "Agencias", en: "Agencies", accent: "#8B5CF6" },
};

// Textos de la interfaz del blog (los artículos van en español; en inglés se avisa)
const I18N = {
  es: {
    title: "Ideas para vender, atender y cobrar mejor.",
    sub: "Guías prácticas sobre IA, WhatsApp, ventas y operación, escritas desde lo que hace Pixy hoy.",
    all: "Todos", read: "min de lectura", by: "Equipo Pixy", featured: "Destacado",
    share: "Compartir", share_title: "Comparte este artículo", copy: "Copiar enlace", copied: "Enlace copiado",
    faq: "Preguntas frecuentes", related: "Sigue leyendo", back: "Volver al blog",
    cta_t: "Míralo con tu negocio.", cta_b: "Te mostramos Pixy con tu caso en una demo guiada.", cta_btn: "Agenda tu demo",
    cta_more: "Conoce la plataforma", lang_note: "", rss: "Suscríbete por RSS", breadcrumb: "Inicio",
  },
  en: {
    title: "Ideas to sell, serve and get paid better.",
    sub: "Practical guides on AI, WhatsApp, sales and operations, written from what Pixy does today.",
    all: "All", read: "min read", by: "Pixy Team", featured: "Featured",
    share: "Share", share_title: "Share this article", copy: "Copy link", copied: "Link copied",
    faq: "Frequently asked questions", related: "Keep reading", back: "Back to the blog",
    cta_t: "See it with your business.", cta_b: "We'll show you Pixy with your case in a guided demo.", cta_btn: "Book a demo",
    cta_more: "Explore the platform", lang_note: "This article is available in Spanish.", rss: "Subscribe via RSS", breadcrumb: "Home",
  },
};
const es = I18N.es;
const i = (k) => `data-i18n="blog2.${k}"`;

// --- Lectura de los artículos ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Encabezado YAML simple: clave: valor, y faq como lista de q/a. */
function frontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) throw new Error("Falta el encabezado ---");
  const data = { faq: [] };
  let inFaq = false, cur = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim()) continue;
    if (/^faq:\s*$/.test(raw)) { inFaq = true; continue; }
    if (inFaq && /^\s+-\s+q:\s*/.test(raw)) { cur = { q: raw.replace(/^\s+-\s+q:\s*/, "").trim(), a: "" }; data.faq.push(cur); continue; }
    if (inFaq && /^\s+a:\s*/.test(raw) && cur) { cur.a = raw.replace(/^\s+a:\s*/, "").trim(); continue; }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(raw);
    if (kv) { inFaq = false; data[kv[1]] = kv[2].trim(); }
  }
  return { data, body: src.slice(m[0].length) };
}

/** Markdown mínimo: ## y ###, párrafos, listas, citas, **negrita**, *cursiva* y [enlaces](url). */
function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u.replace(/&amp;/g, "&")}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`);
}
export function markdown(md) {
  const out = [], toc = [];
  let list = null, para = [];
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; }
    if (list) { out.push(`<${list.tag}>${list.items.map((x) => `<li>${inline(x)}</li>`).join("")}</${list.tag}>`); list = null; }
  };
  const slug = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  for (const line of md.split(/\r?\n/)) {
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    const ul = /^\s*-\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    const bq = /^>\s?(.*)$/.exec(line);
    if (h) { flush(); const id = slug(h[2]); if (h[1].length === 2) toc.push({ id, t: h[2] }); out.push(`<h${h[1].length} id="${id}">${inline(h[2])}</h${h[1].length}>`); }
    else if (ul || ol) { if (para.length) flush(); const tag = ul ? "ul" : "ol"; if (list && list.tag !== tag) flush(); list = list || { tag, items: [] }; list.items.push((ul || ol)[1]); }
    else if (bq) { flush(); out.push(`<blockquote><p>${inline(bq[1])}</p></blockquote>`); }
    else if (!line.trim()) flush();
    else { if (list) flush(); para.push(line.trim()); }
  }
  flush();
  return { html: out.join(EOL), toc };
}

export function loadPosts() {
  const dir = join(root, "content/blog");
  return readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => {
    const slug = f.replace(/\.md$/, "");
    const { data, body } = frontMatter(readFileSync(join(dir, f), "utf8"));
    for (const k of ["title", "description", "date", "category"]) if (!data[k]) throw new Error(`${f}: falta «${k}»`);
    if (!CATEGORIES[data.category]) throw new Error(`${f}: tema desconocido «${data.category}»`);
    const words = body.split(/\s+/).filter(Boolean).length;
    const paragraphs = body.trim().split(/\r?\n\r?\n/);
    const lead = paragraphs[0];
    const { html, toc } = markdown(paragraphs.slice(1).join("\n\n"));
    return {
      slug, ...data, updated: data.updated || data.date, lead, html, toc, words,
      minutes: Math.max(2, Math.round(words / 220)),
      keywords: (data.keywords || "").split(",").map((s) => s.trim()).filter(Boolean),
      url: `${SITE}/blog/${slug}.html`, cover: `assets/blog/${slug}.webp`, og: `assets/blog/${slug}-og.jpg`,
    };
  // Orden: el destacado (featured: true) primero, luego por fecha y por título
  }).sort((a, b) => (b.featured === "true") - (a.featured === "true") || (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

// --- Portadas ---------------------------------------------------------------------------------------------
async function covers(posts) {
  const sharp = require("G:/Pixy/pixy-web/node_modules/sharp");
  for (const p of posts) {
    const raw = join(root, "tools/blog/covers-raw", `${p.slug}.png`);
    const web = join(root, p.cover), og = join(root, p.og);
    if (!existsSync(raw)) { if (!existsSync(web)) console.warn(`  sin portada: ${p.slug}`); continue; }
    const fresh = (f) => existsSync(f) && statSync(f).mtimeMs >= statSync(raw).mtimeMs;
    if (!fresh(web)) await sharp(raw).resize({ width: 1376 }).webp({ quality: 76, effort: 6 }).toFile(web);
    if (!fresh(og)) await sharp(raw).resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 80, mozjpeg: true }).toFile(og);
  }
}

// --- Piezas comunes ---------------------------------------------------------------------------------------
const fmtDate = (d) => {
  const [y, m, day] = d.split("-").map(Number);
  const M = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return `${day} de ${M[m - 1]} de ${y}`;
};
const ld = (obj) => `    <script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const ORG = { "@type": "Organization", "@id": `${SITE}/#org`, name: "Pixy", url: `${SITE}/`, logo: { "@type": "ImageObject", url: `${SITE}/assets/favicon.png` } };

const THEME_BTN = `    <button class="theme-toggle" onclick="toggleTheme()" title="Cambiar tema" aria-label="Cambiar tema">
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>`;

function head(pre, { title, description, canonical, image, imageAlt, type = "website", extra = "", preload = "" }) {
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
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/png" href="${pre}assets/favicon.png">
    <link rel="alternate" type="application/rss+xml" title="Blog de Pixy" href="${SITE}/blog/feed.xml">
    <meta name="theme-color" content="#000000">
    <meta property="og:site_name" content="Pixy">
    <meta property="og:locale" content="es_ES">
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:image" content="${SITE}/${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(imageAlt || title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${SITE}/${image}">
${extra}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Unbounded:wght@500;700;800&display=swap" rel="stylesheet">
${preload}    <link rel="stylesheet" href="${pre}css/style.css">
    <link rel="stylesheet" href="${pre}css/components.css">
    <link rel="stylesheet" href="${pre}css/spaces-home.css">
    <link rel="stylesheet" href="${pre}css/blog.css">
</head>
`;
}

function tail(pre) {
  return `${spacesFooter(pre)}
${THEME_BTN}

    <!-- Fondo espacial (el del login de la plataforma) -->
    <script src="${pre}js/space-bg.js"></script>
    <script src="${pre}js/smooth-scroll.js"></script>
    <script src="${pre}js/i18n.js"></script>
    <script src="${pre}js/main.js"></script>
    <script src="${pre}js/blog.js"></script>
</body>

</html>
`;
}

// Íconos (glifos de cada red, un solo color)
const ICON = {
  whatsapp: '<path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/>',
  linkedin: '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  x: '<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zM17.61 20.64h2.04L6.49 3.24H4.3z"/>',
  facebook: '<path d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.09 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.38.04.76.11 1.14.2v3.32c-.22-.02-.43-.03-.65-.04-.25 0-.49-.01-.74-.01-.7 0-1.26.1-1.67.31-.29.15-.52.36-.68.62-.26.42-.38 1-.38 1.75v1.3h3.92l-.39 2.1-.28 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04 24 5.42 18.63.04 12 .04S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z"/>',
  mail: '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 5.5h18v13H3zM3.5 6l8.5 7 8.5-7"/>',
  link: '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M10 14a4.5 4.5 0 0 0 6.36 0l3.18-3.18a4.5 4.5 0 0 0-6.36-6.36L11.6 6.04M14 10a4.5 4.5 0 0 0-6.36 0l-3.18 3.18a4.5 4.5 0 0 0 6.36 6.36l1.58-1.58"/>',
  check: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.5l5 5 10-11"/>',
  share: '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7.5h14V12"/>',
  rss: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14"/><circle cx="6" cy="18" r="1.6" fill="currentColor"/>',
};
const svg = (name) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">${ICON[name]}</svg>`;

/** Botones para compartir: enlaces reales (funcionan sin JavaScript) más copiar y el menú nativo del teléfono. */
function shareButtons(p, variant) {
  const u = encodeURIComponent(p.url), t = encodeURIComponent(p.title);
  const nets = [
    ["whatsapp", "WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["linkedin", "LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ["x", "X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`],
    ["facebook", "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ["mail", "Email", `mailto:?subject=${t}&body=${t}%0A%0A${u}`],
  ];
  return `<div class="bp-share bp-share-${variant}" data-share data-url="${p.url}" data-title="${esc(p.title)}">
${nets.map(([k, label, href]) => `                <a class="bp-share-btn" data-net="${k}" href="${href}"${k === "mail" ? "" : ' target="_blank" rel="noopener"'} aria-label="${label}"><span class="bp-share-ico">${svg(k)}</span><span class="bp-share-tip">${label}</span></a>`).join("\n")}
                <button class="bp-share-btn" type="button" data-copy aria-label="${es.copy}"><span class="bp-share-ico">${svg("link")}${svg("check")}</span><span class="bp-share-tip" ${i("copy")} data-copied-label>${es.copy}</span></button>
                <button class="bp-share-btn bp-share-native" type="button" data-native aria-label="${es.share}"><span class="bp-share-ico">${svg("share")}</span><span class="bp-share-tip" ${i("share")}>${es.share}</span></button>
            </div>`;
}

function card(p, pre, extraClass = "") {
  const c = CATEGORIES[p.category];
  return `<a class="bp-card${extraClass}" href="${pre}blog/${p.slug}.html" data-cat="${p.category}" style="--acc:${c.accent}">
                <span class="bp-card-media"><img src="${pre}${p.cover}" alt="" width="1376" height="768" loading="lazy" decoding="async"></span>
                <span class="bp-card-body">
                    <span class="bp-cat" ${i(`cat_${p.category}`)}>${c.es}</span>
                    <span class="bp-card-title">${esc(p.title)}</span>
                    <span class="bp-card-dek">${esc(p.description)}</span>
                    <span class="bp-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} <span ${i("read")}>${es.read}</span></span>
                </span>
            </a>`;
}

// --- Artículo -------------------------------------------------------------------------------------------
function articlePage(p, posts) {
  const pre = "../";
  const c = CATEGORIES[p.category];
  const related = [...posts.filter((x) => x.slug !== p.slug && x.category === p.category), ...posts.filter((x) => x.slug !== p.slug && x.category !== p.category)].slice(0, 3);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting", "@id": `${p.url}#post`, headline: p.title, description: p.description,
        image: [`${SITE}/${p.og}`, `${SITE}/${p.cover}`], datePublished: p.date, dateModified: p.updated,
        inLanguage: "es", articleSection: c.es, keywords: p.keywords.join(", "), wordCount: p.words,
        author: { "@id": `${SITE}/#org` }, publisher: { "@id": `${SITE}/#org` }, mainEntityOfPage: p.url,
      },
      ORG,
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog.html` },
        { "@type": "ListItem", position: 3, name: p.title, item: p.url },
      ] },
      ...(p.faq.length ? [{ "@type": "FAQPage", mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
    ],
  };
  const extra = [
    `    <meta property="article:published_time" content="${p.date}">`,
    `    <meta property="article:modified_time" content="${p.updated}">`,
    `    <meta property="article:section" content="${c.es}">`,
    ld(graph),
  ].join("\n");
  const preload = `    <link rel="preload" as="image" href="${pre}${p.cover}" fetchpriority="high">\n`;
  const faq = p.faq.length ? `
            <section class="bp-faq" aria-labelledby="faq">
                <h2 id="faq" ${i("faq")}>${es.faq}</h2>
${p.faq.map((f) => `                <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
            </section>` : "";
  return withPageEnd(head(pre, {
    title: `${p.title} | Blog Pixy`, description: p.description, canonical: p.url, image: p.og, imageAlt: p.title, type: "article", extra, preload,
  }) + `<body class="blog-post-page spaces-face bp-page" style="--acc:${c.accent}">
    <div class="bp-progress" aria-hidden="true"><i></i></div>
${spacesNav(pre, "blog")}
    <main class="bp-article" data-no-reveal>
        <header class="bp-hero container">
            <nav class="bp-crumbs" aria-label="Ruta"><a href="${pre}index.html" ${i("breadcrumb")}>${es.breadcrumb}</a><span>/</span><a href="${pre}blog.html">Blog</a></nav>
            <span class="bp-cat" ${i(`cat_${p.category}`)}>${c.es}</span>
            <h1 class="bp-title">${esc(p.title)}</h1>
            <p class="bp-dek">${inline(p.lead)}</p>
            <p class="bp-meta"><span ${i("by")}>${es.by}</span> · <time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} <span ${i("read")}>${es.read}</span></p>
            <p class="bp-lang-note" ${i("lang_note")}></p>
        </header>
        <figure class="bp-cover container">
            <img src="${pre}${p.cover}" alt="${esc(p.title)}" width="1376" height="768" fetchpriority="high" decoding="async">
        </figure>
        <div class="bp-layout container">
            <aside class="bp-rail" aria-label="${es.share}">
                ${shareButtons(p, "rail")}
            </aside>
            <article class="bp-body">
${p.html}
${faq}
                <div class="bp-endshare">
                    <p ${i("share_title")}>${es.share_title}</p>
                    ${shareButtons(p, "row")}
                </div>
            </article>
        </div>
        <section class="bp-cta container">
            <div class="bp-cta-inner">
                <h2 ${i("cta_t")}>${es.cta_t}</h2>
                <p ${i("cta_b")}>${es.cta_b}</p>
                <div class="bp-cta-actions">
                    <a class="btn-neon" href="${pre}contact.html" data-warp-click="hop" ${i("cta_btn")}>${es.cta_btn}</a>
                    <a class="sh-link" href="${pre}${p.cta || "features.html"}" ${i("cta_more")}>${es.cta_more}</a>
                </div>
            </div>
        </section>
        <section class="bp-related container" aria-labelledby="rel">
            <h2 id="rel" class="bp-section-title" ${i("related")}>${es.related}</h2>
            <div class="bp-grid">
            ${related.map((r) => card(r, pre)).join("\n            ")}
            </div>
        </section>
    </main>
    <div class="bp-dock" aria-hidden="true">${shareButtons(p, "dock")}</div>
` + tail(pre)).replace(/\n/g, EOL);
}

// --- Índice ---------------------------------------------------------------------------------------------
function indexPage(posts) {
  const pre = "";
  const [first, ...rest] = posts;
  const cats = Object.keys(CATEGORIES).filter((k) => posts.some((p) => p.category === k));
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Blog", "@id": `${SITE}/blog.html#blog`, name: "Blog de Pixy", description: es.sub, url: `${SITE}/blog.html`, inLanguage: "es", publisher: { "@id": `${SITE}/#org` },
        blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: p.url, datePublished: p.date, image: `${SITE}/${p.og}` })) },
      ORG,
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog.html` },
      ] },
    ],
  };
  return withPageEnd(head(pre, {
    title: "Blog de Pixy: IA, WhatsApp, ventas y operación para tu negocio",
    description: "Guías prácticas para atender con IA, vender por WhatsApp e Instagram, ordenar tu pipeline y cobrar sin perseguir a nadie. Escritas por el equipo de Pixy.",
    canonical: `${SITE}/blog.html`, image: "assets/og/blog.png", imageAlt: "Blog de Pixy", extra: ld(graph),
    preload: `    <link rel="preload" as="image" href="${first.cover}" fetchpriority="high">\n`,
  }) + `<body class="blog-page spaces-face bp-page">
${spacesNav(pre, "blog")}
    <main class="bp-index" data-no-reveal>
        <header class="bp-index-hero container">
            <h1 class="bp-index-title" ${i("title")}>${es.title}</h1>
            <p class="bp-index-sub" ${i("sub")}>${es.sub}</p>
            <div class="bp-filters" role="tablist" aria-label="Temas">
                <button type="button" class="bp-filter is-active" data-filter="all" role="tab" aria-selected="true" ${i("all")}>${es.all}</button>
${cats.map((k) => `                <button type="button" class="bp-filter" data-filter="${k}" role="tab" aria-selected="false" style="--acc:${CATEGORIES[k].accent}" ${i(`cat_${k}`)}>${CATEGORIES[k].es}</button>`).join("\n")}
                <a class="bp-rss" href="blog/feed.xml" aria-label="RSS">${svg("rss")}<span ${i("rss")}>${es.rss}</span></a>
            </div>
        </header>
        <section class="container bp-featured-wrap">
            ${card(first, pre, " bp-card-featured").replace('loading="lazy"', 'fetchpriority="high"')}
        </section>
        <section class="container">
            <div class="bp-grid" data-grid>
            ${rest.map((p) => card(p, pre)).join("\n            ")}
            </div>
        </section>
    </main>
` + tail(pre)).replace(/\n/g, EOL);
}

function feed(posts) {
  const item = (p) => `    <item><title>${esc(p.title)}</title><link>${p.url}</link><guid>${p.url}</guid><pubDate>${new Date(p.date + "T12:00:00Z").toUTCString()}</pubDate><category>${CATEGORIES[p.category].es}</category><description>${esc(p.description)}</description></item>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog de Pixy</title>
    <link>${SITE}/blog.html</link>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(es.sub)}</description>
    <language>es</language>
${posts.map(item).join("\n")}
  </channel>
</rss>
`;
}

// URL viejas (sitio anterior) -> artículo nuevo equivalente; las demás van al blog
export const OLD = {
  "ai-whatsapp-agents": "ia-que-atiende-whatsapp", "human-in-the-loop-support": "ia-que-atiende-whatsapp",
  "whatsapp-crm": "bandeja-compartida-whatsapp", "omnichannel": "bandeja-compartida-whatsapp",
  "conversational-commerce": "comentarios-que-venden", "predictive-lead-scoring": "calificar-clientes-con-evidencia",
  "smart-restaurants-pos": "restaurante-sin-comandas-perdidas", "real-estate-crm": "liquidar-arriendos-sin-hoja-de-calculo",
  "headless-ecommerce": "tienda-en-linea-desde-tu-catalogo", "automated-billing-stripe": "cobrar-sin-perseguir",
  "saas-sprawl-consolidation": "herramientas-sueltas", "operational-chaos": "herramientas-sueltas", "spaces-vs-erp": "herramientas-sueltas",
  "agency-retention-churn": "agencia-portal-del-cliente",
  "automation": null, "data-driven": null, "data-governance-smes": null, "design-systems-agencies": null,
  "future-business-os-2026": null, "retail-sync-case-study": null, "spaces-v2-launch": null, "web-performance-conversion": null,
};
const redirect = (to) => `<!DOCTYPE html>${EOL}<html lang="es">${EOL}<head>${EOL}    <meta charset="UTF-8">${EOL}    <meta name="robots" content="noindex, follow">${EOL}    <link rel="canonical" href="${SITE}/${to}">${EOL}    <meta http-equiv="refresh" content="0; url=${to}">${EOL}    <title>Blog de Pixy</title>${EOL}    <script>location.replace(${JSON.stringify(to)});</script>${EOL}</head>${EOL}<body><a href="${to}">Blog de Pixy</a></body>${EOL}</html>${EOL}`;

// --- Ejecución ------------------------------------------------------------------------------------------
export async function buildBlog() {
  const posts = loadPosts();
  mkdirSync(join(root, "blog"), { recursive: true });
  await covers(posts);
  for (const p of posts) writeFileSync(join(root, "blog", `${p.slug}.html`), articlePage(p, posts), "utf8");
  writeFileSync(join(root, "blog.html"), indexPage(posts), "utf8");
  writeFileSync(join(root, "blog", "feed.xml"), feed(posts), "utf8");
  for (const [old, slug] of Object.entries(OLD)) writeFileSync(join(root, `article-${old}.html`), redirect(slug ? `blog/${slug}.html` : "blog.html"), "utf8");

  // Imagen para compartir del índice y textos de la interfaz
  const { renderOg } = await import("../og/og.mjs");
  if (!existsSync(join(root, "assets/og/blog.png"))) await renderOg({ title: es.title, label: "Blog de Pixy", out: join(root, "assets/og/blog.png") });
  for (const lang of ["es", "en"]) {
    const file = join(root, "locales", `${lang}.json`);
    const raw = readFileSync(file, "utf8");
    const data = JSON.parse(raw);
    const t = { ...I18N[lang] };
    for (const [k, c] of Object.entries(CATEGORIES)) t[`cat_${k}`] = c[lang];
    data.blog2 = t;
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    writeFileSync(file, JSON.stringify(data, null, 2).replace(/\n/g, eol) + (raw.endsWith("\n") ? eol : ""), "utf8");
  }
  console.log(`${posts.length} artículos, índice, feed y ${Object.keys(OLD).length} redirecciones`);
  return posts;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await buildBlog();
