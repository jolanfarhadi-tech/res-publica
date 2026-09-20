import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createParliamentLayout, parliamentAisleHalfWidth } from "./parliament-layout";

export type BuildingMaps = { stone: THREE.Texture; stoneNormal: THREE.Texture; stoneRough: THREE.Texture;
  oak: THREE.Texture; oakNormal: THREE.Texture; oakRough: THREE.Texture };

/** Authored in metres: one atrium with connected library, studio and galleries. */
export function buildCinematicBuilding(maps: BuildingMaps) {
  const root = new THREE.Group();
  root.name = "continuous-civic-building";
  const stone = new THREE.MeshStandardMaterial({ color: 0xc4d4e5, map: maps.stone,
    normalMap: maps.stoneNormal, normalScale: new THREE.Vector2(0.16, 0.16), roughnessMap: maps.stoneRough, roughness: 0.46 });
  stone.name = "honed-limestone";
  const oak = new THREE.MeshStandardMaterial({ color: 0xb5a68f, map: maps.oak,
    normalMap: maps.oakNormal, normalScale: new THREE.Vector2(0.07, 0.07), roughness: 0.62 });
  oak.name = "continuous-oak-veneer";
  const plaster = new THREE.MeshStandardMaterial({ color: 0xd8d5cd, roughness: 0.88 });
  const bronze = new THREE.MeshStandardMaterial({ color: 0x76634a, roughness: 0.32, metalness: 0.72 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xa58753, roughness: 0.3, metalness: 0.85 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x233b46, roughness: 0.68, metalness: 0.08 });
  const red = new THREE.MeshStandardMaterial({ color: 0x70424a, roughness: 0.7, metalness: 0.04 });
  const linen = new THREE.MeshPhysicalMaterial({ color: 0x454d47, roughness: 0.85, sheen: .25, sheenRoughness: .8, sheenColor: 0x948877 });
  const seam = new THREE.MeshStandardMaterial({ color: 0x666b64, roughness: 1 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x252e30, roughness: 0.4 });
  const paper = new THREE.MeshStandardMaterial({ color: 0xe7dfcc, roughness: 0.94 });
  // Thin low-iron panes: double-sided tinted boxes compounded into a milky veil.
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xf8fcfa, roughness: 0.025, metalness: 0,
    transparent: true, opacity: 0.035, depthWrite: false, side: THREE.FrontSide });
  const warm = new THREE.MeshStandardMaterial({ color: 0xffdea0, emissive: 0xffb661, emissiveIntensity: 1.35 });
  const crystal = new THREE.MeshPhysicalMaterial({ color: 0xca8838, roughness: 0.12, metalness: 0.48,
    clearcoat: 1, transparent: true, opacity: 0.82, emissive: 0x6b360b, emissiveIntensity: 0.4 });
  const geometryCache = new Map<string, THREE.BufferGeometry>();
  function cube(w: number, h: number, d: number, round = 0) {
    const key = `${w}/${h}/${d}/${round}`;
    if (!geometryCache.has(key)) geometryCache.set(key, round ? new RoundedBoxGeometry(w, h, d, 2, round) : new THREE.BoxGeometry(w, h, d));
    return geometryCache.get(key)!;
  }
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) {
    const result = new THREE.Mesh(geometry, material);
    result.position.set(x, y, z);
    result.castShadow = material !== glass && material !== warm;
    result.receiveShadow = material !== glass;
    parent.add(result);
    return result;
  }
  function box(w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number, round = 0, parent: THREE.Object3D = root) {
    return mesh(cube(w, h, d, round), material, x, y, z, parent);
  }
  function rod(a: number[], b: number[], radius = 0.024, material: THREE.Material = bronze, parent: THREE.Object3D = root) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const delta = end.clone().sub(start);
    const cylinder = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 10), material, 0, 0, 0, parent);
    cylinder.position.copy(start.add(end).multiplyScalar(0.5));
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return cylinder;
  }
  // A complete enclosing building. The camera remains inside, never a dollhouse view.
  box(40, 0.3, 43, stone, 0, -0.2, -1);
  // Joints now belong to the metre-scaled stone finish, not coplanar strips.
  // Open atrium skylight: an opaque roof had blocked direct daylight and flattened the room.
  for (const x of [-15.25, 15.25]) box(9.5, 0.28, 43, plaster, x, 10.9, -1);
  for (const z of [-20.25, 18.25]) box(21, 0.28, 4.5, plaster, 0, 10.9, z);
  const skylight = box(21, 0.025, 34, glass, 0, 10.98, -1);
  skylight.name = "daylight-atrium-skylight";
  for (const x of [-19.5, -10.5, 10.5, 19.5]) {
    for (const z of [-19, -10, -1, 8, 17]) {
      box(0.48, 10.8, 0.65, stone, x, 5.4, z, 0.025);
      box(.53,.11,.7,bronze,x,.025,z,.008);
      for (const side of [-1,1]) box(.018,10.7,.04,bronze,x+side*.25,5.4,z+.32);
    }
  }
  for (const z of [-20, 19]) {
    for (let x = -19; x < 20; x += 2.5) {
      box(0.075, 10.7, 0.14, bronze, x, 5.35, z);
      box(2.44, 10.5, 0.015, glass, x + 1.25, 5.35, z);
    }
    for (const y of [0.2, 3.7, 7.2, 10.6]) box(40, 0.06, 0.075, bronze, 0, y, z);
  }
  for (const x of [-20, 20]) {
    for (let z = -19; z < 19; z += 3) {
      box(0.08, 10.6, 0.06, bronze, x, 5.3, z);
      box(0.012, 10.5, 2.9, glass, x, 5.3, z + 1.5);
    }
    for (const y of [3.7, 7.2]) box(0.08, 0.06, 39, bronze, x, y, -0.5);
  }
  // Mezzanines frame the atrium and connect through a broad rear gallery.
  for (const x of [-15.2, 15.2]) box(9.2, 0.28, 38, stone, x, 4.3, -0.5);
  for (const x of [-10.62,10.62]) {
    box(.07,.36,38,oak,x,4.23,-.5,.014);
    box(.075,.018,38,warm,x,4.02,-.5);
  }
  box(21, 0.28, 4.5, stone, 0, 4.3, 16.6);
  for (const x of [-10.6, 10.6]) {
    for (let z = -18; z <= 16; z += 2) {
      box(0.016, 1.08, 1.95, glass, x, 4.98, z);
      rod([x, 4.44, z - 1], [x, 5.55, z - 1], 0.018);
    }
    rod([x, 5.55, -19], [x, 5.55, 17], 0.026);
  }
  for (let x = -10; x <= 10; x += 2) box(1.96, 1.08, 0.015, glass, x, 4.98, 14.3);
  rod([-10.5, 5.55, 14.3], [10.5, 5.55, 14.3], 0.026);
  // Coffered structural roof: quiet warm slots, not neon sci-fi decoration.
  for (const z of [-16, -10, -4, 2, 8, 14]) {
    box(39.5, 0.24, 0.24, plaster, 0, 10.6, z);
    box(35, 0.014, 0.04, warm, 0, 10.47, z + 0.18);
  }
  const forum = new THREE.Group(); forum.name = "forum"; root.add(forum);
  function uBand(radius: number, width: number, height: number, material: THREE.Material, elevation: number, name: string) {
    const band = new THREE.Group(); band.name = name; forum.add(band);
    // Two physical halves preserve the logo while leaving an uninterrupted central aisle.
    for (const side of [-1, 1]) {
      const inner = radius - width, shape = new THREE.Shape();
      shape.moveTo(side * radius, -8.8); shape.lineTo(side * radius, 0);
      for (let i = 1; i <= 64; i++) {
        const angle = Math.acos(parliamentAisleHalfWidth / radius) * i / 64;
        shape.lineTo(side * radius * Math.cos(angle), radius * Math.sin(angle));
      }
      for (let i = 64; i >= 0; i--) {
        const angle = Math.acos(parliamentAisleHalfWidth / inner) * i / 64;
        shape.lineTo(side * inner * Math.cos(angle), inner * Math.sin(angle));
      }
      shape.lineTo(side * inner, -8.8); shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
      geometry.rotateX(Math.PI / 2); geometry.translate(0, height, 0);
      mesh(geometry, material, 0, elevation, 0, band);
    }
    return band;
  }
  uBand(9.25, .24, 1.45, red, 0, "logo-u-partition");
  for (const [row, radius] of [4.25, 6.15, 8.05].entries()) {
    uBand(radius, 1.86, .08 + row * .32, stone, -.08, "parliament-tier");
    uBand(radius, .14, .82, navy, row * .32, "logo-u-partition");
    // Continuous joinery follows the logo, rather than an array of school desks.
    // Seat radius is radius-.6; the desk centre is another .78m inward.
    uBand(radius - 1.02, .72, .055, oak, row * .32 + .7325, "continuous-parliament-worktop");
    uBand(radius - 1.05, .035, .29, navy, row * .32 + .41, "parliament-cable-apron");
    // Two shallow risers per row, beside the level central access aisle.
    for (const side of [-1, 1]) {
      box(.55, .16, .72, stone, side * 1.43, row * .32 + .08, radius - .72);
      box(.55, .32, .36, stone, side * 1.43, row * .32 + .16, radius - .36);
    }
  }
  // The circulation aisle is a clear void, not a wooden stripe through the logo.
  const aisle = new THREE.Group(); aisle.name = "central-access-aisle"; root.add(aisle);

  function chair(x: number, z: number, yaw: number, y = 0) {
    const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = yaw; root.add(c);
    box(0.46, 0.085, 0.46, linen, 0, 0.46, 0, 0.035, c);
    const back = box(0.46, 0.43, 0.075, linen, 0, 0.72, 0.23, 0.033, c); back.rotation.x = -0.11;
    for (const side of [-1, 1]) {
      rod([side * 0.19, 0.44, -0.15], [side * 0.23, 0.035, -0.24], 0.017, bronze, c);
      rod([side * 0.19, 0.44, 0.15], [side * 0.23, 0.035, 0.3], 0.017, bronze, c);
      rod([side * .225, .46, .15], [side * .225, .655, .1], .014, bronze, c);
      box(.045, .04, .31, oak, side * .225, .67, .025, .015, c);
    }
    // Narrow upholstered welt; distinct from the load-bearing chair frame.
    box(.43, .012, .014, seam, 0, .508, -.19, .005, c);
    return c;
  }
  function desk(x: number, z: number, yaw: number, y = 0, continuous = false) {
    const d = new THREE.Group(); d.position.set(x, y, z); d.rotation.y = yaw; root.add(d);
    d.name = continuous ? "parliament-workstation" : "reading-workstation";
    if (!continuous) {
      box(1.35, 0.055, 0.72, oak, 0, 0.76, 0, 0.022, d);
      box(1.16, .29, .025, navy, 0, .57, -.29, .008, d);
      for (const a of [-0.54, 0.54]) for (const b of [-0.27, 0.27]) rod([a, 0.03, b], [a, 0.74, b], 0.018, bronze, d);
    } else {
      box(.075, .7, .36, bronze, 0, .36, 0, .012, d);
      box(.62, .035, .42, bronze, 0, .025, 0, .012, d);
    }
    box(0.31, 0.012, 0.23, paper, 0.34, 0.797, 0.1, 0, d);
    box(0.32, 0.015, 0.22, ink, -0.22, 0.801, 0, 0.005, d);
    const screen = box(0.32, 0.21, 0.014, ink, -0.22, 0.91, -0.1, 0.006, d); screen.rotation.x = -0.12;
    mesh(new THREE.CylinderGeometry(.045, .045, .014, 12), ink, .06, .8, -.22, d);
    rod([.06,.81,-.22],[.06,1.01,-.17],.006,ink,d);
    rod([.06,1.01,-.17],[.06,1.025,-.1],.009,ink,d);
    mesh(new THREE.CylinderGeometry(0.033, 0.03, 0.074, 16), paper, 0.52, 0.833, -0.2, d);
  }
  const seats = createParliamentLayout();
  for (const seat of seats) {
    // Documents/screens align with the ribbon, while the person looks at the lectern.
    const deskYaw = Math.atan2(seat.x - seat.desk.x, seat.z - seat.desk.z);
    desk(seat.desk.x, seat.desk.z, deskYaw, seat.y, true);
    const furniture = chair(seat.x, seat.z, seat.yaw, seat.y);
    furniture.name = "parliament-seat";
  }
  const axis = new THREE.Group(); axis.name = "logo-circle-and-longitudinal-stem"; root.add(axis);
  mesh(new THREE.CylinderGeometry(1.05, 1.05, .15, 64), gold, 0, .045, -4.5, axis).name = "logo-gold-circle";
  box(.7, .68, 2.65, gold, 0, .34, -1.7, .025, axis).name = "logo-gold-stem";
  box(.78, .045, 2.7, gold, 0, .7, -1.7, .015, axis);
  box(.56, 1.05, .38, navy, 0, .66, -4.5, .018);
  box(.65, .045, .46, gold, 0, 1.22, -4.5, .014).rotation.x = .15;
  rod([0.18, 1.17, -4.5], [0.18, 1.43, -4.5], 0.008, ink);
  // Amber cut-glass chandelier, built as many physical hanging facets.
  const chandelier = new THREE.Group(); chandelier.name = "amber-glass-chandelier"; root.add(chandelier);
  for (let tier = 0; tier < 5; tier++) {
    const radius = [0.42, 0.76, 1.15, 0.9, 0.48][tier]; const y = 7.8 - tier * 0.47;
    const ring = mesh(new THREE.TorusGeometry(radius, 0.018, 6, 48), bronze, 0, y, -4.5, chandelier); ring.rotation.x = Math.PI / 2;
    for (let i = 0; i < 16; i++) {
      const angle = i * Math.PI / 8;
      const panel = mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.66, 5), crystal,
        Math.sin(angle) * radius, y - 0.15, -4.5 + Math.cos(angle) * radius, chandelier);
      panel.rotation.y = angle;
      if (i % 4 === 0) mesh(new THREE.SphereGeometry(0.032, 8, 6), warm, Math.sin(angle) * radius * 0.75, y, -4.5 + Math.cos(angle) * radius * 0.75, chandelier);
    }
  }
  for (const x of [-0.35, 0.35]) rod([x, 7.9, -4.5], [x, 10.5, -4.5], 0.009);
  // A real adjoining library, with shelving, books and occupied reading tables.
  const library = new THREE.Group(); library.name = "library"; root.add(library);
  for (const x of [12.6, 16.3, 19.1]) {
    for (const z of [-16, -12.5, -9]) {
      // Open carcass: a solid box used to swallow most of the book geometry.
      for (const side of [-1,1]) box(.07,3.5,.46,oak,x+side*1.415,1.75,z,.008,library);
      box(2.9,.07,.46,oak,x,3.465,z,.008,library);
      box(2.9,.1,.46,oak,x,.05,z,.008,library);
      box(2.72, 3.24, 0.08, ink, x, 1.73, z - 0.19, 0, library).name = "shelf-rear-panel";
      for (let s = 0; s < 5; s++) {
        box(2.72, 0.045, 0.44, oak, x, 0.26 + s * 0.62, z + 0.08, 0, library);
        for (let b = 0; b < 17; b++) {
          const h = 0.27 + ((b * 13 + s * 7) % 9) * 0.021;
          box(0.09 + b % 3 * 0.015, h, 0.22, [paper, navy, linen, red, oak][(b + s) % 5], x - 1.25 + b * 0.15, 0.29 + s * 0.62 + h / 2, z + 0.15, 0, library).name = "archive-volume";
        }
      }
      box(2.5, 0.012, 0.03, warm, x, 3.24, z + 0.23, 0, library);
    }
  }
  for (const x of [13, 17]) for (const z of [-3, 2, 8]) {
    desk(x, z, 0); chair(x, z + 0.8, 0);
    // Upper reading gallery participates in the same architecture.
    desk(x, z, 0, 4.46); chair(x, z + 0.8, 0, 4.46);
  }
  const studio = new THREE.Group(); studio.name = "research-studio"; root.add(studio);
  function researchDocument(x: number, z: number, angle: number, index: number, parent: THREE.Object3D) {
    const document = new THREE.Group(); document.name = "research-document";
    document.position.set(x, .955 + index % 3 * .004, z); document.rotation.y = angle; parent.add(document);
    box(.52, .004, .38, paper, 0, 0, 0, .001, document);
    // Abstract printed plans, not invented publication titles or research evidence.
    for (let line = 0; line < 5; line++) {
      box(.27 - (line % 3) * .034, .001, .002, seam, -.04, .0026, -.13 + line * .018, 0, document);
    }
    box(.002, .001, .16, seam, -.17, .0026, .067, 0, document);
    box(.32, .001, .002, seam, -.01, .0026, .145, 0, document);
    for (let bar = 0; bar < 6; bar++) box(.025, .001, .03 + ((bar + index) % 4) * .023, bar % 2 ? navy : red,
      -.125 + bar * .045, .0027, .11 - ((bar + index) % 4) * .0115, 0, document);
    return document;
  }
  function taskLamp(x: number, z: number, parent: THREE.Object3D) {
    const lamp = new THREE.Group(); lamp.name = "research-task-lamp"; lamp.position.set(x, .954, z); parent.add(lamp);
    mesh(new THREE.CylinderGeometry(.12, .14, .025, 24), bronze, 0, .0125, 0, lamp);
    rod([0,.025,0],[0,.47,0],.014,bronze,lamp);
    rod([0,.47,0],[0,.53,.15],.011,bronze,lamp);
    const shade = mesh(new THREE.CylinderGeometry(.07,.15,.17,24,1,true), bronze, 0,.49,.15,lamp);
    shade.material = bronze;
    mesh(new THREE.CircleGeometry(.135,24), warm, 0,.407,.15,lamp).rotation.x = Math.PI / 2;
  }
  for (const z of [-13, -7, -1, 5]) {
    box(6.6, 0.075, 1.4, oak, -15, 0.91, z, 0.028, studio);
    for (const x of [-17.5, -12.5]) box(0.1, 0.89, 0.9, bronze, x, 0.445, z, 0, studio);
    box(5.9,.12,.09,bronze,-15,.82,z,0,studio);
    for (const [index,x] of [-17,-15.7,-14.3,-13].entries()) {
      researchDocument(x, z + .26, .1 * Math.sin(index + z), index, studio);
      researchDocument(x + .23, z - .14, -.12 * Math.cos(index + z), index + 1, studio);
      rod([x+.16,.966,z+.35],[x+.34,.966,z+.31],.003,ink,studio);
    }
    taskLamp(-15,z-.28,studio);
    const laptop = new THREE.Group(); laptop.position.set(-12.45,.958,z-.07); studio.add(laptop);
    box(.42,.018,.29,bronze,0,0,0,.007,laptop);
    const screen = box(.42,.28,.014,ink,0,.137,-.13,.007,laptop); screen.rotation.x = -.13;
    for (let stack = 0; stack < 3; stack++) box(.45,.045,.33,[navy,paper,red][stack],-17.9,.98+stack*.047,z-.23,.003,studio);
    // Move unused chairs off the standing work zone, not through participants' legs.
    for (const x of [-17.6,-12.4]) chair(x,z+1.78,Math.PI*.12);
  }
  // Slatted acoustic soffits add construction detail, keeping the atrium clear.
  const acoustic = new THREE.Group(); acoustic.name = "gallery-acoustic-soffits"; root.add(acoustic);
  for (const x of [-15, 15]) {
    for (let z = -17; z <= 10; z += .38) box(7.8,.09,.055,oak,x,4.1,z,.01,acoustic);
    for (const z of [-12,-4,4]) box(6.8,.028,.04,warm,x,4.035,z,0,acoustic);
  }
  // HARM: a quiet review room at the end of the research wing, not another library.
  const review = new THREE.Group(); review.name = "harm-review-room"; root.add(review);
  box(6.5, 3.2, .1, plaster, -15, 1.7, -18.6, .03, review);
  for (const x of [-17, -15, -13]) {
    box(1.35, 2.1, .05, linen, x, 1.75, -18.48, .025, review);
    for (let i = 0; i < 4; i++) {
      box(.9, .012, .008, bronze, x, 1.15 + i * .35, -18.43, 0, review);
      box(.12, .12, .02, i % 2 ? red : navy, x - .48, 1.15 + i * .35, -18.42, .01, review);
    }
    chair(x, -16, Math.PI);
  }
  // Publications: editorial displays and a colophon wall, separate from reading desks.
  const editorial = new THREE.Group(); editorial.name = "publication-gallery"; root.add(editorial);
  for (let i = 0; i < 5; i++) {
    const x = 11.8 + i * 1.48;
    box(.82, 1.1, .72, plaster, x, .55, -19.1, .025, editorial);
    const book = box(.62, .85, .085, [navy, red, ink, gold, linen][i], x, 1.65, -19.1, .01, editorial);
    book.rotation.x = -.12;
    box(.35, .02, .018, paper, x, 1.72, -19.045, 0, editorial);
  }
  // Programme learning space on the upper west gallery.
  const learning = new THREE.Group(); learning.name = "programme-learning-room"; root.add(learning);
  for (const z of [-9, -4]) {
    mesh(new THREE.CylinderGeometry(1.55, 1.55, .07, 48), oak, -15, 5.22, z, learning);
    mesh(new THREE.CylinderGeometry(.12, .2, .73, 16), bronze, -15, 4.825, z, learning);
    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) chair(-15 + Math.sin(angle) * 2, z + Math.cos(angle) * 2, angle, 4.46);
  }
  box(5, 2, .055, paper, -15, 6.1, -13.7, .02, learning);
  for (let i = 0; i < 3; i++) box(.65, .65, .02, [navy, gold, red][i], -16.4 + i * 1.4, 6.1, -13.65, .025, learning);
  // Internal glass partitions have open doorways, not opaque barriers.
  for (const x of [-10.7, 10.7]) for (const z of [-15, -11, -7, -3, 5, 9]) {
    box(0.012, 3.8, 3.88, glass, x, 1.95, z);
    rod([x, 0.05, z - 1.95], [x, 4.1, z - 1.95], 0.025);
  }
  // A physical terrace meets the photographic distant lighting environment.
  // The occupied building stays fully geometric; no fake box-city facades.
  box(48, 0.12, 50, stone, 0, -.2, -1).name = "exterior-stone-terrace";
  return { root, seats, chandelier };
}
