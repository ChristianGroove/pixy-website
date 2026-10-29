// SEO DEL SITIO: título, descripción, canonical, Open Graph, Twitter y datos estructurados de cada página
// (bloque <!-- seo --> en el <head>), más sitemap.xml y robots.txt. El blog trae su SEO desde build-blog.mjs;
// aquí solo se suma al sitemap. Corre al final de tools/build-all.mjs, después de los generadores.
// Reglas: título de 30 a 60 caracteres con la palabra clave al inicio; descripción de 120 a 160; una imagen
// 1200×630 por cara (assets/og); nunca cifras ni promesas que no estén en docs/comercial.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SOCIAL as PROFILES } from "../pages/chrome.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://pixy.com.co";
export const CONTACT = { email: "contact@pixy.com.co", phone: "+57 350 407 6800", whatsapp: "https://wa.me/573504076800" };
// Perfiles oficiales en redes (Organization.sameAs): se definen en tools/pages/chrome.mjs
const SOCIAL = PROFILES.map((s) => s.url);

const SPACES = "assets/og/pixy.png", STUDIO = "assets/og/studio.png";
const PAGES = {
  "index.html": { path: "", title: "Pixy: el sistema operativo de tu negocio, con IA", description: "Atiende por WhatsApp con IA, vende con un pipeline que te dice qué hacer hoy, opera tu industria y cobra sin perseguir a nadie. Elige el Space de tu negocio.", og: SPACES, priority: "1.0", home: true },
  "spaces.html": { title: "Pixy Spaces: software hecho para tu industria", description: "Restaurantes, tiendas, inmobiliarias, colegios, agencias y software: cada Space trae los módulos, las palabras y los portales de tu industria, con IA incluida.", og: SPACES, priority: "0.9", crumb: "Spaces" },
  "features.html": { title: "Plataforma Pixy: WhatsApp con IA, CRM, tareas y cobros", description: "Bandeja omnicanal con IA, calificación de clientes, pipeline vivo, campañas, tareas, formularios, facturas y links de pago, conectados entre sí.", og: SPACES, priority: "0.9", crumb: "Plataforma" },
  "pricing.html": { title: "Precios de Pixy: IA que atiende desde 29 USD al mes", description: "Esencial, Pro y Total para cada Space, en USD, con Respuestas de IA, WhatsApp y Pixy Social incluidos. Pago anual con dos meses gratis.", og: SPACES, priority: "0.9", crumb: "Precios", faq: true, offers: true },
  "contact.html": { title: "Agenda una demo de Pixy con tu negocio", description: "Cuéntanos de tu negocio y te mostramos Pixy con tu caso en una demo guiada. Escríbenos a contact@pixy.com.co o por WhatsApp al +57 350 407 6800.", og: SPACES, priority: "0.8", crumb: "Contacto", type: "ContactPage" },
  "partners.html": { title: "Partners de Pixy: vende IA con tu marca", description: "Programa de partners para agencias y consultores: Pixy con tu marca y tu dominio, panel para tus clientes, cuentas de demostración y soporte prioritario.", og: SPACES, priority: "0.7", crumb: "Partners" },
  "space-agency.html": { title: "Software para agencias: Space Agencias de Pixy", description: "Proyectos, freelancers con PIN, briefings, cobros recurrentes, portal del cliente e informes de redes para tu agencia, con marca blanca para revender.", og: SPACES, priority: "0.8", crumb: "Space Agencias" },
  "space-restaurant.html": { title: "Software para restaurantes: Space Resto de Pixy", description: "Menú digital, pedidos desde la mesa con QR, cocina, caja y equipo con PIN, con IA que atiende por WhatsApp. Precios en USD.", og: SPACES, priority: "0.8", crumb: "Space Resto" },
  "space-stores.html": { title: "Software para tiendas: Space Tiendas de Pixy", description: "Tienda en línea desde tu catálogo, pedidos, varias sedes y comentarios que venden con Pixy Social, con IA que atiende. Precios en USD.", og: SPACES, priority: "0.8", crumb: "Space Tiendas" },
  "space-real-estate.html": { title: "Software inmobiliario: Space Inmobiliaria de Pixy", description: "Propiedades publicadas con tu marca, cotizaciones, arriendos y liquidaciones a propietarios, con IA que atiende por WhatsApp. Precios en USD.", og: SPACES, priority: "0.8", crumb: "Space Inmobiliaria" },
  "space-edu.html": { title: "Software para colegios: Pixy Edu", description: "Académico, asistencia, portal de familias y docentes, y cobro de pensiones para tu colegio. Precio por sede según estudiantes activos, con calculadora.", og: SPACES, priority: "0.8", crumb: "Pixy Edu" },
  "space-saas.html": { title: "Software para startups SaaS: Space SaaS de Pixy", description: "Tu software con bandeja de WhatsApp e IA, CRM, tareas y proyectos, hosting y monitor de anuncios de Meta, conectados. Precios en USD.", og: SPACES, priority: "0.8", crumb: "Space SaaS" },
  "agency.html": { title: "Pixy Studio: marca, contenido, webs y pauta", description: "Marca, contenido, webs, tiendas y pauta con dirección de arte de revista, conectados a un sistema que vende. Paquetes, equipo dedicado o a la medida.", og: STUDIO, priority: "0.9", crumb: "Pixy Studio", studio: true },
  "agency/services.html": { title: "Paquetes de Pixy Studio: la colección", description: "Paquetes de marca, contenido, web, tienda, temporada y lanzamiento con dirección de arte y entregas claras, listos para empezar cuando tu marca lo necesite.", og: STUDIO, priority: "0.8", crumb: "Paquetes", studio: true },
  "agency/plans.html": { title: "Cómo trabajar con Pixy Studio: tres formas", description: "Paquetes con inicio y fin, Front Row como tu equipo creativo dedicado, o un proyecto a la medida. Elige la forma de trabajar que le sirve a tu marca.", og: STUDIO, priority: "0.8", crumb: "Planes", studio: true },
  "agency/portfolio.html": { title: "Trabajos de Pixy Studio", description: "Trabajos de Pixy Studio en marca, contenido, web y sistema visual. Mostramos el trabajo real; los casos de clientes llegan con su permiso.", og: STUDIO, priority: "0.6", crumb: "Trabajos", studio: true },
  "agency/contact.html": { title: "Abre tu casting con Pixy Studio", description: "Cuéntanos de tu marca y lo que quieres lograr. Te respondemos con una propuesta. Escríbenos a contact@pixy.com.co o por WhatsApp.", og: STUDIO, priority: "0.7", crumb: "Casting", studio: true, type: "ContactPage" },
  "privacy.html": { title: "Política de privacidad y tratamiento de datos | Pixy", description: "Cómo trata Pixy los datos personales de clientes, prospectos y visitantes, con qué finalidades y cómo ejercer tus derechos de acceso, corrección y supresión.", og: SPACES, priority: "0.3", crumb: "Privacidad" },
  "terms.html": { title: "Términos y condiciones de Pixy", description: "Condiciones de uso de Pixy Spaces: cuentas, suscripciones, pagos, uso aceptable, datos, integraciones, responsabilidad y terminación del servicio.", og: SPACES, priority: "0.3", crumb: "Términos" },
  "cookies.html": { title: "Política de cookies | Pixy", description: "Qué guarda el sitio y la plataforma de Pixy en tu navegador, para qué lo usamos y cómo puedes gestionarlo o eliminarlo desde tu navegador.", og: SPACES, priority: "0.2", crumb: "Cookies" },
  "data-deletion.html": { title: "Eliminación de datos | Pixy", description: "Cómo solicitar la eliminación de tus datos en Pixy, incluidos los recibidos de Facebook, Instagram y WhatsApp, y en qué plazos respondemos.", og: SPACES, priority: "0.3", crumb: "Eliminación de datos" },
  "legal/index.html": { title: "Documentos legales de Pixy", description: "Las reglas con las que Pixy trabaja: tratamiento de datos personales, términos, cookies, uso aceptable, encargo de tratamiento y subencargados.", og: SPACES, priority: "0.3", crumb: "Documentos legales" },
  "legal/uso-aceptable.html": { title: "Uso aceptable y mensajería | Pixy", description: "Qué se puede y qué no se puede hacer con Pixy: mensajes de WhatsApp, campañas, consentimiento, horarios de contacto y contenido prohibido.", og: SPACES, priority: "0.3", crumb: "Uso aceptable" },
  "legal/encargo-de-tratamiento.html": { title: "Acuerdo de encargo de tratamiento (DPA) | Pixy", description: "Cómo trata Pixy, como encargado, los datos personales que tus clientes y contactos dejan en tu Space: instrucciones, seguridad, subencargados e incidentes.", og: SPACES, priority: "0.3", crumb: "Encargo de tratamiento" },
  "legal/subencargados.html": { title: "Subencargados de Pixy", description: "Los proveedores que tratan datos para que Pixy funcione: infraestructura, base de datos, inteligencia artificial, correo y mensajería, con su país.", og: SPACES, priority: "0.2", crumb: "Subencargados" },
  "legal/terminos-pixy-studio.html": { title: "Términos de Pixy Studio", description: "Condiciones de los servicios de Pixy Studio: paquetes, equipo dedicado y proyectos a la medida, entregas, revisiones, pagos y propiedad del trabajo.", og: STUDIO, priority: "0.3", crumb: "Términos de Pixy Studio" },
  "legal/tiendas-y-menus.html": { title: "Tiendas, menús y portales generados | Pixy", description: "Condiciones para las tiendas, menús y portales que publicas con Pixy: quién vende, qué debes informar a tus compradores y cómo se tratan sus datos.", og: SPACES, priority: "0.2", crumb: "Tiendas y menús" },
  "legal/menores-pixy-edu.html": { title: "Datos de menores en Pixy Edu", description: "Cómo trata Pixy Edu los datos de estudiantes menores de edad: autorizaciones de acudientes, datos sensibles, acceso por roles y uso de la IA.", og: SPACES, priority: "0.2", crumb: "Menores en Pixy Edu" },
  "permissions.html": { title: "Instrucciones para revisores | Pixy", description: "Instrucciones para los revisores de las plataformas sobre los permisos que usa Pixy.", og: SPACES, noindex: true },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const ORG = {
  "@type": "Organization", "@id": `${SITE}/#org`, name: "Pixy", url: `${SITE}/`,
  logo: { "@type": "ImageObject", url: `${SITE}/assets/favicon.png` },
  email: CONTACT.email,
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: CONTACT.email, telephone: CONTACT.phone, availableLanguage: ["es", "en"] }],
  ...(SOCIAL.length ? { sameAs: SOCIAL } : {}),
};

