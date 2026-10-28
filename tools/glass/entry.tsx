/**
 * Objeto 3D en cromo para el viaje de Spaces. Se compila a js/space-models.js con
 * `node tools/glass/build.mjs` y lo carga js/spaces-home.js solo en escritorio, cuando el viaje se acerca.
 *
 * API: window.pixyModels.mount(elemento, { slug, accent }) → { set(slug, accent) }
 */
import { createRoot } from "react-dom/client";
import { ChromeObject, type ModelSlug } from "./chrome-object";

type PixySpace = { drift?: () => number };
const drift = () => (window as unknown as { pixySpace?: PixySpace }).pixySpace?.drift?.() ?? 1;

function mount(el: HTMLElement, opts: { slug: ModelSlug; accent: string; base?: string }) {
  const root = createRoot(el);
  const base = opts.base ?? "assets/models";
  const onReady = () => el.classList.add("is-ready");
  const render = (slug: ModelSlug, accent: string) =>
    root.render(<ChromeObject base={base} slug={slug} accent={accent} drift={drift} onReady={onReady} distance={5} />);
  render(opts.slug, opts.accent);
  return { set: render };
}

(window as unknown as { pixyModels: unknown }).pixyModels = { mount };
window.dispatchEvent(new Event("pixy:models-ready"));
