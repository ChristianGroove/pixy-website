// Versiones WebP livianas de las imágenes pesadas del sitio (usa sharp de G:\Pixy\pixy-web).
// - Astronauta de la portada: 1000 px, con transparencia.
// - Portadas del blog: 1200 px de ancho. Los JPG originales se conservan para og:image y twitter:image.
// Uso: node tools/perf/optimize-images.mjs
import { createRequire } from "node:module";
import { readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("G:/Pixy/pixy-web/node_modules/sharp");
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const kb = (f) => Math.round(statSync(f).size / 1024) + " KB";

const jobs = [{ src: "assets/hero-astronaut.png", out: "assets/hero-astronaut.webp", width: 1000, quality: 82, alpha: true }];
for (const f of readdirSync(join(root, "assets/blog")).filter((f) => f.endsWith(".jpg"))) {
  jobs.push({ src: `assets/blog/${f}`, out: `assets/blog/${f.replace(/\.jpg$/, ".webp")}`, width: 1200, quality: 74 });
}
for (const j of jobs) {
  const src = join(root, j.src), out = join(root, j.out);
  await sharp(src).resize({ width: j.width, withoutEnlargement: true }).webp({ quality: j.quality, alphaQuality: j.alpha ? 90 : undefined, effort: 6 }).toFile(out);
  console.log(`${j.src} ${kb(src)} -> ${j.out} ${kb(out)}`);
}
