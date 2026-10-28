// Compila el objeto 3D en cromo (entry.tsx) a js/space-models.js.
// Uso: node tools/glass/build.mjs   (usa esbuild de tools/space-bg y three/r3f/drei de G:/Pixy/pixy-web)
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../space-bg/package.json"));
const { build } = require("esbuild");

await build({
  entryPoints: [join(here, "entry.tsx")],
  outfile: join(here, "../../js/space-models.js"),
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  nodePaths: ["G:/Pixy/pixy-web/node_modules"],
  banner: { js: "/* Pixy · objeto 3D en cromo (generado por tools/glass/build.mjs; no editar a mano) */" },
  logLevel: "info",
});
