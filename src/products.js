const C = (name, hex) => ({ name, hex })

const SNEAKER = [C('Bone', '#efe9df'), C('Onyx', '#1d1d1f'), C('Fog', '#a3a7ad'), C('Sand', '#c9b79c'), C('Olive', '#4b5a3c'), C('Navy', '#1f2f55'), C('Ember', '#d4501e'), C('Volt', '#d4f53c'), C('Crimson', '#c1121f'), C('Lilac', '#b9a7e8')]
const SOLE = [C('Bone', '#efe9df'), C('Onyx', '#1d1d1f'), C('Gum', '#b7793f'), C('Fog', '#a3a7ad'), C('Volt', '#d4f53c'), C('Ember', '#d4501e')]
const FABRIC = [C('Ivory', '#ece4d6'), C('Oat', '#cdbb9e'), C('Clay', '#b5654a'), C('Moss', '#5f6b45'), C('Ink', '#22283a'), C('Charcoal', '#3a3a3c'), C('Blush', '#d9a6a0'), C('Ochre', '#c98f2b'), C('Teal', '#2c6e6a'), C('Cognac', '#8a4b24')]
const SHELL = [C('Oak', '#c99a64'), C('Walnut', '#6a4024'), C('Ebony', '#2a1e18'), C('Chalk', '#e9e5dc'), C('Graphite', '#2e2e30'), C('Sage', '#9aa58a'), C('Terracotta', '#b45a3c'), C('Navy', '#1f2f55')]
const LEGS = [C('Oak', '#c99a64'), C('Walnut', '#6a4024'), C('Ebony', '#2a1e18'), C('Brass', '#c9a55c'), C('Steel', '#d9dadc'), C('Black', '#1c1c1c')]
const PAINT = [C('Glacier', '#e8eaed'), C('Obsidian', '#0e0f11'), C('Mercury', '#9aa0a6'), C('Rosso', '#b3121b'), C('Riviera', '#1f4fa3'), C('Lagoon', '#0f7c7a'), C('Giallo', '#f2b705'), C('Verde', '#2f5d34'), C('Arancio', '#ef6c1a'), C('Viola', '#5b2a86')]
const RIMS = [C('Silver', '#cfd2d6'), C('Gunmetal', '#4a4d52'), C('Black', '#151515'), C('Bronze', '#a5773f'), C('Gold', '#c8a24a'), C('White', '#eeeeee')]
const CALIPER = [C('Red', '#d0021b'), C('Yellow', '#f5c400'), C('Black', '#151515'), C('Blue', '#1e5bd8'), C('Green', '#3fae49'), C('Orange', '#f26b1d')]
const GLASS = [C('Smoke', '#262b31'), C('Clear', '#dfe7ea'), C('Bronze', '#6a5238'), C('Ocean', '#2a4466')]
const TRIM = [C('Carbon', '#3a3a3e'), C('Black', '#141414'), C('Titanium', '#8d8f93'), C('Bronze', '#7a5a35')]

const part = (id, label, materials, colors, material, color) => ({ id, label, materials, colors, default: { material, color } })

