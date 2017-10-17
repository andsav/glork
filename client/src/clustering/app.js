import {ENDPOINTS} from '../../lib/constants.js'
import {MIN_POINTS} from './config.js'
import {$, $ready} from '../../lib/$.js'
import {error} from '../../lib/helpers.js'
import {Socket} from '../../lib/socket.js'
import {ConfigSlider} from './ConfigSlider.js'
import {MainCanvas} from './MainCanvas.js'
import {CursorSlider} from './CursorSlider.js'

window.ws = null;

$ready(() => {
  const canvas = new MainCanvas('c')
  const kSlider = new ConfigSlider('cursor-k')
  const eSlider = new ConfigSlider('cursor-e')
  const cursorSlider = new CursorSlider('cursor-slider', canvas) // eslint-disable-line

  $('reset').onclick = () => {
    canvas.reset()
  }

  $('lloyd').onclick = () => {
    let data = canvas.object(kSlider)
    if (canvas.points.length < MIN_POINTS) {
      error(canvas.c, 'Please define at least ' + MIN_POINTS + ' points')
    } else if (data['config'][0] > data['p'].length) {
      error(canvas.c, 'More clusters than number of points defined')
    } else {
      window.ws = new Socket(
        ENDPOINTS.CLUSTERING_KMEANS,
        function (d) {
          canvas.updateKMS(d)
        },
        data,
        function () {
          canvas.updateKMS(canvas.data)
          canvas.voronoi()
        })
    }
  }

  $('dbscan').onclick = () => {
    if (canvas.points.length < MIN_POINTS) {
      error(canvas.c, 'Please define at least ' + MIN_POINTS + ' points')
    } else {
      window.ws = new Socket(
        ENDPOINTS.CLUSTERING_DBSCAN,
        function (d) {
          canvas.updateDBSCAN(d, eSlider)
        },
        canvas.object(eSlider),
        function () {
          canvas.updateDBSCAN(canvas.data, eSlider, true)
        })
    }
  }

  $('random').onclick = () => {
    canvas.randomPoints(500)
  }

  $('circles').onclick = () => {
    canvas.randomPoints(80,
      [
        [canvas.width / 3, canvas.height / 3],
        [2 * canvas.width / 3, canvas.height / 3],
        [canvas.width / 2, 2 * canvas.height / 3]
      ])

    kSlider.setVal(3)
  }

  $('donut').onclick = () => {
    let circle = []
    let steps = 20
    for (let i = 0; i < steps; i++) {
      circle.push([
        (canvas.halfWidth + 130 * Math.cos(2 * Math.PI * i / steps)),
        (canvas.halfHeight + 130 * Math.sin(2 * Math.PI * i / steps))
      ])
    }

    canvas.randomPoints(25, circle)
    canvas.randomPoints(50, [[canvas.halfWidth, canvas.halfHeight]], false)

    kSlider.setVal(2)
  }

  $('smiley').onclick = () => {
    let circle = []
    let steps = 27
    for (let i = 0; i < steps; i++) {
      circle.push([
        (canvas.halfWidth + 145 * Math.cos(2 * Math.PI * i / steps)),
        (canvas.halfHeight + 155 * Math.sin(2 * Math.PI * i / steps))
      ])
    }

    // Face
    canvas.randomPoints(20, circle)

    // Eyes
    canvas.randomPoints(20, [
      [0.4 * canvas.width, 0.4 * canvas.height],
      [0.6 * canvas.width, 0.4 * canvas.height]
    ], false)

    // Smile
    canvas.randomPoints(15, [
      [0.375 * canvas.width, 0.625 * canvas.height],
      [0.4 * canvas.width, 0.65 * canvas.height],
      [0.425 * canvas.width, 0.675 * canvas.height],
      [0.45 * canvas.width, 0.7 * canvas.height],
      [0.475 * canvas.width, 0.725 * canvas.height],
      [0.5 * canvas.width, 0.73 * canvas.height],
      [0.525 * canvas.width, 0.725 * canvas.height],
      [0.55 * canvas.width, 0.7 * canvas.height],
      [0.575 * canvas.width, 0.675 * canvas.height],
      [0.6 * canvas.width, 0.65 * canvas.height],
      [0.625 * canvas.width, 0.625 * canvas.height]
    ], false)
  }
})
