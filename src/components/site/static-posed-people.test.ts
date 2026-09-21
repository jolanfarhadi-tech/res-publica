import fs from "node:fs";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { describe, expect, it } from "vitest";
import { poseCinematicPerson } from "./cinematic-people";
import { bakeCinematicPeople, bakeCinematicPeopleIncrementally, bakePosedMesh } from "./static-posed-people";

describe("static posed participant batching", () => {
  it("yields per occupant without altering the final geometry", async () => {
    const material = new THREE.MeshStandardMaterial(), geometry = new THREE.BoxGeometry();
    const people = [0, 1, 2].map(x => { const mesh = new THREE.Mesh(geometry, material); mesh.position.x = x * 2; return mesh; });
    const resources: THREE.BufferGeometry[] = []; let yields = 0;
    const sync = bakeCinematicPeople(people, item => resources.push(item));
    const async = await bakeCinematicPeopleIncrementally(people, item => resources.push(item), async () => { yields++; });
    expect(yields).toBe(people.length);
    expect(new THREE.Box3().setFromObject(async)).toEqual(new THREE.Box3().setFromObject(sync));
    expect((async.children[0] as THREE.Mesh).geometry.getAttribute("position").array)
      .toEqual((sync.children[0] as THREE.Mesh).geometry.getAttribute("position").array);
    resources.forEach(item => item.dispose()); material.dispose(); geometry.dispose();
  });
  it("retains actual deformed geometry, smooth skin normals and shared materials", () => {
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    loader.load = () => new THREE.Texture(); manager.addHandler(/.*/, loader);
    const bytes = fs.readFileSync("public/architecture/Female_Adult_01.fbx");
    const model = new FBXLoader(manager).parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer, "");
    model.scale.setScalar(.01);
    const standing = poseCinematicPerson(clone(model),false,0,"research");
    standing.position.set(-16,0,6); standing.rotation.y=.3;
    const seated = poseCinematicPerson(clone(model),true,1);
    seated.position.set(6,.32,-3); seated.rotation.y=.8;
    const people = [standing,seated], generated: THREE.BufferGeometry[] = [];
    const originals = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    const expectedBounds = new THREE.Box3(); let triangles = 0, sourceDraws = 0;
    try {
      for (const person of people) {
        person.updateMatrixWorld(true); expectedBounds.union(new THREE.Box3().setFromObject(person,true));
        person.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          sourceDraws += Array.isArray(object.material) ? object.geometry.groups.length : 1;
          originals.add(object.geometry);
          triangles += (object.geometry.index?.count ?? object.geometry.getAttribute("position").count) / 3;
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
          const baked = bakePosedMesh(object); generated.push(baked);
          expect(baked.getAttribute("skinIndex")).toBeUndefined();
          expect(baked.getAttribute("skinWeight")).toBeUndefined();
          // FBX is unindexed here; compare every 97th posed vertex to the renderer.
          expect(object.geometry.index).toBeNull();
          const positions = baked.getAttribute("position"), normals = baked.getAttribute("normal");
          for (let i=0;i<positions.count;i+=97) {
            const expected = object.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(object.matrixWorld);
            expect(new THREE.Vector3().fromBufferAttribute(positions,i).distanceTo(expected)).toBeLessThan(.00001);
            expect(new THREE.Vector3().fromBufferAttribute(normals,i).length()).toBeCloseTo(1,4);
          }
        });
      }
      const batch = bakeCinematicPeople(people,geometry=>generated.push(geometry));
      const actualBounds = new THREE.Box3().setFromObject(batch,true);
      expect(actualBounds.min.distanceTo(expectedBounds.min)).toBeLessThan(.00001);
      expect(actualBounds.max.distanceTo(expectedBounds.max)).toBeLessThan(.00001);
      expect(batch.children.length).toBeLessThanOrEqual(materials.size);
      expect(batch.children.length).toBeLessThan(sourceDraws);
      expect(batch.children.reduce((sum,child)=>sum+(child as THREE.Mesh).geometry.getAttribute("position").count/3,0)).toBe(triangles);
      for (const child of batch.children) expect(materials.has((child as THREE.Mesh).material as THREE.Material)).toBe(true);
    } finally {
      generated.forEach(geometry=>geometry.dispose()); originals.forEach(geometry=>geometry.dispose()); materials.forEach(material=>material.dispose());
      for(const person of people) person.traverse(object=>{if(object instanceof THREE.SkinnedMesh)object.skeleton.dispose();});
    }
  });
});
