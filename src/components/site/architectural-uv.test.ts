import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { applyArchitecturalUVs } from "./architectural-uv";
import { buildCeremonialFlags } from "./ceremonial-flags";

describe("authored flag textures", () => {
  it("preserves every flag UV through the world-space batching preparation", () => {
    const stone = new THREE.Texture(), oak = new THREE.Texture();
    const flags = buildCeremonialFlags([new THREE.Texture(), new THREE.Texture(), new THREE.Texture()]);
    flags.updateMatrixWorld(true);
    flags.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const before = Array.from(object.geometry.getAttribute("uv").array);
      const transformed = object.geometry.clone().applyMatrix4(object.matrixWorld);
      applyArchitecturalUVs(transformed, object.material, stone, oak);
      expect(Array.from(transformed.getAttribute("uv").array)).toEqual(before);
      transformed.dispose(); object.geometry.dispose(); object.material.dispose();
    });
    stone.dispose(); oak.dispose();
  });
  it("still tiles architectural wood in metres", () => {
    const oak = new THREE.Texture(), stone = new THREE.Texture();
    const material = new THREE.MeshStandardMaterial({ map: oak });
    const geometry = new THREE.BoxGeometry(10, 1, 10);
    applyArchitecturalUVs(geometry, material, stone, oak);
    expect(Math.max(...geometry.getAttribute("uv").array)).toBeGreaterThan(1);
    geometry.dispose(); material.dispose(); oak.dispose(); stone.dispose();
  });
  it("keeps normal-only limestone at architectural scale without an albedo photograph", () => {
    const oak = new THREE.Texture(), stone = new THREE.Texture();
    const material = new THREE.MeshStandardMaterial({ normalMap: new THREE.Texture() });
    material.name = "honed-limestone";
    const geometry = new THREE.BoxGeometry(40, .3, 43);
    applyArchitecturalUVs(geometry, material, stone, oak);
    expect(Math.max(...geometry.getAttribute("uv").array)).toBeGreaterThan(7);
    geometry.dispose(); material.normalMap?.dispose(); material.dispose(); oak.dispose(); stone.dispose();
  });
});
