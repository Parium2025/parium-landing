---
name: 3d-website
description: Build a world-class, scroll-driven 3D landing page. Three.js, WebGL, custom shaders, post-processing, GSAP, Lenis. Awwwards/Spotify-tier output. Use when someone asks for a 3D site, immersive landing page, or WebGL experience.
argument-hint: [concept, product, or theme]
---

# 3D Website — Masterclass Builder

Build a cinematic, scroll-driven 3D landing page. The bar is Awwwards Site of the Day. Every render decision must serve the brand. Every animation must feel inevitable, not mechanical.

---

## Phase 0: Commit to Direction

Before one line of code, lock these in writing:

```
CONCEPT:   ________________________________
ATMOSPHERE: dark-cinematic / light-editorial / brutalist / organic / luxury
HERO OBJECT: floating sculpture / particle field / product model / abstract geometry / fluid sim
PALETTE:   primary #______ / accent #______ / background #______
DISPLAY FONT: _______ (never Inter, Roboto, Arial)
BODY FONT:   _______ (refined, readable)
MEMORY HOOK: The one thing visitors will remember: _______
```

Half-measures produce forgettable work. Commit fully.

---

## Tech Stack (CDN, no bundler)

```html
<!-- Critical order -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="GOOGLE_FONTS_URL" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- Optional post-processing (import via ES module) -->
<!-- EffectComposer, UnrealBloomPass from three/examples/jsm -->

<script src="js/app.js" type="module"></script>
```

---

## File Structure

```
project/
  index.html
  css/style.css
  js/
    app.js           ← main: scene, scroll, animations
    shaders.js       ← GLSL vertex/fragment strings
  assets/
    models/          ← .glb files
    textures/        ← .jpg/.webp/.hdr
    fonts/           ← variable fonts if self-hosted
```

---

## Step 1: HTML Architecture

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brand Name</title>
  <!-- Fonts + scripts -->
</head>
<body>

  <!-- 1. Loader -->
  <div id="loader">
    <div class="loader-wordmark">BRAND</div>
    <div class="loader-track"><div class="loader-fill"></div></div>
    <span class="loader-pct">0%</span>
  </div>

  <!-- 2. Fixed WebGL canvas (behind everything) -->
  <canvas id="canvas-3d"></canvas>

  <!-- 3. Fixed custom cursor (desktop only) -->
  <div class="cursor-outer"></div>
  <div class="cursor-dot"></div>

  <!-- 4. Fixed navigation -->
  <header class="site-header">
    <a class="logo" href="/">BRAND</a>
    <nav>
      <a href="#features">Features</a>
      <a href="#about">About</a>
    </nav>
    <a class="btn-nav" href="#cta">Get Started</a>
  </header>

  <!-- 5. Scroll container (min 600vh) -->
  <main id="scroll-wrap">

    <!-- Hero: 100vh, text left, object center-right -->
    <section class="section hero align-left"
             data-enter="0" data-leave="18" data-animation="hero">
      <div class="section-inner">
        <span class="label">Next Generation</span>
        <h1 class="split-text">Headline<br>Goes Here</h1>
        <p class="hero-sub">Brief punchy subline. One sentence max.</p>
        <div class="btn-group">
          <a class="btn btn-primary" href="#cta">Start Free</a>
          <a class="btn btn-ghost" href="#features">See How</a>
        </div>
      </div>
    </section>

    <!-- Feature sections (80-100vh each) -->
    <section class="section feature align-right"
             data-enter="18" data-leave="36" data-animation="slide-left">
      <div class="section-inner">
        <span class="label">01 / Feature</span>
        <h2 class="split-text">Powerful<br>Headline</h2>
        <p>Feature description — punchy, benefit-driven.</p>
      </div>
    </section>

    <section class="section feature align-left"
             data-enter="36" data-leave="54" data-animation="slide-right">
      <div class="section-inner">
        <span class="label">02 / Feature</span>
        <h2 class="split-text">Another<br>Feature</h2>
        <p>Feature description.</p>
      </div>
    </section>

    <!-- Stats row -->
    <section class="section stats full-width"
             data-enter="54" data-leave="68" data-animation="scale-up">
      <div class="stats-grid">
        <div class="stat"><span class="stat-num" data-target="99" data-suffix="%">0%</span><span class="stat-label">Uptime</span></div>
        <div class="stat"><span class="stat-num" data-target="500" data-suffix="K+">0</span><span class="stat-label">Users</span></div>
        <div class="stat"><span class="stat-num" data-target="4.9" data-suffix="★">0</span><span class="stat-label">Rating</span></div>
      </div>
    </section>

    <!-- CTA (always last, persist) -->
    <section class="section cta align-center"
             data-enter="80" data-leave="100" data-animation="fade-up" data-persist="true">
      <div class="section-inner">
        <span class="label">Get Started Today</span>
        <h2>Ready to Begin?</h2>
        <a class="btn btn-primary btn-large" href="#">Start Free Trial</a>
      </div>
    </section>

  </main>

  <!-- Marquee (fixed position, appears mid-scroll) -->
  <div class="marquee-wrap" id="marquee">
    <div class="marquee-track">
      <span>WORLD CLASS · IMMERSIVE · 3D EXPERIENCE · NEXT GENERATION · </span>
    </div>
  </div>

  <!-- Grain overlay -->
  <svg class="grain" aria-hidden="true">
    <filter id="grain-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#grain-filter)"/>
  </svg>

