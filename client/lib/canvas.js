import { COLOR } from './constants.js'
import { $ } from './$.js'

export class Canvas {
  constructor (id) {
    this.c = $(id)
    this.ctx = this.c.getContext('2d')
    this.ctx.fillStyle = this.ctx.strokeStyle = COLOR.DEFAULT
    this.ctx.lineWidth = 2
  }

  get height () {
    return this.c.height
  }

  get width () {
    return this.c.width
  }

  get halfWidth () {
    return this.c.width / 2
  }

  get halfHeight () {
    return this.c.height / 2
  }

  hide () {
    this.c.style.display = 'none'
  }

  show () {
    this.c.style.display = 'initial'
    this.c.scrollIntoView()
  }

  clear () {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height)
  }

  mouse (e) {
    return {
      x: e.pageX - this.c.offsetLeft,
      y: e.pageY - this.c.offsetTop
    }
  }

  placeNode (x, y, circle = false, side = 10) {
    if (x > side + 2 && x < this.c.width - (side + 2) && y > side + 2 && y < this.c.height - (side + 2)) {
      if (circle) {
        this.drawCircle(x, y, side)
      } else {

        this.drawNode(x, y, side)
      }
    }
  }

  drawNode (x, y, side = 10) {
    this.ctx.fillRect(x - side / 2, y - side / 2, side, side)
  }

  drawCircle (x, y, diameter = 10) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, diameter / 2, 0, 2 * Math.PI)
    this.ctx.fill()
  }
}

export class SliderCanvas extends Canvas {
  constructor (id, defaultButton) {
    super(id)

    this.button = defaultButton(this)

    this.ctx.lineCap = 'round'
    this.update()

    let _this = this
    this.click = false

    this.c.ontouchstart = function (e) {
      _this.setConfig(_this.mouse(e))
    }

    this.c.onmousedown = function (e) {
      let m = _this.mouse(e)
      if (!_this.overButton(m)) {
        _this.setConfig(m)
      }
      _this.click = true
    }

    this.c.onmousemove = function (e) {
      let m = _this.mouse(e)
      _this.c.style.cursor = _this.overButton(_this.mouse(e)) ? 'pointer' : 'initial'

      if (_this.click) {
        _this.setConfig(m)
      }
    }

    this.c.onmouseup = function () {
      _this.click = false
    }
  }

  get data () {
    return this.c.dataset
  }

  update () {

  }

  overButton (m) {

  }

  setConfig (m) {

  }

  dataF (x) {
    return parseFloat(this.c.dataset[x])
  }
}
