# Progressive Enhancement — WebGL Fallbacks & Accessibility

Never assume WebGL works. Always degrade gracefully. A broken site is worse than a simple one.

---

## 1. Detection Hierarchy

```js
function detectCapabilities() {
  const canvas = document.createElement('canvas');

  return {
    webgpu:       !!navigator.gpu,
    webgl2:       !!canvas.getContext('webgl2'),
    webgl1:       !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lowMemory:    navigator.deviceMemory < 4,        // < 4GB RAM
    slowCPU:      navigator.hardwareConcurrency < 4, // < 4 CPU cores
    isMobile:     /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
    isOldSafari:  /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
                  && parseInt(navigator.userAgent.match(/Version\/(\d+)/)?.[1] || '99') < 16,
  };
}

const caps = detectCapabilities();
```

---

## 2. Four-Tier Strategy

```js
async function initScene(canvas) {
  const caps = detectCapabilities();

  // Tier 0: No GPU at all — static fallback
  if (!caps.webgl1 && !caps.webgl2 && !caps.webgpu) {
    showStaticFallback();
    return;
  }

  // Tier 1: Reduced motion preference
  if (caps.reducedMotion) {
    initStaticWebGL(canvas); // render one beautiful frame, no animation
    return;
  }

  // Tier 2: Low-end device
  if (caps.isMobile || caps.lowMemory || caps.slowCPU) {
    initLiteScene(canvas);   // particles /3, geometry /2, no post-processing
    return;
  }

  // Tier 3: Full experience
  initFullScene(canvas);
}
```

---

## 3. Static Fallback (No WebGL)

```html
<!-- Always have a static fallback in the HTML -->
<div id="static-fallback" style="display:none">
  <img src="assets/hero-fallback.jpg" alt="Product" loading="eager"
       style="width:100%;height:100vh;object-fit:cover;position:fixed;inset:0;z-index:0">
  <!-- Same gradient overlay as the 3D version -->
  <div style="position:fixed;inset:0;z-index:1;
              background:linear-gradient(to right, rgba(10,10,12,0.9) 0%, transparent 60%)"></div>
</div>

<canvas id="canvas-3d"></canvas>
```

```js
function showStaticFallback() {
  document.getElementById('canvas-3d').style.display = 'none';
  document.getElementById('static-fallback').style.display = 'block';
  // Still run GSAP text animations — they work without WebGL
  initTextAnimations();
}
```

---

## 4. Lite Scene (Mobile / Low-End)

```js
function initLiteScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(1); // force 1x — no Retina on low-end
  renderer.setSize(innerWidth, innerHeight);
  // NO post-processing (EffectComposer disabled)
  // NO shadows

  const geo = new THREE.IcosahedronGeometry(1.5, 1); // low poly
  const mat = new THREE.MeshPhongMaterial({           // cheaper than MeshPhysical
    color: BRAND_COLOR,
    shininess: 80,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Gentle idle only — no scroll-driven animation on mobile
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.004;
    mesh.position.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08;
    renderer.render(scene, camera);
  }
  animate();
}
```

---

## 5. Particle Count by Device

```js
function getParticleCount() {
  const caps = detectCapabilities();
  if (!caps.webgl1)              return 0;
  if (caps.reducedMotion)        return 0;
  if (caps.isMobile || caps.lowMemory) return 2000;
  if (caps.slowCPU)              return 4000;
  return 10000; // full desktop
}

// GPGPU texture size by device:
function getGPGPUSize() {
  const caps = detectCapabilities();
  if (caps.isMobile || caps.lowMemory) return 64;   // 4k particles
  if (caps.slowCPU)                    return 128;  // 16k particles
  return 256; // 65k particles
}
```

---

## 6. CSS Fallback for Animations

```css
/* Respect prefers-reduced-motion everywhere */
@media (prefers-reduced-motion: reduce) {
  /* Kill ALL CSS animations and transitions */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Replace parallax with static */
  .parallax { transform: none !important; }

  /* Replace text reveal with instant visible */
  .word-inner { transform: none !important; opacity: 1 !important; }
}
```

```js
// Respect in GSAP as well
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(1000); // speed through all animations instantly
  // Or: don't register ScrollTrigger animations at all
}
```

---

## 7. Error Boundary for WebGL Context Loss

```js
// WebGL context can be lost (GPU reset, background tab, low memory)
canvas.addEventListener('webglcontextlost', e => {
  e.preventDefault(); // prevents browser from destroying context
  console.warn('WebGL context lost — pausing render');
  cancelAnimationFrame(animationId);
}, false);

canvas.addEventListener('webglcontextrestored', () => {
  console.info('WebGL context restored — reinitialising');
  // Reinitialise textures, buffers, etc.
  reinitScene();
  animate();
}, false);

// Also handle renderer errors gracefully:
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  console.warn('WebGLRenderer failed:', e);
  showStaticFallback();
  return;
}
```

---

## 8. Lenis Fallback (touch / older browsers)

```js
let lenis;
try {
  lenis = new Lenis({ duration: 1.4, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
} catch (e) {
  // Lenis failed — use native scroll, wire ScrollTrigger directly
  window.addEventListener('scroll', ScrollTrigger.update, { passive: true });
}
```

---

## 9. Font Loading Fallback

```css
/* Always define a system fallback stack */
:root {
  --font-display: 'Syne', 'Arial Black', sans-serif;
  --font-body:    'Instrument Sans', 'Helvetica Neue', system-ui, sans-serif;
}

/* Use font-display:swap so text is visible immediately */
/* Already in Google Fonts URL: &display=swap */
```

---

## 10. Performance Budget

| Device tier | Max draw calls | Max triangles | Post-processing | Particles |
|-------------|---------------|---------------|-----------------|-----------|
| Desktop high-end | 200 | 500k | Full (bloom+AA) | 65k+ |
| Desktop mid | 100 | 200k | Bloom only | 20k |
| Mobile high-end | 50 | 50k | None | 3k |
| Mobile low-end | 20 | 10k | None | 0 |
| No WebGL | 0 | 0 | N/A | 0 |

---

## Fallback Decision Tree

```
User visits page
│
├── WebGL available?
│   ├── NO → Static image + CSS gradient + text animations
│   └── YES
│       ├── prefers-reduced-motion?
│       │   ├── YES → Static WebGL frame (no animation, no scroll-drive)
│       │   └── NO → continue
│       │
│       ├── Mobile or low memory?
│       │   ├── YES → Lite scene (low poly, no post-processing, 2k particles)
│       │   └── NO → Full scene
│       │
│       └── WebGPU available?
│           ├── YES → Optional: upgrade to WebGPU renderer
│           └── NO → WebGL2 full scene (standard)
```
