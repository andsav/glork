import {ENDPOINTS, COLOR} from '../../lib/constants.js'
import {$, $$, $post, $ready} from '../../lib/$.js'
import {dist, round, inCircle, shuffle, rand, stopAnimations, error, collision} from '../../lib/helpers.js'
import {Canvas, SliderCanvas} from '../../lib/canvas.js'

// Quick and dirty return random element form array (not really random)
Array.prototype.random = function () {  // eslint-disable-line
  return this[~~((Math.random() * this.length))]
}

// Configuration
const DELAY = 30 // milliseconds between frame refresh
const DEFAULT_FONT = '14pt Courier New'
const CONFIG_BUTTON_RADIUS = 6

class TSPCanvas extends Canvas {
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
    }, DELAY)
  }

  loadingLBS (path = Path.random(this.coordinates)) {
    path.trace(this)
    let _this = this
    setTimeout(() => {
      _this.loadingLBS()
    }, DELAY)
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

class ResultCanvas extends Canvas {
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
      }, DELAY)

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

class ConfigCanvas extends SliderCanvas {
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

class Path {
  constructor (p) {
    this.p = p
  }

  clear () {
    this.p = []
  }

  map (fn) {
    return this.p.map(fn)
  }

  push (c) {
    this.p.push(c)
  }

  trace (canvas) {
    canvas.trace(this.p)
  }

  get neighbour () {
    let p = this.p
    let a = rand(0, p.length - 1)
    let b = rand(0, p.length - 1)
    let tmp = p[a]

    p[a] = p[b]
    p[b] = tmp

    return new Path(p)
  }

  get object () {
    return this.p.map((c) => {
      return {'x': c[0], 'y': c[1]}
    })
  }

  get length () {
    return this.p.reduce((acc, val, i) => {
      return acc + dist(val, this.p[(i + 1) % this.p.length])
    }, 0).toFixed(3)
  }

  static fromObject (o) {
    return new Path(o.map((c) => [c.x, c.y]))
  }

  static random (coord) {
    return new Path(coord.sort(() => {
      return 0.5 - Math.random()
    }))
  }
}

$ready(() => {
  const canvas = new TSPCanvas('c')
  const result = new ResultCanvas('result')
  const config = $$('config-canvas').map((c) => {   // eslint-disable-line
    return new ConfigCanvas(c.id)
  })

  $('reset').onclick = () => {
    canvas.reset()
    result.hide()
  }

  $$('random').forEach((c) => {
    c.onclick = () => {
      canvas.random(parseInt(c.dataset['points'], 10) % 200)
      result.hide()
    }
  })

  let solve = (endpoint, input, output, loading) => {
    return () => {
      if (canvas.coordinates.length > 3) {
        stopAnimations()
        loading()

        $post(endpoint, canvas.solver[input], (data) => {
          output(data)
        }, (response) => {
          stopAnimations()
          canvas.redraw()
          error(canvas.c, response)
        })
      } else {
        error(canvas.c, 'Please define at least 4 coordinates')
      }
    }
  }

  $('SA').onclick = solve(ENDPOINTS.TSP_SA, 'sa', (data) => {
    result.outputSA(canvas, data)
  }, () => {
    canvas.loadingSA(result)
  })

  $('LBS').onclick = solve(ENDPOINTS.TSP_LBS, 'lbs', (data) => {
    result.outputLBS(canvas, data)
  }, () => {
    canvas.loadingLBS()
    result.loadingLBS()
  })
})
