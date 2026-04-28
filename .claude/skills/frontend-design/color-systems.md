# Color Systems — Brand Derivation & Premium Palettes

---

## Step 1: Pick One Hero Color

Never pick from default Tailwind palette. Pick from:
- Brand assets (always wins)
- A specific emotion: trust → deep teal/navy, desire → warm amber/terracotta, power → near-black with electric accent, luxury → dark charcoal + gold, innovation → electric blue-violet

---

## Step 2: Derive the Full System (CSS)

```css
:root {
  /* ── Core brand ──────────────────────────────────────────── */
  --brand-h: 245;          /* HSL hue of your hero color      */
  --brand-s: 80%;          /* saturation                      */
  --brand-l: 60%;          /* lightness                       */

  --brand:       hsl(var(--brand-h), var(--brand-s), var(--brand-l));
  --brand-light: hsl(var(--brand-h), calc(var(--brand-s) - 10%), 75%);
  --brand-dark:  hsl(var(--brand-h), var(--brand-s), 35%);
  --brand-dim:   hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.15);
  --brand-glow:  hsla(var(--brand-h), var(--brand-s), var(--brand-l), 0.35);

  /* ── Neutrals (always slightly tinted toward brand hue) ─── */
  --bg-void:    hsl(var(--brand-h), 15%, 5%);   /* deepest dark */
  --bg-dark:    hsl(var(--brand-h), 12%, 8%);
  --bg-mid:     hsl(var(--brand-h), 10%, 12%);
  --bg-surface: hsl(var(--brand-h), 8%,  16%);
  --bg-light:   hsl(var(--brand-h), 8%,  96%);  /* off-white */
  --bg-accent:  hsl(var(--brand-h), 25%, 10%);  /* tinted section bg */

  /* ── Text ───────────────────────────────────────────────── */
  --text:        hsl(var(--brand-h), 10%, 93%);
  --text-muted:  hsla(var(--brand-h), 10%, 93%, 0.45);
  --text-dark:   hsl(var(--brand-h), 10%, 8%);

  /* ── Shadow (brand-tinted, layered) ─────────────────────── */
  --shadow-sm:
    0 1px 2px  hsla(var(--brand-h), 50%, 5%, 0.12),
    0 4px 8px  var(--brand-dim);

  --shadow-md:
    0 1px 2px  hsla(var(--brand-h), 50%, 5%, 0.1),
    0 4px 8px  var(--brand-dim),
    0 16px 32px hsla(var(--brand-h), 50%, 5%, 0.2);

  --shadow-lg:
    0 1px 2px  hsla(var(--brand-h), 50%, 5%, 0.1),
    0 8px 16px var(--brand-dim),
    0 32px 64px hsla(var(--brand-h), 50%, 5%, 0.25),
    0 64px 128px hsla(var(--brand-h), 50%, 5%, 0.15);

  /* ── Glow (for 3D canvas complement) ────────────────────── */
  --glow: 0 0 60px var(--brand-glow), 0 0 120px var(--brand-dim);
}
```

---

## Curated Brand Palettes (ready to use)

### Electric Indigo (tech / AI / innovation)
```css
--brand:       #6c63ff;
--brand-light: #9b94ff;
--brand-dark:  #3d36cc;
--bg-void:     #07070f;
--bg-dark:     #0e0e1a;
--bg-accent:   #110e28;
--text:        #ededf5;
```

### Amber / Flame (energy / startup / bold)
```css
--brand:       #ff6b35;
--brand-light: #ff9264;
--brand-dark:  #cc4412;
--bg-void:     #0f0904;
--bg-dark:     #180e06;
--bg-accent:   #1f1008;
--text:        #f5ede8;
```

### Deep Teal (trust / health / fintech)
```css
--brand:       #00c9a7;
--brand-light: #5de0c9;
--brand-dark:  #008f77;
--bg-void:     #040f0e;
--bg-dark:     #071614;
--bg-accent:   #091f1c;
--text:        #e8f5f3;
```

