---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with world-class design quality. Masterclass-level 3D animated landing pages, WebGL, GSAP, Lenis. Avoids all generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill produces world-class frontend interfaces — cinematic, scroll-driven, 3D-powered landing pages that feel Spotify/Apple/Awwwards-tier. Every output must be something worth putting in a portfolio. Implement real working code with obsessive attention to detail.

---

## Phase 0: Brand Audit (Always First)

Before any design decision:
1. Check `brand_assets/` — logos, color guides, font files, style guides
2. If assets exist: use them exactly. No substitutions.
3. Extract: primary color, secondary, neutrals, font names, spacing rhythm
4. If no assets: invent a brand direction and commit hard (see Phase 1)

---

## Phase 1: Design Direction (Non-Negotiable)

Define and lock these before writing one line of code:

### Identity
- **Concept**: What emotion should this page trigger? (awe, desire, trust, excitement)
- **Aesthetic pole**: Pick ONE and commit — brutalist / editorial / luxury / organic / cyberpunk / minimalist-zen / retro-futurist / maximalist-expressive
- **Memory hook**: What is the ONE thing a visitor will remember 24h later?

### Typography System
```
Display font  — dramatic, characterful (Clash Display, Syne, Cabinet Grotesk, Bebas Neue, Playfair Display, PP Mori, Editorial New)
Body font     — readable, refined (DM Sans, Instrument Sans, General Sans, Satoshi, Neue Haas Grotesk)
Mono font     — for code/labels (JetBrains Mono, Fira Code, IBM Plex Mono)

NEVER: Inter, Roboto, Arial, Helvetica, system-ui as primary font
```

Hero heading:   `clamp(5rem, 12vw, 14rem)` · weight 700-900 · line-height 0.85-0.95 · tracking -0.03em
Section h2:     `clamp(3rem, 6vw, 7rem)` · weight 600-800
Section label:  `0.65rem` · uppercase · tracking 0.25em · muted color
Body text:      `1rem-1.125rem` · line-height 1.7 · max-width 60ch

### Color Architecture
```css
:root {
  /* Brand */
  --brand:       #______;   /* Primary — never default Tailwind indigo/blue */
  --brand-light: #______;   /* Tinted variant */
  --brand-dim:   #______;   /* Muted variant */

  /* Backgrounds — must shift between sections */
  --bg-void:    #0a0a0c;   /* Deepest dark */
  --bg-dark:    #111116;
  --bg-mid:     #1a1a24;
  --bg-light:   #f5f4f0;   /* Off-white, never pure white */
  --bg-accent:  #______;   /* Brand-tinted zone */

  /* Text */
  --text-primary: #f0ede8;
  --text-muted:   rgba(240,237,232,0.5);
  --text-dark:    #0f0f12;

  /* Depth */
  --shadow-color: ______;  /* Brand-tinted, low opacity */
}
```

Gradient philosophy:
- Layer 2-3 radial gradients, offset from each other
- Add SVG noise texture at 3-5% opacity for grain/depth
- Never flat backgrounds on hero sections

---

## Phase 2: Layout & Composition

### Spatial Rules
- **Never center everything** — alternate left / right / center / split / full-bleed
- **Intentional asymmetry** — pull elements across grid lines
- **Depth system**: base plane → elevated cards → floating CTAs (different z-planes, different shadows)
- **Negative space** is a design element — use it aggressively in luxury/minimal styles

### Section Rhythm
Every page needs all of these, in varied order:
1. **Hero** — full viewport, 3D canvas, massive typography
2. **Feature left** — text left, visual right
3. **Feature right** — text right, visual left
4. **Stats row** — large animated numbers, full width
5. **Marquee** — horizontal scrolling text at 10-15vw
6. **Bento/grid** — dense information grid
7. **CTA** — isolated, dramatic, conversion-focused

### No Cards, No Boxes
On dark, 3D, or scroll-driven sites:
- Text sits directly on the background — no glassmorphism, no frosted containers
- Readability via: font-weight 600+, text-shadow, ensuring bg has contrast at that scroll point
- Acceptable structure: generous section padding only

---

## Phase 3: Animation & Motion Masterclass

### Principles
- Animate ONLY `transform` and `opacity` — never layout properties
- Use `will-change: transform` on animated elements
- Easing: `power4.out` for entries, `power2.inOut` for transitions, `expo.out` for hero reveals
- Duration: 0.6s-1.4s for primary, 0.2s-0.4s for micro-interactions
- Stagger sequence: `label (0s) → h2 (0.08s) → p (0.16s) → button (0.24s)`

