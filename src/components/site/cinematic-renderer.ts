import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { ArchitecturalOcclusionPass } from "./architectural-occlusion";
import { createArchitecturalReflection } from "./architectural-reflection";
import { loadArchitecturalDetails } from "./architectural-details";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildCinematicBuilding, type BuildingMaps } from "./cinematic-building";
import { loadCinematicPeople } from "./cinematic-people";
import { bakeCinematicPeople } from "./static-posed-people";
import { researchParticipants, standingObservers } from "./parliament-layout";
import { buildCeremonialFlags, civicFlagTexture } from "./ceremonial-flags";
import { applyArchitecturalUVs } from "./architectural-uv";
import { type ArchitecturalRoom } from "./architecture-camera";
import { ArchitectureMotion, architectureMotion } from "./architecture-motion";

export type CinematicController = {
  setRoom: (room: ArchitecturalRoom | null) => void;
  setMotion: (reduced: boolean) => void;
  setHomeProgress: (progress: number) => void;
  dispose: () => void;
};

/** Persistent renderer: assets are local, HTML and authentication never enter the scene. */
export function mountCinematicArchitecture(canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean; room: ArchitecturalRoom; onReady: () => void; onFailure: () => void }): CinematicController {
  const resources = new Set<{ dispose: () => void }>();
  let disposed = false, failed = false, ready = false, reduced = options.reducedMotion;
  let room: ArchitecturalRoom | null = options.room;
  canvas.dataset.room = options.room;
  const motion = new ArchitectureMotion(options.room, reduced);
  let lastFrame = 0, frameCount = 0;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  resources.add(renderer);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc5cbd0);
  const camera = new THREE.PerspectiveCamera(51, 1.6, 0.1, 180);
  const reflection = createArchitecturalReflection();
  scene.add(reflection); resources.add(reflection); resources.add(reflection.geometry);
  const composer = new EffectComposer(renderer); resources.add(composer);
  const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass);
  const occlusion = new ArchitecturalOcclusionPass(scene, camera, 512, 512);
  occlusion.blendIntensity = 0.65;
  occlusion.updateGtaoMaterial({ radius: .6, thickness: .45, distanceExponent: 1.6, screenSpaceRadius: false });
  composer.addPass(occlusion); resources.add(occlusion);
  const output = new OutputPass(); composer.addPass(output); resources.add(output);
  const antialias = new SMAAPass(); composer.addPass(antialias); resources.add(antialias);
  const sun = new THREE.DirectionalLight(0xfff7ee, 2.0);
  sun.position.set(-13, 22, -17); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -27, right: 27, top: 25, bottom: -25, near: 1, far: 85 });
  sun.shadow.normalBias = 0.04; sun.shadow.bias = -0.0003;
  scene.add(sun, sun.target); resources.add(sun.shadow);
  scene.add(new THREE.HemisphereLight(0xdbe7f3, 0x645342, 0.12));
  const chandelierLight = new THREE.PointLight(0xffbc6e, 65, 14, 2);
  chandelierLight.position.set(0, 6.5, -4.5); scene.add(chandelierLight);
  for (const x of [-15, 15]) {
    const fill = new THREE.PointLight(0xffe0b4, 32, 24, 2); fill.position.set(x, 3.7, -6); scene.add(fill);
  }
  // Broad daylight through the studio glazing, not a point highlight on faces.
  RectAreaLightUniformsLib.init();
  for (const z of [-6, 5]) {
    const daylight = new THREE.RectAreaLight(0xe7efff, 1.5, 5.5, 3);
    daylight.position.set(-10.5, 3.3, z); daylight.lookAt(-16, 1.2, z);
    scene.add(daylight);
  }
  const track = (resource: { dispose: () => void }) => { if (disposed) resource.dispose(); else resources.add(resource); };
  function fail() {
    if (disposed) return;
    failed = true; canvas.dataset.status = "unavailable"; renderer.setAnimationLoop(null); options.onFailure();
  }
  async function prepare() {
    try {
      const textureLoader = new THREE.TextureLoader();
      const specs = { stone: "details/marble_diff.jpg", stoneNormal: "details/marble_nor_gl.jpg", stoneRough: "details/marble_rough.jpg",
        oak: "oak_veneer_01_diff.webp", oakNormal: "oak_veneer_01_nor_gl.webp", oakRough: "oak_veneer_01_rough.webp" };
      const maps = {} as BuildingMaps;
      for (const [key, file] of Object.entries(specs)) {
        const texture = await textureLoader.loadAsync(`/architecture/${file}`); track(texture);
        if (disposed) return;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        if (key === "stone" || key === "oak") texture.colorSpace = THREE.SRGBColorSpace;
        maps[key as keyof BuildingMaps] = texture;
      }
      const hdr = await new HDRLoader().loadAsync("/architecture/details/urban-courtyard.hdr"); track(hdr);
      if (disposed) return;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environment = pmrem.fromEquirectangular(hdr); pmrem.dispose(); track(environment);
      scene.environment = environment.texture; scene.environmentIntensity = 0.72;
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = hdr; scene.backgroundBlurriness = 0.018; scene.backgroundIntensity = 0.8;
      const { root, seats } = buildCinematicBuilding(maps);
      const lionSun = await textureLoader.loadAsync("/architecture/lion-sun-reference-v1.png"); track(lionSun);
      if (disposed) return;
      lionSun.colorSpace = THREE.SRGBColorSpace;
      const flags = [civicFlagTexture("eu"), civicFlagTexture("germany"), lionSun]; flags.forEach(track);
      root.add(buildCeremonialFlags(flags));
      scene.add(root);
      const originals: THREE.Mesh[] = [];
      const batches = new Map<THREE.Material, { geometries: THREE.BufferGeometry[]; castShadow: boolean; receiveShadow: boolean }>();
      root.updateMatrixWorld(true);
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        track(object.geometry);
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) track(material);
        // Low-opacity glazing can share a batch; substantial crystal stays sorted.
        if (Array.isArray(object.material) || (object.material.transparent && object.material.opacity > .1)) return;
        const transformed = object.geometry.clone().applyMatrix4(object.matrixWorld);
        // Metre-scaled UVs: a floor must not stretch one stone tile over 40 metres.
        applyArchitecturalUVs(transformed, object.material, maps.stone, maps.oak);
        const geometry = transformed.index ? transformed.toNonIndexed() : transformed;
        if (geometry !== transformed) transformed.dispose();
        // Material batching cuts thousands of book/chair/structural draw calls.
        const batch = batches.get(object.material) ?? { geometries: [], castShadow: object.castShadow, receiveShadow: object.receiveShadow };
        batch.geometries.push(geometry); batches.set(object.material, batch); originals.push(object);
      });
      for (const [material, { geometries, castShadow, receiveShadow }] of batches) {
        const geometry = mergeGeometries(geometries); geometries.forEach((part) => part.dispose());
        if (!geometry) throw new Error("Architectural batching failed");
        track(geometry);
        const batch = new THREE.Mesh(geometry, material); batch.castShadow = castShadow; batch.receiveShadow = receiveShadow; root.add(batch);
      }
      originals.forEach((mesh) => mesh.removeFromParent());
      const details = await loadArchitecturalDetails(track);
      if (disposed) return;
      scene.add(details);
      const person = await loadCinematicPeople(track);
      if (disposed) return;
      const occupants: THREE.Object3D[] = [];
      for (let i = 0; i < seats.length; i += 3) {
        const seat = seats[i], human = person(i / 3, true);
        human.position.set(seat.x, seat.y, seat.z); human.rotation.y = seat.yaw; occupants.push(human);
      }
      for (const { model, x, y, z, yaw } of standingObservers) {
        const human = person(model); human.position.set(x, y, z); human.rotation.y = yaw; occupants.push(human);
      }
      for (const { model, x, y, z, yaw } of researchParticipants) {
        const human = person(model, false, "research");
        human.position.set(x, y, z); human.rotation.y = yaw; occupants.push(human);
      }
      const participantBatches = bakeCinematicPeople(occupants, track); scene.add(participantBatches);
      canvas.dataset.participants = String(occupants.length);
      canvas.dataset.participantBatches = String(participantBatches.children.length);
      // Warm material programs asynchronously where parallel shader compilation is supported.
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      // Static shadows bake once. No idle animation loop when camera has settled.
      renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
      ready = true; canvas.dataset.status = "ready"; resize(); options.onReady(); schedule();
    } catch (error) {
      console.warn("Architectural scene unavailable:", error instanceof Error ? error.message : "rendering failed");
      fail();
    }
  }
  function isInteracting() {
    return !!document.activeElement?.closest("input, textarea, select, [contenteditable='true'], form, dialog[open]");
  }
  function render(now: number) {
    if (!ready || disposed || failed || !room || document.hidden) return;
    const current = motion.pose;
    canvas.dataset.transition = motion.phase;
    camera.position.set(...current.position); camera.lookAt(new THREE.Vector3(...current.target));
    camera.fov = current.fov + (camera.aspect < 1 ? 12 : 0); camera.updateProjectionMatrix();
    renderer.info.autoReset = false; renderer.info.reset();
    const renderStart = performance.now();
    composer.render(); frameCount++;
    canvas.dataset.cpuFrameMs = (performance.now() - renderStart).toFixed(1);
    canvas.dataset.frame = String(frameCount);
    canvas.dataset.camera = current.position.map((v) => v.toFixed(2)).join(",");
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.lastRender = now.toFixed(0);
  }
  function loop(now: number) {
    if (now - lastFrame < architectureMotion.frameInterval - 1) return;
    const delta = lastFrame ? now - lastFrame : architectureMotion.frameInterval;
    lastFrame = now;
    if (!isInteracting() && !document.hidden) motion.step(delta);
    render(now);
    if (!motion.moving || isInteracting()) { renderer.setAnimationLoop(null); lastFrame = 0; }
  }
  function schedule() {
    const animate = ready && !disposed && !failed && !!room && !document.hidden && !reduced && !isInteracting() && motion.moving;
    renderer.setAnimationLoop(animate ? loop : null);
    if (!animate) lastFrame = 0;
  }
  function resize() {
    if (disposed || failed) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    // One bounded 768px reflection on desktop; lighter rendering on small devices.
    const compact = width < 768;
    motion.setCompact(compact);
    reflection.visible = width >= 1200 && navigator.hardwareConcurrency > 4;
    occlusion.enabled = !compact;
    const ratio = Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5, Math.sqrt((compact ? 500_000 : 1_650_000) / (width * height)));
    renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
    composer.setPixelRatio(ratio); composer.setSize(width, height);
    canvas.dataset.renderedPixels = String(Math.round(width * height * ratio * ratio));
    camera.aspect = width / height; camera.updateProjectionMatrix(); render(performance.now()); schedule();
  }
  function updatePause() {
    lastFrame = 0;
    schedule();
  }
  function visibility() { updatePause(); if (!document.hidden) render(performance.now()); }
  function focus() { queueMicrotask(updatePause); }
  function lost(event: Event) { event.preventDefault(); fail(); }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  document.addEventListener("visibilitychange", visibility);
  document.addEventListener("focusin", focus); document.addEventListener("focusout", focus);
  canvas.addEventListener("webglcontextlost", lost);
  void prepare();
  return {
    setRoom(next) {
      if (disposed || next === room) return;
      room = next;
      if (next) {
        motion.setRoom(next);
        canvas.dataset.room = next; render(performance.now());
      }
      schedule();
    },
    setMotion(value) { reduced = value; motion.setReduced(value); render(performance.now()); schedule(); },
    setHomeProgress(value) { motion.setProgress(value); schedule(); },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("focusin", focus); document.removeEventListener("focusout", focus);
      canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse((object) => { if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose(); });
      for (const resource of resources) resource.dispose(); resources.clear(); scene.clear();
    },
  };
}
