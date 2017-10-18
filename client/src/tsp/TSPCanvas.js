import {$} from '../../lib/$.js'
import {rand, stopAnimations, collision} from '../../lib/helpers.js'
import {Canvas} from '../../lib/canvas.js'
import {FRAME_DELAY} from './config.js'
import {Path} from './Path.js'

export class TSPCanvas extends Canvas {
  constructor (id) {
    super(id)

    this.path = new Path([])
    let _this = this

    this.c.onclick = function (e) {
      let m = _this.mouse(e)
      _this.placePoint(m.x, m.y)
    }
  }

  placePoint (x, y) {
    if (!collision(this.path.p, [x, y], 12)) {
      this.path.push([x, y])
      this.placeNode(x, y)
    }
  }

  random (points) {
    this.reset()
    while (this.coordinates.length < points) {
      this.placePoint(rand(15, this.width - 15), rand(15, this.height - 15))
    }
  }

  redraw () {
    this.clear()
    this.coordinates.forEach((c) => {
      this.drawNode(c[0], c[1])
    })
  }

  reset () {
    stopAnimations()
    this.clear()
    this.path.clear()
  }

  loadingSA (result, path = Path.random(this.coordinates)) {
    result.show()
    path.trace(this)
    result.outputSAHelper(path)

    let _this = this
    setTimeout(() => {
      _this.loadingSA(result /*, path.neighbour */)
    }, FRAME_DELAY)
  }

  loadingLBS (path = Path.random(this.coordinates)) {
    path.trace(this)
    let _this = this
    setTimeout(() => {
      _this.loadingLBS()
    }, FRAME_DELAY)
  }

  trace (path) {
    this.redraw()
    this.ctx.beginPath()
    this.ctx.moveTo(path[0][0], path[0][1])
    for (let i = 1; i < path.length; ++i) {
      this.ctx.lineTo(path[i][0], path[i][1])
    }
    this.ctx.lineTo(path[0][0], path[0][1])
    this.ctx.stroke()
  }

  get solver () {
    let $configSA = $('config_sa')
    let $configLBS = $('config_lbs')

    return {
      'sa': {
        'p': this.path.object,
        'config': [parseFloat($configSA.dataset['x']), parseFloat($configSA.dataset['y'])]
      },
      'lbs': {
        'p': this.path.object,
        'config': [parseFloat($configLBS.dataset['x']), parseFloat($configLBS.dataset['y'])]
      }
    }
  }

  get coordinates () {
    return this.path.p
  }
}
