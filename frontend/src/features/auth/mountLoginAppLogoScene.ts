import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import logoAppGlbUrl from '../../assets/logo_app.glb?url'
import { attachLogoLoginSpin } from '../assistant/logo3d/logo3dLoginSpin'
import { centerAndFitSphere } from '../assistant/logo3d/logo3dSceneHelpers'
import {
  attachLoginLogoInnerSpinGroup,
  loginLogoInnerCounterRotationY,
} from './loginAppLogoInnerSpin'
import {
  applyLoginAppLogoMaterials,
  LOGIN_LOGO_CYAN,
  LOGIN_LOGO_ORANGE,
} from './kairosLoginLogoColors'

export type MountLoginAppLogoOptions = {
  interactiveSpin?: boolean
}

export function mountLoginAppLogoScene(
  canvas: HTMLCanvasElement,
  { interactiveSpin = true }: MountLoginAppLogoOptions = {},
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
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
  scene.add(new THREE.AmbientLight(0xffffff, 0.62))

  const key = new THREE.DirectionalLight(0xffffff, 0.75)
  key.position.set(2, 2.5, 4)
  scene.add(key)

  const cyanFill = new THREE.PointLight(LOGIN_LOGO_CYAN, 0.48, 8)
  cyanFill.position.set(-1.2, 0.6, 2)
  scene.add(cyanFill)

  const orangeFill = new THREE.PointLight(LOGIN_LOGO_ORANGE, 0.4, 6)
  orangeFill.position.set(0.8, -0.4, 1.5)
  scene.add(orangeFill)

  const root = new THREE.Group()
  scene.add(root)

  let disposed = false
  let innerSpin: THREE.Group | null = null
  const loader = new GLTFLoader()
  loader.load(
    logoAppGlbUrl,
    (gltf) => {
      if (disposed) return
      applyLoginAppLogoMaterials(gltf.scene)
      innerSpin = attachLoginLogoInnerSpinGroup(gltf.scene)
      root.add(gltf.scene)
      centerAndFitSphere(camera, gltf.scene)
    },
    undefined,
    (err) => {
      if (import.meta.env.DEV) {
        console.warn('[login-app-logo] failed to load logo_app.glb', err)
      }
    },
  )

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

  const spin = interactiveSpin ? attachLogoLoginSpin(canvas) : null
  const start = performance.now()
  let frame = 0
  let lastNow = start
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick)
    const dt = Math.min((now - lastNow) / 1000, 0.05)
    lastNow = now
    spin?.tick(dt)
    const idle = ((now - start) / 20000) * Math.PI * 2
    const outerY = idle + (spin?.readAngle() ?? 0)
    root.rotation.y = outerY
    if (innerSpin) {
      innerSpin.rotation.y = loginLogoInnerCounterRotationY(outerY)
    }
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