const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function block(file, p, html = "") {
  const url = `${SITE}/${p.path ?? file}`;
  const graph = [ORG];
  if (p.home) {
    graph.push({ "@type": "WebSite", "@id": `${SITE}/#site`, name: "Pixy", url: `${SITE}/`, inLanguage: "es", publisher: { "@id": `${SITE}/#org` } });
  } else {
    const items = [{ name: "Inicio", item: `${SITE}/` }];
    if (p.studio && file !== "agency.html") items.push({ name: "Pixy Studio", item: `${SITE}/agency.html` });
    items.push({ name: p.crumb || p.title, item: url });
    graph.push({ "@type": "BreadcrumbList", itemListElement: items.map((x, n) => ({ "@type": "ListItem", position: n + 1, ...x })) });
  }
  graph.push({ "@type": p.type || "WebPage", "@id": `${url}#page`, url, name: p.title, description: p.description, inLanguage: "es", isPartOf: { "@id": `${SITE}/#site` }, publisher: { "@id": `${SITE}/#org` } });
  if (p.faq) {
    const qa = [...html.matchAll(/<details class="pr-faq-item"><summary[^>]*>([\s\S]*?)<\/summary><p[^>]*>([\s\S]*?)<\/p><\/details>/g)];
    if (qa.length) graph.push({ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: qa.map(([, q, a]) => ({ "@type": "Question", name: strip(q), acceptedAnswer: { "@type": "Answer", text: strip(a) } })) });
  }
  if (p.offers) {
    // Rango de precios de los Spaces (USD al mes), desde content/pricing.json
    const pr = JSON.parse(readFileSync(join(root, "content", "pricing.json"), "utf8"));
    const all = Object.values(pr.spaces).flatMap((x) => x.prices);
    graph.push({ "@type": "Product", name: "Pixy Spaces", description: p.description, brand: { "@id": `${SITE}/#org` }, url, offers: { "@type": "AggregateOffer", priceCurrency: pr.currency, lowPrice: Math.min(...all), highPrice: Math.max(...all), offerCount: all.length } });
  }
  if (p.studio && file === "agency.html") graph.push({ "@type": "Service", name: "Pixy Studio", serviceType: "Marca, contenido, webs, tiendas y pauta", provider: { "@id": `${SITE}/#org` }, areaServed: "Worldwide", url });
  return `    <!-- seo: tools/seo/seo.mjs -->
    <title>${esc(p.title)}</title>
    <meta name="description" content="${esc(p.description)}">
    <meta name="robots" content="${p.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
    <link rel="canonical" href="${url}">
    <meta name="theme-color" content="#000000">
    <meta property="og:site_name" content="Pixy">
    <meta property="og:locale" content="es_ES">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(p.title)}">
    <meta property="og:description" content="${esc(p.description)}">
    <meta property="og:image" content="${SITE}/${p.og}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(p.title)}">
    <meta name="twitter:description" content="${esc(p.description)}">
    <meta name="twitter:image" content="${SITE}/${p.og}">
    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
    <!-- /seo -->`;
}

