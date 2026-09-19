import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildForumArchitecture, disposeForumArchitecture } from "./forum-architecture";

describe("real three-dimensional civic forum", () => {
  it("models the glass shell, upright U volumes, furniture and suspended jewel as geometry", () => {
    const { architecture, chandelier } = buildForumArchitecture();
    try {
      expect(architecture.getObjectByName("glass-laboratory")).toBeDefined();
      const forum = architecture.getObjectByName("logo-shaped-forum")!;
      const walls = forum.children.filter((child) => child.name === "upright-u-volume");
      expect(walls).toHaveLength(4);
      for (const wall of walls) {
        const size = new THREE.Box3().setFromObject(wall).getSize(new THREE.Vector3());
        expect(size.y).toBeGreaterThan(0.8);
        expect(size.z).toBeGreaterThan(size.x * 0.9);
      }
      const stations = architecture.getObjectByName("furnished-workspaces")!;
      expect(stations.children).toHaveLength(30);
      for (const station of stations.children) {
        expect(station.getObjectByName("synthetic-seated-person")).toBeDefined();
        expect(station.position.y).toBe(0);
      }
      expect(chandelier.position.y).toBeGreaterThan(4);
      expect(chandelier.position.z).toBeLessThan(0);
      expect(chandelier.getObjectByName("faceted-gold-pendant")).toBeDefined();
    } finally { disposeForumArchitecture(architecture); }
  });

  it("uses finite geometry, no remote textures or identity data, and releases GPU resources", () => {
    const { architecture } = buildForumArchitecture();
    let meshes = 0;
    let disposed = 0;
    architecture.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      meshes++;
      const positions = object.geometry.getAttribute("position");
      expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
      object.geometry.addEventListener("dispose", () => { disposed++; });
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) expect((material as THREE.MeshStandardMaterial).map).toBeNull();
      expect(object.userData).toEqual({});
    });
    disposeForumArchitecture(architecture);
    expect(meshes).toBeGreaterThan(500);
    expect(disposed).toBe(meshes);
  });
});
