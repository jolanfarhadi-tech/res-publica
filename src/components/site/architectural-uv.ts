import type { BufferGeometry, Material, MeshStandardMaterial, Texture } from "three";

/** Only repeating architectural finishes get world-space UVs. Flags keep authored 0–1 UVs. */
export function applyArchitecturalUVs(geometry: BufferGeometry, material: Material, stone: Texture, oak: Texture) {
  const map = (material as MeshStandardMaterial).map;
  const isStone = map === stone || material.name === "honed-limestone";
  if (!isStone && map !== oak) return;
  const positions = geometry.getAttribute("position"), normals = geometry.getAttribute("normal"), uv = geometry.getAttribute("uv");
  if (!uv || !normals) return;
  const scale = isStone ? 3 : 1.8;
  for (let i = 0; i < positions.count; i++) {
    const nx = Math.abs(normals.getX(i)), ny = Math.abs(normals.getY(i)), nz = Math.abs(normals.getZ(i));
    if (ny >= nx && ny >= nz) uv.setXY(i, positions.getX(i) / scale, positions.getZ(i) / scale);
    else if (nx >= nz) uv.setXY(i, positions.getZ(i) / scale, positions.getY(i) / scale);
    else uv.setXY(i, positions.getX(i) / scale, positions.getY(i) / scale);
  }
}
