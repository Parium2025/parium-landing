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

// ── SCROLL-DRIVEN ─────────────────────────────────────────────
let phoneReady = false;

ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate(self) {
    const p = self.progress;

    // Phone fades out as we scroll past hero
    const phoneWrap = document.getElementById('phone-wrap');
    if (phoneWrap && phoneReady) {
      const fade = p < 0.10 ? 1 : p < 0.18 ? (0.18 - p) / 0.08 : 0;
      phoneWrap.style.opacity = fade;
    }

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
const sectionVis  = new Map();
let   countersRun = false;

function positionSections() {
  const totalH      = document.getElementById('scroll-wrap').offsetHeight;
  const scrollableH = totalH - window.innerHeight;

  document.querySelectorAll('.section[data-enter]').forEach(sec => {
    const enter = parseFloat(sec.dataset.enter) / 100;
    const leave = parseFloat(sec.dataset.leave) / 100;
    const mid   = (enter + leave) / 2;

    if (enter === 0) {
      sec.style.top = '0px';
    } else {
      sec.style.top = (mid * scrollableH) + 'px';
    }

    sectionVis.set(sec, false);
    gsap.set(getAnimEls(sec), { opacity: 0 });
  });

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

      // Phone entrance
      const phoneWrap = document.getElementById('phone-wrap');
      if (phoneWrap) {
        gsap.fromTo(phoneWrap,
          { opacity: 0, x: 120, scale: 0.88 },
          {
            opacity: 1, x: 0, scale: 1,
            duration: 1.6, ease: 'power3.out', delay: 0.15,
            onComplete() {
              phoneReady = true;
              gsap.to(phoneWrap, {
                y: -20, duration: 4, ease: 'sine.inOut',
                yoyo: true, repeat: -1
              });
            }
          }
        );
      }
    }
  });
}, 1500);
