# Advanced Three.js Techniques — GPGPU, Instancing, Physics, Workers

---

## 1. GPGPU Particle System (100k+ particles at 60fps)

Moves particle physics to the GPU via ping-pong render targets. CPU only reads final positions. Scales to 500k+ particles.

```js
class GPGPUParticles {
  constructor(renderer, size = 256) {
    // size x size = total particles (256x256 = 65,536)
    this.renderer = renderer;
    this.size = size;
    this.count = size * size;

    const opts = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
    };
    this.rtA = new THREE.WebGLRenderTarget(size, size, opts);
    this.rtB = new THREE.WebGLRenderTarget(size, size, opts);

    this._buildInitTexture();
    this._buildSimPass();
    this._buildRenderPoints();
  }

  _buildInitTexture() {
    const data = new Float32Array(this.count * 4);
    for (let i = 0; i < this.count; i++) {
      // Spherical shell distribution
      const r     = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      data[i*4]   = r * Math.sin(phi) * Math.cos(theta); // x
      data[i*4+1] = r * Math.sin(phi) * Math.sin(theta); // y
      data[i*4+2] = r * Math.cos(phi);                   // z
      data[i*4+3] = 0.5 + Math.random() * 0.5;           // life/size
    }
    const tex = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
    tex.needsUpdate = true;
    this._initTex = tex;
  }

  _buildSimPass() {
    // Paste full snoise3 from shaders.md here
    const NOISE_GLSL = `/* snoise3 function here */`;

    this.simMat = new THREE.ShaderMaterial({
      uniforms: {
        uPositions: { value: this._initTex },
        uTime:      { value: 0 },
        uDelta:     { value: 0.016 },
        uMouse:     { value: new THREE.Vector3() },
        uAttract:   { value: 0.0 }, // 0=free, 1=pull to origin
      },
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uPositions;
        uniform float uTime;
        uniform float uDelta;
        uniform vec3 uMouse;
        uniform float uAttract;
        varying vec2 vUv;

        ${NOISE_GLSL}

        vec3 curl(vec3 p) {
          const float e = 0.1;
          float nx1 = snoise3(p + vec3(0,e,0)), nx2 = snoise3(p - vec3(0,e,0));
          float ny1 = snoise3(p + vec3(0,0,e)), ny2 = snoise3(p - vec3(0,0,e));
          float nz1 = snoise3(p + vec3(e,0,0)), nz2 = snoise3(p - vec3(e,0,0));
          return normalize(vec3(nx1-nx2, ny1-ny2, nz1-nz2));
        }

        void main() {
          vec4 pos  = texture2D(uPositions, vUv);
          vec3 p    = pos.xyz;

          // Curl-noise velocity (fluid motion)
          vec3 vel  = curl(p * 0.4 + uTime * 0.12) * 0.025;

          // Mouse repulsion
          vec3 toMouse = p - uMouse;
          float mDist  = length(toMouse);
          if (mDist < 2.0) vel += normalize(toMouse) * (2.0 - mDist) * 0.04;

          // Gravity toward origin (scroll-driven)
          vel += -p * uAttract * 0.02;

          p += vel;

          // Soft boundary — push back gently
          float len = length(p);
          if (len > 5.0) p = normalize(p) * mix(len, 5.0, 0.1);

          gl_FragColor = vec4(p, pos.w);
        }
      `,
    });

    // Ortho camera + quad for sim pass
    this._simCam   = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this._simScene = new THREE.Scene();
    this._simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), this.simMat));
  }

  _buildRenderPoints() {
    // UV lookup grid
    const uvs = new Float32Array(this.count * 2);
    let idx = 0;
    for (let i = 0; i < this.size; i++)
      for (let j = 0; j < this.size; j++) {
        uvs[idx++] = j / (this.size - 1);
        uvs[idx++] = i / (this.size - 1);
      }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.count * 3), 3));
    geo.setAttribute('aUv',      new THREE.BufferAttribute(uvs, 2));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uPositions: { value: null },
        uColor:     { value: new THREE.Color(0x88aaff) },
        uAccent:    { value: new THREE.Color(0xff88cc) },
        uSize:      { value: 2.5 },
        uTime:      { value: 0 },
      },
      vertexShader: `
        uniform sampler2D uPositions;
        uniform float uSize;
        attribute vec2 aUv;
        varying float vLife;
        varying float vDepth;
        void main() {
          vec4 pos = texture2D(uPositions, aUv);
          vLife = pos.w;
          vec4 mvPos = modelViewMatrix * vec4(pos.xyz, 1.0);
          vDepth = -mvPos.z;
          gl_PointSize = uSize * vLife * (280.0 / vDepth);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uTime;
        varying float vLife;
        varying float vDepth;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * vLife * 0.85;
          vec3  col   = mix(uColor, uAccent, vLife);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent:  true,
      depthWrite:   false,
      blending:     THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
  }

  update(dt, time, mouse) {
    this.simMat.uniforms.uPositions.value = this.rtB.texture;
    this.simMat.uniforms.uTime.value  = time;
    this.simMat.uniforms.uDelta.value = dt;
    this.simMat.uniforms.uMouse.value = mouse;

    this.renderer.setRenderTarget(this.rtA);
    this.renderer.render(this._simScene, this._simCam);
    this.renderer.setRenderTarget(null);

    this.points.material.uniforms.uPositions.value = this.rtA.texture;
    this.points.material.uniforms.uTime.value      = time;

    // Swap
    [this.rtA, this.rtB] = [this.rtB, this.rtA];
  }

  setAttract(v) { this.simMat.uniforms.uAttract.value = v; }

  dispose() {
    this.rtA.dispose();
    this.rtB.dispose();
    this.simMat.dispose();
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}

// Usage:
const gpgpu = new GPGPUParticles(renderer, 256); // 65k particles
scene.add(gpgpu.points);

// In animate loop:
const mouse3D = new THREE.Vector3(); // update from raycaster
gpgpu.update(clock.getDelta(), clock.getElapsedTime(), mouse3D);

// On scroll: attract to origin
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: '60% top',
  scrub: 2,
  onUpdate: s => gpgpu.setAttract(s.progress)
});
```

