// Convierte los sujetos elegidos para Pixy Studio a WebP optimizado (assets/studio/).
// Uso: node tools/studio/optimize-subjects.mjs   (usa sharp de G:/Pixy/pixy-web)
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire("G:/Pixy/pixy-web/package.json");
const sharp = require("sharp");

const SRC = join(root, "assets/sujetos pagina pixy");
const OUT = join(root, "assets/studio");
mkdirSync(OUT, { recursive: true });

// Un sujeto por paquete: los más limpios (sin redes sociales ni paneles saturados)
const PICK = {
  hero: "graphic design.png",
  rayos: "ux research.png",
  debut: "branding.png",
  portada: "ui design.png",
  tienda: "ecommerce.png",
  temporada: "content creator.png",
  ignicion: "ads.png",
  frontrow: "digital strategy2.png",
  laboratorio: "developer.png",
  pixy: "concept launch.png",
};

for (const [name, file] of Object.entries(PICK)) {
  const info = await sharp(join(SRC, file)).resize({ height: 1100, withoutEnlargement: true }).webp({ quality: 78, alphaQuality: 90 }).toFile(join(OUT, `${name}.webp`));
  console.log(`${name}.webp  ${Math.round(info.size / 1024)} KB`);
}
