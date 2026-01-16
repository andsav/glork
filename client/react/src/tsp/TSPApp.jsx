import { useState, useRef, useCallback, useEffect } from 'react'
import { ENDPOINTS, COLOR } from '../lib/constants'
import { useApi } from '../hooks/useApi'
import { collision, rand, stopAnimations } from '../lib/helpers'
import { CanvasHelper } from '../lib/canvas'
import { Path } from './Path'
import { FRAME_DELAY, DEFAULT_FONT, CONFIG_BUTTON_RADIUS } from './config'
import { inCircle, round } from '../lib/helpers'

export default function TSPApp() {
  const [coordinates, setCoordinates] = useState([])
  const [error, setError] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Config state for SA
  const [saConfig, setSaConfig] = useState({ x: 0.97, y: 200 })
  // Config state for LBS
  const [lbsConfig, setLbsConfig] = useState({ x: 50, y: 1500 })

  const mainCanvasRef = useRef(null)
  const resultCanvasRef = useRef(null)
  const saConfigCanvasRef = useRef(null)
  const lbsConfigCanvasRef = useRef(null)
  const mainHelperRef = useRef(null)
  const resultHelperRef = useRef(null)
  const animationRef = useRef(null)
  const initialRef = useRef(0)

  const { post } = useApi()

  // Initialize canvas helpers
  useEffect(() => {
    if (mainCanvasRef.current) {
      mainHelperRef.current = new CanvasHelper(mainCanvasRef.current)
    }
    if (resultCanvasRef.current) {
      resultHelperRef.current = new CanvasHelper(resultCanvasRef.current)
      resultHelperRef.current.setFont(DEFAULT_FONT)
    }
  }, [])

  // Draw all coordinates
  const redraw = useCallback(() => {
    if (!mainHelperRef.current) return
    const helper = mainHelperRef.current
    helper.clear()
    helper.setFillStyle(COLOR.DEFAULT)
    coordinates.forEach((c) => {
      helper.drawNode(c[0], c[1])
    })
  }, [coordinates])

  // Trace path on canvas
  const trace = useCallback((path) => {
    redraw()
    if (!mainHelperRef.current) return
    const helper = mainHelperRef.current
    helper.setStrokeStyle(COLOR.DEFAULT)
    helper.beginPath()
    helper.moveTo(path[0][0], path[0][1])
    for (let i = 1; i < path.length; ++i) {
      helper.lineTo(path[i][0], path[i][1])
    }
    helper.lineTo(path[0][0], path[0][1])
    helper.stroke()
  }, [redraw])

  // Place a point on canvas
  const placePoint = useCallback((x, y) => {
    if (!mainHelperRef.current) return
    if (!collision(coordinates, [x, y], 12)) {
      setCoordinates((prev) => [...prev, [x, y]])
      mainHelperRef.current.placeNode(x, y)
    }
  }, [coordinates])

  // Reset canvas
  const handleReset = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    stopAnimations(setError)
    if (mainHelperRef.current) {
      mainHelperRef.current.clear()
    }
    setCoordinates([])
    setShowResult(false)
  }, [])

  // Generate random points
  const handleRandom = useCallback((count) => {
    handleReset()
    const newCoords = []
    const canvas = mainCanvasRef.current
    if (!canvas) return

    while (newCoords.length < count) {
      const x = rand(15, canvas.width - 15)
      const y = rand(15, canvas.height - 15)
      if (!collision(newCoords, [x, y], 12)) {
        newCoords.push([x, y])
      }
    }

    setCoordinates(newCoords)
    if (mainHelperRef.current) {
      mainHelperRef.current.clear()
      mainHelperRef.current.setFillStyle(COLOR.DEFAULT)
      newCoords.forEach((c) => {
        mainHelperRef.current.drawNode(c[0], c[1])
      })
    }
  }, [handleReset])

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    if (!mainHelperRef.current) return
    const pos = mainHelperRef.current.mouse(e)
    placePoint(pos.x, pos.y)
  }, [placePoint])

  // Output SA helper
  const outputSAHelper = useCallback((path, i = 0, max = 0, cooling = 0.98) => {
    if (!resultHelperRef.current) return
    const helper = resultHelperRef.current

    if (i === 0) {
      helper.clear()
      helper.beginPath()
      helper.moveTo(0, helper.halfHeight)
      helper.lineTo(helper.width, helper.halfHeight)
      helper.stroke()
    } else {
      helper.clearHalf()
      helper.beginPath()
      helper.moveTo(0, helper.halfHeight)
      helper.lineTo(helper.halfWidth, helper.halfHeight)
      helper.stroke()
    }

    const t = round(Math.pow(cooling, i), 1e7)
    const length = path.length

    if (i === 1) {
      initialRef.current = length
    }

    helper.setFillStyle(COLOR.WHITE)
    if (i !== 0) {
      const x = helper.halfWidth + (helper.halfWidth / max) * i
      const y = Math.max(
        helper.height - (length / initialRef.current) * helper.halfHeight * 0.67,
        helper.halfHeight
      )
      const h = helper.height - y
      const w = helper.halfWidth / max
      const y2 = helper.halfHeight - t * helper.halfHeight
      const h2 = helper.halfHeight - y2

      helper.fillRect(x, y, w, h)
      helper.fillRect(x, y2, w, h2)
    }

    helper.fillText('    T°: ' + (t === 1 ? '1.0000000' : String(t)), 20, 26)
    helper.fillText('Length: ' + String(length), 20, helper.halfHeight + 26)
    helper.setFillStyle(COLOR.DEFAULT)
  }, [])

  // Output SA animation
  const outputSA = useCallback((solution, i = 1) => {
    if (i === 1) {
      stopAnimations(setError)
    }
    if (i >= solution.length) {
      return
    }

    const p = Path.fromObject(solution[i])
    trace(p.p)
    outputSAHelper(p, i, solution.length, saConfig.x)

    animationRef.current = setTimeout(() => {
      outputSA(solution, i + 1)
    }, FRAME_DELAY)
  }, [trace, outputSAHelper, saConfig.x])

  // Output LBS
  const outputLBS = useCallback((solution) => {
    stopAnimations(setError)
    if (!resultHelperRef.current) return
    const helper = resultHelperRef.current
    helper.clear()

    const worst = Path.fromObject(solution[0])
    const best = Path.fromObject(solution[solution.length - 1])
    const max = worst.length
    const min = best.length

    const shuffled = [...solution].sort(() => 0.5 - Math.random())

    let i = 0
    let foundBest = false
    helper.setFillStyle('#001427')

    shuffled.forEach((s) => {
      const path = Path.fromObject(s)
      const h = (path.length / max) * helper.halfHeight
      const w = helper.width / solution.length
      const y = helper.height - h
      const x = i++ * w

      if (path.length === min && !foundBest) {
        helper.setFillStyle(COLOR.WHITE)
        const offset = helper.measureText(String(min)).width
        helper.fillText(
          min,
          Math.min(Math.max(x + w / 2 - offset / 2, 2), helper.width - offset - 2),
          20
        )
        foundBest = true
      }

      helper.fillRect(x, y, w, h)
      helper.setFillStyle('#001427')
    })

    trace(best.p)
    helper.setFillStyle(COLOR.DEFAULT)
  }, [trace])

  // Loading SA animation
  const loadingSA = useCallback((path = null) => {
    if (!coordinates.length) return
    const p = path || Path.random([...coordinates])
    trace(p.p)
    outputSAHelper(p)

    animationRef.current = setTimeout(() => {
      loadingSA()
    }, FRAME_DELAY)
  }, [coordinates, trace, outputSAHelper])

  // Loading LBS animation
  const loadingLBS = useCallback(() => {
    if (!resultHelperRef.current) return
    const helper = resultHelperRef.current
    helper.clear()
    const n = parseInt(lbsConfig.x, 10)

    helper.setFillStyle(COLOR.BLACK)
    for (let i = 0; i < n; ++i) {
      const h = helper.height * 0.5
      const w = helper.width / n
      const y = helper.height - h
      const x = i * w
      helper.fillRect(x, y, w, h)
    }
    helper.setFillStyle(COLOR.DEFAULT)
  }, [lbsConfig.x])

  // Solve with SA
  const handleSA = useCallback(async () => {
    if (coordinates.length <= 3) {
      setError('Please define at least 4 coordinates')
      return
    }

    stopAnimations(setError)
    setShowResult(true)
    loadingSA()

    try {
      const data = await post(ENDPOINTS.TSP_SA, {
        p: coordinates.map((c) => ({ x: c[0], y: c[1] })),
        config: [saConfig.x, saConfig.y]
      })
      outputSA(data)
    } catch (err) {
      if (animationRef.current) clearTimeout(animationRef.current)
      redraw()
      setError(err.message)
    }
  }, [coordinates, saConfig, post, loadingSA, outputSA, redraw])

  // Solve with LBS
  const handleLBS = useCallback(async () => {
    if (coordinates.length <= 3) {
      setError('Please define at least 4 coordinates')
      return
    }

    stopAnimations(setError)
    setShowResult(true)
    loadingLBS()

    // Loading animation for main canvas
    const animateLoading = () => {
      const p = Path.random([...coordinates])
      trace(p.p)
      animationRef.current = setTimeout(animateLoading, FRAME_DELAY)
    }
    animateLoading()

    try {
      const data = await post(ENDPOINTS.TSP_LBS, {
        p: coordinates.map((c) => ({ x: c[0], y: c[1] })),
        config: [lbsConfig.x, lbsConfig.y]
      })
      outputLBS(data)
    } catch (err) {
      if (animationRef.current) clearTimeout(animationRef.current)
      redraw()
      setError(err.message)
    }
  }, [coordinates, lbsConfig, post, trace, loadingLBS, outputLBS, redraw])

  return (
    <div>
      <h1>
        <a href="/">Experiments</a> / Traveling Salesman
      </h1>

      <div id="top_toolbar">
        <div>
          <div className="buttons-right">
            <button className="random" onClick={() => handleRandom(15)}>
              Random 15
            </button>
            <button className="random" onClick={() => handleRandom(50)}>
              Random 50
            </button>
            <button className="random" onClick={() => handleRandom(100)}>
              Random 100
            </button>
          </div>
          <button id="reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <canvas
        ref={mainCanvasRef}
        id="c"
        width={600}
        height={400}
        onClick={handleCanvasClick}
      />

      <div id="bottom_toolbar">
        <div>
          <span className="button-group">
            <ConfigCanvas
              ref={lbsConfigCanvasRef}
              id="config_lbs"
              config={lbsConfig}
              setConfig={setLbsConfig}
              minX={1}
              maxX={200}
              xInt={true}
              minY={100}
              maxY={3000}
              yInt={true}
            />
            <button id="LBS" onClick={handleLBS}>
              Local Beam Search
              <br />
              <small>
                Locations: <span>{Math.round(lbsConfig.x)}</span>
                <br />
                Iterations: <span>{Math.round(lbsConfig.y)}</span>
              </small>
            </button>
          </span>
          &nbsp;
          <span className="button-group">
            <ConfigCanvas
              ref={saConfigCanvasRef}
              id="config_sa"
              config={saConfig}
              setConfig={setSaConfig}
              minX={0.85}
              maxX={0.99}
              xInt={false}
              minY={1}
              maxY={500}
              yInt={true}
            />
            <button id="SA" onClick={handleSA}>
              Simulated Annealing
              <br />
              <small>
                Cooling: <span>{saConfig.x}</span>
                <br />
                Iterations: <span>{Math.round(saConfig.y)}</span>
              </small>
            </button>
          </span>
        </div>
      </div>

      <canvas
        ref={resultCanvasRef}
        id="result"
        height={80}
        width={600}
        style={{ display: showResult ? 'block' : 'none' }}
      />

      {error && <div id="error_msg" style={{ opacity: 1 }}>{error}</div>}
    </div>
  )
}