---

## 2. InstancedMesh (thousands of distinct objects, one draw call)

```js
const COUNT = 2000;
const geo = new THREE.IcosahedronGeometry(0.05, 0);
const mat = new THREE.MeshPhysicalMaterial({ metalness: 0.9, roughness: 0.1, color: 0x88aaff });
const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(mesh);

// Store per-instance data
const dummy    = new THREE.Object3D();
const positions = [];
const phases    = [];
const speeds    = [];

for (let i = 0; i < COUNT; i++) {
  const r     = 2 + Math.random() * 4;
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  positions.push(new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  ));
  phases.push(Math.random() * Math.PI * 2);
  speeds.push(0.3 + Math.random() * 0.7);

  dummy.position.copy(positions[i]);
  dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}
mesh.instanceMatrix.needsUpdate = true;

// Per-instance color
const color = new THREE.Color();
for (let i = 0; i < COUNT; i++) {
  color.setHSL(i / COUNT * 0.3 + 0.6, 0.8, 0.5);
  mesh.setColorAt(i, color);
}
mesh.instanceColor.needsUpdate = true;

// Animate in loop:
function updateInstances(t, scrollP) {
  for (let i = 0; i < COUNT; i++) {
    dummy.position.copy(positions[i]);
    dummy.position.y += Math.sin(t * speeds[i] + phases[i]) * 0.1;
    // Collapse to origin on scroll
    dummy.position.lerpVectors(positions[i], new THREE.Vector3(0,0,0), scrollP);
    dummy.rotation.y = t * speeds[i];
    dummy.scale.setScalar(1 - scrollP * 0.5);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
```

---

## 3. Shape Morph on Scroll (Three.js MorphTargets)

```js
// Two geometries must have same vertex count
const geoA = new THREE.IcosahedronGeometry(1.5, 4); // 1280 vertices
const geoB = new THREE.SphereGeometry(1.5, 32, 32);  // needs matching count

// Match vertex count by using same subdivision level
const morphGeo = new THREE.IcosahedronGeometry(1.5, 4);
morphGeo.morphAttributes.position = [];

// Target B positions (pre-arranged to same count)
const morphPositions = geoB.attributes.position.array.slice(0, morphGeo.attributes.position.count * 3);
const morphAttr = new THREE.BufferAttribute(new Float32Array(morphPositions), 3);
morphGeo.morphAttributes.position[0] = morphAttr;

const mat = new THREE.MeshPhysicalMaterial({
  metalness: 0.8, roughness: 0.1, morphTargets: true
});
const morphMesh = new THREE.Mesh(morphGeo, mat);
scene.add(morphMesh);

// Drive morph from scroll
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: '30% top',
  end: '60% bottom',
  scrub: 2,
  onUpdate: self => {
    morphMesh.morphTargetInfluences[0] = self.progress;
  }
});
```

---

## 4. Custom Post-Processing Shader Pass