</body>
</html>
```

---

## Step 2: CSS Architecture

```css
/* ── Reset & Variables ───────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --brand:       #______;
  --brand-dim:   color-mix(in srgb, var(--brand) 30%, transparent);
  --bg:          #0a0a0c;
  --bg-surface:  #111116;
  --bg-light:    #f5f4f0;
  --text:        #f0ede8;
  --text-muted:  rgba(240,237,232,0.45);
  --font-display: 'Display Font', sans-serif;
  --font-body:    'Body Font', sans-serif;
}

html { scroll-behavior: auto; } /* Lenis handles smooth scroll */
body { background: var(--bg); color: var(--text); font-family: var(--font-body); overflow-x: hidden; }

/* ── Canvas (always fixed, behind content) ──────────────── */
#canvas-3d {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ── Header ─────────────────────────────────────────────── */
.site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 3rem;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* ── Scroll container ────────────────────────────────────── */
#scroll-wrap {
  position: relative;
  z-index: 10;
  min-height: 600vh;
}

/* ── Section positioning ─────────────────────────────────── */
.section {
  position: absolute;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
}
.section-inner { max-width: 44vw; }
.align-left  { padding: 0 5vw; justify-content: flex-start; }
.align-right { padding: 0 5vw; justify-content: flex-end; }
.align-center { justify-content: center; text-align: center; }
.align-center .section-inner { max-width: 60ch; }

/* ── Typography ──────────────────────────────────────────── */
.label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}
h1, .hero h1 {
  font-family: var(--font-display);
  font-size: clamp(5rem, 11vw, 14rem);
  line-height: 0.88;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}
h2 {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6vw, 7rem);
  line-height: 0.92;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
}
p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 50ch;
  margin-bottom: 2.5rem;
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 2rem;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition:
    transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
    box-shadow 0.25s ease,
    background 0.2s ease;
  cursor: pointer;
}
.btn-primary {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 4px 24px var(--brand-dim);
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px var(--brand-dim);
}
.btn-primary:focus-visible { outline: 2px solid var(--brand); outline-offset: 4px; }
.btn-primary:active { transform: translateY(1px); }
.btn-ghost {
  background: rgba(255,255,255,0.08);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.12);
}
.btn-ghost:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); }

