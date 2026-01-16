import { COLOR } from './constants'

/**
 * Canvas utility class for drawing operations
 */
export class CanvasHelper {
  constructor(canvas) {
    this.c = canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.fillStyle = this.ctx.strokeStyle = COLOR.DEFAULT
    this.ctx.lineWidth = 2
  }

  get height() {
    return this.c.height
  }

  get width() {
    return this.c.width
  }

  get halfWidth() {
    return this.c.width / 2
  }

  get halfHeight() {
    return this.c.height / 2
  }

  clear() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height)
  }

  mouse(e) {
    const rect = this.c.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  placeNode(x, y, circle = false, side = 10) {
    if (
      x > side + 2 &&
      x < this.c.width - (side + 2) &&
      y > side + 2 &&
      y < this.c.height - (side + 2)
    ) {
      if (circle) {
        this.drawCircle(x, y, side)
      } else {
        this.drawNode(x, y, side)
      }
    }
  }

  drawNode(x, y, side = 10) {
    this.ctx.fillRect(x - side / 2, y - side / 2, side, side)
  }

  drawCircle(x, y, diameter = 10) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, diameter / 2, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  setFillStyle(color) {
    this.ctx.fillStyle = color
  }

  setStrokeStyle(color) {
    this.ctx.strokeStyle = color
  }

  beginPath() {
    this.ctx.beginPath()
  }

  moveTo(x, y) {
    this.ctx.moveTo(x, y)
  }

  lineTo(x, y) {
    this.ctx.lineTo(x, y)
  }

  stroke() {
    this.ctx.stroke()
  }

  fill() {
    this.ctx.fill()
  }

  arc(x, y, radius, startAngle, endAngle) {
    this.ctx.arc(x, y, radius, startAngle, endAngle)
  }

  fillRect(x, y, w, h) {
    this.ctx.fillRect(x, y, w, h)
  }

  fillText(text, x, y) {
    this.ctx.fillText(text, x, y)
  }

  measureText(text) {
    return this.ctx.measureText(text)
  }

  setFont(font) {
    this.ctx.font = font
  }

  setLineCap(cap) {
    this.ctx.lineCap = cap
  }

  clearHalf() {
    this.ctx.clearRect(0, 0, this.halfWidth, this.height)
  }
}
