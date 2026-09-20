import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";

export const cinematicCast = [
  ["Female_Adult_01", "f001"], ["Male_Adult_01", "m002"],
  ["Female_Adult_04", "f004"], ["Male_Adult_04", "m006"],
  ["Female_Adult_08", "f008"], ["Male_Adult_08", "m014"],
] as const;

export function createParticipantFinish(area: "body" | "head" | "opacity", map: THREE.Texture, normalMap: THREE.Texture | null) {
  const skin = area === "head";
  return new THREE.MeshPhysicalMaterial({
    map, normalMap, roughness: skin ? .64 : .9, metalness: 0,
    specularIntensity: skin ? .26 : .16,
    sheen: area === "body" ? .12 : 0, sheenColor: 0xc4b5a1, sheenRoughness: .9,
    normalScale: new THREE.Vector2(skin ? .48 : .35, skin ? .48 : .35),
    alphaTest: area === "opacity" ? .45 : 0,
    side: area === "opacity" ? THREE.DoubleSide : THREE.FrontSide,
  });
}

/** Rocketbox faces +Z; furniture faces -Z. Pose natively, then normalize once. */
export function poseCinematicPerson(person: THREE.Object3D, seated: boolean, variant = 0, activity: "listen" | "research" = "listen") {
  function aim(name: string, child: string, direction: THREE.Vector3) {
    const bone = person.getObjectByName(name), end = person.getObjectByName(child);
    if (!bone || !end || !bone.parent) throw new Error(`Missing avatar joint: ${name}`);
    person.updateMatrixWorld(true);
    const from = end.getWorldPosition(new THREE.Vector3()).sub(bone.getWorldPosition(new THREE.Vector3())).normalize();
    const world = bone.getWorldQuaternion(new THREE.Quaternion());
    const adjustment = new THREE.Quaternion().setFromUnitVectors(from, direction.normalize());
    bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(adjustment.multiply(world)));
    person.updateMatrixWorld(true);
  }
  // Authored still poses, not synchronized idle loops. Keep attention on the lectern.
  const spine = person.getObjectByName("Bip01_Spine1"), head = person.getObjectByName("Bip01_Head");
  spine?.rotateZ(Math.sin(variant * 1.7) * .025);
  head?.rotateY(Math.sin(variant * 2.1) * .035);
  if (activity === "listen") {
    aim("Bip01_Head", "Bip01_MNose", new THREE.Vector3(Math.sin(variant * 1.7) * .12, -.05 - (variant % 3) * .018, 1));
  }
  if (activity === "research" && !seated) {
    // Rocketbox attaches the thighs to Spine, so lean Spine1 instead to keep feet planted.
    aim("Bip01_Spine1", "Bip01_Spine2", new THREE.Vector3(0, .88, .5));
    aim("Bip01_Neck", "Bip01_Head", new THREE.Vector3(0, .85, .5));
    aim("Bip01_Head", "Bip01_MNose", new THREE.Vector3(Math.sin(variant) * .08, -.63, .78));
  }
  for (const [side, sign] of [["L", 1], ["R", -1]] as const) {
    const resting = seated && (variant + (side === "L" ? 1 : 0)) % 3 === 0;
    const relaxed = !seated && activity === "listen" && (variant + (side === "L" ? 1 : 0)) % 3 !== 0;
    aim(`Bip01_${side}_UpperArm`, `Bip01_${side}_Forearm`, new THREE.Vector3(sign * (resting ? .17 : .06), -1, seated ? (resting ? .12 : .3) : .06));
    aim(`Bip01_${side}_Forearm`, `Bip01_${side}_Hand`, new THREE.Vector3(-sign * (resting ? .32 : relaxed ? .22 : .08), seated ? (resting ? -.55 : -.27) : relaxed ? -.72 : -.9, seated ? .7 : relaxed ? .42 : .12));
    if (seated) {
      aim(`Bip01_${side}_Thigh`, `Bip01_${side}_Calf`, new THREE.Vector3(sign * .025, -.08, 1));
      aim(`Bip01_${side}_Calf`, `Bip01_${side}_Foot`, new THREE.Vector3(0, -1, .04));
    }
  }
  const pelvis = person.getObjectByName("Bip01_Pelvis");
  if (!pelvis) throw new Error("Missing avatar pelvis");
  person.updateMatrixWorld(true);
  const hip = pelvis.getWorldPosition(new THREE.Vector3());
  const bounds = new THREE.Box3().setFromObject(person, true);
  person.position.set(-hip.x, seated ? .59 - hip.y : -bounds.min.y, -hip.z);
  person.updateMatrixWorld(true);
  if (activity === "research" && !seated) {
    // Two-bone IK keeps wrist targets above the documents without stretching limbs.
    for (const [side, sign] of [["L", 1], ["R", -1]] as const) {
      const upper = `Bip01_${side}_UpperArm`, forearm = `Bip01_${side}_Forearm`, hand = `Bip01_${side}_Hand`;
      const at = (name: string) => person.getObjectByName(name)!.getWorldPosition(new THREE.Vector3());
      const shoulder = at(upper), elbow = at(forearm), wrist = at(hand);
      const a = shoulder.distanceTo(elbow), b = elbow.distanceTo(wrist);
      const target = new THREE.Vector3(sign * (.18 + (variant % 2) * .025), 1.005, .51 + (side === "L" ? .025 : 0));
      const direction = target.clone().sub(shoulder).normalize();
      const distance = Math.min(a + b - .001, Math.max(Math.abs(a - b) + .001, shoulder.distanceTo(target)));
      const along = (a * a + distance * distance - b * b) / (2 * distance);
      const out = new THREE.Vector3(sign, -.5, -.2);
      out.addScaledVector(direction, -out.dot(direction)).normalize();
      const elbowTarget = shoulder.clone().addScaledVector(direction, along)
        .addScaledVector(out, Math.sqrt(Math.max(0, a * a - along * along)));
      aim(upper, forearm, elbowTarget.sub(shoulder));
      aim(forearm, hand, target.sub(at(forearm)));
    }
    person.userData.activity = "research";
  }
  const holder = new THREE.Group();
  const facing = new THREE.Group(); facing.rotation.y = Math.PI;
  facing.add(person); holder.add(facing); holder.updateMatrixWorld(true);
  return holder;
}

