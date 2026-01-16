import { dist, rand } from '../lib/helpers'

export class Path {
  constructor(p) {
    this.p = p
  }

  clear() {
    this.p = []
  }

  map(fn) {
    return this.p.map(fn)
  }

  push(c) {
    this.p.push(c)
  }

  get neighbour() {
    const p = [...this.p]
    const a = rand(0, p.length - 1)
    const b = rand(0, p.length - 1)
    const tmp = p[a]
    p[a] = p[b]
    p[b] = tmp
    return new Path(p)
  }

  get object() {
    return this.p.map((c) => ({ x: c[0], y: c[1] }))
  }

  get length() {
    return this.p
      .reduce((acc, val, i) => {
        return acc + dist(val, this.p[(i + 1) % this.p.length])
      }, 0)
      .toFixed(3)
  }

  static fromObject(o) {
    return new Path(o.map((c) => [c.x, c.y]))
  }

  static random(coord) {
    const shuffled = [...coord].sort(() => 0.5 - Math.random())
    return new Path(shuffled)
  }
}
