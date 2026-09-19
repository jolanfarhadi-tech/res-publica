import * as THREE from "three";

/** A real, human-scale architectural model. No member or research data is used. */
export function buildForumArchitecture() {
  const architecture = new THREE.Group();
  architecture.name = "res-publica-civic-forum";
  const material = (color: number, roughness = 0.55, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const stone = material(0xe3ddd1, 0.72);
  const floor = material(0xf0ece4, 0.28);
  const navy = material(0x123c51, 0.3, 0.28);
  const red = material(0x8b2727, 0.32, 0.24);
  const bronze = material(0x857665, 0.3, 0.65);
  const oak = material(0xbca17d, 0.55);
  const upholstery = material(0x657677, 0.85);
  const dark = material(0x253138, 0.55);
  const paper = material(0xf9f4e8, 0.9);
  const screen = material(0x6c8d97, 0.3, 0.2);
  const green = material(0x51684e, 0.8);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x9fc5cd, transparent: true, opacity: 0.24,
    roughness: 0.09, metalness: 0.16, depthWrite: false, side: THREE.DoubleSide,
  });
  const clothes = [0x354956, 0x9d8e7b, 0x636c64, 0x68616b].map((c) => material(c, 0.95));
  const skins = [0xb88160, 0xd1a07a, 0x79513e, 0xe2b793].map((c) => material(c, 0.85));
  const hair = [0x322b27, 0x514335, 0x9a9187].map((c) => material(c, 0.95));

  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, finish: THREE.Material,
    x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, finish);
    item.position.set(x, y, z);
    item.castShadow = finish !== glass;
    item.receiveShadow = finish !== glass;
    parent.add(item);
    return item;
  }
  function box(parent: THREE.Object3D, w: number, h: number, d: number,
    finish: THREE.Material, x: number, y: number, z: number) {
    return mesh(parent, new THREE.BoxGeometry(w, h, d), finish, x, y, z);
  }
  function limb(parent: THREE.Object3D, a: number[], b: number[], radius: number, finish: THREE.Material) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const vector = end.clone().sub(start);
    const item = mesh(parent, new THREE.CylinderGeometry(radius * 0.8, radius, vector.length(), 8), finish);
    item.position.copy(start.add(end).multiplyScalar(0.5));
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.normalize());
  }

  const shell = new THREE.Group();
  shell.name = "glass-laboratory";
  architecture.add(shell);
  box(shell, 21.6, 0.3, 24, stone, 0, -0.24, -0.6);
  box(shell, 21.3, 0.12, 23.7, floor, 0, -0.04, -0.6);
  // Fine joints, not a high-contrast computer grid.
  for (let x = -9; x <= 9; x += 3) box(shell, 0.014, 0.004, 23, stone, x, 0.025, -0.6);
  for (let z = -10; z <= 10; z += 3) box(shell, 21, 0.004, 0.014, stone, 0, 0.025, z);
  // An open-front architectural section keeps the interior legible.
  for (const side of [-1, 1]) {
    for (let z = -10; z <= 8; z += 3) {
      box(shell, 0.09, 6.5, 0.09, bronze, side * 10.3, 3.25, z);
      box(shell, 0.025, 6.2, 2.91, glass, side * 10.3, 3.22, z + 1.5);
    }
    box(shell, 0.15, 0.14, 21, bronze, side * 10.3, 6.5, -0.9);
    box(shell, 0.06, 0.06, 21, bronze, side * 10.3, 3.2, -0.9);
  }
  for (let x = -9; x <= 9; x += 3) {
    box(shell, 0.07, 6.5, 0.07, bronze, x, 3.25, -11.3);
    box(shell, 2.93, 6.2, 0.025, glass, x, 3.22, -11.3);
  }
  for (const z of [-10.8, -6.2, -1.6]) {
    box(shell, 20.7, 0.13, 0.09, bronze, 0, 6.5, z);
  }
  // Architectural depth: gallery plinths, perimeter clerestories and a rear archive.
  for (const side of [-1, 1]) {
    box(shell, 0.18, 0.4, 21.3, stone, side * 10.3, 0.2, -0.75);
    box(shell, 0.22, 0.23, 21.3, stone, side * 10.3, 6.55, -0.75);
    box(shell, 1.15, 0.035, 19.8, glass, side * 9.7, 6.48, -0.9);
  }
  box(shell, 20.7, 0.38, 0.2, stone, 0, 6.55, -11.3);
  for (const x of [-7, -3.5, 3.5, 7]) {
    box(shell, 2.15, 2.8, 0.45, oak, x, 1.42, -10.8);
    box(shell, 2.02, 2.6, 0.47, dark, x, 1.45, -10.77);
    for (let shelf = 0; shelf < 4; shelf++) {
      box(shell, 2.02, 0.035, 0.5, oak, x, 0.3 + shelf * 0.65, -10.72);
      for (let book = 0; book < 9; book++) {
        box(shell, 0.09 + book % 3 * 0.018, 0.34 + book % 2 * 0.11, 0.25,
          book % 3 === 0 ? navy : book % 3 === 1 ? paper : bronze,
          x - 0.86 + book * 0.2, 0.51 + shelf * 0.65, -10.6);
      }
    }
  }

  const forum = new THREE.Group();
  forum.name = "logo-shaped-forum";
  architecture.add(forum);
  // Long parallel stems and a rounded base reproduce the upright U identity.
  // This is a volume in the X/Z floor plane, not a flat illustration or a torus.
  function uWall(radius: number, width: number, height: number, finish: THREE.Material) {
    const shape = new THREE.Shape();
    shape.moveTo(radius, -8.2);
    shape.lineTo(radius, 0);
    shape.absarc(0, 0, radius, 0, Math.PI, false);
    shape.lineTo(-radius, -8.2);
    shape.lineTo(-radius + width, -8.2);
    shape.lineTo(-radius + width, 0);
    shape.absarc(0, 0, radius - width, Math.PI, 0, true);
    shape.lineTo(radius - width, -8.2);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height, bevelEnabled: true, bevelSegments: 2,
      steps: 1, bevelSize: 0.028, bevelThickness: 0.028, curveSegments: 48,
    });
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, height, 0);
    const wall = mesh(forum, geometry, finish);
    wall.name = "upright-u-volume";
  }
  uWall(9, 0.38, 1.05, red);
  for (const radius of [7.6, 5.8, 4]) uWall(radius, 0.23, 0.88, navy);

  const workspaces = new THREE.Group();
  workspaces.name = "furnished-workspaces";
  architecture.add(workspaces);
  let personIndex = 0;
  function workstation(x: number, z: number, yaw: number) {
    const station = new THREE.Group();
    station.name = "seated-participant-workstation";
    station.position.set(x, 0, z);
    station.rotation.y = yaw;
    workspaces.add(station);
    box(station, 1.12, 0.055, 0.61, oak, 0, 0.77, -0.45);
    for (const sx of [-0.45, 0.45]) for (const sz of [-0.67, -0.23]) {
      box(station, 0.035, 0.73, 0.035, bronze, sx, 0.365, sz);
    }
    // A chair, not a person perched on the U-shaped wall.
    box(station, 0.43, 0.07, 0.44, upholstery, 0, 0.45, 0.18);
    const back = box(station, 0.43, 0.4, 0.055, upholstery, 0, 0.68, 0.4);
    back.rotation.x = -0.08;
    for (const sx of [-0.17, 0.17]) for (const sz of [0.02, 0.34]) {
      box(station, 0.025, 0.43, 0.025, bronze, sx, 0.215, sz);
    }
    box(station, 0.3, 0.012, 0.23, paper, 0.27, 0.805, -0.38);
    box(station, 0.32, 0.018, 0.22, dark, -0.15, 0.81, -0.46);
    const laptop = box(station, 0.32, 0.21, 0.015, screen, -0.15, 0.92, -0.57);
    laptop.rotation.x = -0.15;
    const index = personIndex++;
    const person = new THREE.Group();
    person.name = "synthetic-seated-person";
    station.add(person);
    const fabric = clothes[index % clothes.length];
    const skin = skins[index % skins.length];
    const scalp = hair[index % hair.length];
    const torso = mesh(person, new THREE.CapsuleGeometry(0.155, 0.29, 4, 10), fabric, 0, 0.88, 0.13);
    torso.scale.set(1, 1, 0.69);
    torso.rotation.x = -0.12;
    mesh(person, new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), skin, 0, 1.16, 0.095);
    const head = mesh(person, new THREE.SphereGeometry(0.115, 12, 10), skin, 0, 1.29, 0.06);
    head.scale.set(0.85, 1.18, 0.98);
    const cap = mesh(person, new THREE.SphereGeometry(0.117, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), scalp, 0, 1.32, 0.065);
    cap.scale.set(0.88, 1.08, 1);
    if (index % 3 === 0) {
      const longHair = mesh(person, new THREE.SphereGeometry(0.13, 10, 8), scalp, 0, 1.21, 0.16);
      longHair.scale.set(0.9, 1.4, 0.6);
    }
    for (const sx of [-1, 1]) {
      limb(person, [sx * 0.15, 1.02, 0.1], [sx * 0.22, 0.8, -0.1], 0.055, fabric);
      limb(person, [sx * 0.22, 0.8, -0.1], [sx * 0.13, 0.82, -0.34], 0.043, fabric);
      mesh(person, new THREE.SphereGeometry(0.042, 8, 6), skin, sx * 0.13, 0.82, -0.34);
      limb(person, [sx * 0.09, 0.52, 0.12], [sx * 0.11, 0.46, -0.23], 0.072, dark);
      limb(person, [sx * 0.11, 0.46, -0.23], [sx * 0.11, 0.1, -0.25], 0.058, dark);
      box(person, 0.12, 0.075, 0.22, dark, sx * 0.11, 0.055, -0.29);
    }
  }
  for (const radius of [6.84, 5.04, 3.24]) {
    for (const side of [-1, 1]) {
      for (const z of [-6.2, -3.8, -1.4]) workstation(side * radius, z, side * Math.PI / 2);
    }
    for (const angle of [0.38, 0.88, 2.26, 2.76]) {
      workstation(radius * Math.cos(angle), radius * Math.sin(angle), Math.PI / 2 - angle);
    }
  }
  // Central passage, low accessible dais and a narrow standing lectern.
  box(forum, 1.25, 0.035, 10.7, stone, 0, 0.055, 3.2);
  mesh(forum, new THREE.CylinderGeometry(1.65, 1.8, 0.13, 64), stone, 0, 0.08, -2.4);
  mesh(forum, new THREE.CylinderGeometry(1.43, 1.5, 0.1, 64), floor, 0, 0.2, -2.4);
  box(forum, 0.55, 1.04, 0.36, oak, 0, 0.77, -2.4);
  const lectern = box(forum, 0.69, 0.055, 0.48, bronze, 0, 1.31, -2.4);
  lectern.rotation.x = 0.16;

  for (const x of [-9.6, 9.6]) for (const z of [-9.3, 6.6]) {
    mesh(shell, new THREE.CylinderGeometry(0.32, 0.24, 0.48, 16), stone, x, 0.24, z);
    limb(shell, [x, 0.4, z], [x + 0.05, 1.8, z], 0.035, bronze);
    for (let i = 0; i < 6; i++) {
      const leaf = mesh(shell, new THREE.SphereGeometry(0.29, 8, 6), green,
        x + Math.sin(i * 2.4) * 0.23, 1.1 + i * 0.12, z + Math.cos(i * 2.4) * 0.23);
      leaf.scale.set(1, 0.35, 1.2);
      leaf.rotation.z = i * 0.5;
    }
  }

  const chandelier = new THREE.Group();
  chandelier.name = "suspended-crystal-chandelier";
  chandelier.position.set(0, 4.6, -2.4);
  architecture.add(chandelier);
  const gold = material(0xb08a3c, 0.22, 0.8);
  const crystal = new THREE.MeshPhysicalMaterial({
    color: 0xf8bb55, roughness: 0.15, metalness: 0.45, clearcoat: 1,
    emissive: 0xa34906, emissiveIntensity: 0.28,
    transparent: true, opacity: 0.86, side: THREE.DoubleSide,
  });
  const jewel = mesh(chandelier, new THREE.IcosahedronGeometry(0.85, 0), crystal);
  jewel.scale.set(1, 1.18, 1);
  jewel.name = "faceted-gold-pendant";
  const edges = new THREE.EdgesGeometry(jewel.geometry);
  const positions = edges.getAttribute("position");
  for (let i = 0; i < positions.count; i += 2) {
    limb(chandelier,
      [positions.getX(i), positions.getY(i) * 1.18, positions.getZ(i)],
      [positions.getX(i + 1), positions.getY(i + 1) * 1.18, positions.getZ(i + 1)], 0.014, gold);
  }
  edges.dispose();
  mesh(chandelier, new THREE.IcosahedronGeometry(0.52, 0), gold).rotation.y = Math.PI / 5;
  // Suspension stays attached to the architecture, not to an animated image layer.
  limb(shell, [0, 5.5, -2.4], [0, 6.5, -2.4], 0.012, bronze);
  box(shell, 20.7, 0.12, 0.09, bronze, 0, 6.5, -2.4);
  const glow = new THREE.PointLight(0xffd498, 30, 8, 2);
  glow.position.set(0, 3.8, -2.4);
  architecture.add(glow);
  return { architecture, chandelier };
}

export function disposeForumArchitecture(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}
