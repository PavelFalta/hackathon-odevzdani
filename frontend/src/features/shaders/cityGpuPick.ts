import type { CityCell } from './cityPick'

const readBuf = new Uint8Array(4)

export type CityPickTarget = {
  fbo: WebGLFramebuffer
  color: WebGLTexture
  depth: WebGLRenderbuffer
  w: number
  h: number
}

export function createCityPickTarget(gl: WebGL2RenderingContext): CityPickTarget {
  const fbo = gl.createFramebuffer()
  const color = gl.createTexture()
  const depth = gl.createRenderbuffer()
  if (!fbo || !color || !depth) throw new Error('city pick target alloc failed')
  return { fbo, color, depth, w: 0, h: 0 }
}

export function resizeCityPickTarget(
  gl: WebGL2RenderingContext,
  target: CityPickTarget,
  w: number,
  h: number,
) {
  if (target.w === w && target.h === h) return
  target.w = w
  target.h = h
  gl.bindTexture(gl.TEXTURE_2D, target.color)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.bindRenderbuffer(gl.RENDERBUFFER, target.depth)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.color, 0)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.depth)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

export function clientToGlPixel(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
): { ix: number; iy: number } | null {
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    return null
  }
  const x = Math.floor(((clientX - rect.left) * canvas.width) / rect.width)
  const y = Math.floor(canvas.height - ((clientY - rect.top) * canvas.height) / rect.height)
  return {
    ix: Math.min(canvas.width - 1, Math.max(0, x)),
    iy: Math.min(canvas.height - 1, Math.max(0, y)),
  }
}

export type CityGpuPickLocs = {
  time: WebGLUniformLocation | null
  res: WebGLUniformLocation | null
  cols: WebGLUniformLocation | null
  scrollMul: WebGLUniformLocation | null
  mature: WebGLUniformLocation | null
}

export function decodeCityPickColor(buf: Uint8Array): CityCell | null {
  if (buf[3] === 0) return null
  let iz = buf[1] | (buf[2] << 8)
  if (iz >= 32768) iz -= 65536
  return { ixm: buf[0], iz, side: buf[3] > 200 ? 1 : -1 }
}

/** Full-viewport draw, one-pixel scissor. A 1×1 viewport remaps NDC and picks the wrong place. */
export function pickCityGpu(
  gl: WebGL2RenderingContext,
  target: CityPickTarget,
  program: WebGLProgram,
  locs: CityGpuPickLocs,
  ix: number,
  iy: number,
  w: number,
  h: number,
  cols: number,
  instanceCount: number,
  t: number,
  scrollMul: number,
  mature: number,
): CityCell | null {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
  gl.viewport(0, 0, w, h)
  gl.enable(gl.SCISSOR_TEST)
  gl.scissor(ix, iy, 1, 1)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LESS)
  gl.disable(gl.BLEND)
  gl.useProgram(program)
  gl.uniform1f(locs.time, t)
  gl.uniform2f(locs.res, w, h)
  gl.uniform1i(locs.cols, cols)
  gl.uniform1f(locs.scrollMul, scrollMul)
  gl.uniform1f(locs.mature, mature)
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, instanceCount)
  gl.readPixels(ix, iy, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readBuf)
  gl.disable(gl.SCISSOR_TEST)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return decodeCityPickColor(readBuf)
}
