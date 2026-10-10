type MeterBus = {
  context: AudioContext
  timers: number[]
  sources: MediaStreamAudioSourceNode[]
  analysers: AnalyserNode[]
}

function createMeterBus(): MeterBus | undefined {
  const Ctor = window.AudioContext
  if (!Ctor) return undefined
  const context = new Ctor()
  void context.resume().catch(() => undefined)
  return { context, timers: [], sources: [], analysers: [] }
}

function rmsFromAnalyser(analyser: AnalyserNode, buffer: Float32Array): number {
  analyser.getFloatTimeDomainData(buffer as Float32Array<ArrayBuffer>)
  let sum = 0
  for (const sample of buffer) sum += sample * sample
  return Math.sqrt(sum / buffer.length)
}

export function createTalkOrbMeters(
  onInputLevel: (rms: number) => void,
  onOutputLevel: (rms: number) => void,
): {
  attachInput: (stream: MediaStream) => void
  attachOutput: (stream: MediaStream) => void
  stop: () => Promise<void>
} {
  const bus = createMeterBus()
  if (!bus) {
    return {
      attachInput: () => undefined,
      attachOutput: () => undefined,
      stop: async () => undefined,
    }
  }

  let outputAttached = false

  const attach = (stream: MediaStream, onLevel: (rms: number) => void) => {
    const source = bus.context.createMediaStreamSource(stream)
    const analyser = bus.context.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.25
    source.connect(analyser)
    bus.sources.push(source)
    bus.analysers.push(analyser)
    const buffer = new Float32Array(analyser.fftSize)
    bus.timers.push(window.setInterval(() => onLevel(rmsFromAnalyser(analyser, buffer)), 33))
  }

  return {
    attachInput: (stream) => attach(stream, onInputLevel),
    attachOutput: (stream) => {
      if (outputAttached) return
      outputAttached = true
      attach(stream, onOutputLevel)
    },
    stop: async () => {
      for (const id of bus.timers) window.clearInterval(id)
      bus.timers.length = 0
      for (const source of bus.sources) source.disconnect()
      for (const analyser of bus.analysers) analyser.disconnect()
      bus.sources.length = 0
      bus.analysers.length = 0
      if (bus.context.state !== 'closed') await bus.context.close()
    },
  }
}
