import { COLOR } from '../../lib/constants.js'
import { MIN_CURSOR_RADIUS, POINTS_DELAY } from './config.js'
import { Canvas } from '../../lib/canvas.js'
import { collision, dist, gaussian, rand, round, stopAnimations } from '../../lib/helpers.js'

export class MainCanvas extends Canvas {
  constructor (id) {
    super(id)

    this.updating = false
    this.data = []

    this.points = []
    this.cursor_radius = MIN_CURSOR_RADIUS
    this.updateCursor(MIN_CURSOR_RADIUS)

    let _this = this
    this.timer = null
    let m = {x: 0, y: 0}

    this.c.onmousedown = this.c.ontouchstart = function (e) {
      m = _this.mouse(e)

      _this.placePoint(
        round(m.x + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1),
        round(m.y + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1)
      )

      _this.timer = setInterval(function () {
        _this.placePoint(
          round(m.x + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1),
          round(m.y + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1)
        )
      }, POINTS_DELAY)
    }

    this.c.onmousemove = this.c.ontouchmove = function (e) {
      m = _this.mouse(e)
      if (m.x < 6 || m.y < 6 || m.x > this.width - 6 || m.y > this.height - 6) {
        clearInterval(_this.timer)
      }
    }

    this.c.onmouseup = this.c.ontouchend = function () {
      if (_this.timer) {
        clearInterval(_this.timer)
      }
    }
  }

  updateCursor (r) {
    this.cursor_radius = r
    this.c.style.cursor = 'url(\'data:image/svg+xml;utf8,' +
      '<svg fill="none" ' +
      'height="' + r * 4 + '" ' +
      'viewBox="0 0 ' + r * 2 + ' ' + r * 2 + '" ' +
      'width="' + r * 4 + '" ' +
      'xmlns="http://www.w3.org/2000/svg">' +
      '<circle fill-opacity="0.4" fill="black" cx="' + r + '" cy="' + r + '" r="' + r + '" stroke="none" stroke-width="1" />' +
      '</svg>\') ' + r * 2 + ' ' + r * 2 + ', auto'
  }

  placePoint (x, y) {
    if (this.updating) {
      this.stopUpdating()
    }

    if (!collision(this.points, [x, y], 7)) {
      this.points.push([x, y])
      this.placeNode(x, y, true, 6)
    }
  }

  placeGaussian (x, y, n) {
    for (let i = 0; i < n; ++i) {
      this.placePoint(parseInt(x + gaussian() * n / 3, 10), parseInt(y + gaussian() * n / 3, 10))
    }
  }

  redraw () {
    this.clear()
    this.ctx.fillStyle = COLOR.DEFAULT
    this.points.forEach((p) => {
      this.placeNode(p[0], p[1], true, 6)
    })
  }

  reset () {
    stopAnimations()
    this.stopUpdating()
    this.clear()
    this.points = []
  }

  randomPoints (n = 500, points = null, reset = true) {
    if (reset) {
      this.reset()
    }

    if (points === null) {
      for (let i = 0; i < n; ++i) {
        this.placePoint(rand(6, this.width - 6), rand(6, this.height - 6))
      }
    } else {
      for (let i = 0; i < points.length; ++i) {
        this.placeGaussian(...points[i], n)
      }
    }
  }

  updateKMS (data) {
    this.updating = true
    this.data = data

    this.clear()

    // Place centroids
    this.ctx.fillStyle = COLOR.DARKEN[0]
    data['c'].forEach((c) => {
      this.drawCircle(c.x, c.y, 25)
    })

    for (let i = 0; i < data['pp'].length; ++i) {
      if (data['pp'][i] !== null && data['pp'][i].length !== 0) {
        this.ctx.fillStyle = COLOR.CUSTOM[i]
        data['pp'][i].forEach((p) => {
          this.placeNode(p.x, p.y, true, 6)
        })
      }
    }

    this.ctx.fillStyle = COLOR.DEFAULT
  }

  voronoi () {
    let points = {}
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let distances = this.data['c'].map((p) => dist([p.x, p.y], [x, y]))
        let color = COLOR.CUSTOM[distances.indexOf(Math.min(...distances))]

        if (!(color in points)) {
          points[color] = []
        }

        points[color].push([x, y])
      }
    }

    this.clear()
    for (let color in points) {
      this.ctx.fillStyle = color
      for (let i = 0; i < points[color].length; ++i) {
        this.ctx.fillRect(points[color][i][0], points[color][i][1], 1, 1)
      }
    }

    this.ctx.fillStyle = COLOR.DARKEN[2]
    this.points.forEach((p) => {
      this.placeNode(p[0], p[1], true, 6)
    })
  }

  updateDBSCAN (data, config, final = false) {
    this.updating = true
    this.data = data

    this.clear()

    if (!final) {
      this.ctx.fillStyle = '#16161D'
    }

    for (let i = 0; i < data.length; ++i) {
      if (final) {
        this.ctx.fillStyle = COLOR.CUSTOM[i]
      }

      data[i].forEach((p) => {
        this.drawCircle(p.x, p.y, Math.ceil(1.2 * config.data['val']))
      })
    }

    this.ctx.fillStyle = final ? COLOR.DARKEN[2] : COLOR.DEFAULT

    this.points.forEach((p) => {
      this.placeNode(p[0], p[1], true, 6)
    })

    this.ctx.fillStyle = COLOR.DEFAULT
  }

  stopUpdating () {
    this.updating = false
    if (window.ws !== null) {
      window.ws.close()
    }
    this.redraw()
  }

  object (config) {
    return {
      'p': this.points.map((c) => {
        return {'x': c[0], 'y': c[1]}
      }),
      'config': [parseFloat(config.data['val'])]
    }
  }
}
