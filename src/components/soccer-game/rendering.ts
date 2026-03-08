export function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  ballX: number,
  ballY: number,
  canvasH: number,
  radius: number,
) {
  const groundY = canvasH - 2
  const height = canvasH - ballY
  const maxHeight = canvasH
  const heightRatio = Math.max(0, Math.min(height / maxHeight, 1))

  const shadowWidth = radius * (1 + heightRatio * 1.5)
  const shadowHeight = 6 * (1 - heightRatio * 0.5)
  const opacity = 0.15 - heightRatio * 0.12

  if (opacity <= 0) return

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(ballX, groundY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
  ctx.fill()
  ctx.restore()
}

export function drawSoccerBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  angle: number,
  onCooldown: boolean,
  img: HTMLImageElement,
) {
  ctx.save()
  ctx.translate(x, y)

  ctx.rotate(angle)
  if (onCooldown) ctx.globalAlpha = 0.6
  const size = radius * 2
  ctx.drawImage(img, -size / 2, -size / 2, size, size)
  ctx.globalAlpha = 1

  ctx.restore()
}

export function drawKickZoneHighlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
) {
  const pulse = 0.3 + 0.15 * Math.sin(time * 0.006)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x - radius, y, radius * 2, radius)
  ctx.clip()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(34, 197, 94, ${pulse})`
  ctx.fill()
  ctx.restore()
}

export function randomVariance(base: number, factor: number): number {
  return base * (1 - factor + Math.random() * factor * 2)
}

export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function formatValue(value: number, step: number): string {
  if (step >= 1) return value.toFixed(0)
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  return value.toFixed(decimals)
}
