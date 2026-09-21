import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildCinematicBuilding, type BuildingMaps } from "./cinematic-building";
import { buildingTextureFiles, createInitialBuildingMaps, replaceBuildingTexture } from "./cinematic-materials";
import { researchParticipants, standingObservers } from "./parliament-layout";
import { buildCeremonialFlags, civicFlagTexture } from "./ceremonial-flags";
import { applyArchitecturalUVs } from "./architectural-uv";
import { portraitTargetOffset, type ArchitecturalRoom } from "./architecture-camera";
import { ArchitectureMotion, architectureMotion } from "./architecture-motion";
import { architecturalPixelRatio, CinematicQuality } from "./cinematic-quality";
import { prepareArchitecturalFinishes } from "./cinematic-startup";
import type { createArchitecturalPostprocessing } from "./cinematic-postprocessing";

export type CinematicController = {
  setRoom: (room: ArchitecturalRoom | null) => void;
  setMotion: (reduced: boolean) => void;
  setPaused: (paused: boolean) => void;
  setScroll: (progress: number) => void;
  setRoomScroll: (progress: number) => void;
  dispose: () => void;
};

/** Persistent renderer: assets are local, HTML and authentication never enter the scene. */
export function mountCinematicArchitecture(canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean; room: ArchitecturalRoom; onReady: () => void; onFailure: () => void; onRecover?: () => void }): CinematicController {
  const resources = new Set<{ dispose: () => void }>();
  const mountedAt = performance.now(); canvas.dataset.mountedAt = mountedAt.toFixed(0);
  let disposed = false, failed = false, ready = false, reduced = options.reducedMotion;
  let room: ArchitecturalRoom | null = options.room;
  canvas.dataset.room = options.room;
  const motion = new ArchitectureMotion(options.room, reduced);
  let lastFrame = 0, frameCount = 0, diagnosticAt = 0, nextFrame = 0;
  const quality = new CinematicQuality();
  let postprocessing: ReturnType<typeof createArchitecturalPostprocessing> | null = null;
  // Yield expensive optional model/pose work after a paint, not in one long task.
  const yieldToBrowser = () => new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  // A paused/reduced-motion frame must survive compositing, including Safari's
  // layer promotion when the loading veil fades and the browser toolbar resizes.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
  resources.add(renderer);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc5cbd0);
  const camera = new THREE.PerspectiveCamera(51, 1.6, 0.1, 180);
  const sun = new THREE.DirectionalLight(0xfff7ee, 2.0);
  sun.position.set(-13, 22, -17); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -27, right: 27, top: 25, bottom: -25, near: 1, far: 85 });
  sun.shadow.normalBias = 0.04; sun.shadow.bias = -0.0003;
  scene.add(sun, sun.target); resources.add(sun.shadow);
  // Daylight is available even before the optional HDR download finishes.
  const skyLight = new THREE.HemisphereLight(0xdbe7f3, 0x645342, 0.8); scene.add(skyLight);
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
      const maps: BuildingMaps = createInitialBuildingMaps(); Object.values(maps).forEach(track);
      const { root, seats } = buildCinematicBuilding(maps);
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
      canvas.dataset.geometryMs = (performance.now() - mountedAt).toFixed(0);
      const finishesWarmup = prepareArchitecturalFinishes(root); track(finishesWarmup);
      // Show the actual approved building first. Optional furniture and people
      // must not hold the entire translated page behind a blank loading surface.
      renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
      ready = true; canvas.dataset.status = "ready";
      resize(); options.onReady(); schedule();
      canvas.dataset.readyAt = performance.now().toFixed(0);
      await yieldToBrowser();
      if (disposed) return;
      // Cold physical shaders used to block the very first frame. Keep the same
      // lit geometry visible while KHR_parallel_shader_compile prepares them.
      await renderer.compileAsync(finishesWarmup.warmup, camera, scene);
      if (disposed) return;
      finishesWarmup.restore(); finishesWarmup.dispose(); resources.delete(finishesWarmup);
      canvas.dataset.physicalReadyAt = performance.now().toFixed(0);
      render(performance.now());
      // No network request gates the first real frame. Each upgrade is isolated:
      // a missing map or slow HDR cannot turn the already visible building blank.
      const finishes = Promise.allSettled(Object.entries(buildingTextureFiles).map(async ([key, file]) => {
        const texture = await textureLoader.loadAsync(`/architecture/${file}`); track(texture);
        if (disposed) return;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        if (key === "stone" || key === "oak") texture.colorSpace = THREE.SRGBColorSpace;
        replaceBuildingTexture(root, maps[key as keyof BuildingMaps], texture);
        maps[key as keyof BuildingMaps] = texture;
        if (reduced || isInteracting()) render(performance.now());
      })).then(results => { if (!disposed) canvas.dataset.materialStatus = results.every(result => result.status === "fulfilled") ? "ready" : "partial"; });
      const environment = import("three/addons/loaders/HDRLoader.js").then(({ HDRLoader }) =>
        new HDRLoader().loadAsync("/architecture/details/urban-courtyard.hdr")).then(hdr => {
        track(hdr); if (disposed) return;
        const pmrem = new THREE.PMREMGenerator(renderer);
        try {
          const lighting = pmrem.fromEquirectangular(hdr); track(lighting);
          scene.environment = lighting.texture; scene.environmentIntensity = 0.72;
        } finally { pmrem.dispose(); }
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = hdr; scene.backgroundBlurriness = 0.018; scene.backgroundIntensity = 0.8;
        skyLight.intensity = 0.12; canvas.dataset.environmentStatus = "ready"; render(performance.now());
      }).catch(() => { if (!disposed) canvas.dataset.environmentStatus = "unavailable"; });
      const flags = textureLoader.loadAsync("/architecture/lion-sun-reference-v1.png").then(lionSun => {
        track(lionSun); if (disposed) return;
        lionSun.colorSpace = THREE.SRGBColorSpace;
        const textures = [civicFlagTexture("eu"), civicFlagTexture("germany"), lionSun]; textures.forEach(track);
        const flags = buildCeremonialFlags(textures);
        flags.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          track(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(track);
        });
        root.add(flags); renderer.shadowMap.needsUpdate = true; render(performance.now());
      }).catch(() => { if (!disposed) canvas.dataset.flagStatus = "unavailable"; });
      // These promises handle their own failures and remain independent of people.
      void Promise.all([finishes, environment, flags]);
      const { loadArchitecturalDetails } = await import("./architectural-details");
      const details = await loadArchitecturalDetails(track);
      if (disposed) return;
      scene.add(details);
      await yieldToBrowser();
      const [{ loadCinematicPeople }, { bakeCinematicPeopleIncrementally }] = await Promise.all([
        import("./cinematic-people"), import("./static-posed-people"),
      ]);
      const person = await loadCinematicPeople(track);
      if (disposed) return;
      const occupants: THREE.Object3D[] = [];
      for (let i = 0; i < seats.length; i += 3) {
        await yieldToBrowser(); if (disposed) return;
        const seat = seats[i], human = person(i / 3, true);
        human.position.set(seat.x, seat.y, seat.z); human.rotation.y = seat.yaw; occupants.push(human);
      }
      for (const { model, x, y, z, yaw } of standingObservers) {
        await yieldToBrowser(); if (disposed) return;
        const human = person(model); human.position.set(x, y, z); human.rotation.y = yaw; occupants.push(human);
      }
      for (const { model, x, y, z, yaw } of researchParticipants) {
        await yieldToBrowser(); if (disposed) return;
        const human = person(model, false, "research");
        human.position.set(x, y, z); human.rotation.y = yaw; occupants.push(human);
      }
      const participantBatches = await bakeCinematicPeopleIncrementally(occupants, track, yieldToBrowser);
      for (const occupant of occupants) occupant.traverse(object => { if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose(); });
      if (disposed) return;
      scene.add(participantBatches);
      canvas.dataset.participants = String(occupants.length);
      canvas.dataset.participantBatches = String(participantBatches.children.length);
      // Warm material programs asynchronously where parallel shader compilation is supported.
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      // Architecture and people are static: bake shadows once, animate only the camera.
      renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
      canvas.dataset.detailStatus = "ready"; render(performance.now()); schedule();
      // Keep all secondary effects and their shader code out of the first-frame
      // dependency chain. Environment-map reflections remain on every device.
      if (canvas.clientWidth >= 768 && quality.level === 2) {
        await environment; await yieldToBrowser();
        const { createArchitecturalPostprocessing } = await import("./cinematic-postprocessing");
        if (disposed || quality.level < 2) return;
        postprocessing = createArchitecturalPostprocessing(renderer, scene, camera); track(postprocessing); resize();
      }
    } catch (error) {
      console.warn("Architectural scene unavailable:", error instanceof Error ? error.message : "rendering failed");
      if (ready) { canvas.dataset.detailStatus = "unavailable"; render(performance.now()); }
      else fail();
    }
  }
  function isInteracting() {
    return !!document.activeElement?.closest("input, textarea, select, [contenteditable='true'], form, dialog[open]");
  }
  function render(now: number) {
    if (!ready || disposed || failed || !room || document.hidden) return;
    const current = motion.framePose;
    const portrait = camera.aspect < 1;
    camera.position.set(...current.position);
    // Portrait framing looks into the room, not mostly at the mezzanine ceiling.
    camera.lookAt(new THREE.Vector3(current.target[0], current.target[1] - portraitTargetOffset(current, camera.aspect), current.target[2]));
    camera.fov = current.fov + (portrait ? 4 : 0); camera.updateProjectionMatrix();
    renderer.info.autoReset = false; renderer.info.reset();
    const renderStart = performance.now();
    if (postprocessing && quality.level === 2 && canvas.clientWidth >= 768) postprocessing.render();
    else renderer.render(scene, camera);
    frameCount++;
    // Diagnostics are DOM-visible but do not generate thousands of attribute
    // writes per second on mobile during an otherwise GPU-only animation.
    if (now - diagnosticAt < 250 && frameCount > 1 && !reduced) return;
    diagnosticAt = now;
    canvas.dataset.transition = motion.phase;
    canvas.dataset.motion = reduced ? "reduced" : motion.isPaused ? "paused" : motion.moving ? "travelling" : "ambient";
    canvas.dataset.cpuFrameMs = (performance.now() - renderStart).toFixed(1);
    canvas.dataset.frameTimeMs = quality.frameMs.toFixed(1);
    canvas.dataset.quality = String(quality.level);
    canvas.dataset.postprocessing = postprocessing && quality.level === 2 && canvas.clientWidth >= 768 ? "half-resolution-ao" : "direct-pbr";
    canvas.dataset.frame = String(frameCount);
    canvas.dataset.camera = current.position.map((v) => v.toFixed(2)).join(",");
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.lastRender = now.toFixed(0);
  }
  function loop(now: number) {
    if (now < nextFrame - 1) return;
    const delta = lastFrame ? now - lastFrame : architectureMotion.frameInterval;
    lastFrame = now;
    // Keep a stable 60Hz deadline instead of dropping to 30/20fps whenever one
    // callback arrives a millisecond early or late.
    nextFrame = now + architectureMotion.frameInterval - Math.max(0, now - nextFrame) % architectureMotion.frameInterval;
    if (!document.hidden && quality.record(delta)) resize();
    if (!isInteracting() && !document.hidden) motion.step(delta);
    render(now);
    if (!motion.animating || isInteracting()) { renderer.setAnimationLoop(null); lastFrame = 0; }
  }
  function schedule() {
    const animate = ready && !disposed && !failed && !!room && !document.hidden && !reduced && !isInteracting() && motion.animating;
    renderer.setAnimationLoop(animate ? loop : null);
    if (!animate) { lastFrame = 0; nextFrame = 0; quality.resetSamples(); }
  }
  function resize() {
    if (disposed || failed) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = architecturalPixelRatio(width, height, window.devicePixelRatio, quality.level);
    renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
    postprocessing?.resize(width, height, ratio);
    canvas.dataset.renderedPixels = String(Math.round(width * height * ratio * ratio));
    camera.aspect = width / height; camera.updateProjectionMatrix(); render(performance.now()); schedule();
  }
  function updatePause() {
    lastFrame = 0; nextFrame = 0; quality.resetSamples();
    schedule();
  }
  function visibility() { updatePause(); if (!document.hidden) render(performance.now()); }
  function focus() { queueMicrotask(updatePause); }
  function lost(event: Event) { event.preventDefault(); fail(); }
  function restored() { if (!disposed) options.onRecover?.(); }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  document.addEventListener("visibilitychange", visibility);
  document.addEventListener("focusin", focus); document.addEventListener("focusout", focus);
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", restored);
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
    setScroll(progress) { motion.setScroll(progress); if (reduced) render(performance.now()); schedule(); },
    setRoomScroll(progress) { motion.setRoomScroll(progress); if (reduced) render(performance.now()); schedule(); },
    setPaused(value) { motion.setPaused(value); lastFrame = 0; render(performance.now()); schedule(); },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("focusin", focus); document.removeEventListener("focusout", focus);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      scene.traverse((object) => { if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose(); });
      for (const resource of resources) resource.dispose(); resources.clear(); scene.clear();
      // Release the previous locale's GPU context immediately, especially on iOS
      // where a few abandoned WebGL contexts can evict the newly opened scene.
      renderer.forceContextLoss();
    },
  };
}
