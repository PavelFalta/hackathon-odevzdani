/** Agent map tools already moved the camera this user turn — skip message markup autofocus. */

let toolFocusedMapThisTurn = false

export function markAgentToolMapFocusThisTurn() {
  toolFocusedMapThisTurn = true
}

export function consumeAgentToolMapFocusSkip(): boolean {
  if (!toolFocusedMapThisTurn) return false
  toolFocusedMapThisTurn = false
  return true
}

export function resetAgentToolMapFocusTurn() {
  toolFocusedMapThisTurn = false
}

/** @internal Vitest only */
export function resetAgentToolMapFocusTurnForTests() {
  resetAgentToolMapFocusTurn()
}
