export function defaultNavigationWindowSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 400, h: 480 }
  return {
    w: Math.min(400, window.innerWidth - 24),
    h: Math.min(480, window.innerHeight - 80),
  }
}

export function defaultReviewsWindowSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 384, h: 448 }
  return {
    w: Math.min(384, window.innerWidth - 24),
    h: Math.min(448, window.innerHeight - 80),
  }
}

export function defaultPhotosWindowSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 400, h: 460 }
  return {
    w: Math.min(400, window.innerWidth - 24),
    h: Math.min(460, window.innerHeight - 80),
  }
}

export function defaultBrowserWindowSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 576, h: 384 }
  return {
    w: Math.min(576, window.innerWidth - 24),
    h: Math.min(384, window.innerHeight - 80),
  }
}

export function defaultTimetableWindowSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 400, h: 480 }
  return {
    w: Math.min(400, window.innerWidth - 24),
    h: Math.min(480, window.innerHeight - 80),
  }
}

export function defaultAssistantWindowSize(): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 520, h: 600 }
  return {
    w: Math.min(520, window.innerWidth - 24),
    h: Math.min(600, window.innerHeight - 80),
  }
}
