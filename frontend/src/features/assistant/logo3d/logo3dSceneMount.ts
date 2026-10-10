import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import logoGlbUrl from '../../../assets/logo3d.glb?url'
import { arrowCueOffsetY } from './logo3dArrowCue'
import type { Logo3dRuntime } from './logo3dRuntime'
import {
  applyArrow,
  applyLoginSwap,
  applySwap,
  centerAndFitSphere,
  fitCameraToObject,
  loginSwapBlend,
  type LoginSwapRest,
  type LogoParts,
} from './logo3dSceneHelpers'
import { attachLogoLoginSpin } from './logo3dLoginSpin'
import { logoSwapBlend } from './logo3dSwap'

export function mountLogo3dScene(
  canvas: HTMLCanvasElement,
  runtime: { current: Logo3dRuntime },
  staticPose = false,
  interactiveSpin = false,
): () => void {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
  } catch {
    return () => {}
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
  scene.add(new THREE.AmbientLight(0xffffff, 0.85))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(2, 3, 4)
  scene.add(key)

  const root = new THREE.Group()
  scene.add(root)

  const parts: LogoParts = {
    arrow: null,
    circle: null,
    cube: null,
    restCircle: new THREE.Vector3(),
    restCube: new THREE.Vector3(),
    anchor: new THREE.Vector3(),
    restArrowY: 0,
  }
  const loginRest: LoginSwapRest = {
    circleQuat: new THREE.Quaternion(),
    cubeQuat: new THREE.Quaternion(),
  }
  let disposed = false
  let lastReplyCue = 0
  let cueStartedAt = -1
  let idleTowardCube = 0

  const loader = new GLTFLoader()
  loader.load(logoGlbUrl, (gltf) => {
    if (disposed) return
    root.add(gltf.scene)
    if (staticPose) {
      centerAndFitSphere(camera, gltf.scene)
      parts.circle = gltf.scene.getObjectByName('circle') ?? null
      parts.cube = gltf.scene.getObjectByName('cube') ?? null
      if (!parts.circle || !parts.cube) return
      parts.restCircle.copy(parts.circle.position)
      parts.restCube.copy(parts.cube.position)
      loginRest.circleQuat.copy(parts.circle.quaternion)
      loginRest.cubeQuat.copy(parts.cube.quaternion)
      return
    }
    parts.arrow = gltf.scene.getObjectByName('arrow') ?? null
    parts.circle = gltf.scene.getObjectByName('circle') ?? null
    parts.cube = gltf.scene.getObjectByName('cube') ?? null
    if (!parts.circle || !parts.cube) return
    parts.restCircle.copy(parts.circle.position)
    parts.restCube.copy(parts.cube.position)
    parts.anchor.copy(parts.restCircle).add(parts.restCube).multiplyScalar(0.5)
    if (parts.arrow) parts.restArrowY = parts.arrow.rotation.y
    applySwap(parts, 0)
    applyArrow(parts, null)
    fitCameraToObject(camera, gltf.scene)
  })

  const resize = () => {
    const w = Math.max(canvas.clientWidth, 1)
    const h = Math.max(canvas.clientHeight, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  const spin = staticPose && interactiveSpin ? attachLogoLoginSpin(canvas) : null
  const start = performance.now()
  let frame = 0
  let lastNow = start
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick)
    const dt = Math.min((now - lastNow) / 1000, 0.05)
    lastNow = now
    if (staticPose) {
      spin?.tick(dt)
      applyLoginSwap(parts, loginRest, loginSwapBlend(now - start))
      const idle = ((now - start) / 16000) * Math.PI * 2
      root.rotation.y = idle + (spin?.readAngle() ?? 0)
      renderer.render(scene, camera)
      return
    }
    const elapsed = now - start
    const { thinking, replyCue } = runtime.current

    if (replyCue > lastReplyCue) {
      lastReplyCue = replyCue
      cueStartedAt = now
      idleTowardCube = 0
      applySwap(parts, 0)
    }

    const cueOffset = cueStartedAt >= 0 ? arrowCueOffsetY(now - cueStartedAt) : null
    if (cueStartedAt >= 0 && cueOffset === null && now - cueStartedAt > 0) {
      cueStartedAt = -1
    }

    if (thinking) {
      idleTowardCube = logoSwapBlend(elapsed)
      applySwap(parts, idleTowardCube)
    } else {
      applySwap(parts, idleTowardCube)
    }

    applyArrow(parts, cueOffset)
    renderer.render(scene, camera)
  }
  tick(start)

  return () => {
    disposed = true
    spin?.dispose()
    cancelAnimationFrame(frame)
    ro.disconnect()
    root.clear()
    renderer.dispose()
  }
}