// Config Canvas Component
function ConfigCanvas({
  id,
  config,
  setConfig,
  minX,
  maxX,
  xInt,
  minY,
  maxY,
  yInt
}) {
  const canvasRef = useRef(null)
  const helperRef = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    if (canvasRef.current) {
      helperRef.current = new CanvasHelper(canvasRef.current)
      helperRef.current.setLineCap('round')
      updateCanvas()
    }
  }, [])

  useEffect(() => {
    updateCanvas()
  }, [config])

  const updateCanvas = () => {
    if (!helperRef.current) return
    const helper = helperRef.current
    helper.clear()

    const buttonX = ((config.x - minX) / (maxX - minX)) * helper.width
    const buttonY = helper.height - ((config.y - minY) / (maxY - minY)) * helper.height

    helper.setStrokeStyle(COLOR.DEFAULT)
    helper.beginPath()
    helper.moveTo(buttonX, buttonY)
    helper.lineTo(helper.halfWidth, helper.halfHeight)
    helper.stroke()

    helper.setFillStyle(COLOR.DEFAULT)
    helper.beginPath()
    helper.arc(buttonX, buttonY, CONFIG_BUTTON_RADIUS, 0, 2 * Math.PI)
    helper.fill()
  }

  const buttonPos = () => {
    if (!helperRef.current) return { x: 0, y: 0 }
    const helper = helperRef.current
    return {
      x: ((config.x - minX) / (maxX - minX)) * helper.width,
      y: helper.height - ((config.y - minY) / (maxY - minY)) * helper.height
    }
  }

  const handleMouseDown = (e) => {
    if (!helperRef.current) return
    const pos = helperRef.current.mouse(e)
    const btn = buttonPos()

    if (!inCircle(pos, btn, CONFIG_BUTTON_RADIUS)) {
      updateConfig(pos)
    }
    isDragging.current = true
  }

  const handleMouseMove = (e) => {
    if (!helperRef.current) return
    const pos = helperRef.current.mouse(e)
    const btn = buttonPos()

    canvasRef.current.style.cursor = inCircle(pos, btn, CONFIG_BUTTON_RADIUS)
      ? 'pointer'
      : 'initial'

    if (isDragging.current) {
      updateConfig(pos)
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const updateConfig = (pos) => {
    if (!helperRef.current) return
    const helper = helperRef.current

    let newX = (pos.x / helper.width) * (maxX - minX) + minX
    let newY = maxY - (pos.y / helper.height) * (maxY - minY)

    newX = Math.max(Math.min(newX, maxX), minX)
    newY = Math.max(Math.min(newY, maxY), minY)

    newX = xInt ? Math.round(newX) : round(newX, 100)
    newY = yInt ? Math.round(newY) : round(newY, 100)

    setConfig({ x: newX, y: newY })
  }

  return (
    <canvas
      ref={canvasRef}
      className="config-canvas"
      id={id}
      width={80}
      height={80}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
    />
  )
}
