import { easeInOutCubic } from './logo3dSwap'
import { LOGO_ARROW_CUE_MS } from './logo3dRuntime'

export function arrowCueOffsetY(elapsedSinceCueMs: number): number | null {
  if (elapsedSinceCueMs < 0 || elapsedSinceCueMs > LOGO_ARROW_CUE_MS) return null
  const t = easeInOutCubic(elapsedSinceCueMs / LOGO_ARROW_CUE_MS)
  return t * Math.PI * 2
}
