import * as THREE from "three";
import type { BuildingMaps } from "./cinematic-building";

export const buildingTextureFiles = {
  stone: "details/marble_diff.jpg", stoneNormal: "details/marble_nor_gl.jpg", stoneRough: "details/marble_rough.jpg",
  oak: "oak_veneer_01_diff.webp", oakNormal: "oak_veneer_01_nor_gl.webp", oakRough: "oak_veneer_01_rough.webp",
} as const;

/** Valid one-pixel material inputs let the real geometry render without I/O. */
export function createInitialBuildingMaps(): Record<keyof BuildingMaps, THREE.DataTexture> {
  function initial(key: keyof BuildingMaps) {
    const pixel = key.endsWith("Normal") ? [128, 128, 255, 255]
      : key.endsWith("Rough") ? [210, 210, 210, 255]
      : key === "stone" ? [205, 201, 188, 255] : [150, 121, 88, 255];
    const texture = new THREE.DataTexture(new Uint8Array(pixel), 1, 1);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    if (key === "stone" || key === "oak") texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }
  return { stone: initial("stone"), stoneNormal: initial("stoneNormal"), stoneRough: initial("stoneRough"),
    oak: initial("oak"), oakNormal: initial("oakNormal"), oakRough: initial("oakRough") };
}

/** Keep the approved geometry/materials; replace only an arriving texture. */
export function replaceBuildingTexture(root: THREE.Object3D, previous: THREE.Texture, texture: THREE.Texture) {
  const visited = new Set<THREE.Material>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!(material instanceof THREE.MeshStandardMaterial) || visited.has(material)) continue;
      visited.add(material);
      for (const key of ["map", "normalMap", "roughnessMap"] as const) {
        if (material[key] === previous) { material[key] = texture; material.needsUpdate = true; }
      }
    }
  });
}
