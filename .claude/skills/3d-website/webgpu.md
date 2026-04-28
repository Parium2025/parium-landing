# WebGPU — Next-Generation GPU for Three.js

WebGPU is the successor to WebGL. More powerful compute, better performance, cleaner API. Three.js r160+ supports it via a WebGPU renderer. Not mainstream yet but the direction everything is moving.

**Browser support (2026):** Chrome 113+, Edge 113+, Safari 18+, Firefox behind flag.

---

## When to Use WebGPU

- Particle systems > 500k (GPGPU becomes trivial)
- Compute shaders for physics/simulation on GPU
- Post-processing chains without compositing overhead
- Future-proofing a project that targets modern browsers only

**Do NOT use** for projects that need broad compatibility (iOS 16, older Android).

---

## Setup — Three.js WebGPU Renderer

```js
// Three.js has a WebGPU renderer in three/addons
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGPURenderer from 'three/addons/renderers/common/Renderer.js';

// Feature detection first — always
if (!WebGPU.isAvailable()) {
  console.warn('WebGPU not available — falling back to WebGL');
  // Use standard WebGLRenderer instead
  initWebGL();
} else {
  initWebGPU();
}

async function initWebGPU() {
  const renderer = new WebGPURenderer({
    canvas: document.getElementById('canvas-3d'),
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // WebGPU renderer requires async init
  await renderer.init();

  // Scene setup identical to WebGL
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 5;

  // ... add objects ...

  function animate() {
    requestAnimationFrame(animate);
    renderer.renderAsync(scene, camera); // note: renderAsync, not render
  }
  animate();
}
```

---

## Node Materials (WebGPU native, more powerful than ShaderMaterial)

Three.js introduces a node-based material system for WebGPU that replaces raw GLSL:

```js
import { MeshStandardNodeMaterial, color, positionLocal, sin, time, mix, normalLocal } from 'three/nodes';

const mat = new MeshStandardNodeMaterial();

// Displacement: no GLSL needed
const displacement = sin(positionLocal.x.mul(3).add(time)).mul(0.15);
mat.positionNode = positionLocal.add(normalLocal.mul(displacement));

// Color: driven by normal + time
mat.colorNode = mix(
  color(0x88aaff),
  color(0xff88cc),
  normalLocal.y.mul(0.5).add(0.5)
);

const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 6), mat);
scene.add(mesh);
```

---

## Compute Shaders (WebGPU only) — GPU Physics

```js
import { compute, instancedArray, float, vec3, If } from 'three/nodes';

// Create GPU-side position buffer (replaces GPGPU render targets)
const COUNT = 1_000_000; // 1 million particles at 60fps
const positions = instancedArray(COUNT, 'vec3');
const velocities = instancedArray(COUNT, 'vec3');

// Compute shader — runs entirely on GPU
const computeUpdate = compute(() => {
  const idx = /* instance index */;
  const pos = positions.element(idx);
  const vel = velocities.element(idx);

  // Update velocity with noise-based force
  vel.addAssign(vec3(0, -0.001, 0)); // gravity

  // Boundary
  If(pos.y.lessThan(-3), () => { vel.y.assign(vel.y.abs()); });

  // Integrate
  pos.addAssign(vel);
}, COUNT);

// In render loop:
renderer.computeAsync(computeUpdate);
```

---

## WebGPU Particle System (simplified vs GPGPU)

```js
// With WebGPU, no more ping-pong render targets needed
// Use instancedArray directly

import { instancedArray, positionLocal, time, sin } from 'three/nodes';
import StorageInstancedBufferAttribute from 'three/addons/renderers/common/StorageInstancedBufferAttribute.js';

const COUNT = 500_000;
const posAttr = new StorageInstancedBufferAttribute(COUNT, 3); // xyz
const geo = new THREE.SphereGeometry(0.01, 4, 4);
const mat = new THREE.MeshBasicNodeMaterial();

// Animate position via node system
mat.positionNode = positionLocal.add(/* computed offset */);

const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
scene.add(mesh);
```

---

## Performance Comparison

| Metric | WebGL + GPGPU | WebGPU Compute |
|--------|---------------|----------------|
| Max particles (60fps) | ~500k | ~5M+ |
| Compute setup | Ping-pong render targets | Direct compute pass |
| Shader language | GLSL | WGSL (or Three.js nodes) |
| CPU overhead | Medium | Very low |
| Browser support | Universal | Chrome/Edge/Safari 18+ |

---

## Detection + Graceful Degradation

Always check support and fall back:

```js
async function initRenderer(canvas) {
  // Try WebGPU first
  if (navigator.gpu) {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
      try {
        const device = await adapter.requestDevice();
        return { type: 'webgpu', device };
      } catch (e) { /* fall through */ }
    }
  }

  // Fall back to WebGL2
  const ctx = canvas.getContext('webgl2');
  if (ctx) return { type: 'webgl2' };

  // Last resort: WebGL1
  const ctx1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (ctx1) return { type: 'webgl1' };

  // No GPU context at all
  return { type: 'none' };
}

const { type } = await initRenderer(canvas);
if (type === 'none') showStaticFallback();
```

---

## WGSL vs GLSL Quick Reference

| GLSL (WebGL) | WGSL (WebGPU) |
|-------------|---------------|
| `float` | `f32` |
| `vec3` | `vec3f` |
| `gl_Position` | `@builtin(position) pos: vec4f` |
| `uniform` | `@group(0) @binding(0) var<uniform>` |
| `varying` | `@location(0)` |
| `texture2D(tex, uv)` | `textureSample(tex, sampler, uv)` |

Three.js node materials abstract WGSL away — prefer nodes over raw WGSL for Three.js projects.
