import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { usePart } from '../components/usePart'
import { ribbonGeometry } from './geom'

const BODY_DEPTH = 1.5
const BODY_BEVEL = 0.1
const CABIN_DEPTH = 1.1
const CABIN_BEVEL = 0.14
const WHEEL_R = 0.345
const AXLES = [-1.2, 1.25]
const TRACK = 0.79

function bodyShape() {
  const s = new THREE.Shape()
  s.moveTo(-1.98, 0.45)
  s.lineTo(-1.63, 0.36)
  s.absarc(AXLES[0], 0.36, 0.43, Math.PI, 0, true)
  s.lineTo(-0.72, 0.24)
  s.lineTo(0.77, 0.24)
  s.lineTo(0.82, 0.36)
  s.absarc(AXLES[1], 0.36, 0.43, Math.PI, 0, true)
  s.lineTo(2.0, 0.34)
  s.bezierCurveTo(2.08, 0.45, 2.08, 0.62, 1.98, 0.72)
  s.bezierCurveTo(1.7, 0.86, 1.1, 0.97, 0.55, 0.99)
  s.lineTo(-1.1, 1.0)
  s.bezierCurveTo(-1.55, 1.0, -1.9, 0.96, -2.02, 0.84)
  s.bezierCurveTo(-2.06, 0.7, -2.04, 0.52, -1.98, 0.45)
  return s
}

function cabinShape() {
  const s = new THREE.Shape()
  s.moveTo(0.72, 0.9)
  s.bezierCurveTo(0.35, 1.05, 0.05, 1.34, -0.3, 1.38)
  s.bezierCurveTo(-0.75, 1.42, -1.05, 1.3, -1.62, 0.95)
  s.lineTo(-1.62, 0.9)
  s.closePath()
  return s
}

const extrude = (shape, depth, bevel, segs = 10) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: segs,
    curveSegments: 64,
    steps: 1,
  })
  g.translate(0, 0, -depth / 2)
  g.computeVertexNormals()
  return g
}

const fixed = {
  rubber: new THREE.MeshPhysicalMaterial({ color: '#141414', roughness: 0.85, side: THREE.DoubleSide }),
  dark: new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.7 }),
  disc: new THREE.MeshStandardMaterial({ color: '#6b6e73', metalness: 1, roughness: 0.45 }),
  interior: new THREE.MeshStandardMaterial({ color: '#1b1b1d', roughness: 0.75 }),
  head: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f4f7ff', emissiveIntensity: 2.2, toneMapped: false }),
  tail: new THREE.MeshStandardMaterial({ color: '#ff1a1a', emissive: '#ff1020', emissiveIntensity: 2.5, toneMapped: false }),
}

const tireGeo = new THREE.LatheGeometry(
  [[0.235, -0.13], [0.3, -0.135], [0.333, -0.11], [WHEEL_R, 0], [0.333, 0.11], [0.3, 0.135], [0.235, 0.13]].map(([x, y]) => new THREE.Vector2(x, y)),
  64,
)

function Wheel({ position, side, rim, caliper, hRim, hCal }) {
  return (
    <group position={position} rotation={[0, side < 0 ? Math.PI : 0, 0]}>
      <mesh geometry={tireGeo} material={fixed.rubber} rotation={[Math.PI / 2, 0, 0]} />
      <mesh material={fixed.dark} position={[0, 0, -0.08]}>
        <circleGeometry args={[0.24, 48]} />
      </mesh>
      <mesh material={fixed.disc} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 48]} />
      </mesh>
      <group {...hCal}>
        <mesh material={caliper} position={[0, 0, 0.0]} rotation={[0, 0, 0.35]}>
          <torusGeometry args={[0.165, 0.038, 12, 24, 1.1]} />
        </mesh>
      </group>
      <group {...hRim}>
        <mesh material={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0]}>
          <cylinderGeometry args={[0.236, 0.236, 0.2, 64, 1, true]} />
        </mesh>
        <mesh material={rim} position={[0, 0, 0.1]}>
          <torusGeometry args={[0.225, 0.014, 12, 64]} />
        </mesh>
        {Array.from({ length: 10 }, (_, k) => (
          <group key={k} rotation={[0, 0, (k * Math.PI) / 5]}>
            <mesh material={rim} position={[0.12, 0, 0.08]} rotation={[0, k % 2 ? 0.25 : -0.25, 0]}>
              <boxGeometry args={[0.2, 0.035, 0.025]} />
            </mesh>
          </group>
        ))}
        <mesh material={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]}>
          <cylinderGeometry args={[0.055, 0.06, 0.04, 32]} />
        </mesh>
      </group>
    </group>
  )
}

