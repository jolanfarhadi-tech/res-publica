import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";

/** A restrained, physically aligned floor reflection, not a screen-wide blur. */
export function createArchitecturalReflection() {
  const reflector = new Reflector(new THREE.PlaneGeometry(39.8, 42.8), {
    clipBias: .003, textureWidth: 768, textureHeight: 768, multisample: 0,
    shader: {
      uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null } },
      vertexShader: `
        uniform mat4 textureMatrix;
        varying vec4 vReflectionUv;
        varying float vGrazing;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vReflectionUv = textureMatrix * vec4(position, 1.0);
          vGrazing = 1.0 - abs(dot(normalize(-viewPosition.xyz), normalize(normalMatrix * normal)));
          gl_Position = projectionMatrix * viewPosition;
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec4 vReflectionUv;
        varying float vGrazing;
        void main() {
          vec2 uv = vReflectionUv.xy / vReflectionUv.w;
          vec2 stepUv = vec2(2.4 / 768.0);
          vec3 reflected = texture2D(tDiffuse, uv).rgb * .4;
          reflected += texture2D(tDiffuse, uv + vec2(stepUv.x, 0.0)).rgb * .15;
          reflected += texture2D(tDiffuse, uv - vec2(stepUv.x, 0.0)).rgb * .15;
          reflected += texture2D(tDiffuse, uv + vec2(0.0, stepUv.y)).rgb * .15;
          reflected += texture2D(tDiffuse, uv - vec2(0.0, stepUv.y)).rgb * .15;
          gl_FragColor = vec4(reflected, mix(.065, .19, pow(vGrazing, 2.0)));
        }`,
    },
  });
  reflector.name = "restrained-limestone-reflection";
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.set(0, -.041, -1);
  const material = reflector.material as THREE.ShaderMaterial;
  material.transparent = true;
  material.depthWrite = false;
  material.toneMapped = false;
  reflector.renderOrder = 1;
  return reflector;
}
