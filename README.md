# Forma Studio — 3D Product Configurator

**Live demo: [forma-studio-configurator.vercel.app](https://forma-studio-configurator.vercel.app)**

A real-time product configurator built with **React Three Fiber**. Orbit a sneaker, a lounge chair or a sports car and restyle every part live — materials and colours ease between states, and the price updates as you go.

## Features
- **3 fully procedural products**: no model files. The sneaker is lofted from superellipse cross-sections, with overlays "skinned" onto its surface. The chair and car are built from parametric primitives and extrusions.
- **Physically based materials**: knit, leather, suede, bouclé, velvet, wood, carbon fibre, chrome, pearlescent paint, tinted glass and more, using `MeshPhysicalMaterial` (sheen, clearcoat, iridescence, transmission) with canvas-generated bump and grain textures.
- **Smooth transitions**: colour, roughness, metalness and the other material properties animate between selections.
- **Click any part** in 3D to edit it, with hover highlight and a cursor label.
- **Curated editions**, a "Surprise me" option, and a turntable mode.
- **Shareable builds**: your configuration is encoded in the URL.
- **PNG snapshot** export.
- Studio lighting from drei `Lightformer`s (no HDR download), contact shadows, and a responsive layout that turns into a bottom sheet on mobile.

## Stack
React 18 · @react-three/fiber · @react-three/drei · three.js · zustand · Vite

## Run
```bash
npm install
npm run dev
```

## Structure
```
src/
  products.js        product, parts, palettes, editions, pricing
  materials.js       material presets + procedural textures
  store.js           zustand state, share links, pricing
  components/
    usePart.js       shared animated material + pointer handlers per part
    Scene.jsx        lighting, camera rig, controls, reveal animation
    Panel.jsx        configurator UI
  models/
    geom.js          loft / surface-patch / ribbon geometry helpers
    Sneaker.jsx  Chair.jsx  Car.jsx
```

To add a product, add an entry in `products.js` and a model that calls `usePart(productId, partId)` for each configurable mesh group.