/** Quita del <head> todo lo que el bloque reemplaza (versiones viejas incluidas) y pone el bloque. */
function apply(html, seo) {
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  let [headPart, rest] = [html.slice(0, html.indexOf("</head>")), html.slice(html.indexOf("</head>"))];
  headPart = headPart
    .replace(/[ \t]*<!-- seo:[\s\S]*?<!-- \/seo -->\r?\n?/g, "")
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/g, "")
    .replace(/[ \t]*<meta\s+(name|property)="(description|keywords|robots|author|theme-color|og:[^"]+|twitter:[^"]+)"[\s\S]*?>\r?\n?/g, "")
    .replace(/[ \t]*<link rel="canonical"[^>]*>\r?\n?/g, "")
    .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\r?\n?/g, "")
    .replace(/[ \t]*<!-- (Open Graph|Twitter Card|Twitter|Schema[^>]*|SEO[^>]*) -->\r?\n?/g, "");
  headPart = headPart.replace(/(<meta name="viewport"[^>]*>\r?\n)/, `$1${seo.replace(/\n/g, eol)}${eol}`);
  return headPart + rest;
}

export async function buildSeo(posts = []) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  for (const [file, p] of Object.entries(PAGES)) {
    const f = join(root, file);
    if (!existsSync(f)) continue;
    const html = readFileSync(f, "utf8");
    if (/http-equiv="refresh"/.test(html)) continue;
    writeFileSync(f, apply(html, block(file, p, html)), "utf8");
    if (!p.noindex) urls.push({ loc: `${SITE}/${p.path ?? file}`, lastmod: today, priority: p.priority || "0.5" });
  }
  urls.push({ loc: `${SITE}/blog.html`, lastmod: posts[0]?.updated || today, priority: "0.8" });
  for (const post of posts) urls.push({ loc: post.url, lastmod: post.updated, priority: "0.7" });

  writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`, "utf8");
  writeFileSync(join(root, "robots.txt"), `User-agent: *
Allow: /
Disallow: /tools/
Disallow: /content/

Sitemap: ${SITE}/sitemap.xml
`, "utf8");
  console.log(`SEO en ${Object.keys(PAGES).length} páginas; sitemap con ${urls.length} URL`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { loadPosts } = await import("../blog/build-blog.mjs");
  await buildSeo(loadPosts());
}
