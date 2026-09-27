/**
 * Packages the production build into a single self-contained HTML page suitable
 * for a claude.ai Artifact (which wraps the file in its own document skeleton,
 * so we emit only <title> + <style> + content + inline module <script>).
 *
 * Usage:
 *   VITE_STANDALONE=true npm run build      # produces dist/ with hash routing
 *   node scripts/build-artifact.mjs         # emits dist/chimera-artifact.html
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const assetsDir = path.join(dist, "assets");

const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => f.endsWith(".js"));
const cssFile = files.find((f) => f.endsWith(".css"));
if (!jsFile || !cssFile) {
  throw new Error("Could not find built JS/CSS in dist/assets — run the build first.");
}

const css = fs.readFileSync(path.join(assetsDir, cssFile), "utf8");
let js = fs.readFileSync(path.join(assetsDir, jsFile), "utf8");
// Guard against any literal closing-script sequence inside string data.
js = js.replace(/<\/script>/gi, "<\\/script>");

const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap";

const page = `<title>Chimera Console</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${FONTS}" />
<style>
${css}
</style>
<script>
/* Default to the console's dark theme before the app mounts (avoids a flash). */
try { document.documentElement.setAttribute("data-theme", "dark"); } catch (e) {}
</script>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

const out = path.join(dist, "chimera-artifact.html");
fs.writeFileSync(out, page, "utf8");
const kb = (Buffer.byteLength(page) / 1024).toFixed(0);
console.log(`Wrote ${out} (${kb} KB)`);
