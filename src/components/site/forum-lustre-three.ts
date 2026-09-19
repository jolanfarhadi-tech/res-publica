import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildForumArchitecture, disposeForumArchitecture } from "./forum-architecture";

/** Batch static architecture instead of drawing each chair limb separately. */
function batchArchitecture(root: THREE.Group, moving: THREE.Group) {
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const originals: THREE.Mesh[] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return;
    let parent: THREE.Object3D | null = object;
    while (parent) {
      if (parent === moving) return;
      parent = parent.parent;
    }
    const transformed = object.geometry.clone().applyMatrix4(object.matrixWorld);
    const geometry = transformed.index ? transformed.toNonIndexed() : transformed;
    if (geometry !== transformed) transformed.dispose();
    const batch = batches.get(object.material) ?? [];
    batch.push(geometry);
    batches.set(object.material, batch);
    originals.push(object);
  });
  for (const [material, geometries] of batches) {
    const geometry = mergeGeometries(geometries, false);
    for (const part of geometries) part.dispose();
    if (!geometry) throw new Error("Forum geometry could not be batched");
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = !material.transparent;
    mesh.receiveShadow = !material.transparent;
    root.add(mesh);
  }
  for (const mesh of originals) {
    mesh.removeFromParent();
    mesh.geometry.dispose();
  }
}

export function mountForumLustre(canvas: HTMLCanvasElement, onReady: () => void,
  options: { reducedMotion: boolean; onFailure: () => void }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f2ee);
  scene.fog = new THREE.Fog(0xf1f2ee, 39, 70);
  const camera = new THREE.PerspectiveCamera(39, 1.5, 0.1, 100);
  const target = new THREE.Vector3(0, 1.1, -0.4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.65;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff6e6, 0x7d919e, 1.25));
  const sun = new THREE.DirectionalLight(0xffeed5, 3.2);
  sun.position.set(-10, 19, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 55 });
  sun.shadow.normalBias = 0.04;
  sun.shadow.bias = -0.0002;
  scene.add(sun);
  const { architecture, chandelier } = buildForumArchitecture();
  batchArchitecture(architecture, chandelier);
  scene.add(architecture);
  let visible = true;
  let lastFrame = 0;
  let disposed = false;
  let contextUnavailable = false;
  let distance = 30;
  let pointerX = 0;
  let pointerY = 0;
  const host = canvas.closest("figure") ?? canvas;
  const pose = { x: 0, y: 0 };
  function move(event: Event) {
    if (options.reducedMotion) return;
    const pointer = event as PointerEvent;
    if (pointer.pointerType !== "mouse") return;
    const bounds = host.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, (pointer.clientX - bounds.left) / bounds.width * 2 - 1));
    pointerY = Math.max(-1, Math.min(1, (pointer.clientY - bounds.top) / bounds.height * 2 - 1));
  }
  function leave() { pointerX = 0; pointerY = 0; }
  function render(time: number) {
    pose.x += (pointerX - pose.x) * 0.055;
    pose.y += (pointerY - pose.y) * 0.055;
    camera.position.set(pose.x * 2.1, distance * 0.65 + pose.y * 0.75, distance * 0.78);
    camera.lookAt(target);
    chandelier.rotation.y = options.reducedMotion ? 0 : Math.sin(time * 0.00018) * 0.07;
    renderer.render(scene, camera);
  }
  function frame(time: number) {
    if (disposed || time - lastFrame < 32) return;
    lastFrame = time;
    render(time);
  }
  function updateVisibility() {
    renderer.setAnimationLoop(!disposed && !contextUnavailable && visible && !document.hidden && !options.reducedMotion ? frame : null);
  }
  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (disposed || width <= 0 || height <= 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_200_000 / (width * height))));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    distance = Math.max(29, 29 * 1.4 / camera.aspect);
    camera.updateProjectionMatrix();
    render(0);
    onReady();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    contextUnavailable = true;
    renderer.setAnimationLoop(null);
    options.onFailure();
  }
  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateVisibility();
  });
  resizeObserver.observe(canvas);
  intersectionObserver.observe(canvas);
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", leave);
  canvas.addEventListener("webglcontextlost", contextLost);
  document.addEventListener("visibilitychange", updateVisibility);
  resize();
  updateVisibility();
  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("webglcontextlost", contextLost);
    document.removeEventListener("visibilitychange", updateVisibility);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    disposeForumArchitecture(architecture);
    environment.dispose();
    sun.shadow.dispose();
    renderer.dispose();
  };
}