export const PRODUCTS = {
  sneaker: {
    name: 'Aero Runner',
    word: 'AERO',
    kind: 'Footwear',
    tagline: 'Hand-finished performance trainer',
    base: 189,
    priceScale: 1,
    camera: { position: [3.7, 1.9, 4.4], target: [0, 0.45, 0], min: 2.6, max: 8 },
    parts: [
      part('upper', 'Upper', ['knit', 'leather', 'suede'], SNEAKER, 'knit', '#efe9df'),
      part('overlays', 'Overlays', ['leather', 'suede', 'gloss'], SNEAKER, 'leather', '#efe9df'),
      part('accent', 'Accent', ['gloss', 'leather', 'suede', 'metallic'], SNEAKER, 'gloss', '#d4501e'),
      part('laces', 'Laces', ['cotton', 'waxed'], SNEAKER, 'cotton', '#efe9df'),
      part('lining', 'Lining', ['cotton', 'suede'], SNEAKER, 'cotton', '#1d1d1f'),
      part('midsole', 'Midsole', ['foam', 'gloss'], SOLE, 'foam', '#efe9df'),
      part('outsole', 'Outsole', ['rubber', 'icy'], SOLE, 'rubber', '#b7793f'),
    ],
    editions: {
      Studio: null,
      Midnight: { upper: ['knit', '#1d1d1f'], overlays: ['suede', '#1d1d1f'], accent: ['metallic', '#a3a7ad'], laces: ['cotton', '#1d1d1f'], lining: ['cotton', '#c1121f'], midsole: ['foam', '#1d1d1f'], outsole: ['rubber', '#1d1d1f'] },
      Volt: { upper: ['knit', '#a3a7ad'], overlays: ['leather', '#efe9df'], accent: ['gloss', '#d4f53c'], laces: ['waxed', '#d4f53c'], lining: ['cotton', '#d4f53c'], midsole: ['foam', '#efe9df'], outsole: ['icy', '#efe9df'] },
    },
  },
  chair: {
    name: 'Lune Lounge',
    word: 'LUNE',
    kind: 'Furniture',
    tagline: 'Low-slung lounge chair, made to order',
    base: 2850,
    priceScale: 12,
    camera: { position: [3.9, 2.6, 4.6], target: [0, 0.65, 0], min: 2.8, max: 9 },
    parts: [
      part('cushions', 'Cushions', ['boucle', 'velvet', 'leather'], FABRIC, 'boucle', '#ece4d6'),
      part('shell', 'Shell', ['wood', 'lacquer', 'matte', 'leather'], SHELL, 'wood', '#6a4024'),
      part('legs', 'Legs', ['wood', 'brushed', 'chrome', 'matte'], LEGS, 'brushed', '#c9a55c'),
      part('pillow', 'Pillow', ['velvet', 'boucle', 'leather'], FABRIC, 'velvet', '#c98f2b'),
    ],
    editions: {
      Gallery: null,
      Club: { cushions: ['leather', '#8a4b24'], shell: ['wood', '#2a1e18'], legs: ['chrome', '#d9dadc'], pillow: ['velvet', '#5f6b45'] },
      Terra: { cushions: ['velvet', '#b5654a'], shell: ['matte', '#e9e5dc'], legs: ['wood', '#c99a64'], pillow: ['boucle', '#ece4d6'] },
    },
  },
  car: {
    name: 'Vela GT',
    word: 'VELA',
    kind: 'Automotive',
    tagline: 'Electric grand tourer, coachbuilt to spec',
    base: 148000,
    priceScale: 180,
    camera: { position: [6.6, 2.9, 7.4], target: [0, 0.55, 0], min: 4.5, max: 14 },
    parts: [
      part('body', 'Paint', ['metallic', 'gloss', 'matte', 'pearl'], PAINT, 'metallic', '#1f4fa3'),
      part('wheels', 'Wheels', ['brushed', 'chrome', 'gloss', 'matte'], RIMS, 'brushed', '#cfd2d6'),
      part('calipers', 'Calipers', ['gloss', 'matte'], CALIPER, 'gloss', '#f5c400'),
      part('glass', 'Glass', ['glass', 'mirror'], GLASS, 'glass', '#262b31'),
      part('trim', 'Trim', ['carbon', 'gloss', 'matte'], TRIM, 'carbon', '#3a3a3e'),
    ],
    editions: {
      Riviera: null,
      Stealth: { body: ['matte', '#0e0f11'], wheels: ['gloss', '#151515'], calipers: ['gloss', '#d0021b'], glass: ['mirror', '#262b31'], trim: ['carbon', '#3a3a3e'] },
      Giallo: { body: ['gloss', '#f2b705'], wheels: ['chrome', '#cfd2d6'], calipers: ['gloss', '#151515'], glass: ['glass', '#262b31'], trim: ['gloss', '#141414'] },
    },
  },
}

export const PRODUCT_IDS = Object.keys(PRODUCTS)
