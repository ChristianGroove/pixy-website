// Versión de los archivos estáticos: agrega ?v=<huella del contenido> a cada CSS y JS propio en todas las
// páginas, y la huella de las traducciones al script de i18n (data-locales). Así, al publicar, nadie ve el HTML
// nuevo con estilos o scripts viejos guardados en caché (Cloudflare y los navegadores los guardan horas).
// Último paso de tools/build-all.mjs: corre después de que todas las páginas estén generadas.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SKIP = new Set(["tools", "content", "node_modules", ".git", ".claude", "assets", "css", "js", "locales", "_audit_reports"]);
const hash = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 10);

function pages(dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return dir === root && SKIP.has(e.name) ? [] : pages(join(dir, e.name));
    return e.name.endsWith(".html") ? [join(dir, e.name)] : [];
  });
}

export function versionAssets() {
  const cache = {};
  const v = (file) => (cache[file] ??= existsSync(file) ? hash(readFileSync(file)) : null);
  const locales = hash(Buffer.concat(["es", "en"].map((l) => readFileSync(join(root, "locales", `${l}.json`)))));
  let n = 0;
  for (const page of pages()) {
    const html = readFileSync(page, "utf8");
    const out = html
      .replace(/((?:href|src)=")((?:\.\.\/|\/)?(?:css|js)\/[\w.-]+\.(?:css|js))(?:\?v=[\w]+)?"/g, (all, attr, url) => {
        const file = url.startsWith("/") ? join(root, url) : join(dirname(page), url);
        const h = v(file);
        return h ? `${attr}${url}?v=${h}"` : all;
      })
      .replace(/(<script src="(?:\.\.\/|\/)?js\/i18n\.js\?v=\w+")(?: data-locales="\w+")?>/g, `$1 data-locales="${locales}">`);
    if (out !== html) { writeFileSync(page, out, "utf8"); n++; }
  }
  console.log(`Versión de CSS/JS en ${n} páginas (traducciones ${locales})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) versionAssets();
