import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore, priceOf, shareUrl } from './store'
import { PRODUCTS, PRODUCT_IDS } from './products'
import { Scene, glRef } from './components/Scene'
import { Panel, fmt } from './components/Panel'

function useAnimatedNumber(value) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 600)
      const e = 1 - Math.pow(1 - k, 3)
      const v = a + (value - a) * e
      from.current = v
      setShown(v)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return shown
}

function HoverLabel() {
  const hovered = useStore((s) => s.hovered)
  const product = useStore((s) => s.product)
  const ref = useRef()
  useEffect(() => {
    const move = (e) => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  const label = PRODUCTS[product].parts.find((p) => p.id === hovered)?.label
  return (
    <div ref={ref} className={`hover-label ${label ? 'show' : ''}`}>
      {label} <span>· click to edit</span>
    </div>
  )
}

export default function App() {
  const product = useStore((s) => s.product)
  const cfg = useStore((s) => s.config[product])
  const config = useStore((s) => s.config)
  const autoRotate = useStore((s) => s.autoRotate)
  const { setProduct, toggleRotate, randomize, applyEdition } = useStore.getState()
  const [toast, setToast] = useState(null)
  const P = PRODUCTS[product]
  const price = useAnimatedNumber(priceOf(product, cfg))

  const notify = (msg) => {
    setToast(msg)
    clearTimeout(notify.t)
    notify.t = setTimeout(() => setToast(null), 2200)
  }

  const share = async () => {
    const url = shareUrl(product, config)
    history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
      notify('Link copied — your build is in the URL')
    } catch {
      notify('Build saved to the address bar')
    }
  }

  const snapshot = () => {
    const src = glRef.current?.domElement
    if (!src) return
    const out = document.createElement('canvas')
    out.width = src.width
    out.height = src.height
    const g = out.getContext('2d')
    const grd = g.createRadialGradient(out.width / 2, out.height * 0.4, 0, out.width / 2, out.height * 0.4, out.width * 0.7)
    grd.addColorStop(0, '#f7f5f1')
    grd.addColorStop(1, '#dcd7ce')
    g.fillStyle = grd
    g.fillRect(0, 0, out.width, out.height)
    g.drawImage(src, 0, 0)
    const a = document.createElement('a')
    a.download = `${P.name.toLowerCase().replace(/\s+/g, '-')}.png`
    a.href = out.toDataURL('image/png')
    a.click()
    notify('Snapshot saved')
  }

  return (
    <div className="app">
      <div className="bg-word" key={P.word} aria-hidden>
        {P.word}
      </div>

      <div className="stage">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: P.camera.position, fov: 32, near: 0.1, far: 100 }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          onPointerMissed={() => useStore.getState().setHovered(null)}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <header className="top">
        <div className="brand">
          <span className="logo">◐</span>
          <span>
            FORMA <em>Studio</em>
          </span>
        </div>
        <nav className="switcher" aria-label="Product">
          {PRODUCT_IDS.map((id) => (
            <button key={id} className={id === product ? 'active' : ''} onClick={() => setProduct(id)}>
              <small>{PRODUCTS[id].kind}</small>
              {PRODUCTS[id].name}
            </button>
          ))}
        </nav>
        <div className="top-right">
          <span className="live-dot" /> Live render
        </div>
      </header>

      <section className="info" key={product}>
        <p className="eyebrow">
          {P.kind} · Made to order
        </p>
        <h1>{P.name}</h1>
        <p className="tagline">{P.tagline}</p>
        <div className="price">
          <span>{fmt(Math.round(price))}</span>
          <small>incl. selected options</small>
        </div>
        <div className="editions">
          <span className="eyebrow">Editions</span>
          {Object.keys(P.editions).map((name) => (
            <button key={name} onClick={() => applyEdition(name)}>
              {name}
            </button>
          ))}
        </div>
      </section>

      <Panel />

      <div className="toolbar">
        <button className={autoRotate ? 'on' : ''} onClick={toggleRotate} title="Toggle turntable">
          ⟳ <span>Turntable</span>
        </button>
        <button onClick={randomize} title="Random build">
          ✦ <span>Surprise me</span>
        </button>
        <button onClick={snapshot} title="Download PNG">
          ◎ <span>Snapshot</span>
        </button>
        <button className="primary" onClick={share}>
          Share build
        </button>
      </div>

      <p className="hint">Drag to orbit · Scroll to zoom · Click any part to edit it</p>
      <HoverLabel />
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  )
}
