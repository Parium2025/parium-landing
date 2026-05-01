'use strict';

// ── GSAP + LENIS ───────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── THREE.JS SETUP ─────────────────────────────────────────────
const canvas3d  = document.getElementById('canvas-3d');
const scene     = new THREE.Scene();
const camera    = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
const renderer  = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, alpha: true });

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
camera.position.z = 10;

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

// ── GLOW TEXTURE ───────────────────────────────────────────────
function makeGlowTex(r, g, b) {
  const c   = document.createElement('canvas');
  c.width   = c.height = 64;
  const cx  = c.getContext('2d');
  const gr  = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0,    `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.3,  `rgba(${r},${g},${b},0.7)`);
  gr.addColorStop(0.65, `rgba(${r},${g},${b},0.2)`);
  gr.addColorStop(1,    `rgba(${r},${g},${b},0)`);
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const blueTex = makeGlowTex(26, 111, 255);
const tealTex = makeGlowTex(0,  207, 168);

// ── NETWORK GROUP ──────────────────────────────────────────────
const networkGroup = new THREE.Group();
scene.add(networkGroup);

// Hub node positions
const HUB_COUNT = 72;
const hubVecs   = [];

for (let i = 0; i < HUB_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  const r     = 1.0 + Math.random() * 5.0;
  hubVecs.push(new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta) * 0.5,
    r * Math.cos(phi)
  ));
}

// Split into blue (employers) and teal (candidates)
const blueArr = [], tealArr = [];
hubVecs.forEach((v, i) => {
  (i % 3 !== 0 ? blueArr : tealArr).push(v.x, v.y, v.z);
});

const blueGeo = new THREE.BufferGeometry();
blueGeo.setAttribute('position', new THREE.Float32BufferAttribute(blueArr, 3));
const bluePts = new THREE.Points(blueGeo, new THREE.PointsMaterial({
  size: 0.38, map: blueTex, transparent: true, opacity: 0.92,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
}));

const tealGeo = new THREE.BufferGeometry();
tealGeo.setAttribute('position', new THREE.Float32BufferAttribute(tealArr, 3));
const tealPts = new THREE.Points(tealGeo, new THREE.PointsMaterial({
  size: 0.34, map: tealTex, transparent: true, opacity: 0.88,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
}));

networkGroup.add(bluePts, tealPts);

// Connection lines between nearby nodes
const lineArr = [];
for (let i = 0; i < HUB_COUNT; i++) {
  for (let j = i + 1; j < HUB_COUNT; j++) {
    if (hubVecs[i].distanceTo(hubVecs[j]) < 3.0) {
      lineArr.push(
        hubVecs[i].x, hubVecs[i].y, hubVecs[i].z,
        hubVecs[j].x, hubVecs[j].y, hubVecs[j].z
      );
    }
  }
}
const lineGeo  = new THREE.BufferGeometry();
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineArr, 3));
const lineMat  = new THREE.LineBasicMaterial({
  color: 0x1a5aff, transparent: true, opacity: 0.18,
  blending: THREE.AdditiveBlending
});
const lineSegs = new THREE.LineSegments(lineGeo, lineMat);
networkGroup.add(lineSegs);

// ── AMBIENT PARTICLES ─────────────────────────────────────────
const AMB_COUNT = 3500;
const ambPos    = new Float32Array(AMB_COUNT * 3);
for (let i = 0; i < AMB_COUNT * 3; i++) ambPos[i] = (Math.random() - 0.5) * 24;
const ambGeo    = new THREE.BufferGeometry();
ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
const ambPts    = new THREE.Points(ambGeo, new THREE.PointsMaterial({
  size: 0.032, color: 0x2255bb, transparent: true, opacity: 0.5,
  blending: THREE.AdditiveBlending, depthWrite: false
}));
scene.add(ambPts);

// ── MOUSE PARALLAX ─────────────────────────────────────────────
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', e => {
  mouse.tx = (e.clientX / innerWidth  - 0.5) * 0.28;
  mouse.ty = (e.clientY / innerHeight - 0.5) * 0.28;
});

// ── SCROLL-DRIVEN 3D ──────────────────────────────────────────
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate(self) {
    const p  = self.progress;
    const ez = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    // Camera flies through the network
    camera.position.z = 10 - ez * 14;
    camera.position.y = Math.sin(p * Math.PI) * 0.9;
    camera.position.x = Math.sin(p * Math.PI * 1.8) * 0.35;

    // Network rotates as we scroll
    networkGroup.rotation.y = p * Math.PI * 2.2;

    // Connection lines brighten in the middle of the journey
    lineMat.opacity = 0.06 + Math.sin(p * Math.PI) * 0.36;

    // Ambient field drifts
    ambPts.rotation.y = p * Math.PI * 0.6;

    // Marquee: show between stats and CTA
    const marquee = document.getElementById('marquee-mid');
    if (marquee) {
      if (p > 0.63 && p < 0.70) marquee.classList.add('visible');
      else                       marquee.classList.remove('visible');
    }

    updateSections(p);
  }
});

// ── SECTION SYSTEM ────────────────────────────────────────────
const sectionVis    = new Map();
let   countersRun   = false;

function positionSections() {
  const totalH     = document.getElementById('scroll-wrap').offsetHeight;
  const scrollableH = totalH - window.innerHeight;

  document.querySelectorAll('.section[data-enter]').forEach(sec => {
    const enter = parseFloat(sec.dataset.enter) / 100;
    const leave = parseFloat(sec.dataset.leave) / 100;
    const mid   = (enter + leave) / 2;

    // Hero (enter=0) anchors at top of page; others center in viewport at their midpoint
    if (enter === 0) {
      sec.style.top = '0px';
    } else {
      sec.style.top = (mid * scrollableH) + 'px';
    }

    sectionVis.set(sec, false);
    gsap.set(getAnimEls(sec), { opacity: 0 });
  });

  // Marquee at 66.5% scroll depth
  const marquee = document.getElementById('marquee-mid');
  if (marquee) marquee.style.top = (0.665 * scrollableH) + 'px';
}

function getAnimEls(sec) {
  return sec.querySelectorAll('.label, h1, h2, p, .cta-group, .stats-row, .btn-primary');
}

function animateIn(sec) {
  const anim = sec.dataset.animation || 'fade-up';
  const els  = getAnimEls(sec);

  const fromVars = {
    'fade-up':    { y: 70,  opacity: 0 },
    'slide-left': { x: -90, opacity: 0 },
    'slide-right':{ x:  90, opacity: 0 },
    'scale-up':   { scale: 0.86, opacity: 0 },
    'stagger-up': { y: 55,  opacity: 0 },
  }[anim] || { y: 70, opacity: 0 };

  gsap.fromTo(els,
    { ...fromVars },
    { x: 0, y: 0, scale: 1, opacity: 1, stagger: 0.1, duration: 0.9, ease: 'power3.out' }
  );
}

function animateOut(sec) {
  gsap.to(getAnimEls(sec), { opacity: 0, duration: 0.28, ease: 'power2.in' });
}

function updateSections(p) {
  document.querySelectorAll('.section[data-enter]').forEach(sec => {
    const enter   = parseFloat(sec.dataset.enter) / 100;
    const leave   = parseFloat(sec.dataset.leave) / 100;
    const vis     = sectionVis.get(sec);
    const inRange = p >= enter && p <= leave;

    if (inRange && !vis) {
      sec.classList.add('visible');
      sectionVis.set(sec, true);
      animateIn(sec);
      if (sec.classList.contains('section-stats') && !countersRun) {
        countersRun = true;
        runCounters();
      }
    } else if (!inRange && vis) {
      sec.classList.remove('visible');
      sectionVis.set(sec, false);
      animateOut(sec);
      if (sec.classList.contains('section-stats')) countersRun = false;
    }
  });
}

function runCounters() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = parseInt(el.dataset.target);
    gsap.fromTo(el,
      { textContent: 0 },
      {
        textContent: target,
        duration: 1.6, ease: 'power2.out',
        snap: { textContent: 1 },
        onUpdate() {
          el.textContent = Math.ceil(parseFloat(el.textContent)).toLocaleString('sv-SE');
        }
      }
    );
  });
}

// ── RENDER LOOP ────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Smooth mouse follow
  mouse.x += (mouse.tx - mouse.x) * 0.045;
  mouse.y += (mouse.ty - mouse.y) * 0.045;

  // Mouse parallax on entire scene
  scene.rotation.x = mouse.y * 0.1;
  scene.rotation.y = mouse.x * 0.1;

  // Idle: gentle X-tilt on the network (doesn't fight scroll Y rotation)
  networkGroup.rotation.x = Math.sin(t * 0.11) * 0.07;

  // Nodes breathe
  const pulse = 1 + Math.sin(t * 0.9) * 0.055;
  bluePts.material.size = 0.38 * pulse;
  tealPts.material.size = 0.34 * pulse;

  renderer.render(scene, camera);
}
animate();

// ── LOADER ─────────────────────────────────────────────────────
const loaderEl  = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');

let prog = 0;
const tick = setInterval(() => {
  prog += Math.random() * 16 + 4;
  if (prog >= 100) { prog = 100; clearInterval(tick); }
  loaderBar.style.width = prog + '%';
  loaderPct.textContent = Math.floor(prog) + '%';
}, 80);

setTimeout(() => {
  gsap.to(loaderEl, {
    opacity: 0, duration: 0.65,
    onComplete: () => {
      loaderEl.remove();
      positionSections();
      updateSections(0);
      animatePhoneIn();
    }
  });
}, 1500);

// ── SPLINE PHONE ───────────────────────────────────────────────
const phoneWrap = document.getElementById('phone-3d');

function animatePhoneIn() {
  if (!phoneWrap) return;

  // Entrance: flies in from right with spring
  gsap.fromTo(phoneWrap,
    { opacity: 0, x: 120, scale: 0.82, rotationY: -18 },
    {
      opacity: 1, x: 0, scale: 1, rotationY: 0,
      duration: 1.5, ease: 'power3.out', delay: 0.2,
      onComplete: startPhoneFloat
    }
  );

  // Hover lift
  phoneWrap.addEventListener('mouseenter', () => {
    gsap.to(phoneWrap, { y: -14, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
  });
  phoneWrap.addEventListener('mouseleave', () => {
    gsap.to(phoneWrap, { y: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)', overwrite: 'auto' });
  });
}

let floatTween = null;
function startPhoneFloat() {
  if (!phoneWrap) return;
  floatTween = gsap.to(phoneWrap, {
    y: -18, duration: 2.8, ease: 'sine.inOut',
    yoyo: true, repeat: -1
  });
}

// Scroll-driven: phone drifts right and fades as hero exits
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: 'top top',
  end: '13% top',
  scrub: 1.2,
  onUpdate(self) {
    if (!phoneWrap) return;
    const p = self.progress;
    gsap.set(phoneWrap, {
      x: p * 80,
      opacity: 1 - p * 1.4
    });
    if (p > 0.05 && floatTween) { floatTween.pause(); }
    else if (p <= 0.05 && floatTween) { floatTween.resume(); }
  }
});