export function Car() {
  const geo = useMemo(() => {
    const cabin = cabinShape()
    const roofPts = cabin
      .getPoints(80)
      .filter((p) => p.y > 1.2 && p.x < -0.12 && p.x > -1.08)
      .sort((a, b) => a.x - b.x)
    return {
      body: extrude(bodyShape(), BODY_DEPTH, BODY_BEVEL),
      cabin: extrude(cabin, CABIN_DEPTH, CABIN_BEVEL, 12),
      roof: ribbonGeometry(roofPts, -CABIN_DEPTH / 2 + 0.02, CABIN_DEPTH / 2 - 0.02, 0.006),
    }
  }, [])

  const [mBody, hBody] = usePart('car', 'body')
  const [mRim, hRim] = usePart('car', 'wheels')
  const [mCal, hCal] = usePart('car', 'calipers')
  const [mGlass, hGlass] = usePart('car', 'glass')
  const [mTrim, hTrim] = usePart('car', 'trim')

  return (
    <group>
      <group {...hBody}>
        <mesh geometry={geo.body} material={mBody} />
        <mesh geometry={geo.roof} material={mBody} />
        {[1, -1].map((s) => (
          <RoundedBox key={s} args={[0.16, 0.09, 0.14]} radius={0.035} smoothness={4} material={mBody} position={[0.5, 1.03, s * 0.76]} />
        ))}
      </group>

      <group {...hGlass}>
        <mesh geometry={geo.cabin} material={mGlass} />
      </group>

      {/* interior silhouettes seen through the glass */}
      {[0.3, -0.3].map((z) => (
        <group key={z}>
          <RoundedBox args={[0.42, 0.12, 0.38]} radius={0.04} material={fixed.interior} position={[-0.42, 1.04, z]} />
          <RoundedBox args={[0.12, 0.42, 0.36]} radius={0.04} material={fixed.interior} position={[-0.66, 1.2, z]} rotation={[0, 0, 0.25]} />
        </group>
      ))}
      <mesh material={fixed.interior} position={[0.05, 1.12, 0.3]} rotation={[0, Math.PI / 2, 0.5]}>
        <torusGeometry args={[0.1, 0.018, 10, 32]} />
      </mesh>

      <group {...hTrim}>
        {[1, -1].map((s) => (
          <RoundedBox key={s} args={[1.4, 0.07, 0.07]} radius={0.03} smoothness={4} material={mTrim} position={[0.03, 0.27, s * 0.83]} />
        ))}
        <RoundedBox args={[0.22, 0.045, 1.5]} radius={0.02} smoothness={4} material={mTrim} position={[1.9, 0.32, 0]} />
        <RoundedBox args={[0.22, 0.12, 1.36]} radius={0.04} smoothness={4} material={mTrim} position={[-1.92, 0.44, 0]} />
        <RoundedBox args={[0.26, 0.035, 1.46]} radius={0.016} smoothness={4} material={mTrim} position={[-1.8, 0.965, 0]} rotation={[0, 0, 0.1]} />
      </group>

      {/* lights */}
      {[1, -1].map((s) => (
        <RoundedBox key={s} args={[0.06, 0.035, 0.42]} radius={0.015} material={fixed.head} position={[2.01, 0.69, s * 0.52]} rotation={[0, 0, -0.55]} />
      ))}
      <RoundedBox args={[0.04, 0.04, 1.5]} radius={0.015} material={fixed.tail} position={[-2.035, 0.78, 0]} />

      {AXLES.map((x) =>
        [1, -1].map((side) => (
          <Wheel key={`${x}${side}`} position={[x, WHEEL_R, side * TRACK]} side={side} rim={mRim} caliper={mCal} hRim={hRim} hCal={hCal} />
        )),
      )}
    </group>
  )
}