### Electric Gold (luxury / premium / exclusive)
```css
--brand:       #d4a843;
--brand-light: #e8c97a;
--brand-dark:  #9b7620;
--bg-void:     #0a0804;
--bg-dark:     #130f06;
--bg-accent:   #1a1408;
--text:        #f5f0e8;
```

### Crimson (bold / fashion / gaming)
```css
--brand:       #e5204c;
--brand-light: #f05c7f;
--brand-dark:  #a81234;
--bg-void:     #0f0407;
--bg-dark:     #180609;
--bg-accent:   #200810;
--text:        #f5e8ec;
```

### Arctic Blue (clean / SaaS / minimal)
```css
--brand:       #0ea5e9;
--brand-light: #38bdf8;
--brand-dark:  #0369a1;
--bg-void:     #040810;
--bg-dark:     #060c18;
--bg-accent:   #080f20;
--text:        #e8f1f8;
```

### Sage / Forest (wellness / organic / sustainable)
```css
--brand:       #5a9b6e;
--brand-light: #84bb94;
--brand-dark:  #3a6e4a;
--bg-void:     #060c08;
--bg-dark:     #0a130c;
--bg-accent:   #0f1c11;
--text:        #eaf2ec;
```

---

## Background Gradient Recipes

### Hero gradient (always use on hero sections — never flat bg)
```css
.hero {
  background:
    radial-gradient(ellipse 80% 60% at 20% 20%, var(--brand-dim) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 80%, hsla(var(--brand-h), 60%, 40%, 0.08) 0%, transparent 60%),
    var(--bg-void);
}
```

### Section transition (bg shifts between sections)
```css
.section-light { background: var(--bg-light); color: var(--text-dark); }
.section-dark  { background: var(--bg-dark);  color: var(--text); }
.section-accent{
  background:
    radial-gradient(ellipse 100% 100% at 50% 0%, var(--brand-dim) 0%, transparent 70%),
    var(--bg-accent);
}
```

### Button glow
```css
.btn-primary {
  background: var(--brand);
  box-shadow: var(--shadow-sm), 0 0 20px var(--brand-dim);
}
.btn-primary:hover {
  box-shadow: var(--shadow-md), 0 0 40px var(--brand-glow);
}
```

---

## Three.js Color Sync

Match the WebGL scene's lighting to the CSS palette:

```js
// Extract from CSS variables and feed to Three.js
const style = getComputedStyle(document.documentElement);
const brandColor = new THREE.Color(style.getPropertyValue('--brand').trim());
const accentColor = new THREE.Color(style.getPropertyValue('--brand-light').trim());

// Key light: brand-tinted
fillLight.color = brandColor;
// Rim: lighter accent
rimLight.color  = accentColor;
// Material emissive: brand
mat.emissive    = brandColor;
mat.emissiveIntensity = 0.3;
```

---

## Color Contrast Rules (WCAG)

| Pair | Min ratio | Check |
|------|-----------|-------|
| Body text on dark bg | 4.5:1 | `var(--text)` on `var(--bg-dark)` |
| Large heading on dark bg | 3:1 | `var(--text)` on `var(--bg-void)` |
| Muted text on dark bg | 3:1 min | Push muted opacity up if failing |
| Brand color on dark bg | 3:1 for UI, 4.5:1 for text | Adjust `--brand-l` up if needed |

Quick check: `https://webaim.org/resources/contrastchecker/`

---

## Anti-Patterns

| Never | Instead |
|-------|---------|
| Pure `#000000` background | `var(--bg-void)` — slightly tinted |
| Pure `#ffffff` text | `var(--text)` — warm off-white |
| Same brand color for bg + text | Shift lightness ≥ 50% |
| Default Tailwind `indigo-500` (#6366f1) | Custom hue, own derivation |
| Flat hero background | 2-3 radial gradients layered |
| Multiple equally-weighted accent colors | One hero color, one accent, rest neutral |
