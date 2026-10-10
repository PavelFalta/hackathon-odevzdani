import * as THREE from 'three'
import { easeInOutCubic } from './logo3dSwap'

const LOGIN_SWAP_HOLD_MS = 2500
const LOGIN_SWAP_DURATION_MS = 700

export function loginSwapBlend(elapsedMs: number): number {
  const segment = LOGIN_SWAP_HOLD_MS + LOGIN_SWAP_DURATION_MS
  const t = elapsedMs % (2 * segment)
  if (t < segment) {
    return t < LOGIN_SWAP_HOLD_MS
      ? 0
      : easeInOutCubic((t - LOGIN_SWAP_HOLD_MS) / LOGIN_SWAP_DURATION_MS)
  }
  return t - segment < LOGIN_SWAP_HOLD_MS
    ? 1
    : 1 - easeInOutCubic((t - segment - LOGIN_SWAP_HOLD_MS) / LOGIN_SWAP_DURATION_MS)
}

export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  offset = 1.35,
) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = (camera.fov * Math.PI) / 180
  const distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * offset
  camera.position.set(center.x, center.y, center.z + distance)
  camera.near = distance / 100
  camera.far = distance * 100
  camera.updateProjectionMatrix()
  camera.lookAt(center)
}

export function centerAndFitSphere(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  margin = 1.08,
) {
  const box = new THREE.Box3().setFromObject(object)
  object.position.sub(box.getCenter(new THREE.Vector3()))
  object.updateMatrixWorld(true)
  const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere())
  const vFov = (camera.fov * Math.PI) / 180
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
  const distance = (sphere.radius / Math.sin(Math.min(vFov, hFov) / 2)) * margin
  camera.position.set(0, 0, distance)
  camera.near = distance / 100
  camera.far = distance * 100
  camera.updateProjectionMatrix()
  camera.lookAt(0, 0, 0)
}

export type LogoParts = {
  arrow: THREE.Object3D | null
  circle: THREE.Object3D | null
  cube: THREE.Object3D | null
  restCircle: THREE.Vector3
  restCube: THREE.Vector3
  anchor: THREE.Vector3
  restArrowY: number
}

export type LoginSwapRest = { circleQuat: THREE.Quaternion; cubeQuat: THREE.Quaternion }

export function applySwap(parts: LogoParts, towardCube: number) {
  const { circle, cube, restCircle, restCube, anchor } = parts
  if (!circle || !cube) return
  const circleScale = Math.cos((towardCube * Math.PI) / 2)
  const cubeScale = Math.sin((towardCube * Math.PI) / 2)
  circle.position.lerpVectors(restCircle, anchor, towardCube)
  cube.position.lerpVectors(restCube, anchor, 1 - towardCube)
  circle.scale.setScalar(Math.max(circleScale, 0.001))
  cube.scale.setScalar(Math.max(cubeScale, 0.001))
  circle.rotation.set(towardCube * Math.PI * 0.55, towardCube * Math.PI, 0)
  cube.rotation.set((1 - towardCube) * Math.PI * 0.55, (1 - towardCube) * Math.PI, 0)
}

export function applyLoginSwap(parts: LogoParts, rest: LoginSwapRest, blend: number) {
  const { circle, cube, restCircle, restCube } = parts
  if (!circle || !cube) return
  circle.position.lerpVectors(restCircle, restCube, blend)
  cube.position.lerpVectors(restCube, restCircle, blend)
  circle.scale.setScalar(1)
  cube.scale.setScalar(1)
  circle.quaternion.copy(rest.circleQuat)
  cube.quaternion.copy(rest.cubeQuat)
}

export function applyArrow(parts: LogoParts, offsetY: number | null) {
  if (!parts.arrow) return
  parts.arrow.rotation.y = parts.restArrowY + (offsetY ?? 0)
}
