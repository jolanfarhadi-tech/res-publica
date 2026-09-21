import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { prepareArchitecturalFinishes } from "./cinematic-startup";

describe("nonblocking architectural shader warmup", () => {
  it("preserves geometry, glass and exact original physical materials", () => {
    const stone = new THREE.MeshStandardMaterial({ color: 0xc4d4e5 });
    const glass = new THREE.MeshPhysicalMaterial({ transparent: true, opacity: .035, depthWrite: false });
    const root = new THREE.Group(), geometry = new THREE.BoxGeometry();
    const first = new THREE.Mesh(geometry, stone), second = new THREE.Mesh(geometry, [stone, glass]);
    root.add(first, second);
    const startup = prepareArchitecturalFinishes(root);
    expect(first.geometry).toBe(geometry);
    expect(first.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    const temporary = second.material as THREE.Material[];
    expect(temporary[0]).toBe(first.material);
    expect(temporary[1].opacity).toBe(glass.opacity);
    expect(temporary[1].depthWrite).toBe(false);
    expect((startup.warmup.children[0] as THREE.Mesh).material).toBe(stone);
    startup.restore();
    expect(first.material).toBe(stone);
    expect(second.material).toEqual([stone, glass]);
    startup.dispose(); geometry.dispose(); stone.dispose(); glass.dispose();
  });
});
