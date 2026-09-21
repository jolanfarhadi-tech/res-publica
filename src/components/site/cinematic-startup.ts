import * as THREE from "three";

/** Render the same building while its physical-material GPU programs warm up. */
export function prepareArchitecturalFinishes(root: THREE.Object3D) {
  const warmup = new THREE.Scene();
  const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  const temporary = new Map<THREE.Material, THREE.MeshLambertMaterial>();
  function initial(source: THREE.Material) {
    if (temporary.has(source)) return temporary.get(source)!;
    if (!(source instanceof THREE.MeshStandardMaterial)) return source;
    const material = new THREE.MeshLambertMaterial({ color: source.color, map: source.map,
      emissive: source.emissive, emissiveIntensity: source.emissiveIntensity,
      transparent: source.transparent, opacity: source.opacity, side: source.side,
      depthWrite: source.depthWrite, alphaTest: source.alphaTest });
    temporary.set(source, material); return material;
  }
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    originals.set(object, object.material);
    const model = new THREE.Mesh(object.geometry, object.material);
    model.castShadow = object.castShadow; model.receiveShadow = object.receiveShadow;
    warmup.add(model);
    object.material = Array.isArray(object.material) ? object.material.map(initial) : initial(object.material);
  });
  return {
    warmup,
    restore() { for (const [mesh, material] of originals) mesh.material = material; },
    dispose() { for (const material of temporary.values()) material.dispose(); temporary.clear(); originals.clear(); warmup.clear(); },
  };
}
