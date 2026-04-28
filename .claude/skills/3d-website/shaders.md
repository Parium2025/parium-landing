# GLSL Shader Library — Complete Reference

Import these into any ShaderMaterial. Always paste noise functions before `main()`.

---

## 1. Simplex Noise — 2D, 3D, 4D (Production Quality)

```glsl
// ── Utilities ──────────────────────────────────────────────────────
vec3 mod289_3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289_4(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289_2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x)  { return mod289_4(((x*34.0)+1.0)*x); }
vec3 permute3(vec3 x) { return mod289_3(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float taylorInvSqrtF(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

// ── 2D Simplex ──────────────────────────────────────────────────────
float snoise2(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289_2(i);
  vec3 p = permute3(permute3(i.y + vec3(0.0, i1.y, 1.0))
                  + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= taylorInvSqrt(a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// ── 3D Simplex ──────────────────────────────────────────────────────
float snoise3(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289_3(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x  = x_ * ns.x + ns.yyyy;
  vec4 y  = y_ * ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
```

---

## 2. FBM — Fractional Brownian Motion (layered organic noise)

```glsl
// Paste snoise3 above first.
// fBm: layers of noise at increasing frequency, decreasing amplitude.
// Result: clouds, terrain, fluid, fire — anything organic.

float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < octaves; i++) {
    value += amplitude * snoise3(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Domain-warped fBm (Inigo Quilez technique — gives flowing/melting look):
float warpedFbm(vec3 p, int octaves) {
  vec3 q = vec3(
    fbm(p + vec3(0.0, 0.0, 0.0), octaves),
    fbm(p + vec3(5.2, 1.3, 2.8), octaves),
    fbm(p + vec3(1.7, 9.2, 4.1), octaves)
  );
  vec3 r = vec3(
    fbm(p + 4.0*q + vec3(1.7, 9.2, 4.1), octaves),
    fbm(p + 4.0*q + vec3(8.3, 2.8, 0.5), octaves),
    fbm(p + 4.0*q + vec3(3.1, 7.6, 1.2), octaves)
  );
  return fbm(p + 4.0*r, octaves);
}
```

---

## 3. Curl Noise (fluid-like particle flow, divergence-free)

```glsl
// Particles that flow without collapsing to a point.
// Paste snoise3 first.

vec3 curl(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  
  float x = snoise3(p+dy).z - snoise3(p-dy).z
           - snoise3(p+dz).y + snoise3(p-dz).y;
  float y = snoise3(p+dz).x - snoise3(p-dz).x
           - snoise3(p+dx).z + snoise3(p-dx).z;
  float z = snoise3(p+dx).y - snoise3(p-dx).y
           - snoise3(p+dy).x + snoise3(p-dy).x;
  return vec3(x, y, z) / (2.0 * e);
}
// Use: pos += curl(pos * 0.3 + uTime * 0.1) * 0.02;
```

---

## 4. Voronoi Noise (cellular, cracked glass, crystal)

```glsl
float voronoi(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float minDist = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = fract(sin(dot(i + neighbor, vec2(127.1, 311.7))) * 43758.5453);
      point = 0.5 + 0.5 * sin(6.28318 * point);
      vec2 diff = neighbor + point - f;
      minDist = min(minDist, length(diff));
    }
  }
  return minDist;
}
```

---

## 5. Displacement Shader (mesh deformation on scroll)

```glsl
// ── Vertex Shader ──────────────────────────────────────────────────
uniform float uTime;
uniform float uProgress;   // 0–1 from scroll
uniform float uAmplitude;  // displacement strength
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;

// Paste snoise3 here

void main() {
  vNormal   = normalize(normalMatrix * normal);
  
  // Displace along normal
  float n = snoise3(position * 1.2 + uTime * 0.25);
  float displacement = n * uAmplitude * uProgress;
  vec3 displaced = position + normal * displacement;
  
  vNoise    = n;
  vPosition = displaced;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}

// ── Fragment Shader ────────────────────────────────────────────────
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;

void main() {
  // Lighting
  vec3 light  = normalize(vec3(5.0, 8.0, 5.0));
  float diff  = max(dot(vNormal, light), 0.0) * 0.8;
  
  // Rim light
  vec3 viewDir = normalize(-vPosition);
  float rim    = 1.0 - max(dot(viewDir, vNormal), 0.0);
  rim          = pow(rim, 2.5);
  
  // Color blend driven by noise
  vec3 color = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
  color += rim * uColorB * 0.6;
  color *= (0.3 + diff);
  
  gl_FragColor = vec4(color, 1.0);
}
```

