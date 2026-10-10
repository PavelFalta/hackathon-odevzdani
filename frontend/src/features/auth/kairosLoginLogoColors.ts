import * as THREE from 'three'

/** Kairos login palette — matches `src/theme/variables.css`. */
export const LOGIN_LOGO_CYAN = 0x6fc3df
export const LOGIN_LOGO_ORANGE = 0xf38518
export const LOGIN_LOGO_MUTED = 0xa5a5a5
export const LOGIN_LOGO_DARK = 0x000000

export type LoginLogoMeshRole = 'outer' | 'inner' | 'detail' | 'dark'

/** Names from `logo_app.glb` (Tripo export). */
export const LOGIN_LOGO_ROLE_BY_NAME: Record<string, LoginLogoMeshRole> = {
  tripo_part_4: 'outer',
  tripo_part_0: 'inner',
  Material_tripo_part_4: 'outer',
  Material_tripo_part_0: 'inner',
}

const OUTER_EMISSIVE = 0.62
const INNER_EMISSIVE = 1.05
const DETAIL_EMISSIVE = 0.22

/**
 * Substring fallback when explicit map misses (other GLB exports).
 */
export function inferLoginLogoMeshRole(objectName: string): LoginLogoMeshRole | null {
  const n = objectName.toLowerCase()
  if (/(inner|arc|orange|kairos)/.test(n)) return 'inner'
  if (/(outer|ring|cyan|disk|circle|frame)/.test(n)) return 'outer'
  if (/(dot|tick|mark|detail|pin)/.test(n)) return 'detail'
  return null
}

export function meshMaxDimension(mesh: THREE.Mesh): number {
  const box = new THREE.Box3().setFromObject(mesh)
  const size = box.getSize(new THREE.Vector3())
  return Math.max(size.x, size.y, size.z)
}

/** Largest mesh → outer, second → inner; tiny → detail. */
export function rolesByBoundingSize(meshes: THREE.Mesh[]): Map<THREE.Mesh, LoginLogoMeshRole> {
  const ranked = [...meshes].sort((a, b) => meshMaxDimension(b) - meshMaxDimension(a))
  const map = new Map<THREE.Mesh, LoginLogoMeshRole>()
  ranked.forEach((mesh, index) => {
    const dim = meshMaxDimension(mesh)
    if (dim < 0.08) {
      map.set(mesh, 'detail')
      return
    }
    if (index === 0) map.set(mesh, 'outer')
    else if (index === 1) map.set(mesh, 'inner')
    else map.set(mesh, dim < 0.2 ? 'detail' : 'outer')
  })
  return map
}

export function resolveLoginLogoMeshRole(
  mesh: THREE.Mesh,
  bboxRoles: Map<THREE.Mesh, LoginLogoMeshRole>,
): LoginLogoMeshRole {
  const nameCandidates = [mesh.name, mesh.parent?.name ?? ''].filter(Boolean)
  for (const name of nameCandidates) {
    if (LOGIN_LOGO_ROLE_BY_NAME[name]) return LOGIN_LOGO_ROLE_BY_NAME[name]
    const inferred = inferLoginLogoMeshRole(name)
    if (inferred) return inferred
  }
  const fromBbox = bboxRoles.get(mesh)
  if (fromBbox) return fromBbox
  return meshMaxDimension(mesh) < 0.08 ? 'detail' : 'outer'
}

function applyNeonToMaterial(mat: THREE.MeshStandardMaterial, role: LoginLogoMeshRole) {
  switch (role) {
    case 'outer':
      applyNeon(mat, LOGIN_LOGO_CYAN, OUTER_EMISSIVE)
      break
    case 'inner':
      applyNeon(mat, LOGIN_LOGO_ORANGE, INNER_EMISSIVE)
      break
    case 'detail':
      applyNeon(mat, LOGIN_LOGO_MUTED, DETAIL_EMISSIVE)
      break
    default:
      mat.color.setHex(LOGIN_LOGO_DARK)
      mat.emissive.setHex(LOGIN_LOGO_DARK)
      mat.emissiveIntensity = 0
      mat.metalness = 0.05
      mat.roughness = 0.85
  }
}

function applyNeon(mat: THREE.MeshStandardMaterial, hex: number, emissiveIntensity: number) {
  const c = new THREE.Color(hex)
  mat.color.copy(c)
  mat.emissive.copy(c)
  mat.emissiveIntensity = emissiveIntensity
  mat.metalness = 0.08
  mat.roughness = 0.32
}

function cloneToStandard(
  from: THREE.Material,
  role: LoginLogoMeshRole,
): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial()
  mat.transparent = from.transparent
  mat.opacity = from.opacity
  mat.side = from.side
  mat.depthWrite = from.depthWrite
  mat.alphaTest = from.alphaTest
  applyNeonToMaterial(mat, role)
  return mat
}

function collectMaterialUse(root: THREE.Object3D): Map<THREE.Material, number> {
  const use = new Map<THREE.Material, number>()
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const m of materials) {
      if (!m) continue
      use.set(m, (use.get(m) ?? 0) + 1)
    }
  })
  return use
}

function disposeMaterialIfUnused(material: THREE.Material, use: Map<THREE.Material, number>) {
  const left = (use.get(material) ?? 1) - 1
  if (left <= 0) {
    use.delete(material)
    material.dispose()
  } else {
    use.set(material, left)
  }
}

export function applyLoginAppLogoMaterials(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = []
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) meshes.push(obj)
  })

  const bboxRoles = rolesByBoundingSize(meshes)
  const materialUse = collectMaterialUse(root)

  if (import.meta.env.DEV && meshes.length) {
    console.debug(
      '[login-app-logo] glb meshes:',
      meshes.map((m) => ({
        name: m.name || '(unnamed)',
        role: resolveLoginLogoMeshRole(m, bboxRoles),
        maxDim: +meshMaxDimension(m).toFixed(4),
      })),
    )
  }

  for (const mesh of meshes) {
    const role = resolveLoginLogoMeshRole(mesh, bboxRoles)
    const sources = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const next = sources.map((src) => cloneToStandard(src, role))
    for (const src of sources) {
      if (src) disposeMaterialIfUnused(src, materialUse)
    }
    mesh.material = next.length === 1 ? next[0] : next
  }
}
