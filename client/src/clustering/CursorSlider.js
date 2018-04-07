import { COLOR } from '../../lib/constants.js'
import { MAX_CURSOR_RADIUS, MIN_CURSOR_RADIUS } from './config.js'
import { SliderCanvas } from '../../lib/canvas.js'
import { inCircle } from '../../lib/helpers.js'

export class CursorSlider extends SliderCanvas {
  constructor (id, canvas) {
    super(id, function (c) {
      return {
        x: 20 + ((Math.min(canvas.cursor_radius, MIN_CURSOR_RADIUS) - MIN_CURSOR_RADIUS) / MAX_CURSOR_RADIUS) * (c.width - 40),
        y: c.halfHeight,
        r: Math.min(canvas.cursor_radius, MIN_CURSOR_RADIUS) * 2
      }
    })

    this.canvas = canvas
  }

  overButton (m) {
    return inCircle(m, this.button, this.button.r)
  }

  setConfig (m) {
    let v = (m.x - 20) / (this.width - 40) * (MAX_CURSOR_RADIUS - MIN_CURSOR_RADIUS) + MIN_CURSOR_RADIUS
    let r = Math.max(MIN_CURSOR_RADIUS, Math.min(MAX_CURSOR_RADIUS, v))
    this.canvas.updateCursor(r)
    this.button = {
      x: Math.max(20, Math.min(this.width - 20, m.x)),
      y: this.halfHeight,
      r: 2 * r
    }
    this.update()
  }

  update () {
    this.clear()

    // Line
    this.ctx.beginPath()
    this.ctx.moveTo(20, this.halfHeight)
    this.ctx.lineTo(this.width - 20, this.halfHeight)
    this.ctx.stroke()

    // Cursor
    this.ctx.fillStyle = COLOR.WHITE
    this.ctx.beginPath()
    this.ctx.arc(this.button.x, this.button.y, 4, 0, 2 * Math.PI)
    this.ctx.fill()

    // Indicator
    this.ctx.beginPath()
    this.ctx.arc(this.button.x, this.button.y, this.button.r, 0, 2 * Math.PI)
    this.ctx.fillStyle = COLOR.DARKEN[1]
    this.ctx.fill()
  }
}
