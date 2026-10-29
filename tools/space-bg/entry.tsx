/**
 * Fondo espacial de la cara Spaces: EL MISMO del login de la plataforma.
 * particles.tsx, warp-controller.ts y space-background.config.ts se copian tal cual de
 * agency-manager (src/components/ui/backgrounds/); el montaje replica space-backdrop.tsx:
 * fondo negro (#edf0f4 en claro) y partículas encima. Sin el resplandor de marca: el sitio no usa degradados.
 * Se compila a js/space-bg.js con `node tools/space-bg/build.mjs`.
 *
 * Lo propio del sitio:
 * - El scroll acelera el viaje (hacia arriba retrocede) y vuelve solo a crucero.
 * - Una sección con [data-warp="N"] mantiene un impulso N mientras está en pantalla.
 * - Un enlace con [data-warp-click="hop|nudge|departure"] dispara un salto al hacer clic.
 * - Sigue el tema del sitio (data-theme en <html>).
 */
import { createRoot } from "react-dom/client";
import Particles from "./particles";
import { SPACE_PARTICLES_PRESET } from "./space-background.config";
import { driftScale, playWarp, type WarpProfile } from "./warp-controller";

// --- Scroll como acelerador ------------------------------------------------------------------
let boost = 0;
let target = 0;
let lastFrame = 0;
let sectionBoost = 0;
let sectionCurrent = 0;
let lastDrift = 1;
// Impulso que una sección marca por tramos desde su propia línea de tiempo (la de IA); se suma al de [data-warp]
let manualBoost = 0;

function siteDriftScale() {
  const now = performance.now();
  const dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 1 / 60;
  lastFrame = now;
  boost += (target - boost) * Math.min(1, dt * 6);
  target *= Math.pow(0.02, dt);
  sectionCurrent += (Math.max(sectionBoost, manualBoost) - sectionCurrent) * Math.min(1, dt * 2.5);
  lastDrift = driftScale() + boost + sectionCurrent;
  return lastDrift;
}

let lastY = window.scrollY;
let lastT = performance.now();
window.addEventListener(
  "scroll",
  () => {
    const now = performance.now();
    const dy = window.scrollY - lastY;
    const dt = Math.max(16, now - lastT);
    lastY = window.scrollY;
    lastT = now;
    // Velocidad en px por fotograma × 0,35, como con Lenis en el sitio oscuro
    target = Math.max(-7, Math.min(12, (dy / dt) * 16 * 0.35));
  },
  { passive: true },
);

function watchSections() {
  const values = new Map<Element, number>();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => values.set(e.target, e.isIntersecting ? Number((e.target as HTMLElement).dataset.warp) || 0 : 0));
      sectionBoost = Math.max(0, ...values.values());
    },
    { rootMargin: "-35% 0px -35% 0px" },
  );
  document.querySelectorAll("[data-warp]").forEach((el) => io.observe(el));

  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-warp-click]");
    if (el) playWarp((el.dataset.warpClick as WarpProfile) || "hop");
  });
}

// --- Montaje (réplica de space-backdrop.tsx) --------------------------------------------------
const isLight = () => document.documentElement.getAttribute("data-theme") === "light";

// particles.tsx usa clases de Tailwind para medir el lienzo; el sitio no tiene Tailwind, así que se definen aquí.
const UTILITIES =
  ".space-bg .relative{position:relative}.space-bg .absolute{position:absolute}.space-bg .inset-0{inset:0}" +
  ".space-bg .block{display:block}.space-bg .h-full{height:100%}.space-bg .w-full{width:100%}.space-bg .overflow-hidden{overflow:hidden}";

function mount() {
  const css = document.createElement("style");
  css.textContent = UTILITIES;
  document.head.append(css);
  const host = document.createElement("div");
  host.className = "space-bg";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;transition:background-color 300ms ease";
  const brandGlow = document.createElement("div");
  brandGlow.style.cssText = "position:absolute;inset:0";
  const stage = document.createElement("div");
  stage.style.cssText = "position:absolute;inset:0";
  host.append(brandGlow, stage);
  document.body.prepend(host);
  // El fondo del login reemplaza al degradado y la retícula propios del sitio
  document.querySelectorAll<HTMLElement>(".bg-gradient, .bg-grid").forEach((el) => (el.style.display = "none"));

  const root = createRoot(stage);
  const narrow = window.matchMedia("(max-width: 900px)").matches;
  const render = () => {
    const light = isLight();
    host.style.backgroundColor = light ? "#edf0f4" : "#000000";
    // El sitio no lleva degradados (decisión del dueño): sin el resplandor de marca del login
    brandGlow.style.background = "none";
    root.render(
      <Particles
        {...SPACE_PARTICLES_PRESET}
        // Rendimiento: el lienzo a 1,5x como máximo (en retina pintaba 4 veces los píxeles) y la mitad
        // de partículas en pantallas angostas, como hace la plataforma dentro de la app
        pixelRatio={Math.min(window.devicePixelRatio || 1, 1.5)}
        particleCount={narrow ? 800 : SPACE_PARTICLES_PRESET.particleCount}
        lightMode={light}
        driftScale={siteDriftScale}
      />,
    );
  };
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  watchSections();
  // drift: velocidad del último fotograma (1 = crucero); la lee el objeto 3D para girar con el warp
  (window as unknown as { pixySpace: unknown }).pixySpace = {
    warp: playWarp,
    drift: () => lastDrift,
    boost: (v: number) => {
      manualBoost = v;
    },
  };
}

// El script va al final del <body>: se monta en el acto para que las estrellas estén en el primer
// pintado (la página llega armada en la transición entre páginas)
if (document.body) mount();
else document.addEventListener("DOMContentLoaded", mount);
