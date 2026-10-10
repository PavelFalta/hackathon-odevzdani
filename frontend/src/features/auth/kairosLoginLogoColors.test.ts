import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import {
  applyLoginAppLogoMaterials,
  inferLoginLogoMeshRole,
  LOGIN_LOGO_CYAN,
  LOGIN_LOGO_ORANGE,
  LOGIN_LOGO_ROLE_BY_NAME,
  meshMaxDimension,
  resolveLoginLogoMeshRole,
  rolesByBoundingSize,
} from './kairosLoginLogoColors'

describe('kairosLoginLogoColors', () => {
  it('maps logo_app.glb part names explicitly', () => {
    expect(LOGIN_LOGO_ROLE_BY_NAME.tripo_part_4).toBe('outer')
    expect(LOGIN_LOGO_ROLE_BY_NAME.tripo_part_0).toBe('inner')
    expect(inferLoginLogoMeshRole('outer_ring')).toBe('outer')
    expect(inferLoginLogoMeshRole('Inner_Arc')).toBe('inner')
  })

  it('assigns outer/inner by bounding size when names are generic', () => {
    const large = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.2), new THREE.MeshBasicMaterial())
    large.name = 'part_a'
    const small = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.2), new THREE.MeshBasicMaterial())
    small.name = 'part_b'
    const roles = rolesByBoundingSize([small, large])
    expect(roles.get(large)).toBe('outer')
    expect(roles.get(small)).toBe('inner')
    expect(meshMaxDimension(large)).toBeGreaterThan(meshMaxDimension(small))
    expect(resolveLoginLogoMeshRole(large, roles)).toBe('outer')
    expect(resolveLoginLogoMeshRole(small, roles)).toBe('inner')
  })

  it('replaces materials with neon MeshStandardMaterial colors', () => {
    const root = new THREE.Group()
    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.08, 8, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 1 }),
    )
    outer.name = 'tripo_part_4'
    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.08, 8, 32),
      new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 1 }),
    )
    inner.name = 'tripo_part_0'
    root.add(outer, inner)

    applyLoginAppLogoMaterials(root)

    const outerMat = outer.material as THREE.MeshStandardMaterial
    const innerMat = inner.material as THREE.MeshStandardMaterial
    expect(outerMat).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(innerMat).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(outerMat.emissive.getHex()).toBe(LOGIN_LOGO_CYAN)
    expect(innerMat.emissive.getHex()).toBe(LOGIN_LOGO_ORANGE)
    expect(innerMat.emissiveIntensity).toBeGreaterThan(outerMat.emissiveIntensity)
  })
})
