/** Explicit, local asset preparation; never invoked by build or runtime. */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { TGALoader } from "three/addons/loaders/TGALoader.js";

const target = path.resolve("public/architecture");
const revision = "0943055db6ec570bcef9f2c8b41c9e5467c808f9";
const rocketbox = `https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/${revision}`;
const records = [];
await mkdir(target, { recursive: true });

async function asset(url, name, transform) {
  const filename = path.join(target, name);
  let bytes;
  try { bytes = await readFile(filename); }
  catch {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    const source = Buffer.from(await response.arrayBuffer());
    bytes = transform ? await transform(source) : source;
    await writeFile(filename, bytes, { flag: "wx" });
  }
  records.push({ file: name, source: url, bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex") });
  console.log(`${name}: ${bytes.length} bytes`);
}

for (const [model, prefix] of [["Female_Adult_01", "f001"], ["Male_Adult_01", "m002"], ["Female_Adult_04", "f004"], ["Male_Adult_04", "m006"], ["Female_Adult_08", "f008"], ["Male_Adult_08", "m014"]]) {
  const base = `${rocketbox}/Assets/Avatars/Adults/${model}`;
  await asset(`${base}/Export/${model}.fbx`, `${model}.fbx`);
  for (const suffix of ["body_color", "head_color", "opacity_color", "body_normal", "head_normal"]) {
    await asset(`${base}/Textures/${prefix}_${suffix}.tga`, `${prefix}_${suffix}.webp`, async (source) => {
      const texture = new TGALoader().parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
      return sharp(texture.data, { raw: { width: texture.width, height: texture.height, channels: 4 } })
        .resize(1024, 1024).webp({ quality: suffix.includes("normal") ? 95 : 88 }).toBuffer();
    });
  }
}
for (const id of ["stone_tiles_02", "wooden_floor_01", "oak_veneer_01"]) {
  for (const kind of ["diff", "nor_gl", "rough"]) {
    const url = `https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/${id}/${id}_${kind}_1k.jpg`;
    await asset(url, `${id}_${kind}.webp`, (source) => sharp(source).webp({ quality: kind === "nor_gl" ? 95 : 88 }).toBuffer());
  }
}
await asset("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lebombo_1k.hdr", "daylight.hdr");
await asset(`${rocketbox}/LICENSE.md`, "ROCKETBOX-LICENSE.txt");
const flag = await readFile(path.join(target, "lion-sun-reference-v1.png"));
records.push({ file: "lion-sun-reference-v1.png", source: "Owner-supplied Lion and Sun reference, generated ceremonial artwork", bytes: flag.length, sha256: createHash("sha256").update(flag).digest("hex") });
await writeFile(path.join(target, "manifest.json"), JSON.stringify({ revision, records }, null, 2) + "\n");
