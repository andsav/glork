import { ENDPOINTS } from '../../lib/constants.js'
import { $, $$, $post, $ready } from '../../lib/$.js'
import { error, stopAnimations } from '../../lib/helpers.js'
import { ConfigCanvas } from './ConfigCanvas.js'
import { ResultCanvas } from './ResultCanvas.js'
import { TSPCanvas } from './TSPCanvas.js'

// Quick and dirty return random element form array (not really random)
Array.prototype.random = function () {  // eslint-disable-line
  return this[~~((Math.random() * this.length))]
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
