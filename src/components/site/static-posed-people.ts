import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Bake existing still poses, preserving the same skinning used by the renderer. */
export function bakePosedMesh(source: THREE.Mesh) {
  const geometry = source.geometry.clone();
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  const position = new THREE.Vector3(), normal = new THREE.Vector4();
  for (let i = 0; i < positions.count; i++) {
    source.getVertexPosition(i, position);
    positions.setXYZ(i, position.x, position.y, position.z);
    if (source instanceof THREE.SkinnedMesh && normals) {
      // w=0 transforms a direction, not a point. Do not recompute flat face normals.
      normal.set(normals.getX(i), normals.getY(i), normals.getZ(i), 0);
      source.applyBoneTransform(i, normal);
      normals.setXYZ(i, normal.x, normal.y, normal.z);
    }
  }
  // The approved avatar materials use position/normal/UV, not vertex colour or morphs.
  for (const name of Object.keys(geometry.attributes)) {
    if (!["position", "normal", "uv"].includes(name)) geometry.deleteAttribute(name);
  }
  geometry.morphAttributes = {};
  geometry.applyMatrix4(source.matrixWorld);
  geometry.normalizeNormals();
  const result = geometry.index ? geometry.toNonIndexed() : geometry;
  if (result !== geometry) geometry.dispose();
  return result;
}

/** Shared material batches replace per-person skeletal draw calls for static occupants. */
function* participantBatches(people: THREE.Object3D[], track: (geometry: THREE.BufferGeometry) => void) {
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  function add(material: THREE.Material, geometry: THREE.BufferGeometry) {
    const geometries = batches.get(material) ?? [];
    geometries.push(geometry); batches.set(material, geometries);
  }
  for (const person of people) {
    person.updateMatrixWorld(true);
    person.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = bakePosedMesh(object);
      if (!Array.isArray(object.material)) { add(object.material, geometry); return; }
      for (const group of geometry.groups) {
        const material = object.material[group.materialIndex ?? 0];
        if (!material) continue;
        const part = new THREE.BufferGeometry();
        for (const [name, attribute] of Object.entries(geometry.attributes)) {
          const array = attribute.array.slice(group.start * attribute.itemSize, (group.start + group.count) * attribute.itemSize);
          part.setAttribute(name, new THREE.BufferAttribute(array, attribute.itemSize, attribute.normalized));
        }
        add(material, part);
      }
      geometry.dispose();
    });
    yield;
  }
  const root = new THREE.Group(); root.name = "static-posed-participants";
  for (const [material, parts] of batches) {
    const geometry = mergeGeometries(parts); parts.forEach(part => part.dispose());
    if (!geometry) throw new Error("Static participant batching failed");
    geometry.computeBoundingBox(); geometry.computeBoundingSphere(); track(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    root.add(mesh);
  }
  return root;
}

export function bakeCinematicPeople(people: THREE.Object3D[], track: (geometry: THREE.BufferGeometry) => void) {
  const batches = participantBatches(people, track);
  let step = batches.next();
  while (!step.done) step = batches.next();
  return step.value;
}

/** Identical geometry, but touch/scroll/rendering can run between each occupant. */
export async function bakeCinematicPeopleIncrementally(people: THREE.Object3D[], track: (geometry: THREE.BufferGeometry) => void,
  yieldToBrowser: () => Promise<void>) {
  const batches = participantBatches(people, track);
  let step = batches.next();
  while (!step.done) { await yieldToBrowser(); step = batches.next(); }
  return step.value;
}
