import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { buildingTextureFiles, createInitialBuildingMaps, replaceBuildingTexture } from "./cinematic-materials";

describe("progressive architectural materials", () => {
  it("provides complete, valid map inputs before a network request can finish", () => {
    const maps = createInitialBuildingMaps();
    expect(Object.keys(maps)).toEqual(Object.keys(buildingTextureFiles));
    expect(Array.from(maps.stoneNormal.image.data ?? [])).toEqual([128, 128, 255, 255]);
    expect(maps.stone.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(maps.oak.colorSpace).toBe(THREE.SRGBColorSpace);
    for (const map of Object.values(maps)) { expect(map.version).toBeGreaterThan(0); map.dispose(); }
  });
  it("upgrades shared and multi-material meshes without rebuilding geometry or unrelated materials", () => {
    const maps = createInitialBuildingMaps(), highResolution = new THREE.Texture();
    const stone = new THREE.MeshStandardMaterial({ map: maps.stone, normalMap: maps.stoneNormal });
    const oak = new THREE.MeshStandardMaterial({ map: maps.oak });
    const root = new THREE.Group(), geometry = new THREE.BoxGeometry();
    root.add(new THREE.Mesh(geometry, stone), new THREE.Mesh(geometry, [stone, oak]));
    replaceBuildingTexture(root, maps.stone, highResolution);
    expect(stone.map).toBe(highResolution);
    expect(stone.normalMap).toBe(maps.stoneNormal);
    expect(oak.map).toBe(maps.oak);
    expect(root.children).toHaveLength(2);
    expect((root.children[0] as THREE.Mesh).geometry).toBe(geometry);
    geometry.dispose(); stone.dispose(); oak.dispose(); highResolution.dispose();
    Object.values(maps).forEach(map => map.dispose());
  });
});
