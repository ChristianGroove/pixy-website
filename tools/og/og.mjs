// Imágenes para compartir (Open Graph, 1200×630) con la estética del sitio: fondo negro con estrellas,
// logo, etiqueta en el color de la sección, título en Unbounded y el orbe de la IA en ese color.
// Usa el renderizador de Next.js (satori + resvg) que trae G:\Pixy\pixy-web y las fuentes de tools/og/fonts.
// Uso desde otros scripts: await renderOg({ title, label, accent, out })
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("G:/Pixy/pixy-web/node_modules/next/dist/compiled/@vercel/og/index.node.js");
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const font = (f) => readFileSync(join(here, "fonts", f));
const FONTS = [
  { name: "Unbounded", data: font("unbounded-700.ttf"), weight: 700, style: "normal" },
  { name: "Inter", data: font("inter-500.ttf"), weight: 500, style: "normal" },
  { name: "Inter", data: font("inter-700.ttf"), weight: 700, style: "normal" },
];
const LOGO = "data:image/svg+xml;base64," + readFileSync(join(root, "assets/logos/logo-light.svg")).toString("base64");

const h = (type, style, children) => ({ type, props: { style: { display: "flex", ...style }, children } });

// Estrellas fijas (siempre las mismas posiciones): el fondo del sitio, sin animación
function stars() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 70 }, () => {
    const s = rnd() < 0.85 ? 2 : 3;
    return h("div", { position: "absolute", left: Math.round(rnd() * 1200), top: Math.round(rnd() * 630), width: s, height: s, borderRadius: s, background: rnd() < 0.2 ? "#ff0cf7" : "#ffffff", opacity: 0.25 + rnd() * 0.5 });
  });
}

/** Mezcla un color hex con blanco (t de 0 a 1). */
function lighten(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t));
  return `rgb(${c.join(",")})`;
}

export async function renderOg({ title, label, accent = "#f205e2", footer = "pixy.com.co", out }) {
  const size = title.length > 60 ? 50 : title.length > 40 ? 58 : 66;
  const el = h("div", { width: 1200, height: 630, display: "flex", position: "relative", background: "#000000", fontFamily: "Inter", overflow: "hidden" }, [
    ...stars(),
    // El orbe de la IA, en el color de la sección
    h("div", {
      position: "absolute", right: -120, bottom: -150, width: 520, height: 520, borderRadius: 520,
      background: `radial-gradient(circle at 34% 30%, ${lighten(accent, 0.75)} 0%, ${lighten(accent, 0.25)} 28%, ${accent} 62%, ${accent} 100%)`,
    }, []),
    h("div", { position: "absolute", left: 80, top: 72, right: 380, bottom: 72, display: "flex", flexDirection: "column", justifyContent: "space-between" }, [
      { type: "img", props: { src: LOGO, width: 168, height: 36, style: { width: 168, height: 36 } } },
      h("div", { display: "flex", flexDirection: "column" }, [
        h("div", { fontSize: 26, fontWeight: 700, color: accent, marginBottom: 22 }, label),
        h("div", { fontFamily: "Unbounded", fontSize: size, fontWeight: 700, lineHeight: 1.12, color: "#ffffff", letterSpacing: -1 }, title),
      ]),
      h("div", { fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.55)" }, footer),
    ]),
  ]);
  const res = new ImageResponse(el, { width: 1200, height: 630, fonts: FONTS });
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  return buf.length;
}

// node tools/og/og.mjs → imágenes generales del sitio
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const jobs = [
    { title: "El sistema operativo de tu negocio.", label: "Pixy Spaces", out: "assets/og/pixy.png" },
    { title: "Tu marca, en portada.", label: "Pixy Studio", out: "assets/og/studio.png" },
  ];
  for (const j of jobs) console.log(j.out, Math.round((await renderOg({ ...j, out: join(root, j.out) })) / 1024) + " KB");
}