```js
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const customPass = new ShaderPass({
  uniforms: {
    tDiffuse:   { value: null },
    uTime:      { value: 0 },
    uStrength:  { value: 0.004 },
    uVignette:  { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uStrength;
    uniform float uVignette;
    varying vec2 vUv;

    void main() {
      // Chromatic aberration
      vec2 dir = vUv - 0.5;
      float dist = length(dir);
      vec2 offset = dir * uStrength * dist * dist;
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;

      // Vignette
      float vig = 1.0 - smoothstep(0.4, 1.2, dist * uVignette * 2.0);

      // Film grain
      float grain = fract(sin(dot(vUv + uTime * 0.01, vec2(12.9898,78.233))) * 43758.5453) * 0.04 - 0.02;

      gl_FragColor = vec4((vec3(r,g,b) + grain) * vig, 1.0);
    }
  `,
});

composer.addPass(customPass);

// Update in loop:
customPass.uniforms.uTime.value = clock.getElapsedTime();
```

---

## 5. Raycasting — Click & Hover on 3D Objects

```js
const raycaster = new THREE.Raycaster();
const mouse2D   = new THREE.Vector2();
const objects   = [mesh1, mesh2, mesh3]; // clickable 3D objects
let hoveredObj  = null;

window.addEventListener('mousemove', e => {
  mouse2D.x =  (e.clientX / innerWidth)  * 2 - 1;
  mouse2D.y = -(e.clientY / innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
  if (hoveredObj) {
    // Animate clicked object
    gsap.to(hoveredObj.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' });
  }
});

// In animation loop (not every frame — throttle if needed):
function checkRaycast() {
  raycaster.setFromCamera(mouse2D, camera);
  const hits = raycaster.intersectObjects(objects);

  if (hits.length > 0) {
    const obj = hits[0].object;
    if (hoveredObj !== obj) {
      if (hoveredObj) gsap.to(hoveredObj.material, { emissiveIntensity: 0, duration: 0.3 });
      hoveredObj = obj;
      gsap.to(obj.material, { emissiveIntensity: 0.8, duration: 0.3 });
      document.body.style.cursor = 'pointer';
    }
  } else {
    if (hoveredObj) {
      gsap.to(hoveredObj.material, { emissiveIntensity: 0, duration: 0.3 });
      hoveredObj = null;
      document.body.style.cursor = 'none'; // custom cursor
    }
  }
}
```

---

## 6. OffscreenCanvas + Web Worker (heavy scene on separate thread)

```js
// main.js
const canvas = document.getElementById('canvas-3d');
const offscreen = canvas.transferControlToOffscreen();
const worker = new Worker('js/scene.worker.js', { type: 'module' });
worker.postMessage({ type: 'init', canvas: offscreen, width: innerWidth, height: innerHeight }, [offscreen]);

window.addEventListener('resize', () => {
  worker.postMessage({ type: 'resize', width: innerWidth, height: innerHeight });
});

document.addEventListener('mousemove', e => {
  worker.postMessage({ type: 'mouse', x: e.clientX / innerWidth, y: e.clientY / innerHeight });
});

// Scroll progress to worker (from ScrollTrigger)
ScrollTrigger.create({
  trigger: '#scroll-wrap', start: 'top top', end: 'bottom bottom',
  onUpdate: s => worker.postMessage({ type: 'scroll', progress: s.progress })
});
```

```js
// js/scene.worker.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let renderer, scene, camera, mesh;
let scrollProgress = 0;
let mouse = { x: 0, y: 0 };

self.onmessage = ({ data }) => {
  switch (data.type) {
    case 'init':
      renderer = new THREE.WebGLRenderer({ canvas: data.canvas, antialias: true, alpha: true });
      renderer.setSize(data.width, data.height);
      renderer.setPixelRatio(Math.min(2, self.devicePixelRatio || 1));

      scene  = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, data.width / data.height, 0.1, 100);
      camera.position.z = 5;

      // Build scene...
      mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.1, 0.38, 200, 20),
        new THREE.MeshPhysicalMaterial({ metalness: 0.9, roughness: 0.1, color: 0x88aaff })
      );
      scene.add(mesh, new THREE.AmbientLight(0xffffff, 0.3));

      animate();
      break;
    case 'resize':
      camera.aspect = data.width / data.height;
      camera.updateProjectionMatrix();
      renderer.setSize(data.width, data.height);
      break;
    case 'scroll': scrollProgress = data.progress; break;
    case 'mouse':  mouse = { x: data.x, y: data.y }; break;
  }
};

