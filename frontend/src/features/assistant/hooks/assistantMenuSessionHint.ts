const STORAGE_KEY = 'kairos-assistant-menu-touched'

export function readAssistantMenuTouched(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markAssistantMenuTouched(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}