---

## 6. Holographic / Iridescent Shader

```glsl
// ── Vertex ─────────────────────────────────────────────────────────
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

void main() {
  vNormal  = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  vUv      = uv;
  gl_Position = projectionMatrix * mvPos;
}

// ── Fragment ────────────────────────────────────────────────────────
uniform float uTime;
uniform vec3 uBaseColor;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

vec3 hsvToRgb(float h, float s, float v) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
  return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
}

void main() {
  // Fresnel
  float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
  
  // Rainbow shift based on view angle + time + position
  float hue = fresnel * 0.4 + vUv.y * 0.2 + uTime * 0.05;
  vec3 rainbow = hsvToRgb(hue, 0.8, 1.0);
  
  // Scanlines
  float scan = sin(vUv.y * 200.0 + uTime * 2.0) * 0.04 + 0.96;
  
  // Combine
  vec3 color = mix(uBaseColor, rainbow, fresnel * 0.7) * scan;
  float alpha = 0.5 + fresnel * 0.5;
  
  gl_FragColor = vec4(color, alpha);
}
```

---

## 7. Fresnel / Rim Glow

```glsl
// Quick rim glow — paste into any fragment shader with vNormal + vViewDir

float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - max(dot(normalize(normal), normalize(viewDir)), 0.0), power);
}

// Usage in main():
float rim = fresnel(vNormal, vViewDir, 3.0);
vec3 color = baseColor + rimColor * rim * rimIntensity;
```

---

## 8. Chromatic Aberration (post-processing / screen-space)

```glsl
// ── Fragment shader for a full-screen pass ─────────────────────────
uniform sampler2D tDiffuse;
uniform float uStrength;  // 0.002 subtle, 0.008 heavy
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 dir = vUv - 0.5;
  float dist = length(dir);
  vec2 offset = dir * uStrength * dist;
  
  float r = texture2D(tDiffuse, vUv + offset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - offset).b;
  float a = texture2D(tDiffuse, vUv).a;
  
  gl_FragColor = vec4(r, g, b, a);
}
```

---

## 9. Film Grain (GPU, frame-coherent)

```glsl
// ── Fragment (full-screen pass or overlay) ─────────────────────────
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uStrength;  // 0.03–0.06
varying vec2 vUv;

float random(vec2 co, float seed) {
  return fract(sin(dot(co + seed, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float grain = random(vUv, floor(uTime * 24.0) * 0.1) * 2.0 - 1.0;
  color.rgb += grain * uStrength;
  gl_FragColor = color;
}
```

---

## 10. Raymarching Template (volumetric / SDF)

