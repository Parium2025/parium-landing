'use strict';

// ── CONSTANTS ───────────────────────────────────────────────
const FRAME_COUNT  = 169;
const FRAME_SPEED  = 1.3;   // completes by ~77% scroll — keeps street scene during text
const IMAGE_SCALE  = 0.90;  // padded cover (0.85-0.92)

// ── DOM ─────────────────────────────────────────────────────
const loader       = document.getElementById('loader');
const loaderBar    = document.getElementById('loader-bar');
const loaderPct    = document.getElementById('loader-percent');
const heroSection  = document.querySelector('.hero-standalone');
const canvasWrap   = document.getElementById('canvas-wrap');
const canvas       = document.getElementById('canvas');
const ctx          = canvas.getContext('2d');
const scrollCont   = document.getElementById('scroll-container');
const darkOverlay  = document.getElementById('dark-overlay');
const marquee1     = document.getElementById('marquee-1');
const marquee2     = document.getElementById('marquee-2');

// ── STATE ───────────────────────────────────────────────────
const frames       = new Array(FRAME_COUNT);
let   loadedCount  = 0;
let   currentFrame = 0;
let   bgColor      = '#001935';

// ── GSAP SETUP ──────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── CANVAS RESIZE ────────────────────────────────────────────
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  canvas.width  = window.innerWidth  * DPR;
  canvas.height = window.innerHeight * DPR;
  ctx.scale(DPR, DPR);
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  drawFrame(currentFrame);
});

// ── BACKGROUND SAMPLER ───────────────────────────────────────
function sampleBgColor(img) {
  try {
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = 4;
    const t = tmp.getContext('2d');
    t.drawImage(img, 0, 0, 4, 4);
    const d = t.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch { return '#001935'; }
}

// ── DRAW FRAME ───────────────────────────────────────────────
function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete || !img.naturalWidth) return;

  const cw = canvas.width  / DPR;
  const ch = canvas.height / DPR;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

// ── PRELOADER ────────────────────────────────────────────────
function preloadFrames() {
  return new Promise(resolve => {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img  = new Image();
      const pad  = String(i + 1).padStart(4, '0');
      img.src    = `nframes/frame_${pad}.jpg`;

      img.onload = () => {
        loadedCount++;
        const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
        loaderBar.style.width  = pct + '%';
        loaderPct.textContent  = pct + '%';

        if (i === 0)        { drawFrame(0); bgColor = sampleBgColor(img); }
        if (i % 24 === 0)   bgColor = sampleBgColor(img);
        if (loadedCount === FRAME_COUNT) resolve();
      };
      img.onerror = () => { loadedCount++; if (loadedCount === FRAME_COUNT) resolve(); };
      frames[i]  = img;
    }
  });
}

// ── HERO → CANVAS TRANSITION ─────────────────────────────────
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   true,
    onUpdate(self) {
      const p = self.progress;

      // Hero fades out fast (first 7% of scroll)
      heroSection.style.opacity = Math.max(0, 1 - p * 16).toFixed(3);
      heroSection.style.pointerEvents = p > 0.06 ? 'none' : '';

      // Canvas circle-wipe expands
      const wipe = Math.min(1, Math.max(0, (p - 0.004) / 0.075));
      canvasWrap.style.clipPath = `circle(${(wipe * 80).toFixed(1)}% at 50% 50%)`;

      // Marquee 1: 8–23%
      marquee1.style.opacity = (p > 0.08 && p < 0.23) ? '1' : '0';
      // Marquee 2: 70–85%
      marquee2.style.opacity = (p > 0.70 && p < 0.85) ? '1' : '0';
    }
  });
}

// ── FRAME SCROLL BINDING ──────────────────────────────────────
function initFrameScroll() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   true,
    onUpdate(self) {
      const acc   = Math.min(self.progress * FRAME_SPEED, 1);
      const index = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
      if (index !== currentFrame) {
        currentFrame = index;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }
  });
}

// ── DARK OVERLAY ──────────────────────────────────────────────
// Stats: 0.91 opacity. CTA: fades to 0.55 so video brand shows subtly.
function initDarkOverlay() {
  const FADE_IN  = 0.59;  // start fade-in
  const STATS_ON = 0.62;  // full opacity for stats
  const CTA_IN   = 0.76;  // begin fade to partial for CTA
  const CTA_MID  = 0.82;  // settle at 0.55 opacity during CTA
  const END      = 0.96;  // fade out
  const FADE     = 0.03;

  ScrollTrigger.create({
    trigger: scrollCont,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   true,
    onUpdate(self) {
      const p = self.progress;
      let o = 0;
      if (p < FADE_IN) {
        o = 0;
      } else if (p < STATS_ON) {
        o = (p - FADE_IN) / (STATS_ON - FADE_IN) * 0.91;
      } else if (p < CTA_IN) {
        o = 0.91;
      } else if (p < CTA_MID) {
        o = 0.91 - (p - CTA_IN) / (CTA_MID - CTA_IN) * 0.36; // fades to 0.55
      } else if (p < END) {
        o = 0.55;
      } else {
        o = Math.max(0, 0.55 - (p - END) / FADE * 0.55);
      }
      darkOverlay.style.opacity = o.toFixed(3);
    }
  });
}

// ── MARQUEE HORIZONTAL SLIDE ──────────────────────────────────
function initMarquees() {
  [marquee1, marquee2].forEach(el => {
    const speed = parseFloat(el.dataset.scrollSpeed) || -20;
    gsap.to(el.querySelector('.marquee-text'), {
      xPercent: speed,
      ease:     'none',
      scrollTrigger: {
        trigger: scrollCont,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   true
      }
    });
  });
}

