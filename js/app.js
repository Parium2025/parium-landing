'use strict';

// ── LOADER ────────────────────────────────────────────────────
const loaderEl  = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');

let prog = 0;
const loadTick = setInterval(() => {
  prog += Math.random() * 16 + 4;
  if (prog >= 100) { prog = 100; clearInterval(loadTick); }
  loaderBar.style.width = prog + '%';
  loaderPct.textContent = Math.floor(prog) + '%';
}, 80);

setTimeout(() => {
  gsap.to(loaderEl, {
    opacity: 0, duration: 0.6,
    onComplete() { loaderEl.remove(); initScene(); }
  });
}, 1500);

// ── MOUSE PARALLAX STATE ──────────────────────────────────────
let parallaxOn = false;
let tRotX = 0, tRotY = 0;
let cRotX = 0, cRotY = 0;

const setRotX = gsap.quickSetter('#phone-wrap', 'rotateX', 'deg');
const setRotY = gsap.quickSetter('#phone-wrap', 'rotateY', 'deg');

document.addEventListener('mousemove', e => {
  if (!parallaxOn) return;
  const mx = e.clientX - innerWidth  / 2;
  const my = e.clientY - innerHeight / 2;
  tRotY =  Math.max(-8, Math.min(8,  (mx / 300) * 8));
  tRotX = -Math.max(-8, Math.min(8,  (my / 300) * 8));
});

gsap.ticker.add(() => {
  if (!parallaxOn) return;
  cRotX += (tRotX - cRotX) * 0.06;
  cRotY += (tRotY - cRotY) * 0.06;
  setRotX(cRotX);
  setRotY(cRotY);
});

// ── INIT ──────────────────────────────────────────────────────
function initScene() {

  // Halos + spin rings
  gsap.to(['.halo', '.spin-ring'], {
    opacity: 1, duration: 2.2, ease: 'power2.out', stagger: 0.08
  });

  // Phone entrance — matches Framer component exactly:
  // initial: opacity 0, y 140, scale 0.9, rotateX 20
  // animate: opacity 1, y 0,   scale 1,   rotateX 0
  // ease cubic-bezier(0.16, 1, 0.3, 1) ≈ expo.out
  gsap.fromTo('#phone-wrap',
    { opacity: 0, y: 140, scale: 0.9, rotateX: 20 },
    {
      opacity: 1, y: 0, scale: 1, rotateX: 0,
      duration: 1.8, ease: 'expo.out', delay: 0.15,
      onComplete() {
        parallaxOn = true;
        phoneFloat();
        reflectionSweep();
      }
    }
  );

  // Header + label
  gsap.fromTo('#site-header',
    { opacity: 0, y: -8 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.6 }
  );
  gsap.fromTo('#bottom-label',
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.75 }
  );

  // Cards spring entrance from sides
  document.querySelectorAll('.card').forEach(card => {
    const delay  = parseFloat(card.dataset.delay ?? 0.8);
    const isRight = card.dataset.dir === 'right';
    gsap.fromTo(card,
      { opacity: 0, x: isRight ? 38 : -38, scale: 0.88 },
      { opacity: 1, x: 0, scale: 1, duration: 1.05, ease: 'back.out(1.5)', delay }
    );
  });

  // Cards idle float
  document.querySelectorAll('.card').forEach((card, i) => {
    gsap.to(card, {
      y: -7 + (i % 3 - 1) * 2.5,
      rotation: i % 2 === 0 ? 0.4 : -0.4,
      duration: 3.2 + i * 0.38,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
      delay: i * 0.22
    });
  });
}

// ── PHONE FLOAT ───────────────────────────────────────────────
// Float is on #phone-float (inner), not #phone-wrap (parallax layer)
function phoneFloat() {
  gsap.to('#phone-float', {
    y: -8, duration: 6,
    ease: 'sine.inOut', yoyo: true, repeat: -1
  });
}

// ── REFLECTION SWEEP ──────────────────────────────────────────
// Matches Framer: x -120%→120%, opacity [0, 0.25, 0], 2.5s, easeInOut
function reflectionSweep() {
  const tl = gsap.timeline({ delay: 0.8 });
  tl.set('.phone-reflect', { x: '-120%', opacity: 0 })
    .to('.phone-reflect', { x: '120%', duration: 2.5, ease: 'power2.inOut' })
    .to('.phone-reflect', { opacity: 0.25, duration: 0.7, ease: 'power1.in' }, 0)
    .to('.phone-reflect', { opacity: 0,    duration: 0.9, ease: 'power1.out' }, 1.6);
}