/* ── Stats ───────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
  padding: 0 5vw;
  text-align: center;
}
.stat-num {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(4rem, 8vw, 9rem);
  font-weight: 800;
  line-height: 1;
  color: var(--brand);
}
.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
  margin-top: 0.75rem;
}

/* ── Marquee ─────────────────────────────────────────────── */
.marquee-wrap {
  position: fixed;
  bottom: 2rem;
  left: 0; right: 0;
  z-index: 50;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
}
.marquee-track {
  display: flex;
  white-space: nowrap;
  font-family: var(--font-display);
  font-size: clamp(10vw, 12vw, 15vw);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.12);
}

/* ── Custom Cursor ───────────────────────────────────────── */
.cursor-outer {
  position: fixed;
  width: 36px; height: 36px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
  mix-blend-mode: difference;
}
.cursor-outer.hover { width: 64px; height: 64px; border-color: var(--brand); }
.cursor-dot {
  position: fixed;
  width: 5px; height: 5px;
  background: #fff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}

/* ── Grain ───────────────────────────────────────────────── */
.grain {
  position: fixed;
  inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9998;
  opacity: 0.04;
}

/* ── Loader ──────────────────────────────────────────────── */
#loader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}
.loader-wordmark {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.loader-track {
  width: 200px;
  height: 1px;
  background: rgba(255,255,255,0.1);
}
.loader-fill {
  height: 100%;
  width: 0%;
  background: var(--brand);
  transition: width 0.05s linear;
}
.loader-pct {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: var(--text-muted);
}

/* ── Mobile ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  #scroll-wrap { min-height: 420vh; }
  .section { position: relative; height: auto; min-height: 100svh; padding: 8rem 1.5rem 4rem; }
  .section-inner { max-width: 100%; }
  .align-left, .align-right { justify-content: center; padding: 0; }
  h1 { font-size: clamp(3.5rem, 15vw, 6rem); }
  h2 { font-size: clamp(2.5rem, 10vw, 4rem); }
  .stats-grid { grid-template-columns: 1fr; }
  .cursor-outer, .cursor-dot { display: none; }
}

/* ── Reduced motion ──────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

---

## Step 3: Three.js Scene (js/app.js)

### 3a. Renderer — Canonical Setup

```js
const canvas = document.getElementById('canvas-3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});
```

### 3b. Hero Objects — Pattern Library

**Metallic Sculpture (luxury/tech)**
```js
const geo = new THREE.IcosahedronGeometry(1.6, 4);
const mat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.95,
  roughness: 0.05,
  envMapIntensity: 2.5,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
```

**Glass Sphere (elegant/modern)**
```js
const geo = new THREE.SphereGeometry(1.5, 64, 64);
const mat = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  thickness: 2,
  roughness: 0,
  ior: 1.5,
  envMapIntensity: 3,
  transparent: true,
});
```

**Shader Particle Field (tech/data)**
```js
const COUNT = window.innerWidth < 768 ? 3000 : 10000;
const positions = new Float32Array(COUNT * 3);
const randoms = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  // Spherical distribution
  const r = 3 + Math.random() * 4;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
  randoms[i] = Math.random();
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

// Custom shader for animated, size-varying particles
const mat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(BRAND_HEX) },
    uSize: { value: 3.0 * renderer.getPixelRatio() },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSize;
    attribute float aRandom;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = uSize * (1.0 + sin(uTime + aRandom * 6.28) * 0.3) * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    void main() {
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.3, 0.5, d);
      gl_FragColor = vec4(uColor, alpha * 0.8);
    }
  `,
  transparent: true,
  depthWrite: false,
});
const particles = new THREE.Points(geo, mat);
scene.add(particles);
```

**Torus Knot (dramatic, always striking)**
```js
const geo = new THREE.TorusKnotGeometry(1.1, 0.38, 300, 24, 2, 3);
const mat = new THREE.MeshPhysicalMaterial({
  color: BRAND_COLOR,
  metalness: 0.9,
  roughness: 0.08,
  envMapIntensity: 2,
  clearcoat: 0.5,
});
```

**Floating Abstract (organic/studio)**
```js
// Subdivision + noise displacement via ShaderMaterial
const geo = new THREE.SphereGeometry(1.5, 128, 128);
const mat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(BRAND_HEX) },
    uAccent: { value: new THREE.Color(ACCENT_HEX) },
  },
  vertexShader: `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPos;
    
    // Simplex noise (include noise function here)
    float noise(vec3 p) {
      return sin(p.x * 2.0) * sin(p.y * 2.0) * sin(p.z * 2.0);
    }
    
    void main() {
      vNormal = normal;
      float n = noise(position * 1.5 + uTime * 0.3) * 0.35;
      vec3 displaced = position + normal * n;
      vPos = displaced;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uAccent;
    varying vec3 vNormal;
    varying vec3 vPos;
    void main() {
      vec3 light = normalize(vec3(5.0, 8.0, 5.0));
      float diff = max(dot(vNormal, light), 0.0);
      float rim = 1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0);
      vec3 col = mix(uColor, uAccent, rim * 0.6) * (0.3 + diff * 0.7);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});
```

### 3c. Lighting — 4-Point Cinematic Rig

```js
// Ambient — barely there
const ambient = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(ambient);

// Key — warm, from upper-left
const key = new THREE.DirectionalLight(0xfff0e0, 3.5);
key.position.set(-4, 8, 6);
key.castShadow = true;
key.shadow.mapSize.setScalar(2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = 30;
scene.add(key);

// Fill — brand-tinted, from right
const fill = new THREE.DirectionalLight(BRAND_COLOR, 1.5);
fill.position.set(6, 0, 3);
scene.add(fill);

// Rim — accent-tinted, from behind-below
const rim = new THREE.DirectionalLight(ACCENT_COLOR, 1.2);
rim.position.set(0, -6, -6);
scene.add(rim);

// RectAreaLight — for product/object highlights
// Requires RectAreaLightUniformsLib.init()
const rect = new THREE.RectAreaLight(0xffffff, 5, 3, 3);
rect.position.set(0, 4, 3);
rect.lookAt(0, 0, 0);
scene.add(rect);
```

### 3d. Post-Processing (optional but premium)

```js
// Import via ES module from three/examples/jsm
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.35,  // strength — subtle, not blown out
  0.5,   // radius
  0.88   // threshold
);
composer.addPass(bloom);

// SMAA instead of default FXAA (better quality)
composer.addPass(new SMAAPass(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio()));

// Use composer.render() in loop, not renderer.render()
```

### 3e. Environment Map (for PBR materials)

```js
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader().load('assets/textures/environment.hdr', texture => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = envMap; // applies to all MeshPhysicalMaterial
  texture.dispose();
  pmremGenerator.dispose();
});
```

### 3f. GLB Model Loading

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const gltf = new GLTFLoader();
gltf.setDRACOLoader(draco);

let model;
gltf.load('assets/models/product.glb', ({ scene: gltfScene }) => {
  model = gltfScene;
  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      // Upgrade materials to PBR
      child.material = new THREE.MeshPhysicalMaterial({
        map: child.material.map,
        metalness: 0.8,
        roughness: 0.2,
      });
    }
  });
  scene.add(model);
});
```

---

## Step 4: Scroll-Driven 3D Animation

```js
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.4, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

// Master scroll driver
let scrollProgress = 0;
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.5,
  onUpdate: self => {
    scrollProgress = self.progress;
    updateScene(scrollProgress);
  }
});

function updateScene(p) {
  // ── Camera journey ──────────────────────────────────────
  camera.position.z = THREE.MathUtils.lerp(5.5, 1.5, p);
  camera.position.y = Math.sin(p * Math.PI) * 1.8;
  camera.position.x = Math.sin(p * Math.PI * 2) * 0.5;
  camera.lookAt(scene.position);

  // ── Object transform ────────────────────────────────────
  if (mesh) {
    mesh.rotation.y = p * Math.PI * 5;
    mesh.rotation.x = p * Math.PI * 1.5;
    // Scale punch at 50% scroll
    const scalePulse = 1 + Math.sin(p * Math.PI) * 0.4;
    mesh.scale.setScalar(scalePulse);
    // Color shift
    mat.color.setHSL(p * 0.4 + 0.6, 0.85, 0.55);
    mat.emissiveIntensity = Math.sin(p * Math.PI * 2) * 0.5;
  }

  // ── Particle drift ──────────────────────────────────────
  if (particles) {
    particles.rotation.y = p * Math.PI * 3;
    particles.rotation.x = p * Math.PI;
  }

  // ── Background color transition ─────────────────────────
  const zones = [
    { at: 0,    bg: '#0a0a0c' },
    { at: 0.33, bg: '#0d0515' },  // purple-dark mid
    { at: 0.66, bg: '#0a0a0c' },  // back to void
    { at: 1,    bg: '#050810' },  // deep blue-black
  ];
  // interpolate and apply to body background
  updateBackground(p, zones);
}
```

---

## Step 5: Section Animation System

```js
// Position sections based on their data-enter/data-leave percent of scroll height
function positionSections() {
  const totalHeight = document.getElementById('scroll-wrap').offsetHeight;
  document.querySelectorAll('.section').forEach(section => {
    const enterPct = +section.dataset.enter / 100;
    const leavePct = +section.dataset.leave / 100;
    const mid = (enterPct + leavePct) / 2;
    section.style.top = (totalHeight * mid - window.innerHeight / 2) + 'px';
  });
}
positionSections();

// Animate each section in/out
const enterAnimations = {
  hero:        { from: { y: 60, opacity: 0 }, ease: 'power4.out', dur: 1.2 },
  'fade-up':   { from: { y: 70, opacity: 0 }, ease: 'power3.out', dur: 1.0 },
  'slide-left':{ from: { x: -100, opacity: 0 }, ease: 'power3.out', dur: 0.9 },
  'slide-right':{ from: { x: 100, opacity: 0 }, ease: 'power3.out', dur: 0.9 },
  'scale-up':  { from: { scale: 0.82, opacity: 0 }, ease: 'back.out(1.2)', dur: 1.0 },
  'clip-reveal':{ from: { clipPath: 'inset(100% 0 0 0)' }, ease: 'power4.inOut', dur: 1.1 },
  'rotate-in': { from: { y: 50, rotation: 5, opacity: 0 }, ease: 'power3.out', dur: 1.0 },
  'blur-in':   { from: { filter: 'blur(20px)', scale: 1.06, opacity: 0 }, ease: 'power2.out', dur: 1.2 },
};

document.querySelectorAll('.section').forEach(section => {
  const type = section.dataset.animation || 'fade-up';
  const anim = enterAnimations[type];
  const children = section.querySelectorAll('.label, h2, h1, p, .btn-group, .stats-grid');

  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    end: 'bottom 20%',
    onEnter: () => gsap.from(children, {
      ...anim.from,
      duration: anim.dur,
      ease: anim.ease,
      stagger: 0.1,
      clearProps: 'all',
    }),
    onLeave: () => {
      if (!section.dataset.persist) {
        gsap.to(children, { opacity: 0, y: -20, duration: 0.5 });
      }
    },
    onEnterBack: () => gsap.from(children, {
      opacity: 0, y: 20, duration: 0.6, stagger: 0.08
    }),
  });
});
```

---

## Step 6: GSAP Extras

### Word Split + Reveal
```js
function splitWords(el) {
  el.innerHTML = el.textContent
    .split(' ')
    .map(w => `<span class="w" style="display:inline-block;overflow:hidden">
      <span class="wi" style="display:inline-block">${w}</span>
    </span>`)
    .join(' ');
}

function revealWords(el, delay = 0) {
  splitWords(el);
  gsap.from(el.querySelectorAll('.wi'), {
    y: '110%',
    duration: 1.1,
    stagger: 0.07,
    ease: 'power4.out',
    delay,
    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
  });
}

document.querySelectorAll('.split-text').forEach(el => revealWords(el));
```

### Stats Counter
```js
document.querySelectorAll('.stat-num').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const isFloat = target % 1 !== 0;
      gsap.fromTo({ val: 0 }, { val: target }, {
        duration: 2.2,
        ease: 'power2.out',
        snap: { val: isFloat ? 0.1 : 1 },
        onUpdate() {
          const v = this.targets()[0].val;
          el.textContent = (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
        },
      });
    }
  });
});
```

### Marquee (seamless loop)
```js
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  track.innerHTML += track.innerHTML; // duplicate
  gsap.to(track, { x: '-50%', duration: 25, ease: 'none', repeat: -1 });

  // Show/hide with scroll
  ScrollTrigger.create({
    trigger: '#scroll-wrap',
    start: '30% top',
    end: '70% bottom',
    onEnter: () => gsap.to('.marquee-wrap', { opacity: 1, duration: 0.6 }),
    onLeave: () => gsap.to('.marquee-wrap', { opacity: 0, duration: 0.4 }),
    onEnterBack: () => gsap.to('.marquee-wrap', { opacity: 1, duration: 0.6 }),
    onLeaveBack: () => gsap.to('.marquee-wrap', { opacity: 0, duration: 0.4 }),
  });
}
```

### Custom Cursor
```js
function initCursor() {
  const outer = document.querySelector('.cursor-outer');
  const dot = document.querySelector('.cursor-dot');
  if (!outer || window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', e => {
    gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08 });
    gsap.to(outer, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power2.out' });
  });

  document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => outer.classList.add('hover'));
    el.addEventListener('mouseleave', () => outer.classList.remove('hover'));
  });
}
```

### Mouse Parallax on 3D
```js
const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
});

// In animation loop (runs EVERY frame):
function applyMouseParallax() {
  target.x += (mouse.x * 0.2 - target.x) * 0.035;
  target.y += (mouse.y * 0.2 - target.y) * 0.035;
  if (mesh) {
    mesh.rotation.x += target.y * 0.01;
    mesh.rotation.y += target.x * 0.01;
  }
}
```

---

## Step 7: Loader

```js
async function runLoader() {
  // Logo reveal
  await gsap.from('.loader-wordmark', {
    y: 30, opacity: 0, duration: 0.7, ease: 'power3.out'
  }).then();

  // Fill bar (min 1.6s)
  await new Promise(resolve => {
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 10 + 2;
      p = Math.min(p, 100);
      document.querySelector('.loader-fill').style.width = p + '%';
      document.querySelector('.loader-pct').textContent = Math.floor(p) + '%';
      if (p >= 100) { clearInterval(tick); resolve(); }
    }, 60);
  });

  // Exit: flash + slide up
  gsap.to('.loader-fill', { scaleX: 0, transformOrigin: 'right', duration: 0.4 });
  await gsap.to('#loader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }).then();
  document.getElementById('loader').remove();

  // Hero reveal
  revealHero();
}

function revealHero() {
  gsap.from('.site-header', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out' });
  document.querySelectorAll('.hero .split-text').forEach((el, i) => revealWords(el, i * 0.1));
  gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 1, delay: 0.4 });
  gsap.from('.hero .btn-group', { y: 20, opacity: 0, duration: 1, delay: 0.6 });
}
```

---

## Step 8: Animation Loop

```js
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Update shader uniforms
  if (mat.uniforms?.uTime) mat.uniforms.uTime.value = t;

  // Idle float (subtle, on top of scroll-driven)
  if (mesh) {
    mesh.position.y = Math.sin(t * 0.4) * 0.08;
  }

  // Mouse parallax
  applyMouseParallax();

  // Render (use composer if post-processing active)
  composer ? composer.render() : renderer.render(scene, camera);
}

animate();
```

---

## Quality Gates — Every Build

**3D / WebGL**
- [ ] Canvas: `alpha:true`, `powerPreference:'high-performance'`, `pointer-events:none`, `position:fixed`
- [ ] PixelRatio capped at 2
- [ ] Resize handler updates camera aspect + renderer size
- [ ] 3-point lighting + rim (never ambient-only)
- [ ] Object animates through at least 4 distinct scroll states
- [ ] Mouse parallax multiplier ≤ 0.25 (too much = nausea)
- [ ] Mobile particle count reduced by ≥ 60%
- [ ] Post-processing: bloom strength ≤ 0.5 (subtle, not blown out)

**Typography & Layout**
- [ ] Hero h1 ≥ 5rem, custom display font, tight line-height
- [ ] Section h2 ≥ 3rem
- [ ] No Inter/Roboto/Arial as display font
- [ ] Background shifts color across at least 3 zones
- [ ] Every section uses a DIFFERENT entrance animation
- [ ] At least one pinned section
- [ ] Horizontal marquee present
- [ ] Stats animate with GSAP counter (never static)
- [ ] No glassmorphism / frosted glass cards

**Interactive**
- [ ] Custom cursor on desktop
- [ ] All buttons: hover + focus-visible + active states
- [ ] `transition-all` nowhere in the codebase

**Performance**
- [ ] `gsap.ticker.lagSmoothing(0)` enabled
- [ ] Lenis wired to ScrollTrigger.update
- [ ] `will-change: transform` on animated elements
- [ ] Images: `loading="lazy"` + explicit dimensions
- [ ] `@media (prefers-reduced-motion: reduce)` guard

**Screenshots (mandatory)**
- [ ] Full page from `node screenshot.mjs http://localhost:3000`
- [ ] Mobile viewport (375px wide)
- [ ] Mid-scroll state visible (hero scroll > 30%)
- [ ] Read screenshots and verify quality before reporting done

---

## Companion Reference Files

Read these when the task requires advanced techniques:

- **[r3f.md](r3f.md)** — React Three Fiber + Drei: Canvas setup, hooks, Environment, MeshTransmissionMaterial, Float, Sparkles, GLB loading, ScrollControls, post-processing, custom shaders, HTML overlay. Use when project is React-based.
- **[webgpu.md](webgpu.md)** — WebGPU renderer, node materials, compute shaders, 1M+ particles, WGSL reference, detection + fallback strategy. Use when targeting modern browsers and need maximum performance.
- **[fallback.md](fallback.md)** — Progressive enhancement: 4-tier device strategy, static fallback, lite scene, particle count by device, context loss recovery, prefers-reduced-motion, performance budget table, decision tree.
- **[shaders.md](shaders.md)** — Complete GLSL library: simplex noise 2D/3D, FBM, curl noise, voronoi, displacement shader, holographic/iridescent, chromatic aberration, film grain, raymarching + SDF primitives, morph vertex shader, audio reactive uniforms
- **[advanced.md](advanced.md)** — GPGPU particles (65k–500k at 60fps), InstancedMesh, MorphTargets, custom ShaderPass, raycasting, OffscreenCanvas + Web Workers, Rapier.js physics, video texture scrubbing, render-to-texture portals, LOD system

Rules:
- Particles > 10k: always use GPGPU from advanced.md
- Any noise/shader effect: copy from shaders.md, never write noise from scratch
- Click/hover on 3D objects: use raycasting from advanced.md
- Mobile heavy scene: OffscreenCanvas pattern from advanced.md


## Hard Anti-Patterns

| Never | Why |
|-------|-----|
| `pointer-events` on canvas | Blocks scroll and all clicks |
| Uncapped `devicePixelRatio` | Kills mobile GPU |
| `transition-all` | Triggers layout recalc every frame |
| Ambient light only | Flat, lifeless, plastic-looking |
| Same entrance animation repeated | Boring, unfinished feeling |
| Bloom strength > 0.6 | Looks broken, not premium |
| Purple gradient on white | Most clichéd AI output |
| Inter/Space Grotesk as hero font | Overused to death |
| `renderer.render()` when composer active | Post-processing ignored |
| Mouse parallax > 0.3 multiplier | Causes motion sickness |