// ── SECTION ANIMATIONS ────────────────────────────────────────
function initSections() {
  document.querySelectorAll('.scroll-section').forEach(section => {
    const enterPct = parseFloat(section.dataset.enter) / 100;
    const leavePct = parseFloat(section.dataset.leave) / 100;
    const type     = section.dataset.animation;
    const persist  = section.dataset.persist === 'true';

    const children = Array.from(section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .cta-button, .cta-sub, .stat'
    ));
    if (!children.length) return;

    const tl = gsap.timeline({ paused: true });

    const staggerCfg = { stagger: 0.12, ease: 'power3.out' };

    switch (type) {
      case 'slide-left':
        tl.from(children, { x: -72, opacity: 0, duration: 0.88, ...staggerCfg });
        break;
      case 'slide-right':
        tl.from(children, { x: 72, opacity: 0, duration: 0.88, ...staggerCfg });
        break;
      case 'fade-up':
        tl.from(children, { y: 52, opacity: 0, duration: 0.9, ...staggerCfg });
        break;
      case 'scale-up':
        tl.from(children, { scale: 0.86, opacity: 0, duration: 1.0, ease: 'power2.out', stagger: 0.12 });
        break;
      case 'rotate-in':
        tl.from(children, { y: 42, rotation: 4, opacity: 0, duration: 0.92, ...staggerCfg });
        break;
      case 'stagger-up':
        tl.from(children, { y: 64, opacity: 0, duration: 0.85, stagger: 0.16, ease: 'power3.out' });
        break;
      case 'clip-reveal':
        tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, duration: 1.2, stagger: 0.15, ease: 'power4.inOut' });
        break;
    }

    let wasIn = false;

    ScrollTrigger.create({
      trigger: scrollCont,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   false,
      onUpdate(self) {
        const p   = self.progress;
        const inRange = p >= enterPct && p <= leavePct;

        if (inRange && !wasIn) {
          wasIn = true;
          section.style.opacity       = '1';
          section.style.pointerEvents = 'auto';
          tl.restart();
        } else if (!inRange && wasIn && !persist) {
          wasIn = false;
          tl.reverse();
          // Hide after reverse
          gsap.delayedCall(tl.duration(), () => {
            if (!persist) {
              section.style.opacity       = '0';
              section.style.pointerEvents = 'none';
            }
          });
        } else if (!inRange && wasIn && persist) {
          // Stay visible but stop reversing
        }
      }
    });
  });
}

// ── COUNTER ANIMATIONS ────────────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseFloat(el.dataset.value);
    ScrollTrigger.create({
      trigger: el.closest('.scroll-section'),
      start:   'top 70%',
      once:    true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.9, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('sv-SE'); }
        });
      }
    });
  });
}

// ── HERO ENTRANCE ANIMATION ───────────────────────────────────
function animateHeroIn() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.site-logo',        { opacity: 1, duration: 0.6 }, 0.2)
    .to('.nav-link',         { opacity: 1, duration: 0.5 }, 0.3)
    .to('.word',             { y: '0%', duration: 0.95, stagger: 0.1 }, 0.45)
    .to('.hero-tagline',     { opacity: 1, y: 0, duration: 0.75 }, 1.15)
    .to('.hero-scroll-arrow',{ opacity: 1, duration: 0.5 }, 1.5);
}

// ── TRANSPARENT LOGO ──────────────────────────────────────────
// Strip the solid background from logo.png via canvas sampling.
function makeLogoTransparent() {
  const logoEls = document.querySelectorAll('.site-logo, .footer-logo');
  if (!logoEls.length) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const SIZE = 256;
      const tmp  = document.createElement('canvas');
      tmp.width  = tmp.height = SIZE;
      const c    = tmp.getContext('2d');
      c.drawImage(img, 0, 0, SIZE, SIZE);
      const d    = c.getImageData(0, 0, SIZE, SIZE);

      // Sample background from corners
      const bgR = Math.round((d.data[0] + d.data[(SIZE-1)*4]) / 2);
      const bgG = Math.round((d.data[1] + d.data[(SIZE-1)*4+1]) / 2);
      const bgB = Math.round((d.data[2] + d.data[(SIZE-1)*4+2]) / 2);

      // Make bg-matching pixels transparent
      for (let i = 0; i < d.data.length; i += 4) {
        const diff = Math.abs(d.data[i]-bgR) + Math.abs(d.data[i+1]-bgG) + Math.abs(d.data[i+2]-bgB);
        if (diff < 60) d.data[i+3] = 0;
      }
      c.putImageData(d, 0, 0);

      const url = tmp.toDataURL('image/png');
      logoEls.forEach(el => { el.src = url; el.style.mixBlendMode = ''; el.style.filter = ''; });
    } catch { /* CORS or tainted canvas — leave as-is */ }
  };
  img.src = 'logo.png?' + Date.now(); // cache-bust for CORS
}

// ── BOOT ──────────────────────────────────────────────────────
makeLogoTransparent();

preloadFrames().then(() => {
  gsap.to(loader, {
    opacity: 0, duration: 0.55, delay: 0.15,
    onComplete: () => {
      loader.remove();
      initHeroTransition();
      initFrameScroll();
      initDarkOverlay();
      initMarquees();
      initSections();
      initCounters();
      animateHeroIn();
    }
  });
});
