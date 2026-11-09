import { RoundedBox } from '@react-three/drei'
import { usePart } from '../components/usePart'

const LEGS = [
  [0.6, 0.5],
  [-0.6, 0.5],
  [0.6, -0.5],
  [-0.6, -0.5],
]

export function Chair() {
  const [mShell, hShell] = usePart('chair', 'shell')
  const [mCush, hCush] = usePart('chair', 'cushions')
  const [mLegs, hLegs] = usePart('chair', 'legs')
  const [mPillow, hPillow] = usePart('chair', 'pillow')

  return (
    <group>
      <group {...hLegs}>
        {LEGS.map(([x, z], i) => (
          <mesh key={i} material={mLegs} position={[x, 0.2, z]} rotation={[Math.sign(z) * 0.14, 0, -Math.sign(x) * 0.14]}>
            <cylinderGeometry args={[0.045, 0.022, 0.44, 32]} />
          </mesh>
        ))}
      </group>

      <group {...hShell}>
        {/* base */}
        <RoundedBox args={[1.56, 0.15, 1.3]} radius={0.06} smoothness={5} position={[0, 0.46, 0]} material={mShell} />
        {/* arms */}
        <RoundedBox args={[0.2, 0.52, 1.3]} radius={0.09} smoothness={6} position={[0.68, 0.76, 0]} material={mShell} />
        <RoundedBox args={[0.2, 0.52, 1.3]} radius={0.09} smoothness={6} position={[-0.68, 0.76, 0]} material={mShell} />
        {/* back */}
        <RoundedBox args={[1.56, 0.98, 0.2]} radius={0.09} smoothness={6} position={[0, 0.94, -0.6]} rotation={[-0.12, 0, 0]} material={mShell} />
      </group>

      <group {...hCush}>
        <RoundedBox args={[1.14, 0.24, 1.1]} radius={0.1} smoothness={8} position={[0, 0.63, 0.07]} material={mCush} />
        <RoundedBox args={[1.14, 0.72, 0.26]} radius={0.12} smoothness={8} position={[0, 1.0, -0.4]} rotation={[-0.16, 0, 0]} material={mCush} />
      </group>

      <group {...hPillow}>
        <RoundedBox args={[0.6, 0.38, 0.15]} radius={0.07} smoothness={8} material={mPillow} position={[0.2, 0.92, -0.2]} rotation={[-0.32, -0.22, 0.12]} />
      </group>
    </group>
  )
}
