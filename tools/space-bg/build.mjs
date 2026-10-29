// Compila el fondo espacial (entry.tsx + el componente del login) a js/space-bg.js.
// Uso: node tools/space-bg/build.mjs   (requiere esbuild y react/react-dom; toma los de G:/Pixy/pixy-web si no hay aquí)
import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(here, "entry.tsx")],
  outfile: join(here, "../../js/space-bg.js"),
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  nodePaths: [join(here, "node_modules"), "G:/Pixy/pixy-web/node_modules"],
  banner: { js: "/* Pixy · fondo espacial (generado por tools/space-bg/build.mjs; no editar a mano) */" },
  logLevel: "info",
});
