/** Short UI click when the voice session becomes live (mic + channel open). */
export function playVoiceActivationClick(): void {
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return

  const ctx = new Ctor()
  void ctx.resume().then(() => {
    const start = ctx.currentTime
    const playTick = (offsetSec: number, frequencyHz: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = start + offsetSec
      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequencyHz, t)
      osc.frequency.exponentialRampToValueAtTime(frequencyHz * 0.7, t + 0.018)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.0015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.04)
    }

    playTick(0, 1400)
    playTick(0.045, 1100)
    window.setTimeout(() => void ctx.close(), 150)
  })
}
