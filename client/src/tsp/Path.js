import { dist, rand } from '../../lib/helpers.js'

export class Path {
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
