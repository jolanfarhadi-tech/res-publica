import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Resource = THREE.Texture | THREE.Material | THREE.BufferGeometry;
/** Authored CC0 meshes, shared across placements rather than copied downloads. */
export async function loadArchitecturalDetails(track: (resource: Resource) => void) {
  const loader = new GLTFLoader();
  const root = new THREE.Group(); root.name = "authored-architectural-details";
  const models = await Promise.all(["modern_arm_chair_01", "potted_plant_01"].map(async name => {
    const filename = name === "potted_plant_01" ? `${name}.lod.gltf` : `${name}.gltf`;
    const { scene } = await loader.loadAsync(`/architecture/details/${name}/${filename}`);
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      track(object.geometry); object.castShadow = true; object.receiveShadow = true;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        track(material);
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) {
          value.anisotropy = 4; track(value);
        }
      }
    });
    return scene;
  }));
  for (const [x, y, z, yaw] of [[-7.4,4.44,17,Math.PI/4],[-4.8,4.44,17,-Math.PI/4],[15.2,0,11.4,Math.PI/2],[17.4,0,11.4,-Math.PI/2]]) {
    const chair = models[0].clone(true); chair.name = "detailed-lounge-chair";
    chair.position.set(x,y,z); chair.rotation.y = yaw; root.add(chair);
  }
  for (const [x,y,z,scale] of [[-9.5,0,-12.1,1.65],[9.5,0,-12.1,1.5],[-8.9,4.44,16.5,1.25]]) {
    const plant = models[1].clone(true); plant.name = "detailed-indoor-plant";
    plant.position.set(x,y,z); plant.scale.setScalar(scale); plant.rotation.y = x; root.add(plant);
  }
  return root;
}
