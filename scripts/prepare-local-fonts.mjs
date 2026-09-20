/** Explicit preparation only: vendor fonts and licenses, no remote visitor requests. */
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const destination = new URL("../src/app/fonts/", import.meta.url);
await mkdir(destination, { recursive: true });
const records = [];
async function save(url, name) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const data = Buffer.from(await response.arrayBuffer());
  await writeFile(new URL(name, destination), data);
  records.push({ file: name, source: url, bytes: data.length, sha256: createHash("sha256").update(data).digest("hex") });
  console.log(name, data.length);
}
const revisionResponse = await fetch("https://api.github.com/repos/rastikerdar/vazirmatn/commits/master");
if (!revisionResponse.ok) throw new Error("Cannot resolve official Vazirmatn revision");
const { sha } = await revisionResponse.json();
await save(`https://raw.githubusercontent.com/rastikerdar/vazirmatn/${sha}/fonts/webfonts/Vazirmatn%5Bwght%5D.woff2`, "Vazirmatn-variable.woff2");
await save(`https://raw.githubusercontent.com/rastikerdar/vazirmatn/${sha}/OFL.txt`, "Vazirmatn-OFL.txt");
for (const [family, name, folder] of [["Figtree", "Figtree", "figtree"], ["Source+Serif+4", "SourceSerif4", "sourceserif4"]]) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@300..800&display=swap`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" },
  }).then(response => { if (!response.ok) throw new Error("Font stylesheet unavailable"); return response.text(); });
  const section = css.slice(css.lastIndexOf("/* latin */"));
  const url = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/.exec(section)?.[1];
  if (!url) throw new Error(`Missing Latin font for ${name}`);
  await save(url, `${name}-latin.woff2`);
  await save(`https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`, `${name}-OFL.txt`);
}
await writeFile(new URL("manifest.json", destination), JSON.stringify({ records }, null, 2) + "\n");
