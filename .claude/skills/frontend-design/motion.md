# Motion Masterclass — Magnetic UI, Page Transitions, Advanced GSAP

---

## 1. Magnetic Elements

```js
class MagneticElement {
  constructor(el, options = {}) {
    this.el       = el;
    this.strength = options.strength || 0.35;
    this.radius   = options.radius   || 120;
    this.ease     = options.ease     || 0.12;
    this._x = 0; this._y = 0; this._targetX = 0; this._targetY = 0; this._raf = null;

    el.addEventListener('mousemove',  this._onMove.bind(this));
    el.addEventListener('mouseleave', this._onLeave.bind(this));
  }

  _onMove(e) {
    const rect = this.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < this.radius) {
      const pull = (1 - dist / this.radius) * this.strength;
      this._targetX = dx * pull;
      this._targetY = dy * pull;
      if (!this._raf) this._animate();
    }
  }

  _onLeave() { this._targetX = 0; this._targetY = 0; }

  _animate() {
    this._x += (this._targetX - this._x) * this.ease;
    this._y += (this._targetY - this._y) * this.ease;
    gsap.set(this.el, { x: this._x, y: this._y });
    if (Math.abs(this._x - this._targetX) > 0.1 || Math.abs(this._y - this._targetY) > 0.1) {
      this._raf = requestAnimationFrame(this._animate.bind(this));
    } else {
      gsap.set(this.el, { x: this._targetX, y: this._targetY });
      this._raf = null;
    }
  }
}

// Apply
document.querySelectorAll('.btn-primary, .logo, .icon-btn').forEach(el => {
  new MagneticElement(el, { strength: 0.3, radius: 100 });
});
```

---

## 2. View Transitions API (native page transitions)

```js
async function navigateTo(href) {
  if (!document.startViewTransition) { window.location.href = href; return; }
  const transition = document.startViewTransition(async () => {
    const html = await (await fetch(href)).text();
    document.body.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
    initPage();
  });
  await transition.finished;
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || a.hostname !== location.hostname || a.target === '_blank') return;
  e.preventDefault();
  navigateTo(a.href);
});
```

```css
::view-transition-old(root) { animation: 400ms cubic-bezier(.4,0,.2,1) both page-out; }
::view-transition-new(root) { animation: 400ms cubic-bezier(.4,0,.2,1) both page-in;  }

@keyframes page-out { to   { opacity: 0; transform: translateY(-2%) scale(0.98); } }
@keyframes page-in  { from { opacity: 0; transform: translateY( 2%) scale(0.98); } }

/* Named element (hero image morphs across pages) */
.hero-image { view-transition-name: hero-img; }
```

---

## 3. CSS Native Scroll-Driven Animations

```css
/* Reveal on scroll — zero JS */
.reveal {
  animation: fadeUp linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scroll progress bar */
.scroll-progress {
  position: fixed; top: 0; left: 0; height: 2px;
  background: var(--brand); transform-origin: left;
  animation: progress linear; animation-timeline: scroll(root);
}
@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* Parallax */
.hero-bg {
  animation: parallax linear;
  animation-timeline: scroll(root);
  animation-range: 0% 50%;
}
@keyframes parallax { from { transform: translateY(0); } to { transform: translateY(20%); } }
```

---

## 4. Spring Physics (no library)

```js
class Spring {
  constructor({ stiffness = 200, damping = 20, mass = 1, initial = 0 } = {}) {
    this.stiffness = stiffness; this.damping = damping; this.mass = mass;
    this.value = initial; this.velocity = 0; this.target = initial;
  }
  update(dt = 0.016) {
    const a = (-this.stiffness * (this.value - this.target) - this.damping * this.velocity) / this.mass;
    this.velocity += a * dt;
    this.value    += this.velocity * dt;
    return this.value;
  }
  setTarget(v) { this.target = v; }
}

// Spring cursor
const sx = new Spring({ stiffness: 180, damping: 18 });
const sy = new Spring({ stiffness: 180, damping: 18 });
document.addEventListener('mousemove', e => { sx.setTarget(e.clientX); sy.setTarget(e.clientY); });
(function loop() { requestAnimationFrame(loop); gsap.set('.cursor-outer', { x: sx.update(), y: sy.update() }); })();
```

---

## 5. Cinematic Hero Timeline