```glsl
// ── Fragment shader (full canvas) ──────────────────────────────────
uniform float uTime;
uniform vec2 uResolution;

// ── SDF primitives ─────────────────────────────────────────────────
float sdSphere(vec3 p, float r) { return length(p) - r; }

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Smooth min — blends two SDFs together organically
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
  return mix(b, a, h) - k*h*(1.0-h);
}

// ── Scene ──────────────────────────────────────────────────────────
float scene(vec3 p) {
  float sphere = sdSphere(p - vec3(sin(uTime)*0.5, 0.0, 0.0), 0.8);
  float torus  = sdTorus(p - vec3(0.0, 0.0, 0.0), vec2(1.2, 0.25));
  return smin(sphere, torus, 0.4);
}

// ── Normal via central differences ─────────────────────────────────
vec3 calcNormal(vec3 p) {
  const float e = 0.001;
  return normalize(vec3(
    scene(p + vec3(e,0,0)) - scene(p - vec3(e,0,0)),
    scene(p + vec3(0,e,0)) - scene(p - vec3(0,e,0)),
    scene(p + vec3(0,0,e)) - scene(p - vec3(0,0,e))
  ));
}

// ── Raymarcher ──────────────────────────────────────────────────────
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  
  vec3 ro = vec3(0.0, 0.0, 3.0);  // ray origin (camera)
  vec3 rd = normalize(vec3(uv, -1.5)); // ray direction
  
  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 100; i++) {
    float d = scene(ro + rd * t);
    if (d < 0.001) { hit = t; break; }
    if (t > 20.0) break;
    t += d;
  }
  
  vec3 color = vec3(0.0);
  if (hit > 0.0) {
    vec3 p  = ro + rd * hit;
    vec3 n  = calcNormal(p);
    vec3 light = normalize(vec3(2.0, 4.0, 3.0));
    float diff = max(dot(n, light), 0.0);
    float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 64.0);
    color = vec3(0.2, 0.5, 1.0) * diff + vec3(1.0) * spec * 0.5;
  }
  
  gl_FragColor = vec4(color, 1.0);
}
```

---

## 11. Vertex Morph Between Two Shapes

```glsl
// ── Vertex ─────────────────────────────────────────────────────────
attribute vec3 aPositionB;  // target shape positions
uniform float uMorphProgress; // 0.0 → 1.0 (from scroll)
uniform float uTime;

varying vec3 vNormal;

void main() {
  // Elastic ease in GLSL
  float t = uMorphProgress;
  float easedT = t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t) * cos(t * 10.0 * 3.14159 / 1.5);
  
  vec3 morphed = mix(position, aPositionB, easedT);
  
  // Optional: add ripple during morph
  float ripple = sin(length(position) * 5.0 - uTime * 3.0) * 0.05 * sin(t * 3.14159);
  morphed += normal * ripple;
  
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(morphed, 1.0);
}
```

```js
// JS side — add second set of positions as attribute:
const geometryB = new THREE.IcosahedronGeometry(1.5, 4); // target shape
geometry.setAttribute('aPositionB', geometryB.attributes.position);

// Drive morphProgress from scroll:
ScrollTrigger.create({
  trigger: '#scroll-wrap',
  start: '30% top',
  end: '60% bottom',
  scrub: 2,
  onUpdate: self => {
    mat.uniforms.uMorphProgress.value = self.progress;
  }
});
```

---

## 12. Audio Reactive Shader (Web Audio API)

```js
// Analyser setup
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
const data = new Uint8Array(analyser.frequencyBinCount);

// In animation loop:
analyser.getByteFrequencyData(data);
const bass    = data.slice(0,  8).reduce((a,b) => a+b, 0) / (8   * 255);
const mid     = data.slice(8,  64).reduce((a,b) => a+b, 0) / (56  * 255);
const treble  = data.slice(64, 128).reduce((a,b) => a+b, 0) / (64  * 255);

mat.uniforms.uBass.value   = bass;
mat.uniforms.uMid.value    = mid;
mat.uniforms.uTreble.value = treble;
```

```glsl
// GLSL: react to audio
uniform float uBass;
uniform float uMid;
uniform float uTreble;

// In vertex main():
float audioDisplace = uBass * 0.5 + uMid * 0.2;
vec3 displaced = position + normal * audioDisplace;
```

---

## Shader Cheat Sheet

| Effect | Shader | Key param |
|--------|--------|-----------|
| Organic blob | Displacement + snoise3 | uAmplitude, uTime |
| Fluid particles | Curl noise | velocity += curl(pos*0.3 + t*0.1) |
| Cracked/crystal | Voronoi | scale 2–8 |
| Clouds/smoke | Domain-warped fBm | octaves 4–6 |
| Chrome/metal | Fresnel + env map | power 2.5–4.0 |
| Hologram | Iridescent + scanlines | uTime, fresnel |
| Lens aberration | Chromatic aberration pass | uStrength 0.003 |
| Film look | GPU grain pass | uStrength 0.04 |
| SDF object | Raymarching | smin k=0.3–0.5 |
| Shape morph | Morph attribute | uMorphProgress scrubbed |
