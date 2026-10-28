// Aplica el encabezado y el pie únicos de la cara Spaces a las páginas que no se generan
// (portada, blog, artículos y legales) y escribe sus textos en locales/*.json.
// Las páginas generadas los toman al regenerarse (build-pages.mjs y build-studio.mjs).
// Uso: node tools/pages/apply-chrome.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spacesNav, spacesFooter, writeChromeI18n } from "./chrome.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LEGAL = ["privacy.html", "terms.html", "cookies.html", "data-deletion.html", "permissions.html"];
const files = ["index.html", "blog.html", ...readdirSync(root).filter((f) => /^article-.*\.html$/.test(f)), ...LEGAL];

let n = 0;
for (const f of files) {
  const p = join(root, f);
  let c = readFileSync(p, "utf8");
  const eol = c.includes("\r\n") ? "\r\n" : "\n";
  const active = f === "blog.html" || f.startsWith("article-") ? "blog" : "";
  const before = c;
  c = c.replace(/ {4}<nav class="nav">[\s\S]*?<\/nav>\r?\n/, spacesNav("", active).replace(/\n/g, eol));
  c = c.replace(/ *<footer[\s\S]*?<\/footer>/, spacesFooter("").replace(/\n/g, eol));
  if (c !== before) {
    writeFileSync(p, c, "utf8");
    n++;
  }
}
writeChromeI18n(readFileSync, writeFileSync, join, root);
console.log(`${n} de ${files.length} páginas con el encabezado y el pie únicos`);
