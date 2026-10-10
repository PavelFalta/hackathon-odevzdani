export function canGoPrevious(index: number): boolean {
  return index > 0
}

export function canGoNext(index: number, total: number): boolean {
  return total > 0 && index < total - 1
}

export function clampPhotoIndex(index: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(index, 0), total - 1)
}
