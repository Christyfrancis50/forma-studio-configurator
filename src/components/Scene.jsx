import { useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { PRODUCTS } from '../products'
import { Sneaker } from '../models/Sneaker'
import { Chair } from '../models/Chair'
import { Car } from '../models/Car'

export const glRef = { current: null }

function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <Lightformer form="rect" intensity={2.4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
      <Lightformer form="rect" intensity={3} color="#fff6ec" position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[18, 1.2, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[-6, -0.5, -1]} rotation-y={Math.PI / 2} scale={[18, 0.6, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#eef3ff" position={[7, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[18, 1.5, 1]} />
      <Lightformer form="ring" intensity={5} color="#ffe2c4" position={[3, 3.5, 6]} scale={2.2} onUpdate={(s) => s.lookAt(0, 0, 0)} />
      <Lightformer form="rect" intensity={0.8} position={[0, 1, -8]} scale={[20, 6, 1]} />
    </Environment>
  )
}

function CameraRig({ product }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const animating = useRef(true)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const to = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() })

  useEffect(() => {
    const c = PRODUCTS[product].camera
    // Narrow (portrait) viewports need the camera further back to fit the product.
    const fit = Math.min(1.9, Math.max(1, 1.3 / aspect))
    to.current.target.set(...c.target)
    to.current.pos.set(...c.position).sub(to.current.target).multiplyScalar(fit).add(to.current.target)
    animating.current = true
  }, [product, aspect])

  useEffect(() => {
    if (!controls) return
    const stop = () => (animating.current = false)
    controls.addEventListener('start', stop)
    return () => controls.removeEventListener('start', stop)
  }, [controls])

  useFrame((_, dt) => {
    if (!animating.current || !controls) return
    const k = 1 - Math.exp(-dt * 2.6)
    camera.position.lerp(to.current.pos, k)
    controls.target.lerp(to.current.target, k)
    controls.update()
    if (camera.position.distanceTo(to.current.pos) < 0.005) animating.current = false
  })
  return null
}

function Reveal({ children }) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current.scale.setScalar(0.82)
    ref.current.rotation.y = -0.6
  }, [])
  useFrame((_, dt) => {
    const g = ref.current
    const k = 1 - Math.exp(-dt * 4.5)
    g.scale.setScalar(g.scale.x + (1 - g.scale.x) * k)
    g.rotation.y += (0 - g.rotation.y) * k
  })
  return <group ref={ref}>{children}</group>
}

function GlGrabber() {
  const gl = useThree((s) => s.gl)
  useEffect(() => void (glRef.current = gl), [gl])
  return null
}

export function Scene() {
  const product = useStore((s) => s.product)
  const autoRotate = useStore((s) => s.autoRotate)
  const cam = PRODUCTS[product].camera

  return (
    <>
      <GlGrabber />
      <Studio />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 7, 4]} intensity={1.2} />

      <Reveal key={product}>
        {product === 'sneaker' && (
          <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.5} floatingRange={[0.02, 0.12]}>
            <group position={[0, 0.32, 0]} rotation={[0, 0, 0.04]}>
              <Sneaker />
            </group>
          </Float>
        )}
        {product === 'chair' && <Chair />}
        {product === 'car' && <Car />}
      </Reveal>

      <ContactShadows position={[0, 0, 0]} opacity={product === 'sneaker' ? 0.35 : 0.55} scale={product === 'car' ? 12 : 7} blur={product === 'sneaker' ? 3 : 2.2} far={product === 'sneaker' ? 2 : 3} resolution={1024} color="#3a2f25" />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.7}
        minDistance={cam.min}
        maxDistance={cam.max * 1.9}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 - 0.04}
      />
      <CameraRig product={product} />
    </>
  )
}
