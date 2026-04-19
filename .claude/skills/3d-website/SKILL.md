---
name: 3d-website
description: Build a premium 3D website with Three.js, WebGL, GSAP animations, and scroll-driven interactions. Use when someone asks to create a 3D site, add Three.js, build an immersive web experience, or make a 3D landing page.
argument-hint: [concept or theme]
---

# 3D Website Builder

Build a premium, scroll-driven 3D website using Three.js, GSAP, and Lenis. The result is a production-ready single-page experience that is immersive, performant, and visually unforgettable.

## Design Direction (Commit Before Coding)

Before writing a single line of code, define:
- **Theme**: What is this for? Product, portfolio, agency, event?
- **Atmosphere**: Dark & cinematic? Light & airy? Brutalist & geometric? Organic & fluid?
- **Hero 3D object**: What Three.js scene anchors the page? (floating geometry, particle field, 3D model, abstract sculpture)
- **Color palette**: 2-3 dominant colors + 1 accent. Define as CSS variables.
- **Typography**: One display font (dramatic, characterful) + one body font. Never Inter or Arial.

Commit to the direction. Execute it fully. Half-measures produce forgettable work.

---

## Tech Stack

```html
<!-- CDN order matters -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="js/app.js" type="module"></script>
```

Google Fonts via `<link>` in `<head>`. No bundler — pure HTML/CSS/JS.

---

## File Structure

```
project/
  index.html
  css/
    style.css
  js/
    app.js          ← Three.js scene + GSAP + Lenis
  assets/
    models/         ← .glb files if needed
    textures/       ← .jpg/.webp textures
```

---

## Step 1: Build index.html

Required sections in order:

```html
<!-- 1. Loader: #loader > .loader-bar, .loader-percent -->
<!-- 2. Fixed canvas: #canvas-3d (position:fixed, full viewport, z-index:0) -->
<!-- 3. Fixed header: .site-header with logo + nav -->
<!-- 4. Scroll container: #scroll-wrap (min 600vh) -->
<!--    ├── .section.hero (100vh) -->
<!--    ├── .section.feature (each 80-100vh) -->
<!--    ├── .section.stats -->
<!--    └── .section.cta (data-persist="true") -->
```

Section example:
```html
<section class="section feature align-left" 
         data-enter="20" data-leave="38" data-animation="slide-left">
  <div class="section-inner">
    <span class="label">01 / Feature</span>
    <h2>Headline Here</h2>
    <p>Description text. Keep it punchy.</p>
  </div>
</section>
```

---

## Step 2: CSS Architecture

```css
:root {
  --bg: #0a0a0f;
  --surface: #12121a;
  --accent: #6c63ff;
  --accent-2: #ff6b6b;
  --text: #f0ede8;
  --text-muted: #888899;
  --font-display: 'Display Font', sans-serif;
  --font-body: 'Body Font', sans-serif;
}

/* Three.js canvas is fixed behind everything */
#canvas-3d {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* Content layers above canvas */
.site-header, #scroll-wrap { position: relative; z-index: 10; }

/* Text alignment zones — 3D scene occupies center */
.align-left  { padding: 0 55vw 0 5vw; }
.align-right { padding: 0 5vw 0 55vw; }
.align-left .section-inner,
.align-right .section-inner { max-width: 42vw; }

/* Sections absolutely positioned in scroll container */
.section {
  position: absolute;
  width: 100%;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
}

/* Hero typography */
.hero h1 { font-size: clamp(4rem, 10vw, 12rem); line-height: 0.9; font-weight: 800; }
.section h2 { font-size: clamp(2.5rem, 5vw, 5rem); font-weight: 700; }
.label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-muted); }
```

**Mobile (<768px):** Collapse side zones, reduce scroll height to ~400vh, center text with semi-transparent dark backgrounds.

---

## Step 3: Three.js Scene (js/app.js)

### 3a. Scene Setup

```js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas-3d'),
  antialias: true,
  alpha: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
camera.position.z = 5;

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
```

### 3b. Hero 3D Object (choose one pattern)

**Option A — Geometric sculpture:**
```js
const geo = new THREE.IcosahedronGeometry(1.5, 1);
const mat = new THREE.MeshPhysicalMaterial({
  color: 0x6c63ff,
  metalness: 0.3,
  roughness: 0.1,
  wireframe: false,
  transparent: true,
  opacity: 0.9
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
```

**Option B — Particle field:**
```js
const count = 8000;
const positions = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
  size: 0.02,
  color: 0x6c63ff,
  transparent: true,
  opacity: 0.8
}));
scene.add(particles);
```

**Option C — Torus knot (dramatic, always works):**
```js
const geo = new THREE.TorusKnotGeometry(1, 0.35, 200, 20);
const mat = new THREE.MeshPhysicalMaterial({
  color: 0x6c63ff,
  metalness: 0.8,
  roughness: 0.1,
  envMapIntensity: 1
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);
```

