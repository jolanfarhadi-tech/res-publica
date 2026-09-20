/** CC0 architectural details. Explicit preparation only; no provider calls at runtime. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const directory = path.resolve("public/architecture/details");
await mkdir(directory, { recursive: true });
const records = [];
async function download(url, relative, expected) {
  if (new URL(url).hostname !== "dl.polyhaven.org") throw new Error("Unexpected asset host");
  const file = path.resolve(directory, relative);
  if (!file.startsWith(directory + path.sep)) throw new Error("Unsafe asset path");
  await mkdir(path.dirname(file), { recursive: true });
  let bytes;
  try { bytes = await readFile(file); }
  catch {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`Asset request failed: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 12_000_000) throw new Error("Asset exceeds individual download budget");
    if (expected && createHash("md5").update(bytes).digest("hex") !== expected) throw new Error("Provider checksum mismatch");
    await writeFile(file, bytes, { flag: "wx" });
  }
  records.push({ file: relative.replaceAll("\\", "/"), source: url, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  console.log(`${relative}: ${bytes.length}`);
}
for (const id of ["modern_arm_chair_01", "potted_plant_01"]) {
  const response = await fetch(`https://api.polyhaven.com/files/${id}`);
  if (!response.ok) throw new Error(`Catalog unavailable: ${id}`);
  const entry = (await response.json()).gltf["1k"].gltf;
  await download(entry.url, `${id}/${id}.gltf`, entry.md5);
  for (const [relative, file] of Object.entries(entry.include)) await download(file.url, `${id}/${relative}`, file.md5);
}
await download("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/urban_courtyard_02_2k.hdr", "urban-courtyard.hdr", "94e7adc2d79d7dedd80b50afae271a99");
for (const kind of ["diff", "nor_gl", "rough"]) await download(`https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/marble_01/marble_01_${kind}_1k.jpg`, `marble_${kind}.jpg`);
await writeFile(path.join(directory, "manifest.json"), JSON.stringify({ license: "CC0-1.0", records }, null, 2) + "\n");
