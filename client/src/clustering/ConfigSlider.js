import {COLOR} from '../../lib/constants.js'
import {MIN_CURSOR_RADIUS} from './config.js'
import {SliderCanvas} from '../../lib/canvas.js'
import {inCircle, round} from '../../lib/helpers.js'

export class ConfigSlider extends SliderCanvas {
  constructor(id) {
    super(id, function (c) {
      return {
        x: c.buttonToConfig,
        y: c.halfHeight,
        r: MIN_CURSOR_RADIUS * 2
      }
    })
  }

  get buttonToConfig() {
    return (this.dataF('val') - this.dataF('min')) / (this.dataF('max') - this.dataF('min')) * (this.width - 40) + 20
  }

  overButton(m) {
    return inCircle(m, this.button, this.button.r)
  }

  setVal(v) {
    this.setConfig({
      x: 20 + (v - this.dataF('min')) / this.dataF('max') * (this.width - 40),
      y: this.halfHeight
    })
  }

  setConfig(m) {
    this.button.x = Math.max(20, Math.min(this.width - 20, m.x))
    this.data['val'] = round(
      (this.dataF('max') - this.dataF('min')) * (this.button.x - 20) / (this.width - 40) + this.dataF('min'),
      (this.data['int'] === 'true' ? 1 : 1000)
    )

    this.button.x = this.buttonToConfig

    this.update()
  }

  update() {
    this.clear()

    // Line
    this.ctx.beginPath()
    this.ctx.moveTo(20, this.halfHeight)
    this.ctx.lineTo(this.width - 20, this.halfHeight)
    this.ctx.stroke()

    // Cursor
    this.ctx.fillStyle = COLOR.WHITE
    this.ctx.beginPath()
    this.ctx.arc(this.button.x, this.button.y, this.button.r, 0, 2 * Math.PI)
    this.ctx.fill()

    // Indicator
    let text = String(this.data['var'] + ' = ' + this.dataF('val'))
    let offset = this.ctx.measureText(text).width
    this.ctx.fillText(text, this.button.x - offset / 2, this.halfHeight + 22)
  }
}