/** Licensed anonymous avatars; never represent real members or research data. */
export async function loadCinematicPeople(track: (resource: THREE.Texture | THREE.Material | THREE.BufferGeometry) => void) {
  const models: THREE.Group[] = [];
  for (const [filename, prefix] of cinematicCast) {
    // Do not follow paths embedded in FBX. Every texture is an explicit same-origin asset.
    const manager = new THREE.LoadingManager();
    const placeholder = new THREE.Texture<HTMLImageElement>(); track(placeholder);
    const ignoredTextureLoader = new THREE.TextureLoader(manager);
    ignoredTextureLoader.load = () => placeholder;
    manager.addHandler(/.*/, ignoredTextureLoader);
    const response = await fetch(`/architecture/${filename}.fbx`);
    if (!response.ok) throw new Error("Architecture avatar unavailable");
    const model = new FBXLoader(manager).parse(await response.arrayBuffer(), "");
    models.push(model);
    // Track parsed resources before subsequent network requests can fail.
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      track(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) track(material);
    });
    const finishes = new Map<string, THREE.MeshPhysicalMaterial>();
    const loader = new THREE.TextureLoader();
    for (const area of ["body", "head", "opacity"] as const) {
      const map = await loader.loadAsync(`/architecture/${prefix}_${area}_color.webp`); track(map);
      map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
      const normalMap = area === "opacity" ? null : await loader.loadAsync(`/architecture/${prefix}_${area}_normal.webp`);
      if (normalMap) track(normalMap);
      const finish = createParticipantFinish(area, map, normalMap);
      finishes.set(`${prefix}_${area}`, finish); track(finish);
    }
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const replace = (material: THREE.Material) => finishes.get(material.name) ?? finishes.get(`${prefix}_body`)!;
      object.material = Array.isArray(object.material) ? object.material.map(replace) : replace(object.material);
      object.castShadow = true; object.receiveShadow = true;
      // Skinned bounds are evaluated by the actual pose, not the exported A-pose.
      object.frustumCulled = false;
    });
    model.scale.setScalar(0.01);
    model.updateMatrixWorld(true);
  }

  return (index: number, seated = false, activity: "listen" | "research" = "listen") => {
    const person = clone(models[index % models.length]);
    person.name = "licensed-anonymous-participant";
    return poseCinematicPerson(person, seated, index, activity);
  };
}
