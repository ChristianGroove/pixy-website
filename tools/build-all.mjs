// Construye todo el sitio en el orden correcto. Uso: node tools/build-all.mjs
// 1. Encabezado y pie de las páginas fijas  2. Páginas de Spaces y de Studio (generadores)
// 3. Blog (artículos, índice, feed, portadas)      4. SEO de todas las páginas, sitemap y robots
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const run = (script) => execFileSync(process.execPath, [join(here, script)], { stdio: "inherit" });

// Primero el encabezado y pie de la portada: build-pages copia el pie desde index.html
run("pages/apply-chrome.mjs");
run("pages/build-pages.mjs");
run("pages/build-studio.mjs");
const { buildBlog } = await import("./blog/build-blog.mjs");
const posts = await buildBlog();
const { buildSeo } = await import("./seo/seo.mjs");
await buildSeo(posts);
