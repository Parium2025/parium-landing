# React Three Fiber (R3F) + Drei — Complete Reference

Use when building 3D sites in React. R3F is declarative Three.js — same power, React paradigm.

---

## Setup

```bash
npm install three @react-three/fiber @react-three/drei gsap lenis
```

```jsx
// main.jsx
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import { App } from './App'

createRoot(document.getElementById('root')).render(
  <Canvas
    camera={{ position: [0, 0, 5], fov: 55 }}
    gl={{
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.1,
    }}
    dpr={[1, 2]}           // caps devicePixelRatio at 2
    shadows="soft"
    style={{ position: 'fixed', inset: 0, zIndex: 0 }}
  >
    <App />
  </Canvas>
)
```

---

## Core Hooks

```jsx
import { useFrame, useThree } from '@react-three/fiber'

function MyMesh() {
  const meshRef = useRef()
  const { viewport, size, camera } = useThree()

  // Runs every frame — like animate()
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1
  })

  return <mesh ref={meshRef}><icosahedronGeometry args={[1.5, 4]} /></mesh>
}
```

---

## Drei — Pre-Built Essentials

```jsx
import {
  Environment,
  MeshTransmissionMaterial,
  Float,
  Sparkles,
  OrbitControls,
  ScrollControls,
  useScroll,
  Html,
  Text,
  useGLTF,
  useTexture,
  Preload,
  AdaptiveDpr,
  PerformanceMonitor,
} from '@react-three/drei'
```

### Environment (HDR, one line)
```jsx
<Environment preset="city" />
// Presets: 'apartment'|'city'|'dawn'|'forest'|'lobby'|'night'|'park'|'studio'|'sunset'|'warehouse'
// Or custom HDR:
<Environment files="/assets/environment.hdr" />
```

### Glass / Transmission Material
```jsx
<mesh>
  <sphereGeometry args={[1.5, 64, 64]} />
  <MeshTransmissionMaterial
    transmission={1}
    thickness={2}
    roughness={0}
    ior={1.5}
    chromaticAberration={0.05}
    anisotropy={0.1}
    distortion={0.2}
    distortionScale={0.3}
    temporalDistortion={0.1}
    envMapIntensity={3}
  />
</mesh>
```

### Float (idle hover animation)
```jsx
<Float speed={2} rotationIntensity={0.4} floatIntensity={0.3}>
  <MyHeroObject />
</Float>
```

### Sparkles (particle field, zero setup)
```jsx
<Sparkles
  count={200}
  scale={6}
  size={3}
  speed={0.4}
  color="#88aaff"
  opacity={0.7}
/>
```

### GLB Model Loading
```jsx
function Model({ url }) {
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, scene)

  useEffect(() => { actions['idle']?.play() }, [actions])

  return <primitive object={scene} />
}

// Preload outside component (prevents waterfall):
useGLTF.preload('/assets/models/product.glb')
```

---

## Scroll-Driven 3D with R3F + ScrollControls

```jsx
import { ScrollControls, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// Wrap canvas content:
<ScrollControls pages={6} damping={0.15}>
  <Scene />
</ScrollControls>

// Inside Scene:
function Scene() {
  const scroll = useScroll()
  const meshRef = useRef()

  useFrame(() => {
    const p = scroll.offset  // 0–1

    meshRef.current.rotation.y = p * Math.PI * 5
    meshRef.current.rotation.x = p * Math.PI * 1.5
    meshRef.current.position.z = THREE.MathUtils.lerp(0, -3, p)

    // Color shift
    meshRef.current.material.color.setHSL(p * 0.4 + 0.6, 0.85, 0.55)
  })

  return <mesh ref={meshRef}><torusKnotGeometry args={[1.1, 0.38, 300, 24]} /></mesh>
}
```

### Mixed: ScrollControls (3D) + Lenis (HTML)
```jsx
// Keep 3D on ScrollControls, HTML sections on Lenis
// Use a shared scroll state via zustand or context:

import { create } from 'zustand'
const useStore = create(set => ({ scrollProgress: 0, setScroll: p => set({ scrollProgress: p }) }))

// In Lenis scroll handler:
lenis.on('scroll', ({ progress }) => useStore.getState().setScroll(progress))

// In R3F component:
const p = useStore(s => s.scrollProgress)
```

---

## Post-Processing (R3F style)

```jsx
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

<EffectComposer>
  <Bloom
    intensity={0.3}
    luminanceThreshold={0.85}
    luminanceSmoothing={0.9}
    mipmapBlur
  />
  <ChromaticAberration
    offset={[0.002, 0.002]}
    blendFunction={BlendFunction.NORMAL}
  />
  <Vignette darkness={0.4} offset={0.4} />
  <Noise opacity={0.04} />
</EffectComposer>
```

---

## Custom Shader Material in R3F

```jsx
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'

const WaveMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(0x88aaff) },
  // vertex
  `uniform float uTime;
   varying vec2 vUv;
   void main() {
     vUv = uv;
     vec3 pos = position;
     pos.z += sin(pos.x * 3.0 + uTime) * 0.1;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
   }`,
  // fragment
  `uniform vec3 uColor;
   varying vec2 vUv;
   void main() {
     gl_FragColor = vec4(uColor * (0.5 + vUv.y * 0.5), 1.0);
   }`
)

extend({ WaveMaterial })

function WavePlane() {
  const matRef = useRef()
  useFrame(({ clock }) => { matRef.current.uTime = clock.elapsedTime })
  return (
    <mesh>
      <planeGeometry args={[4, 4, 32, 32]} />
      <waveMaterial ref={matRef} />
    </mesh>
  )
}
```

---

## Performance (R3F specific)

```jsx
// Auto-reduce quality when fps drops
<PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)}>
  <Canvas dpr={dpr}>...</Canvas>
</PerformanceMonitor>

// Adaptive DPR inside canvas
<AdaptiveDpr pixelated />

// Instanced mesh (same API as vanilla)
<instancedMesh ref={ref} args={[null, null, COUNT]}>
  <icosahedronGeometry args={[0.1, 0]} />
  <meshPhysicalMaterial metalness={0.9} roughness={0.1} />
</instancedMesh>

// Preload everything
<Preload all />

// Dispose geometry on unmount automatically (R3F default behavior)
```

---

## Lighting (R3F)

```jsx
<ambientLight intensity={0.15} />
<directionalLight position={[-4, 8, 6]} intensity={3.5} color="#fff0e0" castShadow
  shadow-mapSize={[2048, 2048]} />
<directionalLight position={[6, 0, 3]} intensity={1.5} color={brandColor} />
<directionalLight position={[0, -6, -6]} intensity={1.2} color={accentColor} />
<pointLight position={[0, 4, 0]} intensity={2} color={brandColor} distance={8} decay={2} />
```

---

## HTML Overlay in 3D Space

```jsx
import { Html } from '@react-three/drei'

// Place HTML at a 3D position (follows the object)
<mesh position={[0, 2, 0]}>
  <Html center distanceFactor={4}>
    <div className="label">Feature Name</div>
  </Html>
</mesh>

// Fixed screen-space overlay (for UI that stays put)
<Html fullscreen>
  <div className="hud">...</div>
</Html>
```

---

## R3F vs Vanilla Three.js Decision

| Use R3F when | Use vanilla Three.js when |
|--------------|--------------------------|
| React is already in the stack | Pure HTML/CSS/JS project (like Parium) |
| Component reuse across pages | One-page landing, no framework |
| Complex state management | Simpler mental model needed |
| Team knows React | CDN-only constraint |
| Using Next.js/Remix | No build step desired |
