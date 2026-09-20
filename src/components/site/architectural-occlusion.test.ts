import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { excludesArchitecturalOcclusion } from "./architectural-occlusion";
import { createArchitecturalReflection } from "./architectural-reflection";

describe("architectural contact shading", () => {
  it("aligns the bounded reflection with the actual floor, without writing opaque depth", () => {
    const floor = createArchitecturalReflection();
    expect(floor.position.y).toBeCloseTo(-.041);
    expect(floor.rotation.x).toBe(-Math.PI / 2);
    expect((floor.material as THREE.ShaderMaterial).depthWrite).toBe(false);
    expect(excludesArchitecturalOcclusion(floor.material)).toBe(true);
    expect(floor.getRenderTarget().width).toBe(768);
    floor.geometry.dispose(); floor.dispose();
  });
  it("does not treat transparent glazing and cut-out hair as opaque AO walls", () => {
    const glass = new THREE.MeshPhysicalMaterial({ transparent: true, opacity: .035 });
    const hair = new THREE.MeshStandardMaterial({ alphaTest: .45 });
    const stone = new THREE.MeshStandardMaterial();
    expect(excludesArchitecturalOcclusion(glass)).toBe(true);
    expect(excludesArchitecturalOcclusion(hair)).toBe(true);
    expect(excludesArchitecturalOcclusion(stone)).toBe(false);
    expect(excludesArchitecturalOcclusion([glass, stone])).toBe(false);
    for (const item of [glass,hair,stone]) item.dispose();
  });
});
