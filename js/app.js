'use strict';

// ── LOADER ────────────────────────────────────────────────────
const loaderEl  = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');

let prog = 0;
const loadTick = setInterval(() => {
  prog += Math.random() * 16 + 4;
  if (prog >= 100) { prog = 100; clearInterval(loadTick); }
  loaderBar.style.width  = prog + '%';
  loaderPct.textContent  = Math.floor(prog) + '%';
}, 80);

setTimeout(() => {
  gsap.to(loaderEl, {
    opacity: 0, duration: 0.6,
    onComplete() { loaderEl.remove(); initScene(); }
  });
}, 1500);

// ── SCENE ─────────────────────────────────────────────────────
function initScene() {

  // Halos + rings materialise
  gsap.to(['.halo', '.spin-ring'], {
    opacity: 1, scale: 1,
    duration: 2.2, ease: 'power2.out',
    stagger: 0.1, delay: 0.05
  });

  // Phone — spring entrance
  gsap.fromTo('#phone-wrap',
    { opacity: 0, scale: 0.76, y: 55 },
    {
      opacity: 1, scale: 1, y: 0,
      duration: 1.9, ease: 'back.out(1.3)', delay: 0.15,
      onComplete: phoneFloat
    }
  );

  // Header + bottom label
  gsap.fromTo('#site-header',
    { opacity: 0, y: -8 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.6 }
  );
  gsap.fromTo('#bottom-label',
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.75 }
  );

  // Cards — spring entrance from sides
  document.querySelectorAll('.card').forEach(card => {
    const delay = parseFloat(card.dataset.delay ?? 0.8);
    const isRight = card.dataset.dir === 'right';
    gsap.fromTo(card,
      { opacity: 0, x: isRight ? 36 : -36, scale: 0.88 },
      {
        opacity: 1, x: 0, scale: 1,
        duration: 1.05, ease: 'back.out(1.5)',
        delay
      }
    );
  });

  // Cards — idle float (each unique)
  document.querySelectorAll('.card').forEach((card, i) => {
    const yAmt = -7 + (i % 3 - 1) * 2.5;
    const rot  = (i % 2 === 0 ? 0.4 : -0.4);
    gsap.to(card, {
      y: yAmt, rotation: rot,
      duration: 3.2 + i * 0.38,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
      delay: i * 0.22
    });
  });
}

// ── PHONE FLOAT ───────────────────────────────────────────────
function phoneFloat() {
  gsap.to('#phone-wrap', {
    y: -16, duration: 4.4,
    ease: 'sine.inOut', yoyo: true, repeat: -1
  });
}
