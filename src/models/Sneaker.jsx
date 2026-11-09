import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { usePart } from '../components/usePart'
import { lookup, makeSurface, loftGeometry, patchGeometry, frameAt, between, clamp01, lerp } from './geom'

// ---- shape language (units ≈ 1 = 11 cm), toe points +x ----
const X0 = -1.28
const X1 = 1.3
const topY = lookup([[-1.28, 0.84], [-1.12, 0.93], [-0.95, 0.88], [-0.72, 0.79], [-0.48, 0.86], [-0.28, 0.82], [0.1, 0.67], [0.5, 0.53], [0.9, 0.43], [1.3, 0.31]])
const halfW = lookup([[-1.28, 0.3], [-1.0, 0.35], [-0.5, 0.355], [-0.1, 0.37], [0.4, 0.44], [0.8, 0.45], [1.1, 0.41], [1.3, 0.34]])
const lift = (x) => 0.17 * clamp01((x - 0.5) / 0.8) ** 2 // toe spring
const heelness = (x) => clamp01((0.4 - x) / 1.5)
const planEnd = (u, k) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), k)), 1 / k)
const xAt = (u, s = 1) => (X0 + (X1 - X0) * u) * s

const upper = makeSurface((u) => {
  const x = xAt(u)
  const e = planEnd(u, 4)
  const bottom = 0.15
  const hy = (topY(x) - bottom) / 2
  return { x, cy: bottom + hy + lift(x), hy: hy * Math.pow(e, u < 0.5 ? 0.15 : 0.5), hz: halfW(x) * e, n: 2.4, topTaper: 0.42 }
})

const midsole = makeSurface((u) => {
  const x = xAt(u, 1.025)
  const e = planEnd(u, 3)
  const bottom = 0.05
  const hy = (0.21 + 0.09 * heelness(x) - bottom) / 2
  return { x, cy: bottom + hy + lift(x), hy: hy * Math.pow(e, 0.12), hz: (halfW(x) + 0.06) * e, n: 4 }
})

const outsole = makeSurface((u) => {
  const x = xAt(u, 1.03)
  const e = planEnd(u, 3)
  const hy = 0.035
  return { x, cy: hy + lift(x) + 0.005, hy: hy * Math.pow(e, 0.12), hz: (halfW(x) + 0.05) * e, n: 5 }
})

const TAU = Math.PI * 2

function useGeometries() {
  return useMemo(() => {
    const flash = (s, t) => {
      const u = lerp(0.2, 0.62, s)
      const vc = lerp(0.19, 0.36, s ** 1.2)
      const hw = lerp(0.065, 0.006, s ** 0.9) * Math.sqrt(Math.min(1, s / 0.12)) // rounded tail
      return [u, vc + (t - 0.5) * 2 * hw]
    }
    const laces = []
    for (let k = 0; k < 6; k++) {
      const u = 0.385 + k * 0.053
      const A = frameAt(upper, u, 0.43)
      const B = frameAt(upper, u + 0.035, 0.57)
      const C = frameAt(upper, u + 0.035, 0.43)
      const D = frameAt(upper, u, 0.57)
      const off = (f) => f.p.clone().addScaledVector(f.n, 0.022)
      laces.push(between(off(A), off(B)), between(off(C), off(D)))
    }
    const tongue = frameAt(upper, 0.35, 0.5)
    const tab = frameAt(upper, 0.03, 0.5)
    return {
      upper: loftGeometry(upper, 160, 96),
      midsole: loftGeometry(midsole, 140, 64),
      outsole: loftGeometry(outsole, 140, 48),
      toeCap: patchGeometry(upper, 24, 120, (s, t) => [lerp(0.8 + 0.04 * Math.cos(TAU * (t - 0.5)), 1, s), t], 0.005),
      heel: patchGeometry(upper, 30, 120, (s, t) => [lerp(0, 0.22 - 0.12 * Math.cos(TAU * (t - 0.5)), s), t], 0.005),
      eyeL: patchGeometry(upper, 40, 6, (s, t) => [lerp(0.37, 0.69, s), lerp(0.39, 0.425, t)], 0.007),
      eyeR: patchGeometry(upper, 40, 6, (s, t) => [lerp(0.37, 0.69, s), lerp(0.575, 0.61, t)], 0.007),
      flashR: patchGeometry(upper, 50, 10, flash, 0.01),
      flashL: patchGeometry(upper, 50, 10, (s, t) => { const [u, v] = flash(s, t); return [u, 1 - v] }, 0.01, true),
      lining: patchGeometry(upper, 30, 24, (s, t) => [lerp(0.12, 0.34, s), 0.5 + (t - 0.5) * 2 * 0.12 * Math.sqrt(Math.sin(Math.PI * s))], 0.004),
      laces,
      tongue,
      tab,
    }
  }, [])
}

export function Sneaker() {
  const g = useGeometries()
  const [mUpper, hUpper] = usePart('sneaker', 'upper')
  const [mOver, hOver] = usePart('sneaker', 'overlays')
  const [mAccent, hAccent] = usePart('sneaker', 'accent')
  const [mLaces, hLaces] = usePart('sneaker', 'laces')
  const [mLining, hLining] = usePart('sneaker', 'lining')
  const [mMid, hMid] = usePart('sneaker', 'midsole')
  const [mOut, hOut] = usePart('sneaker', 'outsole')

  return (
    <group>
      <group {...hUpper}>
        <mesh geometry={g.upper} material={mUpper} />
        <RoundedBox
          args={[0.07, 0.26, 0.27]}
          radius={0.03}
          smoothness={4}
          material={mUpper}
          position={[g.tongue.p.x - 0.03, g.tongue.p.y + 0.06, 0]}
          rotation={[0, 0, 0.42]}
        />
      </group>
      <group {...hOver}>
        <mesh geometry={g.toeCap} material={mOver} />
        <mesh geometry={g.heel} material={mOver} />
        <mesh geometry={g.eyeL} material={mOver} />
        <mesh geometry={g.eyeR} material={mOver} />
      </group>
      <group {...hAccent}>
        <mesh geometry={g.flashR} material={mAccent} />
        <mesh geometry={g.flashL} material={mAccent} />
        <RoundedBox args={[0.05, 0.2, 0.14]} radius={0.02} smoothness={4} material={mAccent} position={[g.tab.p.x - 0.03, g.tab.p.y - 0.02, 0]} rotation={[0, 0, 0.18]} />
      </group>
      <group {...hLining}>
        <mesh geometry={g.lining} material={mLining} />
      </group>
      <group {...hLaces}>
        {g.laces.map((l, i) => (
          <mesh key={i} position={l.position} quaternion={l.quaternion} material={mLaces}>
            <cylinderGeometry args={[0.017, 0.017, l.length + 0.03, 10]} />
          </mesh>
        ))}
      </group>
      <group {...hMid}>
        <mesh geometry={g.midsole} material={mMid} />
      </group>
      <group {...hOut}>
        <mesh geometry={g.outsole} material={mOut} />
      </group>
    </group>
  )
}