function animate() {
  self.requestAnimationFrame(animate);
  if (!renderer) return;
  mesh.rotation.y += 0.003 + scrollProgress * 0.02;
  mesh.rotation.x = scrollProgress * Math.PI;
  renderer.render(scene, camera);
}
```

---

## 7. Physics with Rapier.js (interactive 3D objects)

```js
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

await RAPIER.init();
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

// Ground
const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
world.createCollider(RAPIER.ColliderDesc.cuboid(10, 0.1, 10), groundBody);

// Dynamic spheres (paired with Three.js meshes)
const bodies = [];
const meshes = [];

for (let i = 0; i < 30; i++) {
  const r = 0.1 + Math.random() * 0.2;
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(
      (Math.random()-0.5)*3, Math.random()*5, (Math.random()-0.5)*3
    )
  );
  world.createCollider(RAPIER.ColliderDesc.ball(r), body);
  bodies.push(body);

  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 16, 16),
    new THREE.MeshPhysicalMaterial({ metalness: 0.9, roughness: 0.05 })
  );
  scene.add(m);
  meshes.push(m);
}

// In animate loop:
function stepPhysics() {
  world.step();
  for (let i = 0; i < bodies.length; i++) {
    const t = bodies[i].translation();
    const r = bodies[i].rotation();
    meshes[i].position.set(t.x, t.y, t.z);
    meshes[i].quaternion.set(r.x, r.y, r.z, r.w);
  }
}

// Apply scroll force
function applyScrollForce(progress) {
  bodies.forEach(b => b.applyImpulse({ x: 0, y: progress * 0.5, z: 0 }, true));
}
```

---

## 8. Video Texture (Apple-style product showcase)

```js
const video = document.createElement('video');
video.src    = 'assets/product.mp4';
video.loop   = true;
video.muted  = true;
video.playsInline = true;
video.play();

const videoTex = new THREE.VideoTexture(video);
videoTex.colorSpace = THREE.SRGBColorSpace;

// Apply to plane or curved surface
const geo = new THREE.PlaneGeometry(3.2, 2, 1, 1);
const mat = new THREE.MeshBasicMaterial({ map: videoTex });
const screen = new THREE.Mesh(geo, mat);
scene.add(screen);

// Scrub video with scroll (Apple AirPods style):
video.pause();
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: '20% top',
  end: '60% bottom',
  scrub: true,
  onUpdate: self => {
    video.currentTime = self.progress * video.duration;
  }
});
```

---

## 9. Render to Texture (reflection, portal effect)

```js
// Create render target
const rtTex = new THREE.WebGLRenderTarget(512, 512, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
});

// Separate scene/camera for the texture
const rtScene  = new THREE.Scene();
const rtCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
rtCamera.position.z = 3;
// ... add objects to rtScene ...

// Apply render target to a mesh in main scene
const portalMat = new THREE.MeshBasicMaterial({ map: rtTex.texture });
const portal    = new THREE.Mesh(new THREE.CircleGeometry(1, 64), portalMat);
scene.add(portal);

// In loop: render rtScene into target FIRST, then main scene
function animate() {
  requestAnimationFrame(animate);
  renderer.setRenderTarget(rtTex);
  renderer.render(rtScene, rtCamera);
  renderer.setRenderTarget(null);
  composer.render(); // or renderer.render(scene, camera)
}
```

---

## 10. LOD — Level of Detail (performance on mobile)

```js
const lod = new THREE.LOD();

// High detail (desktop close-up)
const high = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.5, 5),
  mat
);
lod.addLevel(high, 0); // visible from distance 0+

// Medium (mid-distance)
const mid = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.5, 2),
  mat
);
lod.addLevel(mid, 4); // visible from distance 4+

// Low (far/mobile)
const low = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.5, 1),
  mat
);
lod.addLevel(low, 8);

scene.add(lod);
// lod.update(camera) called automatically in render loop with WebGLRenderer
```

---

## Performance Decision Matrix

| Particles | Technique | Approx. fps (desktop) |
|-----------|-----------|----------------------|
| < 10k | BufferGeometry Points + JS | 60fps easy |
| 10k–100k | BufferGeometry + ShaderMaterial | 60fps |
| 100k–500k | GPGPU (ping-pong render targets) | 60fps |
| 500k+ | GPGPU + Additive blending only | 60fps |
| Thousands of meshes | InstancedMesh | 60fps |
| Complex scene on mobile | OffscreenCanvas + Worker | 60fps |
| Interactive objects | Raycaster (throttled to 30fps check) | 60fps |
