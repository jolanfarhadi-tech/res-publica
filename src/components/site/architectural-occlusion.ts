import * as THREE from "three";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";

/** Glass is visible in the beauty pass, never an opaque wall in the AO depth pass. */
export function excludesArchitecturalOcclusion(material: THREE.Material | THREE.Material[]) {
  return (Array.isArray(material) ? material : [material]).every(item => item.transparent || item.alphaTest > 0);
}

export class ArchitecturalOcclusionPass extends GTAOPass {
  override render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget, deltaTime = 0, maskActive = false) {
    const hidden: THREE.Object3D[] = [];
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh && object.visible && excludesArchitecturalOcclusion(object.material)) {
        object.visible = false; hidden.push(object);
      }
    });
    try { super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive); }
    finally { hidden.forEach(object => { object.visible = true; }); }
  }
}
