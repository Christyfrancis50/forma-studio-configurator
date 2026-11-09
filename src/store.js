import { create } from 'zustand'
import { PRODUCTS, PRODUCT_IDS } from './products'
import { MATERIALS } from './materials'

const HEX = /^#[0-9a-f]{6}$/i

export const defaultsFor = (id) => Object.fromEntries(PRODUCTS[id].parts.map((p) => [p.id, { ...p.default }]))

export function editionConfig(id, name) {
  const ed = PRODUCTS[id].editions[name]
  if (!ed) return defaultsFor(id)
  return Object.fromEntries(Object.entries(ed).map(([k, [material, color]]) => [k, { material, color }]))
}

function readHash() {
  const config = Object.fromEntries(PRODUCT_IDS.map((id) => [id, defaultsFor(id)]))
  let product = 'sneaker'
  try {
    const m = location.hash.match(/#c=(.+)$/)
    if (m) {
      const data = JSON.parse(atob(decodeURIComponent(m[1])))
      if (PRODUCTS[data.p]) product = data.p
      for (const p of PRODUCTS[product].parts) {
        const s = data.c?.[p.id]
        if (!s) continue
        if (p.materials.includes(s.m)) config[product][p.id].material = s.m
        if (HEX.test(s.c)) config[product][p.id].color = s.c
      }
    }
  } catch {
    /* ignore malformed links */
  }
  return { product, config }
}

export function shareUrl(product, config) {
  const c = Object.fromEntries(Object.entries(config[product]).map(([k, v]) => [k, { m: v.material, c: v.color }]))
  return `${location.origin}${location.pathname}#c=${encodeURIComponent(btoa(JSON.stringify({ p: product, c })))}`
}

export function priceOf(product, cfg) {
  const P = PRODUCTS[product]
  return P.base + Object.values(cfg).reduce((sum, s) => sum + MATERIALS[s.material].price * P.priceScale, 0)
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const initial = readHash()

export const useStore = create((set) => ({
  product: initial.product,
  config: initial.config,
  activePart: Object.fromEntries(PRODUCT_IDS.map((id) => [id, PRODUCTS[id].parts[0].id])),
  hovered: null,
  autoRotate: true,
  setProduct: (product) => set({ product, hovered: null }),
  setActivePart: (part) => set((s) => ({ activePart: { ...s.activePart, [s.product]: part } })),
  update: (patch) =>
    set((s) => {
      const part = s.activePart[s.product]
      const cur = s.config[s.product]
      return { config: { ...s.config, [s.product]: { ...cur, [part]: { ...cur[part], ...patch } } } }
    }),
  setHovered: (hovered) => set({ hovered }),
  clearHovered: (part) => set((s) => (s.hovered === part ? { hovered: null } : {})),
  toggleRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  applyEdition: (name) => set((s) => ({ config: { ...s.config, [s.product]: editionConfig(s.product, name) } })),
  randomize: () =>
    set((s) => ({
      config: {
        ...s.config,
        [s.product]: Object.fromEntries(PRODUCTS[s.product].parts.map((p) => [p.id, { material: pick(p.materials), color: pick(p.colors).hex }])),
      },
    })),
}))
