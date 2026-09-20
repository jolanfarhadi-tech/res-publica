import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { buildCeremonialFlags, sampleFlagDrape } from "./ceremonial-flags";
import { createParticipantFinish } from "./cinematic-people";

describe("soft ceremonial cloth", () => {
  it("keeps the hoist attached while the free edge hangs under gravity", () => {
    for (const phase of [0, .85, 1.7]) for (const v of [0, .25, .5, 1]) {
      const hoist = sampleFlagDrape(0, v, phase);
      expect(hoist.x).toBe(-.9);
      expect(hoist.z).toBe(0);
      expect(sampleFlagDrape(1, v, phase).y).toBeLessThan(hoist.y - .6);
    }
  });

  it("uses different static folds without an outdoor wind animation", () => {
    expect(sampleFlagDrape(.6, .4, 0).distanceTo(sampleFlagDrape(.6, .4, .85))).toBeGreaterThan(.02);
    for (let u = 0; u <= 1; u += .05) {
      expect(sampleFlagDrape(u, .5).distanceTo(sampleFlagDrape(u, .5))).toBe(0);
    }
  });

  it("preserves UV artwork, normalized cloth normals and the three flag identities", () => {
    const textures = [new THREE.Texture(), new THREE.Texture(), new THREE.Texture()];
    const group = buildCeremonialFlags(textures);
    const cloth = group.children.filter(child => child.userData.ceremonialCloth) as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>[];
    expect(cloth.map(mesh => mesh.name)).toEqual(["flag-eu", "flag-germany", "flag-lion-sun"]);
    const originalUVs = cloth.map(mesh => Array.from(mesh.geometry.getAttribute("uv").array));
    cloth.forEach((mesh, i) => {
      expect(mesh.material.map).toBe(textures[i]);
      expect(mesh.material.roughness).toBeGreaterThan(.9);
      expect(Array.from(mesh.geometry.getAttribute("uv").array)).toEqual(originalUVs[i]);
      const normal = mesh.geometry.getAttribute("normal");
      for (let j = 0; j < normal.count; j++) expect(new THREE.Vector3().fromBufferAttribute(normal, j).length()).toBeCloseTo(1, 5);
      mesh.updateMatrixWorld(true);
      expect(new THREE.Box3().setFromObject(mesh).min.y).toBeGreaterThan(1.6);
    });
    const materials = new Set<THREE.Material>();
    group.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose(); materials.add(object.material);
    });
    materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
  });
});

describe("participant surface response", () => {
  it("retains the original facial textures with broad matte skin and cloth highlights", () => {
    const texture = new THREE.Texture(), normal = new THREE.Texture();
    const skin = createParticipantFinish("head", texture, normal);
    const fabric = createParticipantFinish("body", texture, normal);
    const hair = createParticipantFinish("opacity", texture, null);
    expect(skin.map).toBe(texture); expect(skin.normalMap).toBe(normal);
    expect(skin.roughness).toBeGreaterThan(.6); expect(skin.specularIntensity).toBeLessThan(.3);
    expect(fabric.roughness).toBeGreaterThan(skin.roughness);
    expect(hair.alphaTest).toBe(.45); expect(hair.side).toBe(THREE.DoubleSide);
    [skin, fabric, hair, texture, normal].forEach(resource => resource.dispose());
  });
});