### GSAP Setup (canonical)
```js
import gsap from 'https://cdn.skypack.dev/gsap';
import { ScrollTrigger } from 'https://cdn.skypack.dev/gsap/ScrollTrigger';
import Lenis from 'https://cdn.skypack.dev/lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.4,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### Text Reveal (Split by words)
```js
function splitAndReveal(el, delay = 0) {
  const text = el.textContent;
  const words = text.split(' ');
  el.innerHTML = words.map(w => `<span class="word" style="display:inline-block;overflow:hidden">
    <span class="word-inner" style="display:inline-block">${w}</span>
  </span>`).join(' ');
  
  gsap.from(el.querySelectorAll('.word-inner'), {
    y: '105%',
    opacity: 0,
    duration: 1.1,
    stagger: 0.07,
    ease: 'power4.out',
    delay,
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
}
```

### Section Entrance System
Rotate through all — never repeat consecutively:
```js
const animations = {
  'fade-up':     { y: 70, opacity: 0 },
  'slide-left':  { x: -100, opacity: 0 },
  'slide-right': { x: 100, opacity: 0 },
  'scale-up':    { scale: 0.82, opacity: 0 },
  'clip-reveal': { clipPath: 'inset(100% 0 0 0)' },
  'rotate-in':   { y: 50, rotation: 4, opacity: 0 },
  'blur-in':     { filter: 'blur(20px)', opacity: 0, scale: 1.05 },
};
```

### Stats Counter (mandatory animation)
```js
function animateCounter(el) {
  const target = +el.dataset.target;
  const suffix = el.dataset.suffix || '';
  gsap.from({ val: 0 }, {
    val: target,
    duration: 2,
    ease: 'power2.out',
    snap: { val: 1 },
    onUpdate() { el.textContent = Math.round(this.targets()[0].val) + suffix; },
    scrollTrigger: { trigger: el, start: 'top 80%', once: true }
  });
}
```

### Horizontal Marquee
```js
function createMarquee(track) {
  const clone = track.innerHTML;
  track.innerHTML += clone; // duplicate for seamless loop
  gsap.to(track, {
    x: '-50%',
    duration: 20,
    ease: 'none',
    repeat: -1,
  });
}
```

### Pinned Section (at least one)
```js
ScrollTrigger.create({
  trigger: '.pin-section',
  start: 'top top',
  end: '+=200%',
  pin: true,
  scrub: 1,
  onUpdate: self => {
    // animate internal elements based on self.progress
  }
});
```

### Custom Cursor
```js
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  gsap.to(cursorDot, { x: cursorX, y: cursorY, duration: 0.1 });
  gsap.to(cursor, { x: cursorX, y: cursorY, duration: 0.4, ease: 'power2.out' });
});

