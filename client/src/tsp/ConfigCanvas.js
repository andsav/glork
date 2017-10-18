import {$} from '../../lib/$.js'
import {round, inCircle} from '../../lib/helpers.js'
import {SliderCanvas} from '../../lib/canvas.js'
import {CONFIG_BUTTON_RADIUS} from './config.js'

export class ConfigCanvas extends SliderCanvas {
  constructor (id) {
    super(id, function (c) {
      return {
        x: (c.data.x - c.dataF('minX')) / (c.dataF('maxX') - c.dataF('minX')) * (c.width),
        y: c.height - ((c.data.y - c.dataF('minY')) / (c.dataF('maxY') - c.dataF('minY')) * (c.height))
      }
    })
  }

  overButton (m) {
    return inCircle(m, this.button, CONFIG_BUTTON_RADIUS)
  }

  update () {
    this.clear()

    this.ctx.beginPath()
    this.ctx.moveTo(this.button.x, this.button.y)
    this.ctx.lineTo(this.halfWidth, this.halfHeight)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.arc(this.button.x, this.button.y, CONFIG_BUTTON_RADIUS, 0, 2 * Math.PI, false)
    this.ctx.fill()

    $(this.data['xHref']).innerHTML = this.data.x
    $(this.data['yHref']).innerHTML = this.data.y
  }

  setConfig (m) {
    this.button = m
    this.buttonToConfig()
    this.update()
  }

  buttonToConfig () {
    this.data.x = ((this.button.x / this.width) * (this.dataF('maxX') - this.dataF('minX'))) + this.dataF('minX')
    this.data.y = this.dataF('maxY') - ((this.button.y / this.height) * (this.dataF('maxY') - this.dataF('minY')) + this.dataF('minY'))

    this.data.x = Math.max(Math.min(this.data.x, this.dataF('maxX')), this.dataF('minX'))
    this.data.y = Math.max(Math.min(this.data.y, this.dataF('maxY')), this.dataF('minY'))

    this.data.x = (this.data['xInt'] === 'true') ? Math.round(this.dataF('x')) : round(this.dataF('x'), 100)
    this.data.y = (this.data['yInt'] === 'true') ? Math.round(this.dataF('y')) : round(this.dataF('y'), 100)
  }
}
