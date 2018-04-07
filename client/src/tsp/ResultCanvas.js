import { COLOR } from '../../lib/constants.js'
import { $ } from '../../lib/$.js'
import { round, shuffle, stopAnimations } from '../../lib/helpers.js'
import { Canvas } from '../../lib/canvas.js'
import { DEFAULT_FONT, FRAME_DELAY } from './config.js'
import { Path } from './Path.js'

export class ResultCanvas extends Canvas {
  constructor (id) {
    super(id)
    this.ctx.font = DEFAULT_FONT
    this.initial = 0
    this.cooling = 0
  }

  clearHalf () {
    this.ctx.clearRect(0, 0, this.halfWidth, this.height)
  }

  outputSAHelper (path, i = 0, max = 0, cooling = 0.98) {
    if (i === 0) {
      this.clear()
      this.ctx.beginPath()
      this.ctx.moveTo(0, this.halfHeight)
      this.ctx.lineTo(this.width, this.halfHeight)
      this.ctx.stroke()
    } else {
      this.clearHalf()
      this.ctx.beginPath()
      this.ctx.moveTo(0, this.halfHeight)
      this.ctx.lineTo(this.halfWidth, this.halfHeight)
      this.ctx.stroke()
    }

    let t = round(Math.pow(cooling, i), 1e7)
    let length = path.length

    if (i === 1) {
      this.initial = length
    }

    this.ctx.fillStyle = COLOR.WHITE
    if (i !== 0) {
      let x = this.halfWidth + this.halfWidth / max * i
      let y = Math.max(this.height - (length / this.initial) * this.halfHeight * 0.67, this.halfHeight)
      let h = this.height - y
      let w = this.halfWidth / max
      let y2 = this.halfHeight - t * this.halfHeight
      let h2 = this.halfHeight - y2

      this.ctx.fillRect(x, y, w, h)
      this.ctx.fillRect(x, y2, w, h2)
    }

    this.ctx.fillText('    T°: ' + (t === 1 ? '1.0000000' : String(t)), 20, 26)
    this.ctx.fillText('Length: ' + String(length), 20, this.halfHeight + 26)
    this.ctx.fillStyle = COLOR.DEFAULT
  }

  outputSA (canvas, solution, i = 1) {
    if (i === 1) {
      stopAnimations()
      this.cooling = $('config_sa').dataset['x']
    }
    if (i >= solution.length) {
      return 0
    } else {
      let p = Path.fromObject(solution[i])
      p.trace(canvas)
      this.outputSAHelper(p, i, solution.length, this.cooling)

      let _this = this
      setTimeout(function () {
        _this.outputSA(canvas, solution, i + 1)
      }, FRAME_DELAY)

      return 0
    }
  }

  loadingLBS () {
    this.show()
    this.clear()
    let n = parseInt($('config_lbs').dataset['x'], 10)

    this.ctx.fillStyle = COLOR.BLACK
    for (let i = 0; i < n; ++i) {
      let h = this.height * 0.5
      let w = this.width / n
      let y = this.height - h
      let x = i * w

      this.ctx.fillRect(x, y, w, h)
    }
    this.ctx.fillStyle = COLOR.DEFAULT
  };

  outputLBS (canvas, solution) {
    stopAnimations()
    this.clear()

    const worst = Path.fromObject(solution[0])
    const best = Path.fromObject(solution[solution.length - 1])
    const max = worst.length
    const min = best.length

    shuffle(solution)

    let i = 0
    let foundBest = false
    this.ctx.fillStyle = '#001427'

    solution.forEach((s) => {
      let path = Path.fromObject(s)
      let h = (path.length / max) * this.halfHeight
      let w = this.width / solution.length
      let y = this.height - h
      let x = i++ * w

      if (path.length === min && !foundBest) {
        this.ctx.fillStyle = COLOR.WHITE

        let offset = this.ctx.measureText(String(min)).width
        this.ctx.fillText(min, Math.min(Math.max(x + w / 2 - offset / 2, 2), this.width - offset - 2), 20)

        foundBest = true
      }

      this.ctx.fillRect(x, y, w, h)
      this.ctx.fillStyle = '#001427'
    })

    best.trace(canvas)
    this.ctx.fillStyle = COLOR.DEFAULT
  }
}