// Hover states
document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursor, { scale: 2.5, duration: 0.3, ease: 'power2.out' });
    cursor.classList.add('cursor--hover');
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursor, { scale: 1, duration: 0.3 });
    cursor.classList.remove('cursor--hover');
  });
});
```

---

## Phase 4: 3D / WebGL (for landing pages)

When Three.js is in the stack, apply these standards (full detail in `/3d-website` skill):

### Renderer Config (canonical)
```js
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas-3d'),
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
```

### Lighting Setup (3-point + rim)
```js
const ambient = new THREE.AmbientLight(0xffffff, 0.2);
const key = new THREE.DirectionalLight(0xffffff, 3.0);
key.position.set(5, 8, 5);
key.castShadow = true;
const fill = new THREE.DirectionalLight(BRAND_COLOR, 1.2);
fill.position.set(-5, 0, 3);
const rim = new THREE.DirectionalLight(ACCENT_COLOR, 0.8);
rim.position.set(0, -5, -5);
// RectAreaLight for product/object pages:
const rect = new THREE.RectAreaLight(BRAND_COLOR, 4, 4, 4);
rect.position.set(0, 3, 3);
```

### Material Tiers
| Use case | Material | Key params |
|----------|----------|------------|
| Metal/luxury | MeshPhysicalMaterial | metalness:0.9, roughness:0.05, envMapIntensity:2 |
| Glass | MeshPhysicalMaterial | transmission:1, thickness:0.5, roughness:0 |
| Matte | MeshStandardMaterial | roughness:0.8, metalness:0 |
| Emissive glow | MeshStandardMaterial | emissive: color, emissiveIntensity: 1.5 |
| Particle | PointsMaterial or ShaderMaterial | custom shader for size attenuation |

### Post-Processing (EffectComposer)
```js
// Via CDN: three/examples/jsm/postprocessing/
import { EffectComposer } from '.../EffectComposer.js';
import { RenderPass } from '.../RenderPass.js';
import { UnrealBloomPass } from '.../UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.4,   // strength
  0.4,   // radius
  0.85   // threshold
));
// Render with composer.render() not renderer.render()
```

### Scroll-Driven 3D (scrubbed)
```js
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1.5,
  onUpdate: self => {
    const p = self.progress;
    // Camera dolly
    camera.position.z = gsap.utils.interpolate(5, 1.5, p);
    camera.position.y = Math.sin(p * Math.PI) * 2;
    // Object transform
    mesh.rotation.y = p * Math.PI * 6;
    mesh.rotation.x = p * Math.PI * 2;
    // Scale punch
    const s = 1 + Math.sin(p * Math.PI) * 0.35;
    mesh.scale.setScalar(s);
    // Material shift
    mat.emissiveIntensity = p * 1.5;
  }
});
```

### Mouse Parallax (laggy, organic)
```js
const mouse = new THREE.Vector2();
const targetRot = new THREE.Vector2();
document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
});
// In animation loop:
targetRot.x += (mouse.y * 0.25 - targetRot.x) * 0.04;
targetRot.y += (mouse.x * 0.25 - targetRot.y) * 0.04;
mesh.rotation.x = targetRot.x;
mesh.rotation.y = targetRot.y;
```

---

## Phase 5: Interactive States (Mandatory)

Every interactive element needs ALL four:
```css
.btn {
  /* Default */
  background: var(--brand);
  transform: translateY(0);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--brand) 30%, transparent);
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
              box-shadow 0.25s ease,
              background 0.2s ease;
}
.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--brand) 40%, transparent);
}
.btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 4px;
}
.btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px color-mix(in srgb, var(--brand) 20%, transparent);
}
```

---

## Phase 6: Visual Depth Techniques

### Layered Shadows (never flat shadow-md)
```css
.card {
  box-shadow:
    0 1px 2px rgba(0,0,0,0.1),
    0 4px 8px color-mix(in srgb, var(--brand) 8%, transparent),
    0 16px 32px rgba(0,0,0,0.2),
    0 40px 80px rgba(0,0,0,0.15);
}
```

### Grain Texture Overlay
```html
<svg style="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;opacity:0.04">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)"/>
</svg>
```

### Background Radial Gradient Stack
```css
.hero {
  background:
    radial-gradient(ellipse 80% 60% at 20% 30%, color-mix(in srgb, var(--brand) 15%, transparent) 0%, transparent 70%),
    radial-gradient(ellipse 60% 80% at 80% 70%, color-mix(in srgb, var(--brand-light) 10%, transparent) 0%, transparent 60%),
    var(--bg-void);
}
```

### Image Treatment
```css
.media-wrap {
  position: relative;
  overflow: hidden;
}
.media-wrap img {
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.media-wrap:hover img { transform: scale(1.04); }
.media-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  mix-blend-mode: multiply;
}
```

---

## Phase 7: Performance & Accessibility

### Performance
- Animate `transform` + `opacity` only — triggers compositor, not layout
- `will-change: transform` on elements animated on scroll
- Images: `loading="lazy"`, `decoding="async"`, explicit `width`/`height`
- Fonts: `font-display: swap`, preload critical display font
- Three.js: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`, dispose unused geometries
- `gsap.ticker.lagSmoothing(0)` to prevent GSAP from skipping frames
- Throttle mousemove with `requestAnimationFrame` on heavy parallax

### Accessibility
- All interactive elements: `tabindex`, `aria-label` where text isn't descriptive
- Color contrast: minimum 4.5:1 for body, 3:1 for large headings (WCAG AA)
- Motion: wrap non-essential animations in `@media (prefers-reduced-motion: no-preference)`
- Focus-visible on all interactive elements (never `outline: none` without replacement)
- Semantic HTML: `<main>`, `<section>`, `<article>`, `<nav>`, `<h1>-<h6>` hierarchy

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Mobile Strategy
- Canvas: still rendered, but reduced complexity (particle count /3, geometry segments /2)
- Scroll height: 400vh on mobile vs 600vh desktop
- Text alignment: center, not left/right split
- Semi-transparent dark overlay on sections where 3D bg might reduce contrast
- Touch events: `lenis` handles touch, `pointer-events: none` on canvas preserved
- Breakpoints: 768px (tablet), 480px (phone)

