import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import {
  attachLoginLogoInnerSpinGroup,
  loginLogoInnerCounterRotationY,
  LOGIN_LOGO_INNER_COUNTER_WORLD_RATIO,
} from './loginAppLogoInnerSpin'

describe('loginAppLogoInnerSpin', () => {
  it('counter-rotates inner slower and opposite to outer in world space', () => {
    const outerY = 1.2
    const innerLocal = loginLogoInnerCounterRotationY(outerY)
    const worldInner = outerY + innerLocal
    expect(worldInner).toBeCloseTo(-outerY * LOGIN_LOGO_INNER_COUNTER_WORLD_RATIO, 8)
    expect(worldInner).toBeLessThan(0)
  })

  it('reparents inner meshes into a spin group', () => {
    const scene = new THREE.Group()
    const outer = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.2), new THREE.MeshBasicMaterial())
    outer.name = 'tripo_part_4'
    const inner = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.2), new THREE.MeshBasicMaterial())
    inner.name = 'tripo_part_0'
    scene.add(outer, inner)

    const spinGroup = attachLoginLogoInnerSpinGroup(scene)
    expect(spinGroup).not.toBeNull()
    expect(spinGroup!.children).toContain(inner)
    expect(outer.parent).toBe(scene)
    expect(inner.parent).toBe(spinGroup)
  })
})
