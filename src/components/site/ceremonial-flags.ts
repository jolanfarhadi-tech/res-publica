import * as THREE from "three";

/** Authored indoor drape, not a wind/cloth simulation. The hoist remains pinned. */
export function sampleFlagDrape(u: number, v: number, phase = 0) {
  const fold = u * Math.PI * 4.5 + (1 - v) * .75 + phase;
  const hanging = Math.pow(u, 1.3);
  return new THREE.Vector3(
    -.9 + 1.8 * (.76 * u + .08 * Math.sin(Math.PI * u)),
    (v - .5) * 1.2 - .66 * hanging - .055 * u * Math.sin(fold),
    u * (.18 * Math.sin(fold) + .07 * Math.sin(u * Math.PI * 1.4 + phase)),
  );
}

function shapeCeremonialFlags(group: THREE.Group) {
  for (const child of group.children) {
    if (!(child instanceof THREE.Mesh) || !child.userData.ceremonialCloth) continue;
    const geometry = child.geometry, positions = geometry.getAttribute("position"), uv = geometry.getAttribute("uv");
    for (let i = 0; i < positions.count; i++) {
      const point = sampleFlagDrape(uv.getX(i), uv.getY(i), child.userData.clothPhase);
      positions.setXYZ(i, point.x, point.y, point.z);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }
}

/** Decorative civic symbols, not assertions of institutional affiliation. */
export function civicFlagTexture(kind: "eu" | "germany") {
  const canvas = document.createElement("canvas"); canvas.width = 480; canvas.height = 320;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Flag texture unavailable");
  if (kind === "germany") {
    ["#171717", "#c8272d", "#f3bf26"].forEach((color, i) => {
      context.fillStyle = color; context.fillRect(0, i * 320 / 3, 480, 320 / 3 + 1);
    });
  } else {
    context.fillStyle = "#003399"; context.fillRect(0, 0, 480, 320);
    context.fillStyle = "#ffcc00";
    for (let star = 0; star < 12; star++) {
      const angle = star * Math.PI / 6 - Math.PI / 2;
      const x = 240 + Math.cos(angle) * 86, y = 160 + Math.sin(angle) * 86;
      context.beginPath();
      for (let point = 0; point < 10; point++) {
        const radius = point % 2 ? 5 : 12, a = -Math.PI / 2 + point * Math.PI / 5;
        const px = x + Math.cos(a) * radius, py = y + Math.sin(a) * radius;
        if (point === 0) context.moveTo(px, py); else context.lineTo(px, py);
      }
      context.closePath(); context.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildCeremonialFlags(textures: THREE.Texture[]) {
  const group = new THREE.Group(); group.name = "ceremonial-civic-flags";
  const metal = new THREE.MeshStandardMaterial({ color: 0x8d7855, metalness: .75, roughness: .34 });
  for (const [index, texture] of textures.entries()) {
    const x = [-4, -.8, 2.4][index], z = -10.8;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.026, .032, 3.7, 12), metal);
    pole.position.set(x, 1.85, z); group.add(pole);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.28, .32, .06, 24), metal);
    base.position.set(x, .03, z); group.add(base);
    const geometry = new THREE.PlaneGeometry(1.8, 1.2, 48, 28);
    const cloth = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({
      map: texture, roughness: .96, metalness: 0, specularIntensity: .16,
      sheen: .22, sheenRoughness: .9, sheenColor: 0xe2e4e1, side: THREE.DoubleSide,
    }));
    cloth.name = ["flag-eu", "flag-germany", "flag-lion-sun"][index];
    cloth.userData.ceremonialCloth = true; cloth.userData.clothPhase = index * .85;
    cloth.position.set(x + .94, 2.95, z); cloth.castShadow = true; cloth.receiveShadow = true; group.add(cloth);
    for (const y of [2.35, 3.55]) {
      const fastening = new THREE.Mesh(new THREE.TorusGeometry(.046, .008, 6, 12), metal);
      fastening.position.set(x + .025, y, z); fastening.rotation.y = Math.PI / 2; group.add(fastening);
    }
  }
  shapeCeremonialFlags(group);
  return group;
}
