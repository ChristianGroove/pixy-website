// Página 404 con la estética del sitio. Usa rutas absolutas (/css/…, /index.html) porque el servidor la
// muestra en cualquier ruta que no exista, a cualquier profundidad. La corre tools/build-all.mjs.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spacesNav, withPageEnd } from "./chrome.mjs";
import { head, tail } from "../blog/build-blog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pre = "/";

export function build404() {
  const html = withPageEnd(head(pre, {
    title: "Página no encontrada | Pixy",
    description: "La página que buscas no existe o cambió de dirección.",
    canonical: "https://pixy.com.co/404.html",
    image: "assets/og/pixy.png",
  }).replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"') + `<body class="landing-page spaces-face bp-page">
${spacesNav(pre, "")}
    <main class="bp-index nf" data-no-reveal>
        <section class="container nf-inner">
            <p class="nf-code" aria-hidden="true">404</p>
            <h1 class="bp-index-title" data-i18n="nf.title">Esta página se perdió en el espacio.</h1>
            <p class="bp-index-sub" data-i18n="nf.sub">La dirección no existe o cambió. Sigue por aquí:</p>
            <div class="sp-actions nf-actions">
                <a class="btn-neon" href="/index.html" data-warp-click="hop" data-i18n="nf.home">Ir al inicio</a>
                <a class="sh-link" href="/blog.html" data-i18n="nf.blog">Leer el blog</a>
                <a class="sh-link" href="/contact.html" data-i18n="nf.contact">Escríbenos</a>
            </div>
        </section>
    </main>
` + tail(pre)).replace(/\n/g, "\r\n");
  writeFileSync(join(root, "404.html"), html, "utf8");
  console.log("404.html");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) build404();