### 3c. Lighting

```js
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 2);
key.position.set(5, 5, 5);
scene.add(key);

const fill = new THREE.DirectionalLight(0x6c63ff, 1);
fill.position.set(-5, 0, 3);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xff6b6b, 0.8);
rim.position.set(0, -5, -5);
scene.add(rim);
```

### 3d. Scroll-Driven 3D Animation

```js
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    const p = self.progress;
    
    // Rotate object through scroll
    mesh.rotation.y = p * Math.PI * 4;
    mesh.rotation.x = p * Math.PI * 2;
    
    // Move camera through space
    camera.position.z = 5 - p * 3;
    camera.position.y = Math.sin(p * Math.PI) * 1.5;
    
    // Scale punch at midpoint
    const scale = 1 + Math.sin(p * Math.PI) * 0.3;
    mesh.scale.setScalar(scale);
    
    // Color shift (requires dat.gui or manual uniform)
    // mat.color.setHSL(p * 0.3 + 0.6, 0.8, 0.5);
  }
});
```

### 3e. Idle Animation Loop

```js
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  
  // Gentle idle rotation (on top of scroll-driven rotation)
  mesh.rotation.y += 0.003;
  mesh.position.y = Math.sin(t * 0.5) * 0.1;
  
  renderer.render(scene, camera);
}
animate();
```

### 3f. Mouse Parallax

```js
let mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
});

// In animate loop:
mesh.rotation.x += (mouse.y * 0.3 - mesh.rotation.x) * 0.05;
mesh.rotation.y += (mouse.x * 0.3 - mesh.rotation.y) * 0.05;
```

---

## Step 4: GSAP + Lenis Integration

```js
// Smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Hero word split animation
const words = document.querySelectorAll('.hero h1 .word');
gsap.from(words, {
  y: 120,
  opacity: 0,
  stagger: 0.1,
  duration: 1.2,
  ease: 'power4.out',
  delay: 0.5  // after loader
});
```

---

## Step 5: Section Animation System

Use the same system as `video-to-website` — read `data-enter`, `data-leave`, `data-animation` from each section, position absolutely at midpoint, animate in/out with ScrollTrigger.

Animation types to rotate through:
- `fade-up` — y:60 opacity:0 → default
- `slide-left` — x:-80 opacity:0
- `slide-right` — x:80 opacity:0
- `scale-up` — scale:0.85 opacity:0
- `clip-reveal` — clipPath:inset(100% 0 0 0)
- `rotate-in` — y:40 rotation:3 opacity:0

**Never repeat the same animation for consecutive sections.**

Stagger sequence per section: `label → h2 → p → button` (0.1s delay each).

---

## Step 6: Loader

```js
async function preload() {
  // Preload textures / models if needed
  const loader = document.getElementById('loader');
  const bar = loader.querySelector('.loader-bar');
  const pct = loader.querySelector('.loader-percent');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 80);
  
  await new Promise(r => setTimeout(r, 1400)); // minimum display
  
  gsap.to(loader, { opacity: 0, duration: 0.6, onComplete: () => loader.remove() });
}
preload();
```

---

## Quality Checklist

- [ ] Lenis smooth scroll active and connected to ScrollTrigger
- [ ] Three.js canvas is fixed, pointer-events:none
- [ ] Renderer uses `alpha:true` so page bg shows through
- [ ] devicePixelRatio applied to renderer
- [ ] Resize handler updates camera + renderer
- [ ] Mouse parallax is subtle (multiplier ≤ 0.4)
- [ ] 3D object animates through all 4 quadrants of scroll
- [ ] Every text section uses a different entrance animation
- [ ] Typography: hero ≥ 6rem, sections ≥ 3rem
- [ ] No glassmorphism cards — text sits directly on dark bg
- [ ] Loader hides only after scene is ready
- [ ] Mobile: canvas still visible, text legible, reduced scroll height

---

## Performance Rules

- Max 10,000 vertices for mobile — use LOD for complex models
- Particle count: 8,000 desktop / 3,000 mobile
- Dispose geometry and material when sections leave viewport
- Use `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — never uncapped
- Prefer `BufferGeometry` over legacy geometry
- Test at 60fps in DevTools performance panel before shipping

---

## Anti-Patterns

- **Full-screen canvas with pointer-events** — blocks scroll and clicks
- **Uncapped pixel ratio** — destroys performance on Retina + high-DPI
- **requestAnimationFrame without `Math.min(devicePixelRatio, 2)`** — same issue
- **Ambient light only** — flat, lifeless. Always add directional + rim lights
- **One animation type for all sections** — boring. Rotate through all types
- **Inter/Roboto** — generic. Use a dramatic display font
- **Purple gradient on white** — most clichéd AI aesthetic. Avoid