---

## Phase 8: Loading Sequence

### Cinematic Loader
```html
<div id="loader">
  <div class="loader-logo">BRAND</div>
  <div class="loader-bar-track"><div class="loader-bar"></div></div>
  <div class="loader-percent">0%</div>
</div>
```
```js
// Staged: logo reveal → bar fills → flash → content in
async function runLoader() {
  // 1. Logo slides up
  await gsap.from('.loader-logo', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' });
  // 2. Bar fills (min 1.2s)
  await new Promise(r => {
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p >= 100) { p = 100; clearInterval(tick); r(); }
      document.querySelector('.loader-bar').style.width = p + '%';
      document.querySelector('.loader-percent').textContent = Math.floor(p) + '%';
    }, 60);
  });
  // 3. Flash + exit
  await gsap.to('#loader', { opacity: 0, duration: 0.5, ease: 'power2.in' });
  document.getElementById('loader').remove();
  // 4. Hero elements enter
  revealHero();
}
```

---

## Phase 9: Quality Gates

Before calling done, verify every item:

**Visual**
- [ ] Hero heading ≥ 5rem, tight line-height, custom display font
- [ ] Background shifts color between at least 3 sections
- [ ] Every section uses a DIFFERENT entrance animation
- [ ] At least one pinned section
- [ ] At least one horizontal marquee element
- [ ] Stats count up with GSAP, never static
- [ ] Grain/noise texture overlay present
- [ ] Layered, brand-tinted shadows (never flat)
- [ ] Custom cursor active on desktop
- [ ] No glassmorphism cards on scroll-driven pages

**Technical**
- [ ] Lenis + ScrollTrigger correctly wired
- [ ] Three.js canvas: `alpha:true`, `pointer-events:none`, `position:fixed`
- [ ] `devicePixelRatio` capped at 2
- [ ] Resize handler for camera + renderer
- [ ] Mouse parallax multiplier ≤ 0.3
- [ ] `@media (prefers-reduced-motion)` guard on animations
- [ ] All interactive elements: hover + focus-visible + active states
- [ ] Loader fully complete before hero reveals

**Screenshots** (mandatory — do not skip)
- [ ] Full-page screenshot from localhost via `node screenshot.mjs`
- [ ] Mobile viewport screenshot (375px)
- [ ] At least 2 comparison rounds if reference exists

---

## Companion Reference Files

Read these when the task requires:

- **[motion.md](motion.md)** — Magnetic elements, View Transitions API, CSS native scroll-driven animations, spring physics, cinematic hero timeline, kinetic text skew, elastic navbar, horizontal scroll sections, GSAP Flip, diagonal grid reveal
- **[typography.md](typography.md)** — Font pairing library by aesthetic (cinematic/luxury/organic/brutalist/SaaS/retro), CSS type scale, variable font setup, anti-patterns
- **[color-systems.md](color-systems.md)** — Brand color derivation via HSL, 7 curated palettes, gradient recipes, Three.js color sync, WCAG contrast rules
- See also **[../3d-website/shaders.md](../3d-website/shaders.md)** for all GLSL shaders
- See also **[../3d-website/advanced.md](../3d-website/advanced.md)** for GPGPU, InstancedMesh, physics


## Anti-Patterns (Hard Rules)

| NEVER | INSTEAD |
|-------|---------|
| `transition-all` | Explicit property transitions |
| Inter, Roboto, Arial as display font | Clash Display, Syne, Cabinet Grotesk, etc. |
| Default Tailwind indigo/blue as brand | Custom color from brand assets or invented |
| Purple gradient on white | Any other combination |
| Glassmorphism cards on 3D pages | Text directly on dark background |
| `outline: none` | `outline: none; box-shadow: 0 0 0 2px var(--brand)` |
| Ambient light only in Three.js scene | 3-point lighting + rim |
| Static stats/numbers | GSAP counter animation |
| Same entrance animation repeated | Rotate through all 6+ types |
| `Math.random()` in animation loop | Pre-computed values |
| Space Grotesk (overused AI default) | Any of the listed alternatives |
