export function chartMax(values: number[], floor = 1): number {
  const max = values.length ? Math.max(...values) : 0
  return Math.max(max, floor)
}

export function linePath(
  values: number[],
  width: number,
  height: number,
  padding: number,
  max: number,
): string {
  if (values.length === 0) return ''
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const step = values.length > 1 ? innerW / (values.length - 1) : 0
  const points = values.map((value, index) => {
    const x = padding + index * step
    const y = padding + innerH - (value / max) * innerH
    return `${x},${y}`
  })
  return `M ${points.join(' L ')}`
}

export function barHeight(value: number, max: number, innerHeight: number): number {
  if (max <= 0) return 0
  return (value / max) * innerHeight
}
