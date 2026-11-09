import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { MATERIALS, NUMERIC_DEFAULTS, getTexture } from '../materials'

const WHITE = new THREE.Color('#ffffff')
const KEYS = Object.keys(NUMERIC_DEFAULTS)

/**
 * One shared MeshPhysicalMaterial per configurable part. Colour and every numeric
 * material property ease toward the current selection each frame, so swaps animate.
 * Returns [material, pointerHandlers] — spread the handlers on the part's group.
 */
export function usePart(product, part) {
  const sel = useStore((s) => s.config[product][part])
  const hovered = useStore((s) => s.hovered === part)
  const preset = MATERIALS[sel.material]

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: sel.color })
    Object.assign(m, NUMERIC_DEFAULTS, preset.props)
    m.emissive.set('#ffffff')
    m.emissiveIntensity = 0
    return m
    // created once per mount; later changes animate in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const target = useMemo(() => ({ color: new THREE.Color(sel.color), ...NUMERIC_DEFAULTS, ...preset.props }), [sel.color, preset])

  useEffect(() => {
    material.map = preset.map ? getTexture(preset.map, preset.repeat, true) : null
    material.bumpMap = preset.bump ? getTexture(preset.bump, preset.repeat) : null
    material.bumpScale = preset.bumpScale ?? 1
    material.needsUpdate = true
  }, [material, preset])

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 7)
    material.color.lerp(target.color, k)
    for (const key of KEYS) material[key] += (target[key] - material[key]) * k
    material.sheenColor.copy(material.color).lerp(WHITE, 0.35)
    material.emissiveIntensity += ((hovered ? 0.07 : 0) - material.emissiveIntensity) * k
  })

  const handlers = useMemo(() => {
    const { setHovered, clearHovered, setActivePart } = useStore.getState()
    return {
      onPointerOver: (e) => {
        e.stopPropagation()
        setHovered(part)
        document.body.style.cursor = 'pointer'
      },
      onPointerOut: () => {
        clearHovered(part)
        document.body.style.cursor = ''
      },
      onClick: (e) => {
        e.stopPropagation()
        if (e.delta < 6) setActivePart(part)
      },
    }
  }, [part])

  return [material, handlers]
}
