import * as THREE from 'three'

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const lerp = (a, b, t) => a + (b - a) * t

/** Smooth y = f(x) from control points via a centripetal Catmull-Rom spline. */
export function lookup(points) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal')
  const pts = curve.getPoints(600)
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const n = xs.length
  return (x) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let lo = 0
    let hi = n - 1
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1
      if (xs[m] <= x) lo = m
      else hi = m
    }
    const t = (x - xs[lo]) / (xs[hi] - xs[lo] || 1)
    return ys[lo] + (ys[hi] - ys[lo]) * t
  }
}

/**
 * A cross-section is a superellipse in the (z, y) plane at station x.
 * v runs 0..1 around it, starting (and seaming) at the bottom.
 */
export function sectionPoint(s, v, out) {
  const a = -Math.PI / 2 + v * Math.PI * 2
  const c = Math.cos(a)
  const sn = Math.sin(a)
  const e = 2 / s.n
  let z = s.hz * Math.sign(c) * Math.pow(Math.abs(c), e)
  const y = s.hy * Math.sign(sn) * Math.pow(Math.abs(sn), e)
  if (y > 0 && s.topTaper) z *= 1 - s.topTaper * (y / Math.max(s.hy, 1e-6))
  return out.set(s.x, s.cy + y, z)
}

export const makeSurface = (sectionFn) => (u, v, out) => sectionPoint(sectionFn(u), v, out)

const cosSpace = (t) => (1 - Math.cos(Math.PI * t)) / 2

/** Closed lofted solid along x (ends collapse to points). */
export function loftGeometry(surface, nu = 140, nv = 80) {
  const count = (nu + 1) * (nv + 1)
  const pos = new Float32Array(count * 3)
  const uv = new Float32Array(count * 2)
  const idx = []
  const p = new THREE.Vector3()
  for (let i = 0; i <= nu; i++) {
    const u = cosSpace(i / nu)
    for (let j = 0; j <= nv; j++) {
      const v = j / nv
      surface(u, v, p)
      const k = i * (nv + 1) + j
      pos.set([p.x, p.y, p.z], k * 3)
      uv.set([u * 3, v * 2], k * 2)
    }
  }
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j
      const b = a + nv + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setIndex(idx)
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.computeVertexNormals()
  // Ends collapse to a point; point their normals along the axis.
  const nrm = g.attributes.normal
  for (let j = 0; j <= nv; j++) {
    nrm.setXYZ(j, -1, 0, 0)
    nrm.setXYZ(nu * (nv + 1) + j, 1, 0, 0)
  }
  return g
}

/**
 * A thin skin that sits on top of a surface, like a decal with depth cues.
 * map(s, t) -> [u, v] picks the region in the surface's parameter space.
 */
export function patchGeometry(surface, nS, nT, map, offset = 0.005, flip = false) {
  const pos = []
  const nrm = []
  const uvs = []
  const idx = []
  const p = new THREE.Vector3()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const d = new THREE.Vector3()
  const n = new THREE.Vector3()
  const h = 1e-3
  for (let i = 0; i <= nS; i++)
    for (let j = 0; j <= nT; j++) {
      let [u, v] = map(i / nS, j / nT)
      u = Math.min(0.997, Math.max(0.003, u))
      surface(u, v, p)
      surface(u + h, v, a)
      surface(u - h, v, b)
      surface(u, v + h, c)
      surface(u, v - h, d)
      n.crossVectors(a.sub(b), c.sub(d)).normalize()
      pos.push(p.x + n.x * offset, p.y + n.y * offset, p.z + n.z * offset)
      nrm.push(n.x, n.y, n.z)
      uvs.push((i / nS) * 2, (j / nT) * 2)
    }
  for (let i = 0; i < nS; i++)
    for (let j = 0; j < nT; j++) {
      const A = i * (nT + 1) + j
      const B = A + nT + 1
      if (flip) idx.push(A, A + 1, B, B, A + 1, B + 1)
      else idx.push(A, B, A + 1, B, B + 1, A + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setIndex(idx)
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  return g
}

/** Surface point + outward normal, for placing small parts on a surface. */
export function frameAt(surface, u, v) {
  const p = new THREE.Vector3()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const d = new THREE.Vector3()
  const h = 1e-3
  surface(u, v, p)
  surface(u + h, v, a)
  surface(u - h, v, b)
  surface(u, v + h, c)
  surface(u, v - h, d)
  const n = new THREE.Vector3().crossVectors(a.sub(b), c.sub(d)).normalize()
  return { p, n }
}

/** A curved sheet that follows a 2D contour (in x/y) and spans z0..z1. */
export function ribbonGeometry(pts, z0, z1, offset = 0.006) {
  const pos = []
  const nrm = []
  const idx = []
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(pts.length - 1, i + 1)]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    let nx = -ty / len
    let ny = tx / len
    if (ny < 0) {
      nx = -nx
      ny = -ny
    }
    const x = pts[i].x + nx * offset
    const y = pts[i].y + ny * offset
    pos.push(x, y, z0, x, y, z1)
    nrm.push(nx, ny, 0, nx, ny, 0)
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setIndex(idx)
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  return g
}

/** Place a cylinder between two points. */
export function between(a, b) {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const dir = b.clone().sub(a)
  const length = dir.length()
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return { position: mid, quaternion: q, length }
}
