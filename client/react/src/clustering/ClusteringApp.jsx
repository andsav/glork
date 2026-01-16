import { useState, useRef, useCallback, useEffect } from 'react'
import { ENDPOINTS, COLOR } from '../lib/constants'
import { useWebSocket } from '../hooks/useApi'
import { collision, dist, gaussian, rand, round, stopAnimations } from '../lib/helpers'
import { CanvasHelper } from '../lib/canvas'
import {
  MIN_POINTS,
  MIN_CURSOR_RADIUS,
  MAX_CURSOR_RADIUS,
  POINTS_DELAY
} from './config'

export default function ClusteringApp() {
  const [points, setPoints] = useState([])
  const [error, setError] = useState(null)
  const [cursorRadius, setCursorRadius] = useState(MIN_CURSOR_RADIUS)
  const [kValue, setKValue] = useState(2)
  const [epsilonValue, setEpsilonValue] = useState(25)
  const [data, setData] = useState([])
  const [updating, setUpdating] = useState(false)

  const canvasRef = useRef(null)
  const helperRef = useRef(null)
  const timerRef = useRef(null)

  const { connect, close } = useWebSocket()

  // Initialize canvas helper
  useEffect(() => {
    if (canvasRef.current) {
      helperRef.current = new CanvasHelper(canvasRef.current)
    }
  }, [])

  // Update cursor style
  useEffect(() => {
    if (canvasRef.current) {
      const r = cursorRadius
      canvasRef.current.style.cursor = `url('data:image/svg+xml;utf8,<svg fill="none" height="${r * 4}" viewBox="0 0 ${r * 2} ${r * 2}" width="${r * 4}" xmlns="http://www.w3.org/2000/svg"><circle fill-opacity="0.4" fill="black" cx="${r}" cy="${r}" r="${r}" stroke="none" stroke-width="1" /></svg>') ${r * 2} ${r * 2}, auto`
    }
  }, [cursorRadius])

  // Redraw all points
  const redraw = useCallback(() => {
    if (!helperRef.current) return
    const helper = helperRef.current
    helper.clear()
    helper.setFillStyle(COLOR.DEFAULT)
    points.forEach((p) => {
      helper.placeNode(p[0], p[1], true, 6)
    })
  }, [points])

  // Place a single point
  const placePoint = useCallback((x, y, currentPoints, shouldStopUpdating = false) => {
    if (!helperRef.current) return currentPoints

    if (shouldStopUpdating && updating) {
      close()
      setUpdating(false)
    }

    if (!collision(currentPoints, [x, y], 7)) {
      const newPoints = [...currentPoints, [x, y]]
      helperRef.current.placeNode(x, y, true, 6)
      return newPoints
    }
    return currentPoints
  }, [updating, close])

  // Place points with Gaussian distribution
  const placeGaussian = useCallback((centerX, centerY, n, currentPoints) => {
    let pts = currentPoints
    for (let i = 0; i < n; ++i) {
      const x = parseInt(centerX + gaussian() * n / 3, 10)
      const y = parseInt(centerY + gaussian() * n / 3, 10)
      pts = placePoint(x, y, pts)
    }
    return pts
  }, [placePoint])

  // Stop updating
  const stopUpdating = useCallback(() => {
    setUpdating(false)
    close()
    redraw()
  }, [close, redraw])

  // Reset canvas
  const handleReset = useCallback(() => {
    stopAnimations(setError)
    stopUpdating()
    if (helperRef.current) {
      helperRef.current.clear()
    }
    setPoints([])
    setData([])
  }, [stopUpdating])

  // Random points - uniform distribution
  const handleRandomUniform = useCallback(() => {
    handleReset()
    let newPoints = []
    const canvas = canvasRef.current
    if (!canvas || !helperRef.current) return

    helperRef.current.setFillStyle(COLOR.DEFAULT)
    for (let i = 0; i < 500; ++i) {
      const x = rand(6, canvas.width - 6)
      const y = rand(6, canvas.height - 6)
      newPoints = placePoint(x, y, newPoints)
    }
    setPoints(newPoints)
  }, [handleReset, placePoint])

  // Random points - circles
  const handleCircles = useCallback(() => {
    handleReset()
    const canvas = canvasRef.current
    if (!canvas || !helperRef.current) return

    helperRef.current.setFillStyle(COLOR.DEFAULT)
    const centers = [
      [canvas.width / 3, canvas.height / 3],
      [(2 * canvas.width) / 3, canvas.height / 3],
      [canvas.width / 2, (2 * canvas.height) / 3]
    ]

    let newPoints = []
    centers.forEach((center) => {
      newPoints = placeGaussian(center[0], center[1], 80, newPoints)
    })
    setPoints(newPoints)
    setKValue(3)
  }, [handleReset, placeGaussian])

  // Random points - donut
  const handleDonut = useCallback(() => {
    handleReset()
    const canvas = canvasRef.current
    if (!canvas || !helperRef.current) return

    helperRef.current.setFillStyle(COLOR.DEFAULT)
    const halfWidth = canvas.width / 2
    const halfHeight = canvas.height / 2

    const circle = []
    const steps = 20
    for (let i = 0; i < steps; i++) {
      circle.push([
        halfWidth + 130 * Math.cos((2 * Math.PI * i) / steps),
        halfHeight + 130 * Math.sin((2 * Math.PI * i) / steps)
      ])
    }

    let newPoints = []
    circle.forEach((center) => {
      newPoints = placeGaussian(center[0], center[1], 25, newPoints)
    })
    // Center cluster
    newPoints = placeGaussian(halfWidth, halfHeight, 50, newPoints)

    setPoints(newPoints)
    setKValue(2)
  }, [handleReset, placeGaussian])

  // Random points - smiley
  const handleSmiley = useCallback(() => {
    handleReset()
    const canvas = canvasRef.current
    if (!canvas || !helperRef.current) return

    helperRef.current.setFillStyle(COLOR.DEFAULT)
    const halfWidth = canvas.width / 2
    const halfHeight = canvas.height / 2

    // Face outline
    const circle = []
    const steps = 27
    for (let i = 0; i < steps; i++) {
      circle.push([
        halfWidth + 145 * Math.cos((2 * Math.PI * i) / steps),
        halfHeight + 155 * Math.sin((2 * Math.PI * i) / steps)
      ])
    }

    let newPoints = []
    circle.forEach((center) => {
      newPoints = placeGaussian(center[0], center[1], 20, newPoints)
    })

    // Eyes
    const eyes = [
      [0.4 * canvas.width, 0.4 * canvas.height],
      [0.6 * canvas.width, 0.4 * canvas.height]
    ]
    eyes.forEach((center) => {
      newPoints = placeGaussian(center[0], center[1], 20, newPoints)
    })

    // Smile
    const smile = [
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
    ]
    smile.forEach((center) => {
      newPoints = placeGaussian(center[0], center[1], 15, newPoints)
    })

    setPoints(newPoints)
  }, [handleReset, placeGaussian])

  // Update K-Means visualization
  const updateKMS = useCallback((d) => {
    setUpdating(true)
    setData(d)

    if (!helperRef.current) return
    const helper = helperRef.current
    helper.clear()

    // Place centroids
    helper.setFillStyle(COLOR.DARKEN[0])
    d.c.forEach((c) => {
      helper.drawCircle(c.x, c.y, 25)
    })

    for (let i = 0; i < d.pp.length; ++i) {
      if (d.pp[i] !== null && d.pp[i].length !== 0) {
        helper.setFillStyle(COLOR.CUSTOM[i])
        d.pp[i].forEach((p) => {
          helper.placeNode(p.x, p.y, true, 6)
        })
      }
    }

    helper.setFillStyle(COLOR.DEFAULT)
  }, [])

  // Draw Voronoi diagram
  const voronoi = useCallback(() => {
    if (!helperRef.current || !data.c) return
    const helper = helperRef.current

    const regions = {}
    for (let x = 0; x < helper.width; x++) {
      for (let y = 0; y < helper.height; y++) {
        const distances = data.c.map((p) => dist([p.x, p.y], [x, y]))
        const color = COLOR.CUSTOM[distances.indexOf(Math.min(...distances))]

        if (!(color in regions)) {
          regions[color] = []
        }
        regions[color].push([x, y])
      }
    }

    helper.clear()
    for (const color in regions) {
      helper.setFillStyle(color)
      regions[color].forEach((pt) => {
        helper.fillRect(pt[0], pt[1], 1, 1)
      })
    }

    helper.setFillStyle(COLOR.DARKEN[2])
    points.forEach((p) => {
      helper.placeNode(p[0], p[1], true, 6)
    })
  }, [data, points])

  // Update DBSCAN visualization
  const updateDBSCAN = useCallback((d, final = false) => {
    setUpdating(true)
    setData(d)

    if (!helperRef.current) return
    const helper = helperRef.current
    helper.clear()

    if (!final) {
      helper.setFillStyle('#16161D')
    }

    for (let i = 0; i < d.length; ++i) {
      if (final) {
        helper.setFillStyle(COLOR.CUSTOM[i])
      }
      d[i].forEach((p) => {
        helper.drawCircle(p.x, p.y, Math.ceil(1.2 * epsilonValue))
      })
    }

    helper.setFillStyle(final ? COLOR.DARKEN[2] : COLOR.DEFAULT)
    points.forEach((p) => {
      helper.placeNode(p[0], p[1], true, 6)
    })

    helper.setFillStyle(COLOR.DEFAULT)
  }, [points, epsilonValue])

  // Run K-Means
  const handleKMeans = useCallback(() => {
    if (points.length < MIN_POINTS) {
      setError(`Please define at least ${MIN_POINTS} points`)
      return
    }

    const pointData = {
      p: points.map((c) => ({ x: c[0], y: c[1] })),
      config: [kValue]
    }

    if (kValue > pointData.p.length) {
      setError('More clusters than number of points defined')
      return
    }

    connect(
      ENDPOINTS.CLUSTERING_KMEANS,
      (d) => updateKMS(d),
      pointData,
      () => {
        updateKMS(data)
        voronoi()
      }
    )
  }, [points, kValue, connect, updateKMS, data, voronoi])

  // Run DBSCAN
  const handleDBSCAN = useCallback(() => {
    if (points.length < MIN_POINTS) {
      setError(`Please define at least ${MIN_POINTS} points`)
      return
    }

    const pointData = {
      p: points.map((c) => ({ x: c[0], y: c[1] })),
      config: [epsilonValue]
    }

    connect(
      ENDPOINTS.CLUSTERING_DBSCAN,
      (d) => updateDBSCAN(d, false),
      pointData,
      () => updateDBSCAN(data, true)
    )
  }, [points, epsilonValue, connect, updateDBSCAN, data])

  // Handle canvas mouse events
  const handleMouseDown = useCallback((e) => {
    if (!helperRef.current) return
    const m = helperRef.current.mouse(e)

    let currentPoints = [...points]
    currentPoints = placePoint(
      round(m.x + rand(-cursorRadius, cursorRadius), 1),
      round(m.y + rand(-cursorRadius, cursorRadius), 1),
      currentPoints
    )
    setPoints(currentPoints)

    timerRef.current = setInterval(() => {
      setPoints((prev) => {
        if (!helperRef.current) return prev
        const pos = helperRef.current.mouse(e)
        return placePoint(
          round(pos.x + rand(-cursorRadius, cursorRadius), 1),
          round(pos.y + rand(-cursorRadius, cursorRadius), 1),
          prev
        )
      })
    }, POINTS_DELAY)
  }, [points, cursorRadius, placePoint])

  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !helperRef.current) return
    const canvas = canvasRef.current
    const m = helperRef.current.mouse(e)

    if (m.x < 6 || m.y < 6 || m.x > canvas.width - 6 || m.y > canvas.height - 6) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return (
    <div className="k-means">
      <h1>
        <a href="/">Experiments</a> / Clustering
      </h1>

      <div id="top_toolbar">
        <div>
          <div className="buttons-right">
            <span>
              <button
                id="random"
                className="button-icon"
                title="Uniform"
                onClick={handleRandomUniform}
              >
                <svg height="32" width="32">
                  {[4, 10, 16, 22, 28].map((cx) =>
                    [5, 11, 17, 23, 29]
                      .filter(
                        (cy) =>
                          !((cx === 4 || cx === 28) && (cy === 5 || cy === 29))
                      )
                      .map((cy) => (
                        <circle
                          key={`${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r="1"
                          fill="#E3F09B"
                        />
                      ))
                  )}
                </svg>
              </button>
              <button
                id="circles"
                className="button-icon"
                title="Circles"
                onClick={handleCircles}
              >
                <svg height="32" width="32">
                  <circle cx="9" cy="12" r="5" fill="#437C90" />
                  <circle cx="23" cy="12" r="5" fill="#E3F09B" />
                  <circle cx="16" cy="23" r="5" fill="#87B6A7" />
                </svg>
              </button>
              <button
                id="donut"
                className="button-icon"
                title="Concentric Circles"
                onClick={handleDonut}
              >
                <svg height="32" width="32">
                  <circle
                    cx="16"
                    cy="16"
                    r="10"
                    stroke="#437C90"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle cx="16" cy="16" r="4" fill="#F45B69" />
                </svg>
              </button>
              <button
                id="smiley"
                className="button-icon"
                title="Smiley Face"
                onClick={handleSmiley}
              >
                <svg height="32" width="32">
                  <circle
                    cx="16"
                    cy="16"
                    r="10"
                    stroke="#E3F09B"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="12" cy="13" r="2" fill="#E3F09B" />
                  <circle cx="20" cy="13" r="2" fill="#E3F09B" />
                  <path
                    d="M11,19 Q16,24 21,19"
                    fill="none"
                    stroke="#E3F09B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>

            &nbsp;&nbsp;&nbsp;&nbsp;

            <span className="labeled-group">
              <span>Cursor Size:</span>
              &nbsp;
              <CursorSlider
                value={cursorRadius}
                onChange={setCursorRadius}
              />
            </span>
          </div>
          <button id="reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        id="c"
        width={600}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      />

      <div id="bottom_toolbar">
        <div>
          <span className="button-group">
            <ConfigSlider
              value={kValue}
              onChange={setKValue}
              varName="k"
              min={2}
              max={10}
              isInt={true}
            />
            <button id="lloyd" onClick={handleKMeans}>
              K-Means
            </button>
          </span>
          &nbsp;
          <span className="button-group">
            <ConfigSlider
              value={epsilonValue}
              onChange={setEpsilonValue}
              varName="ε"
              min={20}
              max={75}
              isInt={false}
            />
            <button id="dbscan" onClick={handleDBSCAN}>
              DBSCAN
            </button>
          </span>
        </div>
      </div>

      {error && <div id="error_msg" style={{ opacity: 1 }}>{error}</div>}
    </div>
  )
}

// Cursor Slider Component
function CursorSlider({ value, onChange }) {
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
  }, [value])

  const updateCanvas = () => {
    if (!helperRef.current) return
    const helper = helperRef.current
    helper.clear()

    const buttonX =
      20 +
      ((value - MIN_CURSOR_RADIUS) / (MAX_CURSOR_RADIUS - MIN_CURSOR_RADIUS)) *
        (helper.width - 40)

    // Line
    helper.setStrokeStyle(COLOR.DEFAULT)
    helper.beginPath()
    helper.moveTo(20, helper.halfHeight)
    helper.lineTo(helper.width - 20, helper.halfHeight)
    helper.stroke()

    // Cursor center
    helper.setFillStyle(COLOR.WHITE)
    helper.beginPath()
    helper.arc(buttonX, helper.halfHeight, 4, 0, 2 * Math.PI)
    helper.fill()

    // Cursor radius indicator
    helper.beginPath()
    helper.arc(buttonX, helper.halfHeight, value * 2, 0, 2 * Math.PI)
    helper.setFillStyle(COLOR.DARKEN[1])
    helper.fill()
  }

  const handleMouseDown = (e) => {
    if (!helperRef.current) return
    const pos = helperRef.current.mouse(e)
    updateValue(pos)
    isDragging.current = true
  }

  const handleMouseMove = (e) => {
    if (!helperRef.current || !isDragging.current) return
    const pos = helperRef.current.mouse(e)
    updateValue(pos)
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const updateValue = (pos) => {
    if (!helperRef.current) return
    const helper = helperRef.current
    const v =
      ((pos.x - 20) / (helper.width - 40)) *
        (MAX_CURSOR_RADIUS - MIN_CURSOR_RADIUS) +
      MIN_CURSOR_RADIUS
    const newValue = Math.max(MIN_CURSOR_RADIUS, Math.min(MAX_CURSOR_RADIUS, v))
    onChange(newValue)
  }

  return (
    <canvas
      ref={canvasRef}
      id="cursor-slider"
      className="slider"
      width={200}
      height={39}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}

// Config Slider Component
function ConfigSlider({ value, onChange, varName, min, max, isInt }) {
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
  }, [value])

  const updateCanvas = () => {
    if (!helperRef.current) return
    const helper = helperRef.current
    helper.clear()

    const buttonX =
      ((value - min) / (max - min)) * (helper.width - 40) + 20

    // Line
    helper.setStrokeStyle(COLOR.DEFAULT)
    helper.beginPath()
    helper.moveTo(20, helper.halfHeight)
    helper.lineTo(helper.width - 20, helper.halfHeight)
    helper.stroke()

    // Cursor
    helper.setFillStyle(COLOR.WHITE)
    helper.beginPath()
    helper.arc(buttonX, helper.halfHeight, MIN_CURSOR_RADIUS * 2, 0, 2 * Math.PI)
    helper.fill()

    // Label
    const text = `${varName} = ${isInt ? Math.round(value) : value.toFixed(1)}`
    const offset = helper.measureText(text).width
    helper.fillText(text, buttonX - offset / 2, helper.halfHeight + 22)
  }

  const handleMouseDown = (e) => {
    if (!helperRef.current) return
    const pos = helperRef.current.mouse(e)
    updateValue(pos)
    isDragging.current = true
  }

  const handleMouseMove = (e) => {
    if (!helperRef.current || !isDragging.current) return
    const pos = helperRef.current.mouse(e)
    updateValue(pos)
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const updateValue = (pos) => {
    if (!helperRef.current) return
    const helper = helperRef.current
    const x = Math.max(20, Math.min(helper.width - 20, pos.x))
    let newValue = ((max - min) * (x - 20)) / (helper.width - 40) + min
    newValue = isInt ? Math.round(newValue) : round(newValue, 1000)
    onChange(newValue)
  }

  return (
    <canvas
      ref={canvasRef}
      className="config-canvas"
      width={150}
      height={80}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}
