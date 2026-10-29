// Construye todo el sitio en el orden correcto. Uso: node tools/build-all.mjs
// 1. Páginas de Spaces y de Studio (generadores)  2. Encabezado y pie de las páginas fijas
// 3. Blog (artículos, índice, feed, portadas)      4. SEO de todas las páginas, sitemap y robots
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const run = (script) => execFileSync(process.execPath, [join(here, script)], { stdio: "inherit" });

run("pages/build-pages.mjs");
run("pages/build-studio.mjs");
run("pages/apply-chrome.mjs");
const { buildBlog } = await import("./blog/build-blog.mjs");
const posts = await buildBlog();
const { buildSeo } = await import("./seo/seo.mjs");
await buildSeo(posts);
