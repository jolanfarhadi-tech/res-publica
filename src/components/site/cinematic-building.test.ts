import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { buildCinematicBuilding, type BuildingMaps } from "./cinematic-building";

describe("cinematic building preview", () => {
  it("models adjoining spaces, four volumetric U partitions and physical chandelier in one coordinate system", () => {
    const maps = Object.fromEntries(["stone", "stoneNormal", "stoneRough", "oak", "oakNormal", "oakRough"].map((name) => [name, new THREE.Texture()])) as BuildingMaps;
    const { root, seats, chandelier } = buildCinematicBuilding(maps);
    const geometry = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    try {
      expect(root.getObjectByName("forum")).toBeDefined();
      expect(root.getObjectByName("library")).toBeDefined();
      expect(root.getObjectByName("research-studio")).toBeDefined();
      const skylight = root.getObjectByName("daylight-atrium-skylight") as THREE.Mesh;
      expect(skylight).toBeDefined();
      expect(skylight.castShadow).toBe(false);
      expect(root.getObjectByName("forum")!.children.filter((child) => child.name === "logo-u-partition")).toHaveLength(4);
      expect(chandelier.children.length).toBeGreaterThan(80);
      expect(seats).toHaveLength(36);
      expect(root.getObjectByName("central-access-aisle")).toBeDefined();
      expect(root.getObjectByName("presidium-table")).toBeUndefined();
      const stem = root.getObjectByName("logo-gold-stem")!;
      const stemBounds = new THREE.Box3().setFromObject(stem).getSize(new THREE.Vector3());
      expect(stemBounds.z).toBeGreaterThan(stemBounds.x * 3);
      expect(root.getObjectByName("logo-gold-circle")).toBeDefined();
      expect(root.getObjectByName("central-access-aisle")!.children).toHaveLength(0);
      expect(root.getObjectByName("gallery-acoustic-soffits")).toBeDefined();
      const shelfBack = root.getObjectByName("shelf-rear-panel")!;
      const firstBook = root.getObjectByName("archive-volume")!;
      expect(new THREE.Box3().setFromObject(shelfBack).max.z).toBeLessThan(new THREE.Box3().setFromObject(firstBook).min.z);
      for (const room of ["harm-review-room", "publication-gallery", "programme-learning-room"]) expect(root.getObjectByName(room)).toBeDefined();
      expect(root.getObjectByName("forum")!.children.filter(child => child.name === "parliament-tier")).toHaveLength(3);
      const worktops = root.getObjectByName("forum")!.children.filter(child => child.name === "continuous-parliament-worktop");
      expect(worktops).toHaveLength(3);
      for (const worktop of worktops) for (const half of worktop.children) {
        const bounds = new THREE.Box3().setFromObject(half);
        expect(bounds.max.x <= -1.14 || bounds.min.x >= 1.14).toBe(true);
        expect(bounds.getSize(new THREE.Vector3()).y).toBeCloseTo(.055,5);
      }
      let documents = 0, lamps = 0, workstations = 0;
      root.traverse(object => {
        if (object.name === "research-document") documents++;
        if (object.name === "research-task-lamp") lamps++;
        if (object.name === "parliament-workstation") workstations++;
      });
      expect(documents).toBe(32); expect(lamps).toBe(4); expect(workstations).toBe(36);
      for (const partition of root.getObjectByName("forum")!.children.filter(child => child.name === "logo-u-partition")) {
        expect(partition.children).toHaveLength(2);
        for (const half of partition.children) {
          const box = new THREE.Box3().setFromObject(half);
          expect(box.max.x <= -1.14 || box.min.x >= 1.14).toBe(true);
        }
      }
      root.traverse((object) => {
        expect(object.name).not.toBe("synthetic-seated-person");
        if (!(object instanceof THREE.Mesh)) return;
        geometry.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        expect(Array.from(object.geometry.getAttribute("position").array).every(Number.isFinite)).toBe(true);
      });
      expect(geometry.size).toBeGreaterThan(100);
    } finally {
      geometry.forEach((item) => item.dispose()); materials.forEach((item) => item.dispose());
      Object.values(maps).forEach((texture) => texture.dispose());
    }
  });
  it("ships pinned local assets with intact checksums and a retained license", () => {
    const directory = path.join(process.cwd(), "public", "architecture");
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, "manifest.json"), "utf8"));
    expect(manifest.revision).toBe("0943055db6ec570bcef9f2c8b41c9e5467c808f9");
    expect(manifest.records.map((item: { file: string }) => item.file)).toContain("oak_veneer_01_diff.webp");
    expect(manifest.records.map((item: { file: string }) => item.file)).toContain("lion-sun-reference-v1.png");
    let bytes = 0;
    for (const item of manifest.records) {
      const file = fs.readFileSync(path.join(directory, item.file));
      expect(createHash("sha256").update(file).digest("hex")).toBe(item.sha256);
      expect(file.length).toBe(item.bytes); bytes += file.length;
    }
    // Six distinct licensed bodies/outfits, still bounded; no remote runtime assets.
    expect(bytes).toBeLessThan(15_000_000);
    expect(fs.readFileSync(path.join(directory, "ROCKETBOX-LICENSE.txt"), "utf8")).toContain("MIT License");
  });
  it("ships one public shell without a localhost or legacy-session gate, keeping assets same-origin", () => {
    const source = (file: string) => fs.readFileSync(path.join(process.cwd(), "src/components/site", file), "utf8");
    expect(source("CinematicArchitecture.tsx")).not.toContain('window.location.hostname');
    expect(source("CinematicArchitecture.tsx")).not.toContain('sessionStorage');
    expect(source("CinematicArchitecture.tsx")).toContain('className="architectural-backdrop"');
    expect(fs.readFileSync("src/app/[locale]/layout.tsx", "utf8")).toContain('data-architecture="cinema"');
    expect(source("CinematicArchitecture.tsx")).toContain('prefers-reduced-motion: reduce');
    for (const file of ["cinematic-renderer.ts", "cinematic-people.ts"]) {
      expect(source(file)).not.toMatch(/https?:\/\//);
      expect(source(file)).not.toMatch(/localStorage|document\.cookie|\/api\//);
    }
  });
  it("keeps the scene clear and scopes translucency to reading surfaces", () => {
    const directory = path.join(process.cwd(), "src/components/site");
    const wrapper = fs.readFileSync(path.join(directory, "CinematicArchitecture.tsx"), "utf8");
    const style = fs.readFileSync(path.join(directory, "cinematic-architecture.css"), "utf8");
    expect(wrapper).not.toContain("cinematic-building__reading-veil");
    expect(style).not.toContain("blur(");
    expect(style).toContain(":root[data-architecture=\"cinema\"] .home-stage");
    expect(style).toContain("background: transparent; -webkit-backdrop-filter: none; backdrop-filter: none;");
    expect(style).toContain("--architecture-panel: rgb(247 251 251 / .86)");
    expect(wrapper).toContain('window.removeEventListener("scroll", scroll)');
    expect(wrapper).not.toContain("new IntersectionObserver");
  });
});
