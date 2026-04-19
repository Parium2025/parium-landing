---
name: Project Context
description: Parium 3D landningssida — Three.js, GSAP, Lenis, ska publiceras på parium.se
type: project
originSessionId: 84f649a3-dc40-4553-a60f-aaaf480bf2d9
---
Bygger en premium 3D-landningssida för parium.se, separerad från Lovable-appen. Stack: Three.js 0.160 + GSAP + ScrollTrigger + Lenis. Serveras via serve.mjs på localhost:3000. Screenshots via screenshot.mjs + Puppeteer.

GitHub repo: github.com/Parium2025/parium-landing (main branch). Autentiserat via gh CLI (Parium2025-kontot).

Node.js finns på /opt/homebrew/bin/node — måste alltid prefixas med PATH="/opt/homebrew/bin:$PATH" i Bash-kommandon.

Projektmapp har ett mellanslag: /Users/Anditsdrop/Parium / — alla sökvägar måste quotas.

**Why:** Landningssidan behöver 3D-animationer som Lovable inte klarar av.
**How to apply:** Koppla alltid ihop design med Three.js-scenen, testa alltid via screenshot, pusha ändringar till GitHub efter varje session.
