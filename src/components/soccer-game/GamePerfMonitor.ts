function toMB(b: number) {
  return (b / 1024 / 1024).toFixed(1)
}

export class GamePerfMonitor {
  private frameTimes: number[] = []
  private frameStart = 0
  private engineEnd = 0
  private engineDuration = 0
  private drawDuration = 0
  private frameCount = 0
  private heapBaseline = 0
  private peakHeap = 0
  private currentHeap = 0
  private summaryInterval: ReturnType<typeof setInterval> | null = null

  private displayFPS = 0
  private displayFrameTime = 0
  private displayEngine = 0
  private displayDraw = 0

  private minFPS = Infinity
  private maxFPS = 0
  private fpsSum = 0
  private fpsCount = 0
  private maxFrameTime = 0

  constructor() {
    const mem = (
      performance as unknown as { memory?: { usedJSHeapSize: number } }
    ).memory
    if (mem) {
      this.heapBaseline = mem.usedJSHeapSize
      this.peakHeap = this.heapBaseline
      this.currentHeap = this.heapBaseline
    }
  }

  startConsoleLogging() {
    if (this.summaryInterval) return
    this.summaryInterval = setInterval(() => this.logSummary(), 5000)
  }

  stopConsoleLogging() {
    if (this.summaryInterval) {
      clearInterval(this.summaryInterval)
      this.summaryInterval = null
    }
  }

  recordFrameStart() {
    this.frameStart = performance.now()
  }

  recordEngineEnd() {
    this.engineEnd = performance.now()
    this.engineDuration = this.engineEnd - this.frameStart
  }

  recordDrawEnd() {
    this.drawDuration = performance.now() - this.engineEnd
  }

  private recordFrame() {
    const now = performance.now()
    const delta = now - this.frameStart
    this.frameTimes.push(delta)
    if (this.frameTimes.length > 60) this.frameTimes.shift()

    this.frameCount++
    if (delta > this.maxFrameTime) this.maxFrameTime = delta

    const fps = this.getFPS()
    if (fps > 0) {
      if (fps < this.minFPS) this.minFPS = fps
      if (fps > this.maxFPS) this.maxFPS = fps
      this.fpsSum += fps
      this.fpsCount++
    }

    if (this.frameCount % 30 === 0) {
      this.displayFPS = fps
      this.displayFrameTime = delta
      this.displayEngine = this.engineDuration
      this.displayDraw = this.drawDuration

      const mem = (
        performance as unknown as { memory?: { usedJSHeapSize: number } }
      ).memory
      if (mem) {
        this.currentHeap = mem.usedJSHeapSize
        if (this.currentHeap > this.peakHeap) this.peakHeap = this.currentHeap
      }
    }
  }

  getFPS(): number {
    if (this.frameTimes.length < 2) return 0
    const avg =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    return avg > 0 ? 1000 / avg : 0
  }

  draw(ctx: CanvasRenderingContext2D, enabled: boolean) {
    this.recordFrame()
    if (!enabled) return

    const hasMem = this.heapBaseline > 0

    const lines = [
      `FPS: ${this.displayFPS.toFixed(0)}`,
      `frame: ${this.displayFrameTime.toFixed(1)}ms  (physics: ${this.displayEngine.toFixed(1)}  draw: ${this.displayDraw.toFixed(1)})`,
    ]
    if (hasMem) {
      lines.push(
        `heap: ${toMB(this.currentHeap)}MB  peak: ${toMB(this.peakHeap)}MB  (+${toMB(this.currentHeap - this.heapBaseline)}MB)`,
      )
    }

    ctx.save()
    ctx.font = '11px monospace'
    ctx.textAlign = 'left'
    const lineHeight = 15
    const padding = 6
    const boxW = Math.min(320, ctx.canvas.width - 16)
    const boxH = lines.length * lineHeight + padding * 2

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(8, 8, boxW, boxH)
    ctx.fillStyle =
      this.displayFPS > 0 && this.displayFPS < 30 ? '#ef4444' : '#22c55e'
    lines.forEach((line, i) => {
      if (i > 0) ctx.fillStyle = '#e5e7eb'
      ctx.fillText(line, 8 + padding, 8 + padding + (i + 1) * lineHeight - 3)
    })
    ctx.restore()
  }

  private logSummary() {
    const avgFPS = this.fpsCount > 0 ? this.fpsSum / this.fpsCount : 0
    const hasMem = this.heapBaseline > 0
    const heapGrowth = this.currentHeap - this.heapBaseline

    const parts = [
      `[GamePerfMonitor] FPS min=${this.minFPS === Infinity ? '?' : this.minFPS.toFixed(0)} max=${this.maxFPS.toFixed(0)} avg=${avgFPS.toFixed(0)}`,
      `maxFrameTime=${this.maxFrameTime.toFixed(1)}ms`,
    ]
    if (hasMem) {
      parts.push(
        `heap=${toMB(this.currentHeap)}MB peak=${toMB(this.peakHeap)}MB growth=${toMB(heapGrowth)}MB`,
      )
    }

    console.log(parts.join(' | '))

    if (avgFPS > 0 && avgFPS < 30) {
      console.warn('[GamePerfMonitor] WARNING: Average FPS below 30!')
    }
    if (hasMem && heapGrowth > 50 * 1024 * 1024) {
      console.warn(
        `[GamePerfMonitor] WARNING: Heap grew by ${toMB(heapGrowth)}MB since start!`,
      )
    }

    this.minFPS = Infinity
    this.maxFPS = 0
    this.fpsSum = 0
    this.fpsCount = 0
    this.maxFrameTime = 0
  }

  cleanup() {
    this.stopConsoleLogging()
  }
}