```js
function cinematicReveal() {
  const tl = gsap.timeline({ delay: 0.1 });
  tl.from('#canvas-3d', { opacity: 0, duration: 1.5 }, 0);
  tl.from('.hero .label', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.3);
  tl.from(document.querySelectorAll('.hero h1 .word-inner'), {
    y: '110%', duration: 1.1, stagger: 0.07, ease: 'power4.out'
  }, 0.5);
  tl.from('.hero-sub', { y: 25, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.9);
  tl.from('.hero .btn', { y: 20, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.1, ease: 'back.out(1.5)' }, 1.1);
  return tl;
}
```

---

## 6. Scroll-Speed Kinetic Text (velocity-reactive skew)

```js
let velocity = 0;
let currentSkew = 0;
lenis.on('scroll', ({ velocity: v }) => { velocity = v; });

(function loop() {
  requestAnimationFrame(loop);
  const targetSkew = Math.min(Math.max(velocity * 0.5, -8), 8);
  currentSkew += (targetSkew - currentSkew) * 0.08;
  document.querySelectorAll('.kinetic-text').forEach(el => {
    gsap.set(el, { skewX: currentSkew, filter: `blur(${Math.abs(currentSkew) * 0.25}px)` });
  });
})();
```

---

## 7. Elastic Navbar

```js
let lastScroll = 0;
let navVisible = true;
const nav = document.querySelector('.site-header');

lenis.on('scroll', ({ scroll }) => {
  const delta = scroll - lastScroll;
  lastScroll  = scroll;
  if (delta > 4 && navVisible && scroll > 100) {
    gsap.to(nav, { yPercent: -120, duration: 0.5, ease: 'power3.inOut' });
    navVisible = false;
  } else if (delta < -4 && !navVisible) {
    gsap.to(nav, { yPercent: 0, duration: 0.6, ease: 'back.out(1.2)' });
    navVisible = true;
  }
  nav.style.backdropFilter = `blur(${Math.min(scroll / 100 * 12, 12)}px)`;
  nav.style.background = `rgba(10,10,12,${Math.min(scroll / 200, 0.9)})`;
});
```

---

## 8. Horizontal Scroll Section (Apple-style)

```js
const panels = gsap.utils.toArray('.h-panel');
const hSection = document.querySelector('.h-scroll-section');

const scrollTween = gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: hSection,
    start: 'top top',
    end: () => `+=${hSection.offsetWidth * (panels.length - 1)}`,
    scrub: 1.5,
    pin: true,
    snap: { snapTo: 1 / (panels.length - 1), duration: { min: 0.2, max: 0.8 }, ease: 'power1.inOut' },
  }
});

panels.forEach(panel => {
  const content = panel.querySelectorAll('h2, p, .btn');
  ScrollTrigger.create({
    containerAnimation: scrollTween,
    trigger: panel,
    start: 'left center',
    onEnter: () => gsap.from(content, { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 }),
  });
});
```

---

## 9. GSAP Flip — Layout Morphing

```js
import { Flip } from 'https://cdn.skypack.dev/gsap/Flip';
gsap.registerPlugin(Flip);

const items = document.querySelectorAll('.grid-item');
document.querySelector('.toggle-layout').addEventListener('click', () => {
  const state = Flip.getState(items);
  document.querySelector('.grid').classList.toggle('expanded');
  Flip.from(state, { duration: 0.7, ease: 'power3.inOut', stagger: 0.05, absolute: true });
});
```

---

## 10. Diagonal Grid Reveal

```js
ScrollTrigger.create({
  trigger: '.feature-grid',
  start: 'top 70%',
  once: true,
  onEnter: () => {
    const cols = 3;
    document.querySelectorAll('.grid-card').forEach((card, i) => {
      const delay = (Math.floor(i / cols) + (i % cols)) * 0.08;
      gsap.from(card, { y: 50, opacity: 0, scale: 0.92, duration: 0.8, delay, ease: 'power3.out' });
    });
  }
});
```

---

## Cheat Sheet

| Effect | Key param | Ease | Duration |
|--------|-----------|------|----------|
| Word reveal | y:'110%' | power4.out | 1.1s |
| Magnetic | strength 0.3, radius 100 | lerp 0.12 | realtime |
| Nav hide | yPercent:-120 | power3.inOut | 0.5s |
| Nav show | yPercent:0 | back.out(1.2) | 0.6s |
| Kinetic skew | velocity × 0.5 | lerp 0.08 | realtime |
| Page transition | View Transitions API | CSS | 0.4s |
| Layout morph | GSAP Flip | power3.inOut | 0.7s |
| H-scroll | xPercent scrub | none + snap | scrub 1.5 |
| Spring cursor | stiffness 180, damping 18 | — | realtime |
