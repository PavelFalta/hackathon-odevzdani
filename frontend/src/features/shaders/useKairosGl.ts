import { useEffect, useRef, type RefObject } from 'react'
import { HOVER_SLOTS, packCityHover, stepCityVoices, type HoverVoice } from './cityHoverState'
import { createCityHoverInput } from './cityHoverInput'
import {
  clientToGlPixel,
  createCityPickTarget,
  pickCityGpu,
  resizeCityPickTarget,
} from './cityGpuPick'
import type { CityCell } from './cityPick'
import { KAIROS_FRAGMENT, KAIROS_VERTEX } from './kairos.frag'
import { CITY_FRAGMENT, CITY_PICK_FRAGMENT, CITY_VERTEX } from './kairosCity.frag'
import { type KairosGlOptions, resolveKairosGlMode } from './kairosGlMode'

const ROWS = 28
const NO_CELL = -999_999

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader alloc failed')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader compile failed')
  }
  return shader
}

function linkProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()
  if (!program) throw new Error('program alloc failed')
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'link failed')
  }
  return program
}

export function useKairosGl(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: KairosGlOptions = {},
) {
  const start = useRef(0)
  const mode = resolveKairosGlMode(options)
  const { buildingHover, scrollMul, mature } = mode

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true, depth: true })
    if (!gl) return
    if (!start.current) start.current = performance.now()

    const cityVs = compile(gl, gl.VERTEX_SHADER, CITY_VERTEX)
    const floor = linkProgram(
      gl,
      compile(gl, gl.VERTEX_SHADER, KAIROS_VERTEX),
      compile(gl, gl.FRAGMENT_SHADER, KAIROS_FRAGMENT),
    )
    const city = linkProgram(gl, cityVs, compile(gl, gl.FRAGMENT_SHADER, CITY_FRAGMENT))
    const cityPick = linkProgram(gl, cityVs, compile(gl, gl.FRAGMENT_SHADER, CITY_PICK_FRAGMENT))

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(floor, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const floorTime = gl.getUniformLocation(floor, 'uTime')
    const floorRes = gl.getUniformLocation(floor, 'uResolution')
    const floorScrollMul = gl.getUniformLocation(floor, 'uScrollMul')
    const cityTime = gl.getUniformLocation(city, 'uTime')
    const cityRes = gl.getUniformLocation(city, 'uResolution')
    const cityCols = gl.getUniformLocation(city, 'uCols')
    const cityScrollMul = gl.getUniformLocation(city, 'uScrollMul')
    const cityMature = gl.getUniformLocation(city, 'uMature')
    const cityHoverCells = gl.getUniformLocation(city, 'uHoverCells')
    const cityHoverGlows = gl.getUniformLocation(city, 'uHoverGlows')
    const pickLocs = {
      time: gl.getUniformLocation(cityPick, 'uTime'),
      res: gl.getUniformLocation(cityPick, 'uResolution'),
      cols: gl.getUniformLocation(cityPick, 'uCols'),
      scrollMul: gl.getUniformLocation(cityPick, 'uScrollMul'),
      mature: gl.getUniformLocation(cityPick, 'uMature'),
    }

    let frame = 0
    let voices: HoverVoice[] = []
    const hoverCells = new Int32Array(HOVER_SLOTS * 3)
    const hoverGlows = new Float32Array(HOVER_SLOTS)
    let pickTarget: CityCell | null = null
    let lastPickAt = 0
    let lastPickX = -1
    let lastPickY = -1
    const gpuTarget = buildingHover ? createCityPickTarget(gl) : null
    let lastTick = performance.now()
    const hoverInput = buildingHover ? createCityHoverInput() : null
    if (hoverInput) hoverInput.bind(canvas)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = Math.floor(canvas.clientWidth * dpr)
      const h = Math.floor(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const tick = () => {
      resize()
      const now = performance.now()
      const dt = Math.min((now - lastTick) / 1000, 0.05)
      lastTick = now
      const t = (now - start.current) / 1000
      const w = canvas.width
      const h = canvas.height
      const cols = Math.ceil(30 * (w / Math.max(h, 1))) + 2
      const instances = ROWS * cols * 2

      if (buildingHover && gpuTarget && hoverInput) {
        resizeCityPickTarget(gl, gpuTarget, w, h)
        const pt = hoverInput.pointer()
        const moved = Boolean(pt && (pt.x !== lastPickX || pt.y !== lastPickY))
        const due = now - lastPickAt > 90
        if (!pt) {
          pickTarget = null
        } else if (moved || due) {
          lastPickAt = now
          lastPickX = pt.x
          lastPickY = pt.y
          const pixel = clientToGlPixel(pt.x, pt.y, canvas)
          pickTarget = pixel
            ? pickCityGpu(
                gl,
                gpuTarget,
                cityPick,
                pickLocs,
                pixel.ix,
                pixel.iy,
                w,
                h,
                cols,
                instances,
                t,
                scrollMul,
                mature,
              )
            : null
        }
      }

      gl.clear(gl.DEPTH_BUFFER_BIT)

      gl.disable(gl.DEPTH_TEST)
      gl.disable(gl.BLEND)
      gl.useProgram(floor)
      gl.uniform1f(floorTime, t)
      gl.uniform2f(floorRes, w, h)
      gl.uniform1f(floorScrollMul, scrollMul)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LESS)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO)
      gl.useProgram(city)
      gl.uniform1f(cityTime, t)
      gl.uniform2f(cityRes, w, h)
      gl.uniform1i(cityCols, cols)
      gl.uniform1f(cityScrollMul, scrollMul)
      gl.uniform1f(cityMature, mature)
      if (buildingHover) {
        voices = stepCityVoices(voices, pickTarget, dt)
        packCityHover(voices, hoverCells, hoverGlows)
      } else {
        hoverCells.fill(NO_CELL)
        hoverGlows.fill(0)
      }
      gl.uniform3iv(cityHoverCells, hoverCells)
      gl.uniform1fv(cityHoverGlows, hoverGlows)
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, instances)

      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      hoverInput?.unbind()
    }
  }, [canvasRef, buildingHover, scrollMul, mature])
}
