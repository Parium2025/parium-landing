# Typography Pairings — Premium Font System

Always load from Google Fonts or Fontshare. Never use system fonts as display font.

---

## Pairing Library by Aesthetic

### Dark / Cinematic / Tech
| Display | Body | Character |
|---------|------|-----------|
| Bebas Neue | DM Sans | Bold, industrial, Spotify-like |
| Syne (800) | Instrument Sans | Geometric, futuristic |
| Space Grotesk (700) — AVOID (overused) | — | — |
| Neue Machina | Inter — AVOID | Mechanical, terminal-feel |
| Cabinet Grotesk (800) | General Sans | Confident, modern |

Best combo: **Syne 800 + Instrument Sans 400/500**

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

---

### Luxury / High-End / Minimal
| Display | Body | Character |
|---------|------|-----------|
| Playfair Display | DM Sans | Classic editorial |
| Editorial New (Fontshare) | Satoshi | Fashion magazine |
| Cormorant Garamond | Jost | Haute couture |
| Libre Baskerville | Nunito Sans | Refined, trustworthy |
| PP Editorial New | General Sans | Contemporary luxury |

Best combo: **Cormorant Garamond 700italic + DM Sans 400**

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap" rel="stylesheet">
```

---

### Organic / Natural / Wellness
| Display | Body | Character |
|---------|------|-----------|
| Recoleta | Mulish | Warm, rounded |
| Fraunces | Source Sans 3 | Natural, handcrafted |
| Lora | Nunito | Approachable, earthy |
| Gloock | Plus Jakarta Sans | Premium wellness |

Best combo: **Fraunces 700 + Plus Jakarta Sans 400**

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

---

### Brutalist / Editorial / Raw
| Display | Body | Character |
|---------|------|-----------|
| Bebas Neue | IBM Plex Mono | Industrial |
| Archivo Black | Archivo | Bold Swiss |
| Anton | Roboto Condensed | Newspaper |
| Barlow Condensed 900 | Barlow 400 | Dense editorial |

Best combo: **Archivo Black + IBM Plex Mono 400**

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

### Playful / Product / SaaS
| Display | Body | Character |
|---------|------|-----------|
| Clash Display (Fontshare) | Satoshi | Young, startup |
| Nunito (900) | Nunito | Rounded, friendly |
| Poppins (800) | Poppins | Clean, approachable |
| Cabinet Grotesk (800) | Cabinet Grotesk 400 | Confident SaaS |

Best combo: **Cabinet Grotesk 800 + DM Sans 400**

Fontshare CDN:
```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap" rel="stylesheet">
```

---

### Retro / Futurist / Sci-Fi
| Display | Body | Character |
|---------|------|-----------|
| Orbitron (700) | Rajdhani | Space, tech |
| Audiowide | Exo 2 | Sci-fi |
| Oxanium | Jura | Cyberpunk |
| Chakra Petch | IBM Plex Sans | Terminal-era |

Best combo: **Oxanium 700 + IBM Plex Sans 400**

```html
<link href="https://fonts.googleapis.com/css2?family=Oxanium:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">
```

---

## CSS Type Scale (apply once, always)

```css
:root {
  --font-display: 'CHOSEN_DISPLAY', sans-serif;
  --font-body:    'CHOSEN_BODY',    sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Scale */
  --text-hero:    clamp(5rem,   11vw, 14rem);
  --text-h2:      clamp(3rem,   6vw,  7rem);
  --text-h3:      clamp(2rem,   3.5vw, 4rem);
  --text-lead:    clamp(1.1rem, 1.5vw, 1.4rem);
  --text-body:    1.05rem;
  --text-small:   0.875rem;
  --text-label:   0.65rem;

  /* Weight tokens */
  --fw-black:  900;
  --fw-bold:   700;
  --fw-semi:   600;
  --fw-medium: 500;
  --fw-normal: 400;
}

h1 {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: var(--fw-black);
  line-height: 0.88;
  letter-spacing: -0.03em;
}
h2 {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--fw-bold);
  line-height: 0.92;
  letter-spacing: -0.025em;
}
h3 {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: var(--fw-semi);
  line-height: 1.0;
}
.label {
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--text-muted);
}
p, .body-text {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: var(--fw-normal);
  line-height: 1.72;
  color: var(--text-muted);
  max-width: 58ch;
}
.marquee-text {
  font-family: var(--font-display);
  font-size: clamp(10vw, 12vw, 15vw);
  font-weight: var(--fw-black);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1;
}
```

---

## Variable Font Performance (when available)

```css
/* Single file, full weight range — no separate bold request */
@font-face {
  font-family: 'Satoshi';
  src: url('assets/fonts/Satoshi-Variable.woff2') format('woff2');
  font-weight: 300 900;
  font-style: normal;
  font-display: swap;
}

/* Preload critical display font */
<link rel="preload" href="assets/fonts/DisplayFont-Bold.woff2" as="font" type="font/woff2" crossorigin>
```

---

## Anti-Patterns

| Never | Because |
|-------|---------|
| Inter as hero display font | Generic, everywhere, forgettable |
| Same font for heading + body | No tension, no hierarchy |
| Space Grotesk | Overused AI/SaaS cliché |
| font-weight 400 on hero h1 | Weak, unconvincing |
| line-height > 1.1 on display text | Looks amateurish at large sizes |
| letter-spacing: normal on headings | Missing -0.02em to -0.04em tightness |
| All-caps on body text | Unreadable at length |
