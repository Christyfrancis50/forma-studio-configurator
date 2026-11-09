import * as THREE from 'three'

// Physical material presets. `price` is a base surcharge, multiplied per product.
export const MATERIALS = {
  knit: { label: 'Engineered Knit', price: 0, props: { roughness: 0.95, sheen: 0.7, sheenRoughness: 0.6 }, bump: 'knit', bumpScale: 2.2, repeat: [7, 9] },
  cotton: { label: 'Cotton', price: 0, props: { roughness: 0.95, sheen: 0.4, sheenRoughness: 0.7 }, bump: 'knit', bumpScale: 1.2, repeat: [3, 3] },
  waxed: { label: 'Waxed', price: 5, props: { roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 } },
  leather: { label: 'Full-grain Leather', price: 30, props: { roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.45 }, bump: 'grain', bumpScale: 1.4, repeat: [4, 4] },
  suede: { label: 'Suede', price: 25, props: { roughness: 1, sheen: 1, sheenRoughness: 0.45 }, bump: 'grain', bumpScale: 0.5, repeat: [9, 9] },
  foam: { label: 'Cushion Foam', price: 0, props: { roughness: 0.72 } },
  rubber: { label: 'Rubber', price: 0, props: { roughness: 0.9 } },
  icy: { label: 'Translucent', price: 20, props: { roughness: 0.25, transmission: 0.85, thickness: 0.4, ior: 1.45 } },
  gloss: { label: 'Gloss', price: 10, props: { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 } },
  lacquer: { label: 'Lacquer', price: 15, props: { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.02 } },
  matte: { label: 'Matte', price: 8, props: { roughness: 0.8 } },
  metallic: { label: 'Metallic', price: 25, props: { metalness: 0.72, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05 } },
  pearl: { label: 'Pearlescent', price: 45, props: { roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 1, iridescenceIOR: 1.4 } },
  chrome: { label: 'Polished Chrome', price: 30, props: { metalness: 1, roughness: 0.05 } },
  brushed: { label: 'Brushed Metal', price: 20, props: { metalness: 1, roughness: 0.3 }, bump: 'brushed', bumpScale: 0.6, repeat: [2, 2] },
  wood: { label: 'Solid Wood', price: 18, props: { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4 }, map: 'wood', repeat: [2.5, 2.5] },
  carbon: { label: 'Carbon Fibre', price: 50, props: { metalness: 0.25, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.03 }, map: 'carbon', repeat: [8, 8] },
  velvet: { label: 'Velvet', price: 28, props: { roughness: 0.85, sheen: 1, sheenRoughness: 0.3 } },
  boucle: { label: 'Bouclé', price: 22, props: { roughness: 1, sheen: 0.5, sheenRoughness: 0.8 }, bump: 'boucle', bumpScale: 3, repeat: [3, 3] },
  glass: { label: 'Tinted Glass', price: 0, props: { roughness: 0.03, transmission: 0.7, thickness: 1, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0 } },
  mirror: { label: 'Mirror Tint', price: 15, props: { metalness: 1, roughness: 0.04 } },
}

export const NUMERIC_DEFAULTS = {
  roughness: 0.5,
  metalness: 0,
  clearcoat: 0,
  clearcoatRoughness: 0,
  sheen: 0,
  sheenRoughness: 1,
  transmission: 0,
  thickness: 0,
  ior: 1.5,
  iridescence: 0,
  iridescenceIOR: 1.3,
}

// ---------- procedural canvas textures (no downloads) ----------
function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const gray = (v) => `rgb(${v | 0},${v | 0},${v | 0})`

const DRAW = {
  knit(g, S, r) {
    g.fillStyle = gray(70)
    g.fillRect(0, 0, S, S)
    const n = 32, c = S / n
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        g.fillStyle = gray(175 + r() * 50)
        g.beginPath(); g.ellipse(x * c + c * 0.3, y * c + c * 0.5, c * 0.2, c * 0.55, -0.45, 0, Math.PI * 2); g.fill()
        g.beginPath(); g.ellipse(x * c + c * 0.7, y * c + c * 0.5, c * 0.2, c * 0.55, 0.45, 0, Math.PI * 2); g.fill()
      }
  },
  grain(g, S, r) {
    g.fillStyle = gray(150)
    g.fillRect(0, 0, S, S)
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = gray(100 + r() * 110)
      g.beginPath(); g.arc(r() * S, r() * S, 1 + r() * 3.5, 0, Math.PI * 2); g.fill()
    }
  },
  boucle(g, S, r) {
    g.fillStyle = gray(90)
    g.fillRect(0, 0, S, S)
    g.lineWidth = 2.2
    for (let i = 0; i < 3800; i++) {
      g.strokeStyle = gray(140 + r() * 115)
      g.beginPath(); g.arc(r() * S, r() * S, 2 + r() * 4, r() * 6, r() * 6 + 4); g.stroke()
    }
  },
  brushed(g, S, r) {
    g.fillStyle = gray(128)
    g.fillRect(0, 0, S, S)
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = gray(90 + r() * 90)
      g.fillRect(0, r() * S, S, 0.6 + r())
    }
  },
  wood(g, S, r) {
    const img = g.createImageData(S, S)
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const w = x * 0.09 + 5 * Math.sin(y * 0.018) + 1.6 * Math.sin(y * 0.07 + x * 0.013)
        const ring = Math.pow(Math.abs(Math.sin(w)), 10)
        const v = 236 - ring * 38 - Math.sin(w * 0.37) * 10 - r() * 8
        const i = (y * S + x) * 4
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
    g.putImageData(img, 0, 0)
  },
  carbon(g, S) {
    const n = 16, c = S / n
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const horiz = (x + y) % 4 < 2
        const grd = horiz ? g.createLinearGradient(x * c, y * c, x * c, y * c + c) : g.createLinearGradient(x * c, y * c, x * c + c, y * c)
        grd.addColorStop(0, gray(110)); grd.addColorStop(0.5, gray(255)); grd.addColorStop(1, gray(110))
        g.fillStyle = grd
        g.fillRect(x * c, y * c, c, c)
      }
  },
}

const cache = new Map()
export function getTexture(name, repeat = [1, 1], color = false) {
  const key = `${name}:${repeat.join('x')}`
  if (cache.has(key)) return cache.get(key)
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  DRAW[name](c.getContext('2d'), S, rng(name.length * 977))
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 8
  if (color) t.colorSpace = THREE.SRGBColorSpace
  cache.set(key, t)
  return t
}
