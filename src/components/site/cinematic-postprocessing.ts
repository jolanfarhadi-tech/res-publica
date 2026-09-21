import type * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { ArchitecturalOcclusionPass } from "./architectural-occlusion";

/** Optional desktop finish. The first frame and phones use the direct PBR renderer. */
export function createArchitecturalPostprocessing(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
  const composer = new EffectComposer(renderer);
  const beauty = new RenderPass(scene, camera);
  const occlusion = new ArchitecturalOcclusionPass(scene, camera, 256, 256);
  occlusion.blendIntensity = .65;
  occlusion.updateGtaoMaterial({ radius: .6, thickness: .45, distanceExponent: 1.6, screenSpaceRadius: false });
  const output = new OutputPass(), antialias = new SMAAPass();
  for (const pass of [beauty, occlusion, output, antialias]) composer.addPass(pass);
  return {
    render: () => composer.render(),
    resize(width: number, height: number, ratio: number) {
      composer.setPixelRatio(ratio); composer.setSize(width, height);
      // GTAO otherwise silently inherits the full-resolution composer target.
      occlusion.setSize(Math.max(1, Math.round(width * ratio * .5)), Math.max(1, Math.round(height * ratio * .5)));
    },
    dispose() { for (const pass of [beauty, occlusion, output, antialias]) pass.dispose(); composer.dispose(); },
  };
}
