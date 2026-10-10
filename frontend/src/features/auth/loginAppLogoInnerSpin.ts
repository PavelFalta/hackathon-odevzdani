import * as THREE from 'three'
import { resolveLoginLogoMeshRole, rolesByBoundingSize } from './kairosLoginLogoColors'

/** World-space inner speed vs outer idle/drag spin (0–1, opposite direction). */
export const LOGIN_LOGO_INNER_COUNTER_WORLD_RATIO = 0.42

/** Local Y on the inner spin group (child of the rotating root). */
export function loginLogoInnerCounterRotationY(outerRotationY: number): number {
  const k = LOGIN_LOGO_INNER_COUNTER_WORLD_RATIO
  return -outerRotationY * (1 + k)
}

export function attachLoginLogoInnerSpinGroup(gltfScene: THREE.Object3D): THREE.Group | null {
  const meshes: THREE.Mesh[] = []
  gltfScene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) meshes.push(obj)
  })
  if (!meshes.length) return null

  const bboxRoles = rolesByBoundingSize(meshes)
  const innerMeshes = meshes.filter((mesh) => resolveLoginLogoMeshRole(mesh, bboxRoles) === 'inner')
  if (!innerMeshes.length) return null

  const innerSpin = new THREE.Group()
  innerSpin.name = 'login-logo-inner-spin'
  gltfScene.add(innerSpin)

  for (const mesh of innerMeshes) {
    innerSpin.attach(mesh)
  }
  return innerSpin
}
