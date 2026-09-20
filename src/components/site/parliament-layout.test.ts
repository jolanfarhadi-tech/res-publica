import fs from "node:fs";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { describe, expect, it } from "vitest";
import { createParliamentLayout, parliamentDeskInset, parliamentFocus, researchParticipants, standingObservers } from "./parliament-layout";
import { cinematicCast, poseCinematicPerson } from "./cinematic-people";

describe("parliamentary furniture and human placement", () => {
  it("faces every seat and desk toward the lectern on three rising levels", () => {
    const seats = createParliamentLayout();
    expect([...new Set(seats.map(s => s.y))]).toEqual([0, .32, .64]);
    for (const seat of seats) {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), seat.yaw);
      const target = new THREE.Vector3(parliamentFocus.x - seat.x, 0, parliamentFocus.z - seat.z).normalize();
      expect(forward.dot(target)).toBeCloseTo(1, 8);
      const desk = new THREE.Vector3(seat.desk.x - seat.x, 0, seat.desk.z - seat.z);
      expect(desk.length()).toBeCloseTo(parliamentDeskInset, 8);
      expect(desk.normalize().dot(forward)).toBeGreaterThan(.6);
      // The ribbon follows the logo; the person can turn toward the lectern.
      expect(parliamentDeskInset - .36).toBeGreaterThan(.3);
      const deskRadius = 3.65 + seat.row * 1.9 - parliamentDeskInset;
      expect(seat.z < 0 ? Math.abs(seat.desk.x) : Math.hypot(seat.desk.x, seat.desk.z)).toBeCloseTo(deskRadius, 8);
      expect(Math.abs(seat.x)).toBeGreaterThan(1.5);
    }
  });

  it("places researchers outside worktops and chairs, with hands above the document area", () => {
    for (const person of researchParticipants) {
      const table = [-13, -7, -1, 5].find(z => Math.abs(person.z - z) < 1.2)!;
      expect(table).toBeDefined();
      expect(Math.abs(person.z - table)).toBeCloseTo(1.13, 8);
      expect(Math.abs(person.z - table) - .7).toBeGreaterThan(.4);
      for (const x of [-17.6, -12.4]) {
        expect(Math.hypot(person.x-x, person.z-(table+1.78))).toBeGreaterThan(.6);
      }
    }
  });

  it("keeps standing observers outside all library and studio worktops", () => {
    for (const person of standingObservers) {
      for (const x of [13, 17]) for (const z of [-3, 2, 8]) {
        expect(Math.abs(person.x - x) > .675 + .3 || Math.abs(person.z - z) > .36 + .3).toBe(true);
      }
      if (person.y === 0) for (const z of [-13, -7, -1, 5]) {
        expect(Math.abs(person.x + 15) > 3.3 + .3 || Math.abs(person.z - z) > .7 + .3).toBe(true);
      }
    }
  });

  for (const [index, [file]] of cinematicCast.entries()) {
    it(`${file}: reaches a worktable with planted feet and un-stretched arms`, () => {
      const manager = new THREE.LoadingManager();
      const loader = new THREE.TextureLoader(manager);
      loader.load = () => new THREE.Texture(); manager.addHandler(/.*/, loader);
      const bytes = fs.readFileSync(`public/architecture/${file}.fbx`);
      const model = new FBXLoader(manager).parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset+bytes.byteLength) as ArrayBuffer, "");
      model.scale.setScalar(.01); model.updateMatrixWorld(true);
      const position = (name: string) => model.getObjectByName(name)!.getWorldPosition(new THREE.Vector3());
      const armLengths = ["L","R"].map(side => [position(`Bip01_${side}_UpperArm`).distanceTo(position(`Bip01_${side}_Forearm`)), position(`Bip01_${side}_Forearm`).distanceTo(position(`Bip01_${side}_Hand`))]);
      const ground = new THREE.Box3().setFromObject(model,true).min.y;
      const footClearance = ["L","R"].map(side => position(`Bip01_${side}_Foot`).y - ground);
      const holder = poseCinematicPerson(model, false, index, "research");
      expect(new THREE.Box3().setFromObject(holder,true).min.y).toBeCloseTo(0,5);
      expect(position("Bip01_MNose").y).toBeLessThan(position("Bip01_Head").y);
      for (const [j,side] of ["L","R"].entries()) {
        const hand = position(`Bip01_${side}_Hand`);
        expect(hand.y).toBeGreaterThan(.97);
        expect(hand.y).toBeLessThan(1.06);
        expect(hand.z).toBeGreaterThan(-.57);
        expect(hand.z).toBeLessThan(-.44);
        expect(position(`Bip01_${side}_UpperArm`).distanceTo(position(`Bip01_${side}_Forearm`))).toBeCloseTo(armLengths[j][0],5);
        expect(position(`Bip01_${side}_Forearm`).distanceTo(hand)).toBeCloseTo(armLengths[j][1],5);
        expect(position(`Bip01_${side}_Foot`).y).toBeGreaterThan(-.01);
        expect(position(`Bip01_${side}_Foot`).y).toBeCloseTo(footClearance[j],5);
      }
      holder.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
        }
        if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
      });
    });
    it(`${file}: actual skinned pelvis, knees and face match the chair convention`, () => {
      const manager = new THREE.LoadingManager();
      const loader = new THREE.TextureLoader(manager);
      loader.load = () => new THREE.Texture(); manager.addHandler(/.*/, loader);
      const bytes = fs.readFileSync(`public/architecture/${file}.fbx`);
      const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const model = new FBXLoader(manager).parse(buffer, ""); model.scale.setScalar(.01);
      const holder = poseCinematicPerson(model, true, index);
      const position = (name: string) => holder.getObjectByName(name)!.getWorldPosition(new THREE.Vector3());
      expect(position("Bip01_Pelvis").y).toBeCloseTo(.59, 5);
      expect(position("Bip01_MNose").z).toBeLessThan(position("Bip01_Head").z);
      for (const side of ["L", "R"]) {
        const hip = position(`Bip01_${side}_Thigh`), knee = position(`Bip01_${side}_Calf`), foot = position(`Bip01_${side}_Foot`);
        expect(knee.z).toBeLessThan(hip.z - .3);
        expect(knee.y).toBeLessThan(hip.y);
        expect(foot.y).toBeGreaterThan(-.03);
        expect(foot.y).toBeLessThan(.2);
        expect(Math.abs(position(`Bip01_${side}_Hand`).z)).toBeLessThan(.48);
      }
      const bounds = new THREE.Box3().setFromObject(holder, true);
      expect(bounds.min.y).toBeGreaterThan(-.13);
      holder.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
        }
        if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
      });
    });
  }
});
